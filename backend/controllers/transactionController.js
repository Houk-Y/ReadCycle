/**
 * Transaction Controller
 * Buy/swap with concurrency locking
 */

const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');

const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5-minute lock timeout

// ─── POST /api/transactions/buy ───────────────────────────────────────────────
// Critical section: atomic lock → purchase → unlock

const buyBook = async (req, res) => {
  const session = await require('mongoose').startSession();
  session.startTransaction();

  try {
    const { bookId, notes } = req.body;

    // ── 1. Fetch and lock the book atomically ──────────────────────────────
    const book = await Book.findOneAndUpdate(
      {
        _id: bookId,
        status: 'available',
        isLocked: false,
        seller: { $ne: req.user._id }, // Cannot buy own book
      },
      {
        isLocked: true,
        lockedBy: req.user._id,
        lockedAt: new Date(),
      },
      { new: true, session }
    );

    if (!book) {
      // Check why it failed
      const existing = await Book.findById(bookId);
      if (!existing) {
        await session.abortTransaction();
        return res.status(404).json({ success: false, message: 'Book not found.' });
      }
      if (existing.seller.toString() === req.user._id.toString()) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'You cannot buy your own listing.' });
      }
      if (existing.status !== 'available') {
        await session.abortTransaction();
        return res.status(409).json({ success: false, message: 'This book is no longer available.' });
      }
      if (existing.isLocked) {
        await session.abortTransaction();
        return res.status(409).json({ success: false, message: 'This book is being processed by another buyer. Try again in a moment.' });
      }
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Unable to process purchase.' });
    }

    // ── 2. Create the transaction record ──────────────────────────────────
    const [transaction] = await Transaction.create(
      [
        {
          buyer: req.user._id,
          seller: book.seller,
          book: book._id,
          type: 'buy',
          amount: book.price,
          status: 'pending',
          notes: notes || '',
          bookTitleSnapshot: book.title,
        },
      ],
      { session }
    );

    // ── 3. Mark the book as sold and unlock ────────────────────────────────
    await Book.findByIdAndUpdate(
      bookId,
      { status: 'sold', isLocked: false, lockedBy: null, lockedAt: null },
      { session }
    );

    // ── 4. Update seller's sale count ──────────────────────────────────────
    await User.findByIdAndUpdate(book.seller, { $inc: { totalSales: 1 } }, { session });

    // ── 5. Remove from all wishlists ───────────────────────────────────────
    await Wishlist.deleteMany({ book: bookId }, { session });

    await session.commitTransaction();

    await transaction.populate([
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' },
      { path: 'book', select: 'title image' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Purchase request sent! Contact the seller to arrange delivery.',
      data: transaction,
    });
  } catch (err) {
    await session.abortTransaction();
    // Ensure book is unlocked on error
    if (req.body.bookId) {
      await Book.findByIdAndUpdate(req.body.bookId, {
        isLocked: false, lockedBy: null, lockedAt: null,
      }).catch(() => {});
    }
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// ─── POST /api/transactions/swap ──────────────────────────────────────────────

const requestSwap = async (req, res) => {
  try {
    const { bookId, swapBookId, notes } = req.body;

    const book = await Book.findOne({ _id: bookId, status: 'available', allowSwap: true });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found or does not allow swaps.' });
    }
    if (book.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot swap with yourself.' });
    }

    const swapBook = await Book.findOne({ _id: swapBookId, seller: req.user._id, status: 'available' });
    if (!swapBook) {
      return res.status(400).json({ success: false, message: 'Your swap book is invalid or unavailable.' });
    }

    const transaction = await Transaction.create({
      buyer: req.user._id,
      seller: book.seller,
      book: book._id,
      swapBook: swapBook._id,
      type: 'swap',
      amount: 0,
      status: 'pending',
      notes: notes || '',
      bookTitleSnapshot: book.title,
    });

    await transaction.populate([
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' },
      { path: 'book', select: 'title image' },
      { path: 'swapBook', select: 'title image' },
    ]);

    res.status(201).json({ success: true, message: 'Swap request sent!', data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/transactions/my ─────────────────────────────────────────────────

const getMyTransactions = async (req, res) => {
  try {
    const { role = 'buyer' } = req.query;
    const filter = role === 'seller' ? { seller: req.user._id } : { buyer: req.user._id };

    const transactions = await Transaction.find(filter)
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name email avatar')
      .populate('book', 'title image price')
      .populate('swapBook', 'title image')
      .sort('-createdAt');

    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/transactions/:id/status ─────────────────────────────────────────

const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'completed', 'cancelled', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    // Only seller can accept/reject; buyer can cancel
    const isSeller = transaction.seller.toString() === req.user._id.toString();
    const isBuyer  = transaction.buyer.toString()  === req.user._id.toString();

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    transaction.status = status;
    await transaction.save();

    // If cancelled/rejected, re-list the book
    if (['cancelled', 'rejected'].includes(status)) {
      await Book.findByIdAndUpdate(transaction.book, { status: 'available' });
    }

    res.json({ success: true, message: `Transaction ${status}.`, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { buyBook, requestSwap, getMyTransactions, updateTransactionStatus };
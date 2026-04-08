/**
 * Wishlist Controller
 */

const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

// ─── GET /api/wishlist ────────────────────────────────────────────────────────

const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'book',
        populate: { path: 'seller', select: 'name avatar' },
      })
      .sort('-createdAt');

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/wishlist ───────────────────────────────────────────────────────

const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    const existing = await Wishlist.findOne({ user: req.user._id, book: bookId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already in wishlist.' });
    }

    const item = await Wishlist.create({ user: req.user._id, book: bookId });
    await item.populate({ path: 'book', populate: { path: 'seller', select: 'name' } });

    res.status(201).json({ success: true, message: 'Added to wishlist!', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/wishlist/:bookId ─────────────────────────────────────────────

const removeFromWishlist = async (req, res) => {
  try {
    const result = await Wishlist.findOneAndDelete({ user: req.user._id, book: req.params.bookId });
    if (!result) return res.status(404).json({ success: false, message: 'Item not in wishlist.' });
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/wishlist/check/:bookId ─────────────────────────────────────────

const checkWishlist = async (req, res) => {
  try {
    const item = await Wishlist.findOne({ user: req.user._id, book: req.params.bookId });
    res.json({ success: true, isWishlisted: !!item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };
/**
 * Admin Controller
 * Platform administration and moderation
 */

const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalBooks, totalTransactions, recentUsers, recentBooks] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Transaction.countDocuments(),
      User.find().sort('-createdAt').limit(5).select('name email role createdAt isBlocked'),
      Book.find().sort('-createdAt').limit(5).populate('seller', 'name'),
    ]);

    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const soldBooks    = await Book.countDocuments({ status: 'sold' });
    const activeBooks  = await Book.countDocuments({ status: 'available' });

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalBooks, totalTransactions, blockedUsers, soldBooks, activeBooks },
        recentUsers,
        recentBooks,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/admin/users/:id/block ───────────────────────────────────────────

const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block an admin.' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      data: { isBlocked: user.isBlocked },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an admin.' });
    }
    await user.deleteOne();
    // Also remove their book listings
    await Book.deleteMany({ seller: req.params.id });
    res.json({ success: true, message: 'User and their listings deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/books ─────────────────────────────────────────────────────

const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments();
    const books = await Book.find()
      .populate('seller', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: books,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/transactions ─────────────────────────────────────────────

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('book', 'title price')
      .sort('-createdAt')
      .limit(50);

    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleBlockUser, deleteUser, getAllBooks, getAllTransactions };
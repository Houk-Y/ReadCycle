/**
 * Book Controller
 * Handles all book listing operations
 */

const Book = require('../models/Book');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const fs = require('fs');
const path = require('path');

// ─── GET /api/books ───────────────────────────────────────────────────────────
// Public: Browse & search books with filters and pagination

const getBooks = async (req, res) => {
  try {
    const {
      search, category, condition, minPrice, maxPrice,
      status = 'available', sellerId,
      page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category)  query.category  = category;
    if (condition) query.condition = condition;
    if (status)    query.status    = status;
    if (sellerId)  query.seller    = sellerId;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments(query);

    const books = await Book.find(query)
      .populate('seller', 'name avatar location')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/books/:id ───────────────────────────────────────────────────────

const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('seller', 'name avatar bio location email phone totalSales');

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    // Increment view count
    await Book.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Check if requester has wishlisted this book
    let isWishlisted = false;
    if (req.user) {
      const wl = await Wishlist.findOne({ user: req.user._id, book: book._id });
      isWishlisted = !!wl;
    }

    res.json({ success: true, data: { ...book.toObject(), isWishlisted } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/books ──────────────────────────────────────────────────────────

const createBook = async (req, res) => {
  try {
    const { title, author, isbn, description, price, condition, category, allowSwap, tags } = req.body;

    const book = await Book.create({
      title, author, isbn, description,
      price: parseFloat(price),
      condition, category,
      allowSwap: allowSwap === 'true' || allowSwap === true,
      seller: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    });

    // Update seller's listing count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalListings: 1 } });

    await book.populate('seller', 'name avatar');
    res.status(201).json({ success: true, message: 'Book listed successfully!', data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/books/:id ───────────────────────────────────────────────────────

const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    // Only the seller or an admin can edit
    if (book.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this listing.' });
    }

    const updates = { ...req.body };

    // Parse price if provided
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.allowSwap !== undefined) updates.allowSwap = updates.allowSwap === 'true' || updates.allowSwap === true;

    // Handle new image upload
    if (req.file) {
      // Delete old image file if it exists
      if (book.image) {
        const oldPath = path.join(__dirname, '..', book.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('seller', 'name avatar');

    res.json({ success: true, message: 'Book updated.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/books/:id ────────────────────────────────────────────────────

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    if (book.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
    }

    // Remove image file
    if (book.image) {
      const imgPath = path.join(__dirname, '..', book.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await book.deleteOne();

    // Clean up related wishlist entries
    await Wishlist.deleteMany({ book: req.params.id });

    res.json({ success: true, message: 'Book listing deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/books/my-listings ──────────────────────────────────────────────

const getMyListings = async (req, res) => {
  try {
    const books = await Book.find({ seller: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook, getMyListings };
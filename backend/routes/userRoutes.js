/**
 * User Routes - Public profiles
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');

// GET /api/users/:id - Public seller profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar bio location totalListings totalSales createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const books = await Book.find({ seller: req.params.id, status: 'available' })
      .sort('-createdAt').limit(12);

    res.json({ success: true, data: { user, books } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
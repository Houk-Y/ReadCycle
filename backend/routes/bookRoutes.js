/**
 * Book Routes
 */

const express = require('express');
const router = express.Router();
const {
  getBooks, getBook, createBook, updateBook, deleteBook, getMyListings,
} = require('../controllers/bookController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validateBook } = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/',            optionalAuth, getBooks);
router.get('/my-listings', protect,      getMyListings);
router.get('/:id',         optionalAuth, getBook);

// Protected routes
router.post('/',    protect, upload.single('image'), validateBook, createBook);
router.put('/:id',  protect, upload.single('image'), updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
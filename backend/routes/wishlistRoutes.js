/**
 * Wishlist Routes
 */

const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',                    protect, getWishlist);
router.post('/',                   protect, addToWishlist);
router.get('/check/:bookId',       protect, checkWishlist);
router.delete('/:bookId',          protect, removeFromWishlist);

module.exports = router;
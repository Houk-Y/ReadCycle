/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, toggleBlockUser, deleteUser, getAllBooks, getAllTransactions,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/stats',                  getDashboardStats);
router.get('/users',                  getAllUsers);
router.put('/users/:id/block',        toggleBlockUser);
router.delete('/users/:id',           deleteUser);
router.get('/books',                  getAllBooks);
router.delete('/books/:id',           require('../controllers/bookController').deleteBook);
router.get('/transactions',           getAllTransactions);

module.exports = router;
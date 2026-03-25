/**
 * Transaction Routes
 */

const express = require('express');
const router = express.Router();
const { buyBook, requestSwap, getMyTransactions, updateTransactionStatus } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/buy',          protect, buyBook);
router.post('/swap',         protect, requestSwap);
router.get('/my',            protect, getMyTransactions);
router.put('/:id/status',    protect, updateTransactionStatus);

module.exports = router;
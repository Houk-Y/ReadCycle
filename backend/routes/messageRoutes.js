/**
 * Message Routes
 */

const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, deleteConversation } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { validateMessage } = require('../middleware/validateMiddleware');

router.get('/conversations',          protect, getConversations);
router.get('/:conversationId',        protect, getMessages);
router.post('/',                      protect, validateMessage, sendMessage);
router.delete('/conversations/:id',   protect, deleteConversation);

module.exports = router;
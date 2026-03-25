/**
 * Message Controller
 * One-to-one conversations between users
 */

const { Conversation, Message } = require('../models/Message');

// ─── GET /api/messages/conversations ─────────────────────────────────────────

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .populate('book', 'title image')
      .sort('-lastMessageAt');

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/messages/:conversationId ───────────────────────────────────────

const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      { conversation: req.params.conversationId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    // Reset unread count for this user
    const unreadMap = conversation.unreadCount || {};
    unreadMap[req.user._id.toString()] = 0;
    conversation.unreadCount = unreadMap;
    await conversation.save();

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/messages ───────────────────────────────────────────────────────
// Start or continue a conversation

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, bookId } = req.body;

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself.' });
    }

    // Find or create conversation between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        book: bookId || null,
      });
    }

    // Create the message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content,
    });

    // Update conversation last message
    const unreadMap = conversation.unreadCount ? Object.fromEntries(conversation.unreadCount) : {};
    const recipientKey = recipientId.toString();
    unreadMap[recipientKey] = (unreadMap[recipientKey] || 0) + 1;

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: content,
      lastMessageAt: new Date(),
      unreadCount: unreadMap,
    });

    await message.populate('sender', 'name avatar');

    res.status(201).json({ success: true, data: message, conversationId: conversation._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/messages/conversations/:id ───────────────────────────────────

const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });

    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

    await Message.deleteMany({ conversation: conversation._id });
    await conversation.deleteOne();

    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage, deleteConversation };
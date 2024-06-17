const express = require('express');
const router = express.Router();
const Message = require('../models/message.model');
const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');
const ensureAuthenticated = require('../middleware/authMiddleware');
const NodeCache = require('node-cache');

const myCache = new NodeCache({ stdTTL: 600, checkperiod: 900 });

// Placeholder function to simulate fetching connected users
async function fetchConnectedUsers(userId) {
  try {
    const user = await User.findById(userId).populate('connections');
    return user.connections;
  } catch (error) {
    console.error('Error fetching connected users:', error);
    throw error;
  }
}

// GET conversations for the current user
router.get('/', ensureAuthenticated, async (req, res) => {
  const cacheKey = `userConversations_${req.user._id}`;
  const cachedConversations = myCache.get(cacheKey);

  if (cachedConversations) {
    console.log('serving conversations from cache');
    return res.render('pages/messages.ejs', {
      conversations: cachedConversations.conversations,
      currentUser: req.user,
      connectedUsers: cachedConversations.connectedUsers
    });
  }

  try {
    const user = await User.findById(req.user._id).populate('conversations');
    const connectedUsers = await fetchConnectedUsers(req.user._id);
    const cacheData = {
      conversations: user.conversations,
      connectedUsers: connectedUsers
    };
    myCache.set(cacheKey, cacheData);
    res.render('pages/messages.ejs', { 
      conversations: user.conversations, 
      currentUser: req.user,
      connectedUsers: connectedUsers
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

// GET a specific conversation's messages based on user ID
router.get('/:userId', ensureAuthenticated, async (req, res) => {
  // Removed caching here since it involves real-time message updates
  try {
    const otherUserId = req.params.userId;
    const user = await User.findById(req.user._id);
    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      return res.status(404).send('User not found');
    }

    const conversation = await user.findOrCreateConversationWith(otherUser);

    const conversations = await Conversation.find({
      participants: { $all: [req.user._id, otherUserId] }
    }).populate('participants');

    const messages = await Message.find({
      conversation: conversation._id
    }).populate('sender').sort({ timestamp: 1 });

    res.render('pages/conversation', {
      messages: messages,
      receiver: otherUser,
      conversations: conversations,
      currentUser: req.user
    });
  } catch (error) {
    console.error('Error fetching or creating conversation:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST a new message in a conversation
router.post('/:userId', ensureAuthenticated, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const content = req.body.content;

    if (!content || content.trim() === '') {
      return res.status(400).send('Message content is required');
    }

    const user = await User.findById(req.user._id);
    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      return res.status(404).send('User not found');
    }

    const conversation = await user.findOrCreateConversationWith(otherUser);

    const newMessage = new Message({
      conversation: conversation._id,
      sender: user._id,
      content: content,
    });

    await newMessage.save();

    // Emit the message to both sender and receiver
    req.io.to(user._id.toString()).to(otherUser._id.toString()).emit('newMessage', {
      message: newMessage,
      senderId: user._id,
      conversationId: conversation._id
    });

    res.redirect(`/conversations/${otherUserId}`);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Internal Server Error');  }
});

module.exports = router;

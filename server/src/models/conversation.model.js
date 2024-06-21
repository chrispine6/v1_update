// conversation.model.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

const Conversation = mongoose.model('Conversation', conversationSchema, 'conversations');

module.exports = Conversation;
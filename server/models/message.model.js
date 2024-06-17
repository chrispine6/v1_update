const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String },
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

messageSchema.statics.findMessages = async function (senderId, receiverId) {
  try {
    console.log(`Searching for messages between ${senderId} and ${receiverId}`);
    const messages = await this.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).populate('sender').populate('receiver').sort({ timestamp: 1 });

    console.log(`Messages found: ${messages.length}`);
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

const Message = mongoose.model('Message', messageSchema, 'messages');

module.exports = Message;   
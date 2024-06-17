const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Conversation = require('./conversation.model'); 

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  dob: {
    type: Date,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  communities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }],
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  hasLoggedInBefore: {
    type: Boolean,
    default: false
  },
  accountType: { type: String, enum: ['free', 'premium', 'organizational'], default: 'free' },
}, {
  timestamps: true,
});

userSchema.methods.canStartConversationWith = function (otherUser) {
  return this.connections.includes(otherUser._id) && otherUser.connections.includes(this._id);
};

userSchema.methods.findOrCreateConversationWith = async function (otherUser) {
  if (!this.canStartConversationWith(otherUser)) {
    throw new Error('Both users must be connected to start a conversation.');
  }

  const existingConversation = await Conversation.findOne({
    participants: { $all: [this._id, otherUser._id] },
  });

  if (existingConversation) {
    return existingConversation;
  }

  const newConversation = new Conversation({
    participants: [this._id, otherUser._id],
  });

  await newConversation.save();

  if (!this.conversations.includes(newConversation._id)) {
    this.conversations.push(newConversation._id);
  }
  if (!otherUser.conversations.includes(newConversation._id)) {
    otherUser.conversations.push(newConversation._id);
  }

  await Promise.all([this.save(), otherUser.save()]);

  return newConversation;
};

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

const User = mongoose.model('User', userSchema, 'users_main');

module.exports = User;

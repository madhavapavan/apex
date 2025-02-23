// backend/models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  messages: [
    {
      text: {
        type: String,
        required: true,
      },
      sender: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', chatSchema);
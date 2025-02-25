const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  chatId: { type: String, required: true, unique: true }, // Unique ID for each chat thread
  messages: [messageSchema],
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', chatSchema);
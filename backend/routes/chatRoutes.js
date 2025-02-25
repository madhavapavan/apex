const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid'); // For generating unique chatIds
require('dotenv').config();

// Get all chats for a user
router.get('/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({ lastUpdated: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

// Get a specific chat by chatId
router.get('/thread/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findOne({ chatId: req.params.chatId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat thread:', error);
    res.status(500).json({ error: 'Error fetching chat thread' });
  }
});

// Create or update a chat thread
router.post('/', async (req, res) => {
  const { userId, message, chatId } = req.body;
  try {
    let chat;
    if (chatId) {
      // Append to existing chat
      chat = await Chat.findOne({ chatId });
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
    } else {
      // Create new chat
      chat = new Chat({ userId, chatId: uuidv4(), messages: [] });
    }

    chat.messages.push({ text: message, sender: 'user' });

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: message }] }],
      }
    );

    const botReply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    chat.messages.push({ text: botReply, sender: 'bot' });
    chat.lastUpdated = Date.now();

    await chat.save();
    res.json({ chatId: chat.chatId, reply: botReply });
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Error processing chat' });
  }
});

module.exports = router;
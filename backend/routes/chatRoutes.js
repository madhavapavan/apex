// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Get all chats for a user
router.get('/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({ lastUpdated: -1 });
    res.json({ chats }); // Consistent response format: { chats: [...] }
  } catch (error) {
    console.error('Error fetching chat history:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch chat history', details: error.message });
  }
});

// Get a specific chat by chatId
router.get('/thread/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findOne({ chatId: req.params.chatId });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat); // Return full chat object
  } catch (error) {
    console.error('Error fetching chat thread:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch chat thread', details: error.message });
  }
});

// Create or update a chat thread
router.post('/', async (req, res) => {
  const { userId, message, chatId } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }

  try {
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ chatId });
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
    } else {
      chat = new Chat({ userId, chatId: uuidv4(), messages: [] });
    }

    chat.messages.push({ text: message, sender: 'user' });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    console.log('Sending request to Gemini API:', geminiUrl);
    const geminiResponse = await axios.post(
      geminiUrl,
      { contents: [{ parts: [{ text: message }] }] },
      { timeout: 10000 }
    );

    const botReply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    console.log('Gemini API response:', botReply);
    chat.messages.push({ text: botReply, sender: 'bot' });
    chat.lastUpdated = Date.now();

    await chat.save();
    res.json({ chatId: chat.chatId, reply: botReply }); // Consistent response
  } catch (error) {
    console.error('Chat route error:', error.message, error.stack);
    if (error.response) {
      console.error('Gemini API error:', error.response.status, error.response.data);
    }
    res.status(500).json({ error: 'Failed to process chat', details: error.message });
  }
});

module.exports = router;

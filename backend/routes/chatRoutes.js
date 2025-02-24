// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const axios = require('axios');
require('dotenv').config();

router.get('/:userId', async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.params.userId });
    res.json(chat || { messages: [] });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

router.post('/', async (req, res) => {
  const { userId, message } = req.body;
  try {
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
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
    res.json({ reply: botReply });
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Error processing chat' });
  }
});

module.exports = router;
// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a new user
router.post('/', async (req, res) => {
  const { userId, username, email } = req.body;
  try {
    // Validate input
    if (!userId || !username || !email) {
      return res.status(400).json({ error: 'Missing required fields: userId, username, and email are required' });
    }
    // Check for duplicates
    const existingUser = await User.findOne({ $or: [{ userId }, { username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        error: `Duplicate found: ${existingUser.userId === userId ? 'userId' : existingUser.username === username ? 'username' : 'email'} already exists`,
      });
    }
    const newUser = new User({ userId, username, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error creating user:', err.name, err.message, err.code);
    if (err.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ error: 'Username or email already taken' });
    }
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
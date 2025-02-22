const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  const { userId, username, email } = req.body;

  try {
    const newUser = new User({ userId, username, email });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

router.get('/:userId', async (req, res) => {
  try{
    const user = await User.findOne({userId: req.params.userId});
    res.json(user);
  } catch(error){
    res.status(500).json({error: "Error retrieving user"})
  }
})

module.exports = router;
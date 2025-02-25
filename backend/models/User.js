const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String, // Added
  },
  lastName: {
    type: String, // Added
  },
  // Firebase Auth handles password storage.
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'O email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: [true, 'A senha é obrigatória'],
  },
  interests: [{
    type: Number,
    _id: false
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
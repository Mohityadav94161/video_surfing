// models/counterModel.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  seq: {
    type: Number,
    default: 100 // Start from 100 so first video gets 101
  }
});

module.exports = mongoose.model('Counter', counterSchema);

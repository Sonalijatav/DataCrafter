const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: String,
  type: String,
  data: Array,
  timestamp: { type: Date, default: Date.now }
}, { _id: true }); // ensure _id is auto-generated


const sheetSchema = new mongoose.Schema({
  title: String,
  rows: Array, // Sheet content rows
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  otp: String,
  otpExpiry: Date,
  role: { type: String, default: 'user' },
  files: [fileSchema],
  sheets: [sheetSchema]
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);




const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
  user: String,
  type: String,
  fileName: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Operation', operationSchema);

//fileRoute.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/files/user/:email - Protected route
router.get('/user/:email', auth, async (req, res) => {
  try {
    // Ensure the token belongs to the same user as being requested
    if (req.user.email !== req.params.email) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      files: user.files || [],
      sheets: user.sheets || [],
    });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;



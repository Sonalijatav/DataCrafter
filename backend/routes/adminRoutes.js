// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Operation = require('../models/Operation');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/admin');

// Apply auth and admin middleware to all routes
router.use(auth, isAdmin);

// Get all users with their files and sheets
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password -otp -otpExpiry');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all operations/activities
router.get('/operations', async (req, res) => {
  try {
    const operations = await Operation.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, operations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific user details with files and sheets
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password -otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Log the deletion operation
    await Operation.create({
      user: req.user.email,
      type: 'user-deleted',
      fileName: `User: ${user.email}`
    });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete specific file from user
router.delete('/users/:userId/files/:fileId', async (req, res) => {
  try {
    const { userId, fileId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const fileIndex = user.files.findIndex(file => file._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    const fileName = user.files[fileIndex].name;
    user.files.splice(fileIndex, 1);
    await user.save();
    
    // Log the operation
    await Operation.create({
      user: req.user.email,
      type: 'admin-file-deleted',
      fileName: `${fileName} from ${user.email}`
    });
    
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete specific sheet from user
router.delete('/users/:userId/sheets/:sheetTitle', async (req, res) => {
  try {
    const { userId, sheetTitle } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const originalLength = user.sheets.length;
    user.sheets = user.sheets.filter(sheet => sheet.title !== decodeURIComponent(sheetTitle));
    
    if (user.sheets.length === originalLength) {
      return res.status(404).json({ success: false, error: 'Sheet not found' });
    }
    
    await user.save();
    
    // Log the operation
    await Operation.create({
      user: req.user.email,
      type: 'admin-sheet-deleted',
      fileName: `${decodeURIComponent(sheetTitle)} from ${user.email}`
    });
    
    res.json({ success: true, message: 'Sheet deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOperations = await Operation.countDocuments();
    
    // Count total files and sheets
    const users = await User.find({}, 'files sheets');
    const totalFiles = users.reduce((acc, user) => acc + (user.files?.length || 0), 0);
    const totalSheets = users.reduce((acc, user) => acc + (user.sheets?.length || 0), 0);
    
    // Recent activities
    const recentOperations = await Operation.find()
      .sort({ timestamp: -1 })
      .limit(10);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFiles,
        totalSheets,
        totalOperations,
        recentOperations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});










module.exports = router;














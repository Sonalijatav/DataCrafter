//userRoute.js - Updated with admin check

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Operation = require('../models/Operation');



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


router.post('/login-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'User not found or password not set' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      token,
      user: { 
        email: user.email, 
        id: user._id,
        isAdmin: email === 'sonalijatav100@gmail.com' // Add admin flag
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/upload', auth, async (req, res) => {
  const { fileName, data, type } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.files.push({
      name: fileName,
      data: data,
      type: type,
      timestamp: new Date()
    });
    await user.save();

    await Operation.create({ user: req.user.email, type: 'upload', fileName });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/create-sheet', auth, async (req, res) => {
  const { title, rows } = req.body;

  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.sheets) {
      user.sheets = [];
    }

    user.sheets.push({
      title: title,
      rows: rows,
      createdAt: new Date()
    });

    await user.save();
    await Operation.create({ user: req.user.email, type: 'sheet-created', fileName: title });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all user files and sheets
router.get('/files/user/:email', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ 
      files: user.files || [], 
      sheets: user.sheets || [] 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete sheet by title
router.delete('/sheets/:email/:title', auth, async (req, res) => {
  try {
    const { email, title } = req.params;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.sheets = user.sheets.filter(sheet => sheet.title !== title);
    await user.save();

    res.json({ success: true, message: 'Sheet deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/files/:fileId', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const fileId = req.params.fileId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const fileIndex = user.files.findIndex(file => file._id.toString() === fileId);
    if (fileIndex === -1) return res.status(404).json({ error: 'File not found' });

    user.files.splice(fileIndex, 1);
    await user.save();
     
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (err) {
    console.error('File deletion error:', err);
    res.status(500).json({ error: 'Server error while deleting file' });
  }
});

// Register route 
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ email, _id: newUser._id }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        email, 
        id: newUser._id,
        isAdmin: email === 'sonalijatav100@gmail.com'
      } 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword)
    return res.status(400).json({ success: false, message: 'Email and new password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Route
router.post('/send-otp', async (req, res) => {
  const { email, context } = req.body;
  
  if (!email || !['signup', 'reset'].includes(context)) {
    return res.status(400).json({ success: false, message: 'Invalid parameters' });
  }

  const otp = generateOtp();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  try {
    const existingUser = await User.findOne({ email });

    if (context === 'signup') {
      if (existingUser && existingUser.password) {
        return res.status(400).json({ success: false, message: 'User already exists. Please login instead.' });
      }
      
      if (existingUser) {
        existingUser.otp = otp;
        existingUser.otpExpiry = expiry;
        await existingUser.save();
      } else {
        await User.create({ email, otp, otpExpiry: expiry });
      }
    } else {
      if (!existingUser || !existingUser.password) {
        return res.status(400).json({ success: false, message: 'User not found or not registered' });
      }
      
      existingUser.otp = otp;
      existingUser.otpExpiry = expiry;
      await existingUser.save();
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp} (expires in 10 minutes)`
    });

    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP for Signup
router.post('/verify-otp-signup', async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found. Please request OTP again.' });
    }

    if (user.password) {
      return res.status(400).json({ success: false, message: 'User already registered. Please login.' });
    }

    if (String(user.otp) !== String(otp) || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      const token = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET);

      return res.json({
        success: true,
        message: 'Signup successful',
        token,
        user: { 
          email: user.email, 
          id: user._id,
          isAdmin: email === 'sonalijatav100@gmail.com'
        }
      });
    } else {
      return res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    }
  } catch (error) {
    console.error('Verify OTP signup error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify OTP for Password Reset
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (String(user.otp) !== String(otp) || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

////////////
router.put('/update-file/:fileId', auth, async (req, res) => {
  const { fileId } = req.params;
  const { data } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const file = user.files.id(fileId);

    if (!file) return res.status(404).json({ error: 'File not found' });

    file.data = data;
    await user.save();

    res.json({ success: true, message: 'File updated successfully' });
  } catch (err) {
    console.error('Update file error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.put('/update-sheet/:sheetId', auth, async (req, res) => {
  const { sheetId } = req.params;
  const { rows } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const sheet = user.sheets.id(sheetId);

    if (!sheet) return res.status(404).json({ error: 'Sheet not found' });

    sheet.rows = rows;
    await user.save();

    res.json({ success: true, message: 'Sheet updated successfully' });
  } catch (err) {
    console.error('Update sheet error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;








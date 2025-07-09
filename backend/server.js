require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const User = require('./models/User');

const app = express();
app.use(cors());

// app.use(express.json());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));




const fileRoutes = require('./routes/fileRoute');
app.use('/api/files', fileRoutes); // This gives you /api/files/user/:email          //mount route

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);  //mount route

// 3. SERVER SETUP - Make sure routes are properly mounted
// In your main server file (app.js or server.js):
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://sonalijatav972:HYJpcSjZj9Mvsr0z@cluster0.ag4nq.mongodb.net/fileeditor')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));



// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  try {
    let user = await User.findOne({ email });
    if (!user) user = new User({ email });

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 min

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for File Processor Login',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error while sending OTP' });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

    // OTP is valid
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    

    const token = jwt.sign(
      {
        _id: user._id, // ✅ Add this line
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    
    


    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: { email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error while verifying OTP' });
  }
});


// for keep useer logi until he logout
// Token Verify Route
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      user: {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (err) {
    console.error('Token invalid:', err.message);
    res.json({ success: false, message: 'Token invalid or expired' });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});





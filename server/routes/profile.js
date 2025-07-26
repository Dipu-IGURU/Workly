const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Parse JSON request body
router.use(express.json());

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Please authenticate' });
  }
};

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    res.json({ success: true, profile: req.user.profile || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const updateData = {};
    const profileFields = [
      'avatar', 'fullName', 'jobTitle', 'email', 'phone', 'website',
      'currentSalary', 'experience', 'age', 'education', 'description',
      'facebook', 'twitter', 'linkedin', 'country', 'city', 'address'
    ];

    // Only include fields that exist in the request body
    profileFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[`profile.${field}`] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, profile: user.profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
});

// @route   GET api/profile/applied-jobs
// @desc    Get all jobs the user has applied to
// @access  Private (User)
router.get('/applied-jobs', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('appliedJobs.job');
    res.json({ success: true, jobs: user.appliedJobs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const moment = require('moment');

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

// Get current user's applied jobs
router.get('/applied-jobs', auth, async (req, res) => {
  try {
    // Populate the appliedJobs array with job details
    const user = await User.findById(req.user._id)
      .populate('appliedJobs.job', 'title company location type salary description requirements')
      .select('appliedJobs');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const jobs = user.appliedJobs.map(item => ({
      _id: item._id,
      job: item.job,
      appliedAt: item.appliedAt,
      status: item.status || 'applied'
    }));

    res.json({ 
      success: true, 
      jobs 
    });
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applied jobs', 
      error: error.message 
    });
  }
});

// Get user profile by ID (public)
router.get('/:userId', async (req, res) => {
  console.log('GET /api/profile/' + req.params.userId);
  
  try {
    console.log('Searching for user with ID:', req.params.userId);
    const user = await User.findById(req.params.userId).select('-password -tokens');
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('User not found with ID:', req.params.userId);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        receivedId: req.params.userId
      });
    }
    
    // Return basic profile information
    const profileData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      ...user.profile
    };
    
    console.log('Returning profile data for user:', user.email);
    res.json({ 
      success: true, 
      user: profileData 
    });
    
  } catch (error) {
    console.error('Error in GET /api/profile/:userId:', {
      error: error.message,
      stack: error.stack,
      params: req.params,
      query: req.query
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user profile', 
      error: error.message 
    });
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

// Get application statistics (count and change from last week)
router.get('/applied-jobs/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Get current week applications count
    const currentWeekCount = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$appliedJobs' },
      { $match: { 'appliedJobs.appliedAt': { $gte: oneWeekAgo } } },
      { $count: 'count' }
    ]);
    
    // Get last week applications count
    const lastWeekCount = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$appliedJobs' },
      { $match: { 
        'appliedJobs.appliedAt': { 
          $gte: twoWeeksAgo,
          $lt: oneWeekAgo
        } 
      }},
      { $count: 'count' }
    ]);
    
    // Calculate the difference
    const currentCount = currentWeekCount[0]?.count || 0;
    const lastCount = lastWeekCount[0]?.count || 0;
    const changeFromLastWeek = currentCount - lastCount;
    
    res.json({
      success: true,
      stats: {
        total: currentCount,
        changeFromLastWeek: changeFromLastWeek,
        changePercentage: lastCount > 0 ? Math.round((changeFromLastWeek / lastCount) * 100) : 100
      }
    });
    
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application statistics',
      error: error.message
    });
  }
});

module.exports = router;

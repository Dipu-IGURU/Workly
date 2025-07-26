const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');
const router = express.Router();
const moment = require('moment');
const auth = require('../middleware/auth');

// Parse JSON request body
router.use(express.json());

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

// Get interview statistics (count and scheduled this week)
router.get('/interview-stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Calculate start of current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    
    // Find all applications with interview status for this user
    const applications = await Application.find({
      applicant: userId,
      status: 'interview'
    }).populate('jobId', 'title company');
    
    // Count interviews scheduled for this week
    const interviewsThisWeek = applications.filter(app => {
      return app.updatedAt >= startOfWeek;
    }).length;
    
    // Get upcoming interviews (next 7 days)
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    const upcomingInterviews = applications
      .filter(app => app.updatedAt >= now && app.updatedAt <= nextWeek)
      .map(app => ({
        id: app._id,
        jobTitle: app.jobId?.title || 'Unknown Position',
        company: app.jobId?.company || 'Unknown Company',
        scheduledDate: app.updatedAt
      }));
    
    res.json({
      success: true,
      stats: {
        totalInterviews: applications.length,
        interviewsThisWeek: interviewsThisWeek,
        upcomingInterviews: upcomingInterviews
      }
    });
    
  } catch (error) {
    console.error('Error fetching interview stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interview statistics',
      error: error.message
    });
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

// Track profile view
router.post('/:userId/view', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user._id;

    // Don't track if user is viewing their own profile
    if (userId === viewerId.toString()) {
      return res.json({ success: true, message: 'Self-view not tracked' });
    }

    await User.findByIdAndUpdate(userId, {
      $push: {
        profileViews: {
          viewer: viewerId,
          viewedAt: new Date()
        }
      },
      $set: { lastProfileView: new Date() }
    });

    res.json({ success: true, message: 'Profile view tracked' });
  } catch (error) {
    console.error('Error tracking profile view:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error tracking profile view',
      error: error.message 
    });
  }
});

// Get profile view statistics
router.get('/:userId/view-stats', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get view counts
    const totalViews = user.profileViews.length;
    
    const thisMonthViews = user.profileViews.filter(view => 
      view.viewedAt >= startOfMonth
    ).length;
    
    const lastMonthViews = user.profileViews.filter(view => 
      view.viewedAt >= startOfLastMonth && view.viewedAt <= endOfLastMonth
    ).length;

    // Calculate percentage change
    let percentageChange = 0;
    if (lastMonthViews > 0) {
      percentageChange = Math.round(((thisMonthViews - lastMonthViews) / lastMonthViews) * 100);
    } else if (thisMonthViews > 0) {
      percentageChange = 100; // If no views last month, but some this month
    }

    // Get recent viewers (last 5)
    const recentViewers = user.profileViews
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, 5)
      .map(view => ({
        viewerId: view.viewer,
        viewedAt: view.viewedAt
      }));

    res.json({
      success: true,
      stats: {
        totalViews,
        thisMonthViews,
        percentageChange,
        lastView: user.lastProfileView,
        recentViewers
      }
    });

  } catch (error) {
    console.error('Error getting profile view stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting profile view statistics',
      error: error.message 
    });
  }
});

module.exports = router;

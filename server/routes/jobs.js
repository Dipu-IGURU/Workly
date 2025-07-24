const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Models
const Job = require('../models/Job');
const User = require('../models/User');

// @route   POST api/jobs
// @desc    Create a new job posting
// @access  Private (Recruiter)
router.post('/', auth, async (req, res) => {
  try {
    const { title, company, location, type, description, requirements } = req.body;

    // Validate required fields
    if (!title || !company || !location || !type || !description || !requirements) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Create new job
    const newJob = new Job({
      title,
      company,
      location,
      type,
      description,
      requirements,
      postedBy: req.user.id
    });

    const job = await newJob.save();
    res.status(201).json({ 
      success: true, 
      message: 'Job posted successfully',
      data: job 
    });
  } catch (err) {
    console.error('Error posting job:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while posting job',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET api/jobs
// @desc    Get all jobs posted by the recruiter
// @access  Private (Recruiter)
router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;

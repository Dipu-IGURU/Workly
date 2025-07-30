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
      postedBy: req.user._id
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
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ date: -1 });
    
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

// @route   GET api/jobs/my-jobs
// @desc    Get all jobs posted by the recruiter (alias for GET /)
// @access  Private (Recruiter)
router.get('/my-jobs', auth, async (req, res) => {
  try {
    console.log('Fetching jobs for user:', req.user._id);
    console.log('User object:', req.user);
    
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ date: -1 });
    console.log('Found jobs:', jobs);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    console.error('Error fetching my jobs:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET api/jobs/public
// @desc    Get all public jobs for display
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ date: -1 }).limit(20);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    console.error('Error fetching public jobs:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET api/jobs/:id
// @desc    Get a single job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid job ID format' 
      });
    }
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (err) {
    console.error('Error fetching job:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST api/jobs/:id/apply
// @desc    Apply to a job
// @access  Private (User)
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const jobId = req.params.id;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent duplicate applications
    if (user.appliedJobs.some(j => j.job.toString() === jobId)) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }

    user.appliedJobs.push({ job: jobId });
    await user.save();

    // Add applicant to job's applicants array
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (!job.applicants.some(a => a.user.toString() === user._id.toString())) {
      job.applicants.push({ user: user._id });
      await job.save();
    }

    res.json({ success: true, message: 'Applied successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   GET api/jobs/:id/applicants
// @desc    Get all applicants for a job (recruiter only)
// @access  Private (Recruiter)
router.get('/:id/applicants', auth, async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate('applicants.user');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, applicants: job.applicants });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   GET api/jobs/applications/recruiter
// @desc    Get all applications for all jobs posted by the recruiter
// @access  Private (Recruiter)
router.get('/applications/recruiter', auth, async (req, res) => {
  try {
    // Find all jobs posted by this recruiter
    const jobs = await Job.find({ postedBy: req.user._id }).populate('applicants.user');
    // Flatten all applicants with job info
    const applications = [];
    jobs.forEach(job => {
      job.applicants.forEach(app => {
        applications.push({
          _id: app._id,
          jobId: job._id,
          jobTitle: job.title,
          applicant: app.user,
          appliedAt: app.appliedAt
        });
      });
    });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Models
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF, DOC, and DOCX files
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST api/jobs
// @desc    Create a new job posting
// @access  Private (Recruiter)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title, type, workType, location, category, vacancies,
      company, companyWebsite, companyDescription,
      description, responsibilities, requiredSkills, preferredQualifications, experience, education,
      salaryRange, benefits,
      applicationDeadline, startDate, workHours,
      howToApply, contactEmail
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'title', 'type', 'workType', 'location', 'category', 'company', 'description',
      'responsibilities', 'requiredSkills', 'experience', 'salaryRange',
      'applicationDeadline', 'workHours', 'howToApply', 'contactEmail'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Create new job
    const newJob = new Job({
      title, type, workType, location, category, vacancies,
      company, companyWebsite, companyDescription,
      description, responsibilities, requiredSkills, preferredQualifications, experience, education,
      salaryRange, benefits,
      applicationDeadline, startDate, workHours,
      howToApply, contactEmail,
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

// @route   GET api/jobs/categories
// @desc    Get job categories with open positions count
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const results = await Job.aggregate([
      { $group: { _id: '$category', positions: { $sum: 1 } } },
      { $sort: { positions: -1 } }
    ]);
    const categories = results.map(r => ({ title: r._id, positions: r.positions }));
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching categories', error: err.message });
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
router.post('/:id/apply', auth, upload.single('resume'), async (req, res) => {
  try {
    const jobId = req.params.id;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Prevent duplicate applications
    const existingApplication = await Application.findOne({
      jobId: jobId,
      applicantId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied to this job' 
      });
    }

    // Extract form data
    const {
      fullName, email, phone, currentLocation, experience, education,
      currentCompany, currentPosition, expectedSalary, noticePeriod,
      coverLetter, portfolio, linkedinProfile
    } = req.body;

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'phone', 'currentLocation', 'experience', 'education'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      // If there's an uploaded file, remove it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Handle file upload
    let resumePath = '';
    if (req.file) {
      resumePath = `uploads/resumes/${path.basename(req.file.path)}`;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Resume is required' 
      });
    }

    // Create application record
    const application = new Application({
      jobId,
      applicantId: req.user._id,
      status: 'pending',
      fullName,
      email,
      phone,
      currentLocation,
      experience,
      education,
      currentCompany: currentCompany || '',
      currentPosition: currentPosition || '',
      expectedSalary: expectedSalary || '',
      noticePeriod: noticePeriod || '',
      coverLetter: coverLetter || '',
      portfolio: portfolio || '',
      linkedinProfile: linkedinProfile || '',
      resume: resumePath,
      appliedAt: new Date()
    });

    await application.save();

    // Add to user's applied jobs
    user.appliedJobs.push({
      job: jobId,
      application: application._id,
      status: 'pending',
      appliedAt: new Date()
    });

    await user.save();

    // Add application to job's applicants only if not already added
    if (!job.applicants.some(a => a.user.toString() === req.user._id.toString())) {
      job.applicants.push({
        user: req.user._id,
        application: application._id,
        appliedAt: new Date()
      });
      await job.save();
    }

    res.json({ 
      success: true, 
      message: 'Applied successfully',
      applicationId: application._id
    });
  } catch (err) {
    console.error('Error applying to job:', err);

    // Duplicate application attempt (handled in Application pre-save hook or Mongo unique index)
    if (err.message === 'You have already applied to this job' || err.code === 11000 || (typeof err.message === 'string' && err.message.includes('E11000'))) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Multer file upload or validation errors (e.g. wrong file type / file too large)
    if (err instanceof multer.MulterError || err.message?.startsWith('Only PDF') || err.message?.includes('File too large')) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Fallback – unknown server error
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
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

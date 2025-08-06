const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Applications API is running' });
});

// Update application status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'interview', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Find and update the application
    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    // Check if the user making the request is the job poster
    const job = await Job.findById(application.jobId);
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this application' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Application status updated successfully',
      application
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating application status',
      error: error.message 
    });
  }
});

// Get all applications for a recruiter's jobs with status filter
router.get('/recruiter/applications', auth, async (req, res) => {
  try {
    console.log('Fetching applications for user:', req.user._id);
    
    // Find all jobs posted by this recruiter
    const jobs = await Job.find({ postedBy: req.user._id }).select('_id');
    console.log('Found jobs for recruiter:', jobs);
    const jobIds = jobs.map(job => job._id);
    console.log('Job IDs:', jobIds);

    // Find applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title')
      .populate('applicantId', 'firstName lastName email')
      .sort({ appliedAt: -1 });
    
    console.log('Found applications:', applications);

    // Transform applications to match frontend expectations
    const transformedApplications = applications.map(app => ({
      _id: app._id,
      jobId: app.jobId._id,
      jobTitle: app.jobId.title,
      applicant: app.applicantId,
      appliedAt: app.appliedAt,
      status: app.status
    }));
    
    console.log('Transformed applications:', transformedApplications);

    // Count applications by status
    const statusCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Convert to object for easier access
    const counts = {};
    statusCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    console.log('Status counts:', counts);

    res.json({
      success: true,
      data: transformedApplications,
      counts: {
        total: transformedApplications.length,
        ...counts
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applications',
      error: error.message 
    });
  }
});

// @route   GET /api/applications/:applicationId
// @desc    Get a single application by ID (with applicant info)
// @access  Private (Recruiter or Applicant)
router.get('/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId).populate('applicantId', 'firstName lastName email avatar');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   GET /api/applications
// @desc    Get all applications for a user (with optional sort and limit)
// @access  Private (Recruiter or Applicant)
router.get('/', async (req, res) => {
  try {
    const { userId, sort = 'desc', limit = 0 } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    const query = { applicant: userId };
    let cursor = Application.find(query);
    if (sort === 'desc') {
      cursor = cursor.sort({ appliedAt: -1 });
    } else {
      cursor = cursor.sort({ appliedAt: 1 });
    }
    if (limit) {
      cursor = cursor.limit(Number(limit));
    }
    const applications = await cursor.exec();
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

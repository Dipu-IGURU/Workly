const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Update application status
router.put('/:id/status', auth, async (req, res) => {
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
    // Find all jobs posted by this recruiter
    const jobs = await Job.find({ postedBy: req.user._id }).select('_id');
    const jobIds = jobs.map(job => job._id);

    // Find applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title')
      .populate('applicant', 'firstName lastName email')
      .sort({ appliedAt: -1 });

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

    res.json({
      success: true,
      applications,
      counts: {
        total: applications.length,
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

module.exports = router;

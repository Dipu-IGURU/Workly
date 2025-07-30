const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'interview', 'rejected', 'hired'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  
  // Application Form Data
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  currentLocation: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  education: {
    type: String,
    required: true,
    trim: true
  },
  currentCompany: {
    type: String,
    trim: true
  },
  currentPosition: {
    type: String,
    trim: true
  },
  expectedSalary: {
    type: String,
    trim: true
  },
  noticePeriod: {
    type: String,
    trim: true
  },
  portfolio: {
    type: String,
    trim: true
  },
  linkedinProfile: {
    type: String,
    trim: true
  },
  resume: {
    type: String,
    required: false
  },
  coverLetter: {
    type: String,
    required: false
  },
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
applicationSchema.index({ jobId: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });

// Virtual for job details
applicationSchema.virtual('jobDetails', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

// Virtual for applicant details
applicationSchema.virtual('applicantDetails', {
  ref: 'User',
  localField: 'applicant',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to ensure one application per job per user
applicationSchema.pre('save', async function(next) {
  const existingApplication = await this.constructor.findOne({
    jobId: this.jobId,
    applicant: this.applicant,
    _id: { $ne: this._id }
  });

  if (existingApplication) {
    const error = new Error('You have already applied to this job');
    return next(error);
  }
  next();
});

// Static method to get application stats
applicationSchema.statics.getStats = async function(recruiterId) {
  const stats = await this.aggregate([{
    $lookup: {
      from: 'jobs',
      localField: 'jobId',
      foreignField: '_id',
      as: 'job'
    }
  }, {
    $unwind: '$job'
  }, {
    $match: {
      'job.postedBy': mongoose.Types.ObjectId(recruiterId)
    }
  }, {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }]);

  return stats.reduce((acc, curr) => ({
    ...acc,
    [curr._id]: curr.count
  }), {});
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;

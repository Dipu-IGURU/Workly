const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  // Basic Job Information
  title: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['Full-time', 'Part-time', 'Contract', 'Remote'] },
  workType: { type: String, required: true },
  location: { type: String, required: true, trim: true },
  vacancies: { type: String, trim: true },

  // Category Information
  category: { type: String, required: true, trim: true },

  // Company Information
  company: { type: String, required: true, trim: true },
  companyWebsite: { type: String, trim: true },
  companyDescription: { type: String, trim: true },

  // Job Description
  description: { type: String, required: true },
  responsibilities: { type: String, required: true },
  requiredSkills: { type: String, required: true },
  preferredQualifications: { type: String, trim: true },
  experience: { type: String, required: true },
  education: { type: String, trim: true },

  // Compensation & Benefits
  salaryRange: { type: String, required: true },
  benefits: { type: String, trim: true },

  // Other Details
  applicationDeadline: { type: String, required: true },
  startDate: { type: String, trim: true },
  workHours: { type: String, required: true },

  // Application Process
  howToApply: { type: String, required: true },
  contactEmail: { type: String, required: true, trim: true },

  // System fields
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Job', JobSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema for tracking profile views
const profileViewSchema = new mongoose.Schema({
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 8
    // Not required, as Google users won't have a password
  },
  role: {
    type: String,
    enum: ['user', 'recruiter'],
    required: true
  },
  company: {
    type: String,
    required: function() {
      return this.role === 'recruiter';
    },
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileViews: [profileViewSchema],
  lastProfileView: {
    type: Date,
    default: null
  },
  profile: {
    avatar: String,
    fullName: String,
    jobTitle: String,
    email: String,
    phone: String,
    website: String,
    currentSalary: String,
    experience: String,
    age: String,
    education: String,
    description: String,
    facebook: String,
    twitter: String,
    linkedin: String,
    country: String,
    city: String,
    address: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  appliedJobs: [{
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    appliedAt: { type: Date, default: Date.now }
  }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Transform output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);

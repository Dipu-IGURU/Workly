const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

// User model (simplified version)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'recruiter'], required: true },
  company: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function createTestRecruiter() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workly';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if recruiter already exists
    const existingRecruiter = await User.findOne({ email: 'recruiter@test.com' });
    if (existingRecruiter) {
      console.log('Test recruiter already exists');
      process.exit(0);
    }

    // Create test recruiter
    const testRecruiter = new User({
      firstName: 'Test',
      lastName: 'Recruiter',
      email: 'recruiter@test.com',
      password: 'password123',
      role: 'recruiter',
      company: 'Test Company'
    });

    await testRecruiter.save();
    console.log('Test recruiter created successfully:');
    console.log('Email: recruiter@test.com');
    console.log('Password: password123');
    console.log('Role: recruiter');
    console.log('Company: Test Company');

    // Also create a test user for comparison
    const existingUser = await User.findOne({ email: 'user@test.com' });
    if (!existingUser) {
      const testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'user@test.com',
        password: 'password123',
        role: 'user'
      });

      await testUser.save();
      console.log('\nTest user also created:');
      console.log('Email: user@test.com');
      console.log('Password: password123');
      console.log('Role: user');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestRecruiter();
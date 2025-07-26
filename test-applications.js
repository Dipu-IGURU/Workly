const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workly', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Application = require('./server/models/Application');
const Job = require('./server/models/Job');

async function checkData() {
  try {
    // Check if there are any jobs
    const jobs = await Job.find({});
    console.log('Total jobs in database:', jobs.length);
    
    if (jobs.length > 0) {
      console.log('Sample job:', {
        id: jobs[0]._id,
        title: jobs[0].title,
        postedBy: jobs[0].postedBy,
        applicants: jobs[0].applicants.length
      });
    }

    // Check if there are any applications
    const applications = await Application.find({}).populate('jobId', 'title').populate('applicant', 'email');
    console.log('Total applications in database:', applications.length);
    
    if (applications.length > 0) {
      console.log('Sample application:', {
        id: applications[0]._id,
        jobTitle: applications[0].jobId?.title,
        applicant: applications[0].applicant?.email,
        status: applications[0].status
      });
    }

    // Check the recruiter applications endpoint directly
    const recruiterId = jobs[0]?.postedBy; // Assuming first job has a recruiter
    if (recruiterId) {
      const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('_id');
      const jobIds = recruiterJobs.map(job => job._id);
      
      const recruiterApplications = await Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log('Recruiter application counts by status:', recruiterApplications);
    }

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkData();

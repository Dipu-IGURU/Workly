const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // React dev server
  'https://can-hiring.vercel.app',
  'https://www.can-hiring.vercel.app',
  'https://can-hiring.onrender.com',
  'https://www.can-hiring.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow mobile apps or curl
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API is running',
    timestamp: new Date().toISOString(),
    database: 'Not checked'
  });
});

// MongoDB health check route
app.get('/api/health/db', async (req, res) => {
  try {
    // Get the raw client from mongoose
    const client = mongoose.connection.client;
    // Run a simple command to check the connection
    await client.db().command({ ping: 1 });
    
    res.json({
      status: 'success',
      message: 'Successfully connected to MongoDB',
      dbState: mongoose.connection.readyState,
      dbName: mongoose.connection.name,
      dbHost: mongoose.connection.host,
      dbPort: mongoose.connection.port,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to MongoDB',
      error: error.message,
      dbState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection with retry logic
const connectWithRetry = () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workly';

  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔁 Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Start the app
connectWithRetry();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

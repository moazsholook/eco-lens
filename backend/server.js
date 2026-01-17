// EcoLens Backend Server
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./db');
const { User, Emission } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ecolens-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
connectDB();

// ============================================
// AUTH MIDDLEWARE
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ============================================
// AUTH ROUTES
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      dailyCO2Goal: 8000,
      preferences: { units: 'metric', notifications: true, theme: 'system' },
      stats: { totalScans: 0, totalCO2: 0, streakDays: 0 }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ New user registered:', email);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyCO2Goal: user.dailyCO2Goal,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user (include passwordHash for verification)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in:', email);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyCO2Goal: user.dailyCO2Goal,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user (protected)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      dailyCO2Goal: user.dailyCO2Goal,
      stats: user.stats,
      preferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// EMISSION ROUTES
// ============================================

// Save new emission
app.post('/api/emissions', async (req, res) => {
  try {
    const {
      userId,
      imageUrl,
      objectName,
      category,
      carbonValue,
      carbonFootprint,
      lifecycle,
      explanation,
      alternatives,
      quantity = 1
    } = req.body;

    if (!userId || !objectName || carbonValue === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, objectName, carbonValue' 
      });
    }

    const emission = await Emission.create({
      userId,
      imageUrl,
      objectName,
      category: category || 'other',
      carbonValue,
      carbonFootprint,
      lifecycle: lifecycle || [],
      explanation: explanation || '',
      alternatives: alternatives || [],
      quantity,
      scannedAt: new Date(),
      date: new Date().toISOString().split('T')[0]
    });

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        'stats.totalScans': 1, 
        'stats.totalCO2': carbonValue * quantity 
      },
      $set: { updatedAt: new Date() }
    });

    console.log('💾 Emission saved:', objectName);
    res.status(201).json(emission);
  } catch (error) {
    console.error('Error saving emission:', error);
    res.status(500).json({ error: 'Failed to save emission' });
  }
});

// Get today's emissions for user
app.get('/api/emissions/today/:userId', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const emissions = await Emission.find({ 
      userId: req.params.userId, 
      date: today 
    }).sort({ scannedAt: -1 });

    const totalCO2 = emissions.reduce((sum, e) => sum + e.carbonValue * e.quantity, 0);

    res.json({ 
      date: today,
      emissions, 
      totalCO2,
      count: emissions.length 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get emissions' });
  }
});

// Get emission history
app.get('/api/emissions/history/:userId', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const emissions = await Emission.find({
      userId: req.params.userId,
      scannedAt: { $gte: startDate }
    }).sort({ scannedAt: -1 });

    const byDate = emissions.reduce((acc, emission) => {
      const date = emission.date;
      if (!acc[date]) {
        acc[date] = { date, totalCO2: 0, items: [] };
      }
      acc[date].totalCO2 += emission.carbonValue * emission.quantity;
      acc[date].items.push({
        id: emission._id,
        name: emission.objectName,
        carbonValue: emission.carbonValue,
        category: emission.category
      });
      return acc;
    }, {});

    res.json(Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 EcoLens API running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   POST /api/emissions`);
  console.log(`   GET  /api/emissions/today/:userId`);
  console.log(`   GET  /api/emissions/history/:userId`);
});

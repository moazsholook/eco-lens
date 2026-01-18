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
// DASHBOARD STATS ROUTES
// ============================================

// Get recent scans for user
app.get('/api/emissions/recent/:userId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const emissions = await Emission.find({ userId: req.params.userId })
      .sort({ scannedAt: -1 })
      .limit(parseInt(limit));

    const recentScans = emissions.map(e => ({
      id: e._id,
      itemName: e.objectName,
      category: e.category || 'other',
      impactKg: e.carbonValue / 1000,
      scannedAt: e.scannedAt,
      imageUrl: e.imageUrl
    }));

    res.json(recentScans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recent scans' });
  }
});

// Get category breakdown
app.get('/api/emissions/breakdown/:userId', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const emissions = await Emission.find({
      userId: req.params.userId,
      scannedAt: { $gte: startDate }
    });

    // Aggregate by category
    const categoryTotals = {};
    let totalCO2 = 0;

    emissions.forEach(e => {
      const cat = e.category || 'other';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = 0;
      }
      categoryTotals[cat] += e.carbonValue;
      totalCO2 += e.carbonValue;
    });

    // Convert to breakdown format
    const colors = {
      food: '#10b981',
      beverage: '#14b8a6',
      clothing: '#0d9488',
      electronics: '#059669',
      transportation: '#047857',
      household: '#065f46',
      packaging: '#064e3b',
      other: '#6b7280'
    };

    const breakdown = Object.entries(categoryTotals).map(([category, co2]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      percentage: totalCO2 > 0 ? Math.round((co2 / totalCO2) * 100) : 0,
      impactKg: co2 / 1000,
      color: colors[category] || colors.other
    })).sort((a, b) => b.percentage - a.percentage);

    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get category breakdown' });
  }
});

// Get dashboard stats by period
app.get('/api/dashboard/stats/:userId', async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const userId = req.params.userId;
    
    // Calculate date ranges
    const now = new Date();
    let startDate, previousStartDate, periodDays;
    
    if (period === 'weekly') {
      periodDays = 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      periodDays = 30;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(startDate.getDate() - 30);
    } else {
      periodDays = 365;
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      previousStartDate = new Date(startDate);
      previousStartDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Get current period emissions
    const currentEmissions = await Emission.find({
      userId,
      scannedAt: { $gte: startDate }
    });

    // Get previous period emissions for comparison
    const previousEmissions = await Emission.find({
      userId,
      scannedAt: { $gte: previousStartDate, $lt: startDate }
    });

    // Calculate stats
    const totalScans = currentEmissions.length;
    const totalCO2 = currentEmissions.reduce((sum, e) => sum + e.carbonValue, 0);
    const previousCO2 = previousEmissions.reduce((sum, e) => sum + e.carbonValue, 0);
    
    // Calculate improvement (positive = better, negative = worse)
    let improvementPercent = 0;
    if (previousCO2 > 0) {
      improvementPercent = Math.round(((previousCO2 - totalCO2) / previousCO2) * 100);
    }

    // Find top category
    const categoryTotals = {};
    currentEmissions.forEach(e => {
      const cat = e.category || 'other';
      if (!categoryTotals[cat]) categoryTotals[cat] = { count: 0, co2: 0, items: {} };
      categoryTotals[cat].count++;
      categoryTotals[cat].co2 += e.carbonValue;
      categoryTotals[cat].items[e.objectName] = (categoryTotals[cat].items[e.objectName] || 0) + 1;
    });

    let topCategory = 'None';
    let topItem = 'None';
    let maxCO2 = 0;

    Object.entries(categoryTotals).forEach(([cat, data]) => {
      if (data.co2 > maxCO2) {
        maxCO2 = data.co2;
        topCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
        // Find most scanned item in this category
        const items = Object.entries(data.items);
        if (items.length > 0) {
          topItem = items.sort((a, b) => b[1] - a[1])[0][0];
        }
      }
    });

    // Generate trend data
    const trendData = [];
    if (period === 'weekly') {
      // Daily data for week
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayEmissions = currentEmissions.filter(e => 
          e.date === dateStr || e.scannedAt.toISOString().split('T')[0] === dateStr
        );
        const dayCO2 = dayEmissions.reduce((sum, e) => sum + e.carbonValue, 0);
        trendData.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: dayCO2 / 1000
        });
      }
    } else if (period === 'monthly') {
      // Weekly data for month
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 7);
        
        const weekEmissions = currentEmissions.filter(e => 
          e.scannedAt >= weekStart && e.scannedAt <= weekEnd
        );
        const weekCO2 = weekEmissions.reduce((sum, e) => sum + e.carbonValue, 0);
        trendData.push({
          label: `W${4 - i}`,
          value: weekCO2 / 1000
        });
      }
    } else {
      // Monthly data for year
      for (let i = 5; i >= 0; i--) {
        const monthEnd = new Date(now);
        monthEnd.setMonth(now.getMonth() - i);
        const monthStart = new Date(monthEnd);
        monthStart.setMonth(monthEnd.getMonth() - 1);
        
        const monthEmissions = currentEmissions.filter(e => 
          e.scannedAt >= monthStart && e.scannedAt <= monthEnd
        );
        const monthCO2 = monthEmissions.reduce((sum, e) => sum + e.carbonValue, 0);
        trendData.push({
          label: monthEnd.toLocaleDateString('en-US', { month: 'short' }),
          value: monthCO2 / 1000
        });
      }
    }

    // Generate comparison text
    let comparisonText = '';
    if (improvementPercent > 0) {
      comparisonText = `You're ${improvementPercent}% better than last ${period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}!`;
    } else if (improvementPercent < 0) {
      comparisonText = `${Math.abs(improvementPercent)}% increase from last ${period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}`;
    } else {
      comparisonText = totalScans > 0 ? 'Same as last period' : 'Start scanning to track progress!';
    }

    res.json({
      metrics: {
        label: period.charAt(0).toUpperCase() + period.slice(1),
        totalScans,
        footprintKg: totalCO2 / 1000,
        improvementPercent: Math.max(improvementPercent, 0),
        topCategory,
        topItem,
        comparisonText
      },
      trendData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
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
  console.log(`   GET  /api/emissions/recent/:userId`);
  console.log(`   GET  /api/emissions/breakdown/:userId`);
  console.log(`   GET  /api/dashboard/stats/:userId`);
});

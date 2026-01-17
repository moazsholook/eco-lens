// EcoLens Backend Server
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const { User, Emission } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
connectDB();

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// USER ROUTES
// ============================================

// Get or create demo user (for testing without auth)
app.get('/api/users/demo', async (req, res) => {
  try {
    let user = await User.findOne({ email: 'demo@ecolens.app' });
    
    if (!user) {
      user = await User.create({
        email: 'demo@ecolens.app',
        name: 'Demo User',
        passwordHash: 'demo',
        dailyCO2Goal: 8000,
        preferences: { units: 'metric', notifications: true, theme: 'system' },
        stats: { totalScans: 0, totalCO2: 0, streakDays: 0 }
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting demo user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get user stats
app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ============================================
// EMISSION ROUTES
// ============================================

// Save new emission (called after image analysis)
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

    // Validate required fields
    if (!userId || !objectName || carbonValue === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, objectName, carbonValue' 
      });
    }

    // Create emission
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

// Get emission history for user
app.get('/api/emissions/history/:userId', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const emissions = await Emission.find({
      userId: req.params.userId,
      scannedAt: { $gte: startDate }
    }).sort({ scannedAt: -1 });

    // Group by date
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

// Get recent scans
app.get('/api/emissions/recent/:userId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const emissions = await Emission.find({ userId: req.params.userId })
      .sort({ scannedAt: -1 })
      .limit(parseInt(limit));

    res.json(emissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recent scans' });
  }
});

// Delete emission
app.delete('/api/emissions/:id', async (req, res) => {
  try {
    const emission = await Emission.findById(req.params.id);
    if (!emission) {
      return res.status(404).json({ error: 'Emission not found' });
    }

    // Update user stats (subtract)
    await User.findByIdAndUpdate(emission.userId, {
      $inc: { 
        'stats.totalScans': -1, 
        'stats.totalCO2': -(emission.carbonValue * emission.quantity)
      }
    });

    await emission.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete emission' });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 EcoLens API running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/users/demo`);
  console.log(`   POST /api/emissions`);
  console.log(`   GET  /api/emissions/today/:userId`);
  console.log(`   GET  /api/emissions/history/:userId`);
});

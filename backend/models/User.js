// User Model for EcoLens
// MongoDB/Mongoose schema for user accounts

const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  units: {
    type: String,
    enum: ['metric', 'imperial'],
    default: 'metric'
  },
  notifications: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  }
}, { _id: false });

const userStatsSchema = new mongoose.Schema({
  totalScans: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCO2: {
    type: Number,
    default: 0,
    min: 0
  },
  streakDays: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false // Don't include in queries by default
  },
  avatar: {
    type: String
  },
  dailyCO2Goal: {
    type: Number,
    default: 8000, // 8kg in grams
    min: [0, 'Goal must be positive']
  },
  preferences: {
    type: userPreferencesSchema,
    default: () => ({})
  },
  stats: {
    type: userStatsSchema,
    default: () => ({})
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'users'
});

// Index for faster email lookups
userSchema.index({ email: 1 });

// Virtual for checking if user is on track for daily goal
userSchema.virtual('isOnTrack').get(function() {
  // This would be calculated based on today's emissions
  return true;
});

// Method to update stats after a new emission
userSchema.methods.addEmission = async function(carbonValue) {
  this.stats.totalScans += 1;
  this.stats.totalCO2 += carbonValue;
  await this.save();
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

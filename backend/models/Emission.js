// Emission Model for EcoLens
// MongoDB/Mongoose schema for tracked CO2 emissions

const mongoose = require('mongoose');

const alternativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  benefit: {
    type: String,
    required: true
  },
  carbonSavings: {
    type: String,
    required: true
  }
}, { _id: false });

const emissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  imageUrl: {
    type: String
  },
  objectName: {
    type: String,
    required: [true, 'Object name is required'],
    trim: true,
    maxlength: [200, 'Object name cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['food', 'beverage', 'clothing', 'electronics', 'transportation', 'household', 'packaging', 'other'],
    default: 'other'
  },
  carbonValue: {
    type: Number,
    required: [true, 'Carbon value is required'],
    min: [0, 'Carbon value must be positive']
  },
  carbonFootprint: {
    type: String,
    required: true
  },
  lifecycle: [{
    type: String
  }],
  explanation: {
    type: String
  },
  alternatives: [alternativeSchema],
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  scannedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  date: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  }
}, {
  timestamps: true,
  collection: 'emissions'
});

// Compound indexes for efficient queries
emissionSchema.index({ userId: 1, scannedAt: -1 }); // Recent scans per user
emissionSchema.index({ userId: 1, date: 1 }); // Daily aggregation
emissionSchema.index({ userId: 1, category: 1 }); // Category filtering
emissionSchema.index({ scannedAt: -1 }); // Global recent scans

// Pre-save middleware to set date from scannedAt
emissionSchema.pre('save', function(next) {
  if (this.isNew && !this.date) {
    this.date = this.scannedAt.toISOString().split('T')[0];
  }
  next();
});

// Static method: Get daily total for a user
emissionSchema.statics.getDailyTotal = async function(userId, date) {
  const dateStr = date || new Date().toISOString().split('T')[0];
  
  const result = await this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId), 
        date: dateStr 
      } 
    },
    { 
      $group: { 
        _id: '$date', 
        totalCO2: { $sum: '$carbonValue' }, 
        itemCount: { $sum: 1 } 
      } 
    }
  ]);
  
  return result[0] || { totalCO2: 0, itemCount: 0 };
};

// Static method: Get CO2 breakdown by category
emissionSchema.statics.getCategoryBreakdown = async function(userId, startDate, endDate) {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (startDate || endDate) {
    match.scannedAt = {};
    if (startDate) match.scannedAt.$gte = new Date(startDate);
    if (endDate) match.scannedAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: match },
    { 
      $group: { 
        _id: '$category', 
        totalCO2: { $sum: '$carbonValue' }, 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { totalCO2: -1 } }
  ]);
};

// Static method: Get weekly history
emissionSchema.statics.getWeeklyHistory = async function(userId, weeksBack = 1) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeksBack * 7));
  
  return this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId), 
        scannedAt: { $gte: startDate } 
      } 
    },
    { 
      $group: { 
        _id: '$date', 
        totalCO2: { $sum: '$carbonValue' }, 
        items: { $push: '$objectName' } 
      } 
    },
    { $sort: { _id: -1 } }
  ]);
};

// Static method: Get recent scans
emissionSchema.statics.getRecentScans = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ scannedAt: -1 })
    .limit(limit);
};

// Instance method: Get total with quantity
emissionSchema.methods.getTotalCarbon = function() {
  return this.carbonValue * this.quantity;
};

const Emission = mongoose.model('Emission', emissionSchema);

module.exports = Emission;

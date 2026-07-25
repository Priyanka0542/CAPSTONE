const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    careerPathId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerPath',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    taskDescription: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
dailyActivitySchema.index({ userId: 1, date: 1 });
dailyActivitySchema.index({ userId: 1, careerPathId: 1, date: 1 });

module.exports = mongoose.model('DailyActivity', dailyActivitySchema);

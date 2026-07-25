const mongoose = require('mongoose');

const streakLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

streakLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StreakLog', streakLogSchema);

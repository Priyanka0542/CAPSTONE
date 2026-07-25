const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badgeType: {
      type: String,
      enum: [
        '7-day-streak',
        '30-day-streak',
        'first-milestone',
        'path-completed',
        '3-paths-created',
      ],
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

badgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);

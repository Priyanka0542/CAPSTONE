const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true },
    milestone: { type: String, required: true },
    tasks: [{ type: String }],
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const careerPathSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goalTitle: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'deleted'],
      default: 'active',
    },
    estimatedMonths: {
      type: Number,
      required: true,
    },
    estimatedCostINR: {
      type: Number,
      required: true,
    },
    estimatedOutcomeSalaryINR: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    roadmap: [roadmapStepSchema],
    assumptions: {
      type: String,
      required: true,
    },
    monthsElapsed: {
      type: Number,
      default: 0,
    },
    userProfile: {
      age: Number,
      degree: String,
      budget: Number,
      country: { type: String, default: 'India' },
    },
  },
  {
    timestamps: true,
  }
);

// Only return non-deleted paths by default
careerPathSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ status: { $ne: 'deleted' } });
  }
  next();
});

module.exports = mongoose.model('CareerPath', careerPathSchema);

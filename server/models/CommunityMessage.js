const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema(
  {
    goalSlug: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    reported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by goalSlug and createdAt
communityMessageSchema.index({ goalSlug: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityMessage', communityMessageSchema);

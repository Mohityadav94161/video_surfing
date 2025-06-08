const mongoose = require('mongoose');

const supportSubmissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Submission type is required'],
      enum: ['contact-us', 'partnership-program', 'content-removal'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    username: {
      type: String,
      default: 'guest',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    additionalData: {
      type: Object,
      default: {},
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
supportSubmissionSchema.index({ type: 1, status: 1, createdAt: -1 });

const SupportSubmission = mongoose.model('SupportSubmission', supportSubmissionSchema);

module.exports = SupportSubmission; 
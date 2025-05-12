const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    originalUrl: {
      type: String,
      required: [true, 'Original video URL is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Education',
        'Entertainment',
        'Gaming',
        'Music',
        'News',
        'Sports',
        'Technology',
        'Travel',
        'Other',
      ],
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Video must be added by a user'],
    },
    views: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    sourceWebsite: {
      type: String,
      required: [true, 'Source website is required'],
      trim: true,
    },
    // New fields for reactions summary
    likesCount: {
      type: Number,
      default: 0
    },
    dislikesCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search optimization
videoSchema.index({ title: 'text', tags: 'text', description: 'text' });

// Pre-save middleware to extract source website from URL
videoSchema.pre('save', function (next) {
  if (!this.isModified('originalUrl')) return next();
  
  try {
    const url = new URL(this.originalUrl);
    this.sourceWebsite = url.hostname;
  } catch (err) {
    this.sourceWebsite = 'unknown';
  }
  
  next();
});

// Virtual populate for comments
videoSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'video',
  localField: '_id'
});

// Method to update reaction counts
videoSchema.methods.updateReactionCounts = async function() {
  const Reaction = mongoose.model('Reaction');
  const stats = await Reaction.getReactionStats(this._id);
  
  this.likesCount = stats.likes;
  this.dislikesCount = stats.dislikes;
  
  await this.save({ validateBeforeSave: false });
  
  return this;
};

const Video = mongoose.model('Video', videoSchema);

module.exports = Video; 
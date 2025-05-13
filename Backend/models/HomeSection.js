const mongoose = require('mongoose');

const homeSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot be more than 300 characters'],
    },
    sectionType: {
      type: String,
      required: [true, 'Section type is required'],
      enum: ['featured', 'category', 'trending', 'custom', 'newest'],
      default: 'custom'
    },
    category: {
      type: String,
      trim: true,
      // Only required if sectionType is 'category'
    },
    displayOrder: {
      type: Number,
      default: 0, // 0 is the top position
    },
    layout: {
      type: String,
      enum: ['grid', 'carousel', 'featured', 'banner', 'list'],
      default: 'carousel',
    },
    maxItems: {
      type: Number,
      default: 12,
      min: [1, 'At least 1 item must be shown'],
      max: [24, 'Maximum 24 items can be displayed']
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    backgroundColor: {
      type: String,
      default: '', // CSS color or empty for default theme color
    },
    customCSS: {
      type: String,
      default: '',
    },
    filterTags: [{
      type: String,
      trim: true
    }],
    // For custom sections with manually selected videos
    videos: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Video',
      },
    ],
    // Videos from this source will be prioritized
    prioritySource: {
      type: String,
      trim: true,
    },
    // Minimum number of views to include video
    minViews: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Section must be created by a user'],
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Make sure sections with type 'category' have a category field
homeSectionSchema.pre('save', function(next) {
  if (this.sectionType === 'category' && !this.category) {
    return next(new Error('Category is required for category-type sections'));
  }
  next();
});

// Auto-generate description for category sections if not provided
homeSectionSchema.pre('save', function(next) {
  if (this.sectionType === 'category' && !this.description && this.category) {
    this.description = `Explore our collection of ${this.category} videos`;
  }
  next();
});

// Create index on display order for efficient sorting
homeSectionSchema.index({ displayOrder: 1 });

const HomeSection = mongoose.model('HomeSection', homeSectionSchema);

module.exports = HomeSection; 
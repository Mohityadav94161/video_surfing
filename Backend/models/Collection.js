const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [50, 'Collection name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Collection must belong to a user'],
    },
    videos: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Video',
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index to optimize queries by owner
collectionSchema.index({ owner: 1, createdAt: -1 });

// Index for text search on name and description
collectionSchema.index({ name: 'text', description: 'text' });

// Static method to calculate collection stats for a user
collectionSchema.statics.getUserCollectionStats = async function(userId) {
  return await this.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), active: true }
    },
    {
      $project: {
        name: 1,
        videoCount: { $size: '$videos' }
      }
    },
    {
      $group: {
        _id: null,
        totalCollections: { $sum: 1 },
        totalVideosInCollections: { $sum: '$videoCount' },
        collections: { $push: { id: '$_id', name: '$name', count: '$videoCount' } }
      }
    }
  ]);
};

// Method to add video to collection
collectionSchema.methods.addVideo = async function(videoId) {
  if (!this.videos.includes(videoId)) {
    this.videos.push(videoId);
    await this.save();
  }
  return this;
};

// Method to remove video from collection
collectionSchema.methods.removeVideo = async function(videoId) {
  this.videos = this.videos.filter(video => !video.equals(videoId));
  await this.save();
  return this;
};

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection; 
const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['like', 'dislike'],
      required: [true, 'Reaction type is required'],
    },
    video: {
      type: mongoose.Schema.ObjectId,
      ref: 'Video',
      required: [true, 'Reaction must belong to a video'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Reaction must be made by a user'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only have one reaction per video
reactionSchema.index({ video: 1, user: 1 }, { unique: true });

// Static method to get reaction counts
reactionSchema.statics.getReactionStats = async function(videoId) {
  const stats = await this.aggregate([
    {
      $match: { video: mongoose.Types.ObjectId(videoId) }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  // Format the results into an object
  const formattedStats = {
    likes: 0,
    dislikes: 0
  };

  stats.forEach(stat => {
    formattedStats[stat._id + 's'] = stat.count;
  });

  return formattedStats;
};

const Reaction = mongoose.model('Reaction', reactionSchema);

module.exports = Reaction; 
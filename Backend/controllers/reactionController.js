const Reaction = require('../models/Reaction');
const Video = require('../models/Video');
const mongoose = require('mongoose');

// Add or update a reaction (like or dislike)
exports.toggleReaction = async (req, res, next) => {
  try {
    const { type } = req.body;
    const rawId = req.params.videoId;
    const userId = req.user.id;
    
    // Validate reaction type
    if (!type || !['like', 'dislike'].includes(type)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid reaction type. Must be "like" or "dislike"'
      });
    }
    
    // Find video by _id or videoId
    let video = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      video = await Video.findOne({ _id: rawId, active: true });
    }
    
    // If not found by _id, try finding by videoId
    if (!video) {
      video = await Video.findOne({ videoId: rawId, active: true });
    }
    
    if (!video) {
      return res.status(404).json({
        status: 'fail',
        message: 'Video not found'
      });
    }
    
    // Check if user already reacted to this video
    const existingReaction = await Reaction.findOne({
      video: video._id,
      user: userId
    });
    
    let reaction;
    
    if (existingReaction) {
      if (existingReaction.type === type) {
        // If the same reaction, remove it (toggle off)
        await Reaction.findByIdAndDelete(existingReaction._id);
        
        // Update reaction counts
        await video.updateReactionCounts();
        
        return res.status(200).json({
          status: 'success',
          message: `${type} removed`,
          data: {
            likes: video.likesCount,
            dislikes: video.dislikesCount,
            currentUserReaction: null
          }
        });
      } else {
        // If different reaction, update it
        existingReaction.type = type;
        reaction = await existingReaction.save();
      }
    } else {
      // Create new reaction
      reaction = await Reaction.create({
        type,
        video: video._id,
        user: userId
      });
    }
    
    // Update reaction counts on the video
    await video.updateReactionCounts();
    
    res.status(200).json({
      status: 'success',
      message: `${type} toggled`,
      data: {
        reaction,
        likes: video.likesCount,
        dislikes: video.dislikesCount,
        currentUserReaction: type
      }
    });
    
  } catch (err) {
    console.error('Error toggling reaction:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error processing reaction'
    });
  }
};

// Get reaction stats for a video
exports.getReactionStats = async (req, res, next) => {
  try {
    const rawId = req.params.videoId;
    
    // Find video by _id or videoId
    let video = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      video = await Video.findOne({ _id: rawId, active: true });
    }
    
    // If not found by _id, try finding by videoId
    if (!video) {
      video = await Video.findOne({ videoId: rawId, active: true });
    }
    
    if (!video) {
      return res.status(404).json({
        status: 'fail',
        message: 'Video not found'
      });
    }
    
    // Get current user's reaction if authenticated
    let currentUserReaction = null;
    
    if (req.user) {
      const userReaction = await Reaction.findOne({
        video: video._id,
        user: req.user.id
      });
      
      if (userReaction) {
        currentUserReaction = userReaction.type;
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        likes: video.likesCount,
        dislikes: video.dislikesCount,
        currentUserReaction
      }
    });
    
  } catch (err) {
    console.error('Error getting reaction stats:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching reaction statistics'
    });
  }
}; 
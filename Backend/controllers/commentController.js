const Comment = require('../models/Comment');
const Video = require('../models/Video');
const mongoose = require('mongoose');

// Get all comments for a video
exports.getComments = async (req, res, next) => {
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
    
    const comments = await Comment.find({ video: video._id })
      .sort('-createdAt')
      .populate({
        path: 'user',
        select: 'username avatar'
      });
    
    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: {
        comments
      }
    });
    
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching comments'
    });
  }
};

// Add a comment to a video (by _id or custom videoId)
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const rawId = req.params.videoId;

    if (!text) {
      return res.status(400).json({
        status: 'fail',
        message: 'Comment text is required'
      });
    }

    // 1. Resolve video (try _id first, then videoId field)
    let video = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      video = await Video.findOne({ _id: rawId, active: true });
    }
    if (!video) {
      video = await Video.findOne({ videoId: rawId, active: true });
    }

    if (!video) {
      return res.status(404).json({
        status: 'fail',
        message: 'Video not found'
      });
    }

    // 2. Create the comment pointing to the resolved video._id
    const newComment = await Comment.create({
      text,
      video: video._id,
      user: req.user.id
    });

    // 3. Populate the user field
    await newComment.populate({
      path: 'user',
      select: 'username avatar'
    });

    res.status(201).json({
      status: 'success',
      data: { comment: newComment }
    });

  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error adding comment'
    });
  }
};

// Delete comment (only by owner or admin)
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Comment not found'
      });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this comment'
      });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });

  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting comment'
    });
  }
};
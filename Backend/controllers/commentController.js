const Comment = require('../models/Comment');
const Video = require('../models/Video');

// Get all comments for a video
exports.getComments = async (req, res, next) => {
  try {
    const videoId = req.params.videoId;
    
    // Check if video exists
    const videoExists = await Video.exists({ _id: videoId, active: true });
    
    if (!videoExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'Video not found'
      });
    }
    
    const comments = await Comment.find({ video: videoId })
      .sort('-createdAt')
      .populate({
        path: 'user',
        select: 'username'
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

// Add a comment to a video
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const videoId = req.params.videoId;
    
    if (!text) {
      return res.status(400).json({
        status: 'fail',
        message: 'Comment text is required'
      });
    }
    
    // Check if video exists
    const videoExists = await Video.exists({ _id: videoId, active: true });
    
    if (!videoExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'Video not found'
      });
    }
    
    const newComment = await Comment.create({
      text,
      video: videoId,
      user: req.user.id
    });
    
    // Populate user information
    await newComment.populate({
      path: 'user',
      select: 'username'
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        comment: newComment
      }
    });
    
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error adding comment'
    });
  }
};

// Delete comment (only for comment owner or admin)
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Comment not found'
      });
    }
    
    // Check if user is comment owner or admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this comment'
      });
    }
    
    await Comment.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
    
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting comment'
    });
  }
}; 
const Video = require('../models/Video');
const { extractMetadata } = require('../utils/metadataExtractor');

// Get all videos with filtering, sorting, and pagination
exports.getAllVideos = async (req, res, next) => {
  try {
    // Build query
    let query = Video.find({ active: true });

    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);
    
    // Category filter
    if (queryObj.category) {
      query = query.find({ category: queryObj.category });
    }
    
    // Tag filter
    if (queryObj.tag) {
      query = query.find({ tags: queryObj.tag });
    }

    // 2) Text search
    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    // 3) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sort by newest
    }

    // 4) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 5) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Count total documents for pagination info
    const totalVideos = await Video.countDocuments({ active: true });

    // Execute query with populate
    const videos = await query.populate({
      path: 'addedBy',
      select: 'username'
    });

    // Send response
    res.status(200).json({
      status: 'success',
      results: videos.length,
      total: totalVideos,
      totalPages: Math.ceil(totalVideos / limit),
      currentPage: page,
      data: {
        videos,
      },
    });
  } catch (err) {
    console.error('Error getting videos:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching videos',
    });
  }
};

// Get a single video
exports.getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id).populate({
      path: 'addedBy',
      select: 'username'
    });

    if (!video || !video.active) {
      return res.status(404).json({
        status: 'fail',
        message: 'No video found with that ID',
      });
    }

    // Increment views
    video.views += 1;
    await video.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        video,
      },
    });
  } catch (err) {
    console.error('Error getting video:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching video',
    });
  }
};

// Add a new video (admin only)
exports.addVideo = async (req, res, next) => {
  try {
    const { originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({
        status: 'fail',
        message: 'Video URL is required',
      });
    }

    // Extract metadata from URL
    const metadata = await extractMetadata(originalUrl);

    // Create new video
    const newVideo = await Video.create({
      originalUrl,
      title: metadata.title,
      thumbnailUrl: metadata.thumbnailUrl,
      description: metadata.description,
      tags: metadata.tags,
      category: metadata.category,
      sourceWebsite: metadata.sourceWebsite,
      addedBy: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        video: newVideo,
      },
    });
  } catch (err) {
    console.error('Error adding video:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Error adding video',
    });
  }
};

// Update video (admin only)
exports.updateVideo = async (req, res, next) => {
  try {
    const updatableFields = ['title', 'description', 'tags', 'category', 'active'];
    
    // Filter out unwanted fields
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (updatableFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });
    
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!video) {
      return res.status(404).json({
        status: 'fail',
        message: 'No video found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        video,
      },
    });
  } catch (err) {
    console.error('Error updating video:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating video',
    });
  }
};

// Delete video (admin only)
exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({
        status: 'fail',
        message: 'No video found with that ID',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting video',
    });
  }
};

// Get video categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Video.distinct('category');
    
    res.status(200).json({
      status: 'success',
      data: {
        categories,
      },
    });
  } catch (err) {
    console.error('Error getting categories:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching categories',
    });
  }
};

// Get popular tags
exports.getPopularTags = async (req, res, next) => {
  try {
    const tags = await Video.aggregate([
      { $match: { active: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        tags: tags.map(tag => ({ name: tag._id, count: tag.count })),
      },
    });
  } catch (err) {
    console.error('Error getting tags:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching tags',
    });
  }
};

// Extract metadata from URL (admin only)
exports.extractMetadata = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        status: 'fail',
        message: 'URL is required',
      });
    }
    
    // Extract metadata
    const metadata = await extractMetadata(url);
    
    res.status(200).json({
      status: 'success',
      data: {
        metadata,
      },
    });
  } catch (err) {
    console.error('Error extracting metadata:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Error extracting metadata',
    });
  }
};

// Get video statistics for admin dashboard
exports.getVideoStats = async (req, res, next) => {
  try {
    // Get total views across all videos
    const viewsResult = await Video.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    // Get likes and dislikes stats
    const reactionsStats = await Video.aggregate([
      { $group: { 
          _id: null, 
          totalLikes: { $sum: '$likesCount' },
          totalDislikes: { $sum: '$dislikesCount' }
        } 
      }
    ]);
    
    const totalLikes = reactionsStats.length > 0 ? reactionsStats[0].totalLikes : 0;
    const totalDislikes = reactionsStats.length > 0 ? reactionsStats[0].totalDislikes : 0;

    // Return the stats
    res.status(200).json({
      status: 'success',
      data: {
        totalViews,
        totalLikes,
        totalDislikes
      }
    });
  } catch (err) {
    console.error('Error getting video stats:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching video statistics'
    });
  }
}; 
const Video = require('../models/Video');
const { extractMetadata } = require('../utils/metadataExtractor');
const Fuse = require('fuse.js');

// Get all videos with filtering, sorting, and pagination
exports.getAllVideos = async (req, res, next) => {
  console.log('getall videos hit ')
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

    // video id 
    if (queryObj.videoId) {
      query = query.find({ videoId: queryObj.videoId });
    }



    // 2) Text search
    // if (req.query.search) {
    //   query = query.find({ $text: { $search: req.query.search } });
    // }
    if (req.query.search) {
      const searchTerm = req.query.search;
      const searchQuery = buildSearchQuery(searchTerm);

      query = query.find(searchQuery)
        .sort({ score: { $meta: 'textScore' } }) // sort by relevance
        .select({ score: { $meta: 'textScore' } }); // include score
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
    let videos = await query.populate({
      path: 'addedBy',
      select: 'username'
    });

    // Fuzzy fallback search using Fuse.js
    if (videos.length === 0 &&( req.query.search ||queryObj.category||queryObj.tag||queryObj.videoId)) {
      const allVideos = await Video.find({ active: true }); // Fetch all active videos to run Fuse.js in-memory

      const fuse = new Fuse(allVideos, {
        keys: ['title', 'description', 'tags','videoId','addedBy','category'],
        threshold: 0.3,
      });

      const fuzzyResults = fuse.search(req.query.search);

      // Extract original documents and apply pagination manually
      const paginatedResults = fuzzyResults
        .map(result => result.item)
        .slice(skip, skip + limit);

      // Manually populate 'addedBy' field (since it's in-memory now)
      videos = await Video.populate(paginatedResults, {
        path: 'addedBy',
        select: 'username',
      });
    }

    const totalResults = videos.length === 0 && fuzzyResults ? fuzzyResults.length : totalVideos;
    // Send response
    res.status(200).json({
      status: 'success',
      results: videos.length,
      total: totalResults,
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
const buildSearchQuery = (searchTerm) => {
  return {
    $or: [
      { $text: { $search: searchTerm } }, // Full-text search
      { title: { $regex: searchTerm, $options: 'i' } }, // Fuzzy regex
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } }
    ]
  };
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

// Add a new video (for both regular users and admins)
exports.addVideo = async (req, res, next) => {
  try {
    const {
      originalUrl,
      videoType,
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      sourceWebsite, videoId
    } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        status: 'fail',
        message: 'Video URL is required',
      });
    }
    if (!videoId) {
      return res.status(400).json({
        status: 'fail',
        message: 'videoId is required',
      });
    }

    let videoData = {};

    // If user provided complete data, use it
    if (title && thumbnailUrl && category) {
      videoData = {
        originalUrl,
        title,
        thumbnailUrl,
        description: description || '',
        tags: tags || [],
        category,
        sourceWebsite: sourceWebsite || new URL(originalUrl).hostname,
        videoType: videoType || 'normal',
        videoId: videoId,
        addedBy: req.user.id,
      };
    } else {
      // Otherwise extract metadata from URL
      try {
        const metadata = await extractMetadata(originalUrl);

        videoData = {
          originalUrl,
          title: title || metadata.title,
          thumbnailUrl: thumbnailUrl || metadata.thumbnailUrl,
          description: description || metadata.description,
          tags: tags || metadata.tags,
          category: category || metadata.category,
          sourceWebsite: sourceWebsite || metadata.sourceWebsite,
          videoType: videoType || 'normal',
          addedBy: req.user.id,
        };
      } catch (metadataErr) {
        // If metadata extraction fails, check if we have minimal required data
        if (!title || !category) {
          return res.status(400).json({
            status: 'fail',
            message: 'Could not extract metadata. Please provide title and category manually.',
          });
        }

        // Use provided data with defaults for missing fields
        videoData = {
          originalUrl,
          title,
          thumbnailUrl: thumbnailUrl || 'https://via.placeholder.com/640x360?text=No+Thumbnail',
          description: description || '',
          tags: tags || [],
          category,
          sourceWebsite: sourceWebsite || new URL(originalUrl).hostname,
          videoType: videoType || 'normal',
          addedBy: req.user.id,
        };
      }
    }

    // Create new video
    const newVideo = await Video.create(videoData);

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
    const updatableFields = ['title', 'description', 'tags', 'category', 'active', 'videoType'];

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

// Extract video metadata from a URL (used in addVideo)
exports.extractMetadata = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        status: 'fail',
        message: 'URL is required',
      });
    }

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
      message: err.message || 'Failed to extract metadata',
    });
  }
};

// Extract all videos from a webpage (for bulk upload)
exports.extractVideosFromPage = async (req, res, next) => {
  try {
    const { url, customSelectors, fileExtensions, options } = req.body;

    if (!url) {
      return res.status(400).json({
        status: 'fail',
        message: 'URL is required',
      });
    }

    // Import the page scraper utility
    const { scrapePageForVideos } = require('../utils/metadataExtractor');

    // Extract all videos from the page with optional custom selectors
    const videos = await scrapePageForVideos(url, customSelectors, fileExtensions, options);

    res.status(200).json({
      status: 'success',
      data: {
        videos,
        count: videos.length,
      },
    });
  } catch (err) {
    console.error('Error extracting videos from page:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to extract videos from page',
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
      {
        $group: {
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
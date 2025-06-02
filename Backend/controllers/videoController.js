const { default: mongoose } = require('mongoose');
const Video = require('../models/Video');
const { extractMetadata } = require('../utils/metadataExtractor');
const Fuse = require('fuse.js');
const Counter = require('../models/Counter');

// Get all videos with filtering, sorting, and pagination


exports.getAllVideos = async (req, res) => {
  try {
    // 2. Destructure query parameters (with defaults for page & limit):
    const {
      category,
      tag,
      videoId,
      search,
      sort,
      fields,
      page = 1,
      limit = 12
    } = req.query;

    // 3. Build a base filter for “active” videos + any simple filters:
    const filter = { active: true };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (videoId) filter.videoId = videoId;

    let useTextSearch = false;
    let query;

    // 4. Attempt a text‐search if “search” param is provided:
    if (search) {
      try {
        useTextSearch = true;

        // Build a MongoDB text‐search query on the “search” string:
        query = Video.find({
          ...filter,
          $text: { $search: search }
        })
          // Sort by textScore
          .sort({ score: { $meta: 'textScore' } })
          // Include the textScore in the projection
          .select({
            score: { $meta: 'textScore' }
          });
      } catch (err) {
        // If combining $text and other operators throws “NoQueryExecutionPlans,” fall back to regex:
        console.warn('Text‐search failed, falling back to regex‐style search:', err);

        const regex = new RegExp(search, 'i');
        query = Video.find({
          ...filter,
          $or: [
            { title: regex },
            { description: regex },
            { tags: regex },
            { videoId: regex },
            { category: regex }
          ]
        });
        useTextSearch = false;
      }
    } else {
      // 5. If no “search” param, start from a plain find(filter):
      query = Video.find(filter);
    }

    // 6. Apply sorting if not text‐searching; otherwise, textScore sort is already applied:
    if (!useTextSearch) {
      if (sort) {
        // e.g. sort = "field1,-field2"
        const sortBy = sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        // Default sort: newest first
        query = query.sort('-createdAt');
      }
    }

    // 7. Field limiting (projection):
    if (fields) {
      // e.g. fields = "title,description,tags"
      const selectFields = fields.split(',').join(' ');
      query = query.select(selectFields);
    } else {
      query = query.select('-__v'); // Exclude __v by default
    }

    // 8. Pagination setup:
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    query = query.skip(skip).limit(limitNum);

    // 9. Execute the query (populate “addedBy.username”):
    let videos = await query.populate({
      path: 'addedBy',
      select: 'username'
    });

    // 10. Determine totalResults (for pagination metadata):
    let totalResults;
    if (useTextSearch) {
      // When using a text query, countDocuments must include the same $text filter
      totalResults = await Video.countDocuments({
        ...filter,
        $text: { $search: search }
      });
    } else {
      // If no text search, just count with the base “filter”
      totalResults = await Video.countDocuments(filter);
    }

    // 11. Fuzzy fallback (only if no documents returned AND some filter/search applied):
    if (
      videos.length === 0 &&
      (search || category || tag || videoId)
    ) {
      // Fetch all matching videos (without pagination) for Fuse.js
      const allVideos = await Video.find(filter).populate({
        path: 'addedBy',
        select: 'username'
      });

      const fuse = new Fuse(allVideos, {
        keys: [
          'title',
          'description',
          'tags',
          'videoId',
          'addedBy.username',
          'category'
        ],
        threshold: 0.3
      });

      // If “search” is present, use it in Fuse. Otherwise, Fuse on empty string
      const fuseResults = fuse.search(search || '');

      // Extract just the matched video documents
      const matchedDocs = fuseResults.map(r => r.item);
      totalResults = matchedDocs.length;

      // Apply pagination manually on the fuseResults
      const startIndex = skip;
      const endIndex = skip + limitNum;
      videos = matchedDocs.slice(startIndex, endIndex);
    }

    // 12. Send response with pagination metadata
    res.status(200).json({
      status: 'success',
      results: videos.length,
      total: totalResults,
      totalPages: Math.ceil(totalResults / limitNum),
      currentPage: pageNum,
      data: {
        videos
      }
    });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching videos'
    });
  }
};

// 🔍 Text search helper
const buildSearchQuery = (searchTerm) => ({
  $or: [
    { $text: { $search: searchTerm } },
    { title: { $regex: searchTerm, $options: 'i' } },
    { description: { $regex: searchTerm, $options: 'i' } },
    { tags: { $regex: searchTerm, $options: 'i' } }
  ]
});



exports.getVideo = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    let video = null;

    // 1. If rawId is a valid MongoDB ObjectId, try find by _id
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      video = await Video.findById(rawId)
        .populate({ path: 'addedBy', select: 'username' });
    }

    // 2. If not found by _id (or rawId wasn't valid ObjectId), try find by videoId field
    if (!video) {
      video = await Video.findOne({ videoId: rawId, active: true })
        .populate({ path: 'addedBy', select: 'username' });
    }

    // 3. If still not found, perform a fallback "related search"
    if (!video) {
      // Build a basic filter to only include active videos
      const baseFilter = { active: true };

      // Attempt a text search using MongoDB $text if index is present
      let relatedVideos = [];
      try {
        relatedVideos = await Video.find({
          ...baseFilter,
          $text: { $search: rawId }
        }, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .limit(10)
          .populate({ path: 'addedBy', select: 'username' });
      } catch (textErr) {
        // If text search fails (e.g., no text index or no plans), fall back to regex
        const regex = new RegExp(rawId, 'i');
        relatedVideos = await Video.find({
          ...baseFilter,
          $or: [
            { title: regex },
            { description: regex },
            { tags: regex },
            { category: regex }
          ]
        })
          .limit(10)
          .populate({ path: 'addedBy', select: 'username' });
      }

      // 4. If still no relatedVideos, use Fuse.js for a fuzzy search across all active videos
      if (relatedVideos.length === 0) {
        const allVideos = await Video.find(baseFilter)
          .populate({ path: 'addedBy', select: 'username' });

        const fuse = new Fuse(allVideos, {
          keys: [
            'title',
            'description',
            'tags',
            'category',
            'addedBy.username',
            'videoId'
          ],
          threshold: 0.3
        });

        const fuseResults = fuse.search(rawId || '');
        relatedVideos = fuseResults.map(r => r.item).slice(0, 10);
      }

      // 5. Return 404-like response with related results
      return res.status(404).json({
        status: 'fail',
        message: 'No video found with that identifier. Showing related results instead.',
        data: {
          relatedVideos
        }
      });
    }

    // 6. If a video was found by _id or videoId, but check that it’s active
    if (!video.active) {
      return res.status(404).json({
        status: 'fail',
        message: 'No active video found with that ID'
      });
    }

    // 7. Increment view count (only for exact matches)
    video.views = (video.views || 0) + 1;
    await video.save({ validateBeforeSave: false });

    // 8. Return the found video
    res.status(200).json({
      status: 'success',
      data: { video }
    });
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching video'
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
      sourceWebsite
    } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        status: 'fail',
        message: 'Video URL is required',
      });
    }
    

    let videoData = {};

    // Get next videoId from counter
    let counter = await Counter.findOneAndUpdate(
      { name: 'videoId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const videoId = str(counter)

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
          videoId:videoId,
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
          videoId:videoId
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
    const updatableFields = ['title', 'description', 'tags', 'category', 'active', 'videoType','isTrending'];


    // Filter out unwanted fields

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      console.log('received key ',key ," and value ", req.body[key])
      if (updatableFields.includes(key)) {
        console.log(key ," present ")
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
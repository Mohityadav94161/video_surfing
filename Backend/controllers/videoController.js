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

    // Check if the request is from an admin user
    const isAdmin = req.user && req.user.role === 'admin';

     // 2.1. Pagination setup:
     const pageNum = parseInt(page, 10);
     const limitNum = parseInt(limit, 10);
     const skip = (pageNum - 1) * limitNum;
 
     
    
    // 3. Build a base filter - only include active videos for non-admin users
    const filter = isAdmin ? {} : { active: true };
    
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (videoId) filter.videoId = videoId;

    let useTextSearch = false;
    let query;

    // 4. Check for exact videoId match first
    let exactVideoIdMatch = null;
    if (search && !filter.videoId) {
      try {
        exactVideoIdMatch = await Video.findOne({
          ...filter,
          videoId: search
        }).populate({
          path: 'addedBy',
          select: 'username'
        });
      } catch (err) {
        console.log('Error checking for exact videoId match:', err);
      }
    }

    // 5. If we found an exact videoId match, return it as the primary result
    if (exactVideoIdMatch) {
      // Still search for related videos to fill the rest of the results
      try {
        const regex = new RegExp(search, 'i');
        query = Video.find({
          ...filter,
          _id: { $ne: exactVideoIdMatch._id }, // Exclude the exact match
          $or: [
            { title: regex },
            { description: regex },
            { tags: regex },
            { category: regex }
          ]
        }).limit(limitNum - 1); // Leave space for the exact match
        
        useTextSearch = false;
      } catch (err) {
        query = Video.find(filter).limit(limitNum - 1);
        useTextSearch = false;
      }
    } 
    // 6. Attempt a text-search if "search" param is provided and no exact videoId match:
    else if (search) {
      try {
        useTextSearch = true;

        // Build a MongoDB text-search query on the "search" string:
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
        // If text search fails (e.g., no text index), fall back to regex:
        console.warn('Text-search failed, falling back to regex-style search:', err.message);
        useTextSearch = false;

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
      }
    } else {
      // 7. If no "search" param, start from a plain find(filter):
      query = Video.find(filter);
    }

    // 6. Apply sorting if not text-searching; otherwise, textScore sort is already applied:
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

    query = query.skip(skip).limit(limitNum);

    // 9. Execute the query (populate "addedBy.username"):
    let videos = await query.populate({
      path: 'addedBy',
      select: 'username'
    });

    // 10. If we have an exact videoId match, prepend it to the results
    if (exactVideoIdMatch) {
      videos = [exactVideoIdMatch, ...videos];
    }

    // 11. Determine totalResults (for pagination metadata):
    let totalResults;
    if (exactVideoIdMatch) {
      // When we have an exact match, count related videos + 1 for the exact match
      const regex = new RegExp(search, 'i');
      const relatedCount = await Video.countDocuments({
        ...filter,
        _id: { $ne: exactVideoIdMatch._id },
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
          { category: regex }
        ]
      });
      totalResults = relatedCount + 1;
    } else if (useTextSearch) {
      // When using a text query, countDocuments must include the same $text filter
      try {
        totalResults = await Video.countDocuments({
          ...filter,
          $text: { $search: search }
        });
      } catch (err) {
        // If text search count fails, fall back to regex count
        console.warn('Text search count failed, falling back to regex count:', err.message);
        const regex = new RegExp(search, 'i');
        totalResults = await Video.countDocuments({
          ...filter,
          $or: [
            { title: regex },
            { description: regex },
            { tags: regex },
            { videoId: regex },
            { category: regex }
          ]
        });
      }
    } else {
      // If no text search, just count with the base "filter"
      totalResults = await Video.countDocuments(filter);
    }

    // 12. Enhanced search with related videos fallback:
    let exactMatches = exactVideoIdMatch ? 1 : videos.length;
    let relatedVideos = [];
    let searchType = exactVideoIdMatch ? 'exact-videoid' : 'exact';

    if (search && videos.length < limitNum) {
      // Always try to find related videos when searching, even if we have some exact matches
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
        threshold: 0.6, // More lenient threshold for better related results
        includeScore: true
      });

      const fuseResults = fuse.search(search);

      // Filter out videos that are already in exact matches
      const exactVideoIds = videos.map(v => v._id.toString());
      const relatedResults = fuseResults
        .filter(result => !exactVideoIds.includes(result.item._id.toString()))
        .slice(0, limitNum - videos.length); // Fill up to the limit

      relatedVideos = relatedResults.map(r => ({
        ...r.item.toObject(),
        searchScore: r.score,
        isRelated: true
      }));

      // Determine search type
      if (exactMatches === 0 && relatedVideos.length > 0) {
        searchType = 'related';
        videos = relatedVideos;
        totalResults = fuseResults.length;
      } else if (exactMatches > 0 && relatedVideos.length > 0) {
        searchType = 'mixed';
        // Add related videos to existing exact matches
        videos = [...videos.map(v => ({ ...v.toObject(), isRelated: false })), ...relatedVideos];
        totalResults = exactMatches + fuseResults.length;
      } else if (exactMatches === 0 && relatedVideos.length === 0) {
        // No matches at all, get some popular videos as suggestions
        const popularVideos = await Video.find(filter)
          .sort('-views -createdAt')
          .limit(8)
          .populate({ path: 'addedBy', select: 'username' });
        
        videos = popularVideos.map(v => ({ ...v.toObject(), isRelated: true, isSuggestion: true }));
        searchType = 'suggestions';
        totalResults = videos.length;
      }
    }

    // 13. Send response with enhanced metadata
    res.status(200).json({
      status: 'success',
      results: videos.length,
      total: totalResults,
      totalPages: Math.ceil(totalResults / limitNum),
      currentPage: pageNum,
      searchType: search ? searchType : 'none',
      exactMatches: search ? exactMatches : videos.length,
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

    // 6. If a video was found by _id or videoId, but check that it's active
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

// Get related videos for a specific video
exports.getRelatedVideos = async (req, res) => {
  try {
    const videoId = req.params.id;
    const limit = parseInt(req.query.limit) || 8;

    // First, get the current video to understand its properties
    let currentVideo = null;
    if (mongoose.Types.ObjectId.isValid(videoId)) {
      currentVideo = await Video.findById(videoId);
    }
    if (!currentVideo) {
      currentVideo = await Video.findOne({ videoId: videoId, active: true });
    }

    if (!currentVideo) {
      return res.status(404).json({
        status: 'fail',
        message: 'Video not found'
      });
    }

    const baseFilter = { active: true, _id: { $ne: currentVideo._id } };
    let relatedVideos = [];
    let relationType = 'category';

    // 1. Try to find videos from the same category
    if (currentVideo.category) {
      relatedVideos = await Video.find({
        ...baseFilter,
        category: currentVideo.category
      })
        .sort('-views -createdAt')
        .limit(limit)
        .populate({ path: 'addedBy', select: 'username' });
    }

    // 2. If not enough from category, add videos with similar tags
    if (relatedVideos.length < limit && currentVideo.tags && currentVideo.tags.length > 0) {
      const remainingLimit = limit - relatedVideos.length;
      const existingIds = relatedVideos.map(v => v._id.toString());
      
      const tagVideos = await Video.find({
        ...baseFilter,
        _id: { $nin: [...existingIds, currentVideo._id] },
        tags: { $in: currentVideo.tags }
      })
        .sort('-views -createdAt')
        .limit(remainingLimit)
        .populate({ path: 'addedBy', select: 'username' });

      relatedVideos = [...relatedVideos, ...tagVideos];
      if (tagVideos.length > 0) relationType = 'mixed';
    }

    // 3. If still not enough, use fuzzy search on title and description
    if (relatedVideos.length < limit) {
      const remainingLimit = limit - relatedVideos.length;
      const existingIds = relatedVideos.map(v => v._id.toString());

      // Create search terms from current video
      const searchTerms = [
        ...currentVideo.title.split(' ').filter(word => word.length > 3),
        ...(currentVideo.description ? currentVideo.description.split(' ').filter(word => word.length > 3) : []),
        ...(currentVideo.tags || [])
      ].slice(0, 10); // Limit search terms

      if (searchTerms.length > 0) {
        try {
          // Try text search first
          const textSearchVideos = await Video.find({
            ...baseFilter,
            _id: { $nin: [...existingIds, currentVideo._id] },
            $text: { $search: searchTerms.join(' ') }
          }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .limit(remainingLimit)
            .populate({ path: 'addedBy', select: 'username' });

          relatedVideos = [...relatedVideos, ...textSearchVideos];
          if (textSearchVideos.length > 0) relationType = relationType === 'category' ? 'mixed' : 'fuzzy';
        } catch (textErr) {
          // Fallback to regex search
          const regex = new RegExp(searchTerms.slice(0, 3).join('|'), 'i');
          const regexVideos = await Video.find({
            ...baseFilter,
            _id: { $nin: [...existingIds, currentVideo._id] },
            $or: [
              { title: regex },
              { description: regex }
            ]
          })
            .sort('-views -createdAt')
            .limit(remainingLimit)
            .populate({ path: 'addedBy', select: 'username' });

          relatedVideos = [...relatedVideos, ...regexVideos];
          if (regexVideos.length > 0) relationType = relationType === 'category' ? 'mixed' : 'fuzzy';
        }
      }
    }

    // 4. Final fallback: get popular videos if still not enough
    if (relatedVideos.length < limit) {
      const remainingLimit = limit - relatedVideos.length;
      const existingIds = relatedVideos.map(v => v._id.toString());

      const popularVideos = await Video.find({
        ...baseFilter,
        _id: { $nin: [...existingIds, currentVideo._id] }
      })
        .sort('-views -createdAt')
        .limit(remainingLimit)
        .populate({ path: 'addedBy', select: 'username' });

      relatedVideos = [...relatedVideos, ...popularVideos];
      if (popularVideos.length > 0 && relatedVideos.length === popularVideos.length) {
        relationType = 'popular';
      }
    }

    // Add metadata to videos indicating how they're related
    const videosWithMetadata = relatedVideos.map(video => ({
      ...video.toObject(),
      relationScore: calculateRelationScore(currentVideo, video),
      relationType: determineVideoRelationType(currentVideo, video)
    }));

    res.status(200).json({
      status: 'success',
      results: videosWithMetadata.length,
      relationType,
      data: {
        videos: videosWithMetadata,
        currentVideo: {
          id: currentVideo._id,
          title: currentVideo.title,
          category: currentVideo.category,
          tags: currentVideo.tags
        }
      }
    });
  } catch (err) {
    console.error('Error fetching related videos:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching related videos'
    });
  }
};

// Helper function to calculate relation score
function calculateRelationScore(currentVideo, relatedVideo) {
  let score = 0;
  
  // Same category: +40 points
  if (currentVideo.category === relatedVideo.category) {
    score += 40;
  }
  
  // Shared tags: +10 points per shared tag
  if (currentVideo.tags && relatedVideo.tags) {
    const sharedTags = currentVideo.tags.filter(tag => 
      relatedVideo.tags.includes(tag)
    );
    score += sharedTags.length * 10;
  }
  
  // Title similarity: +5 points per shared word (length > 3)
  const currentWords = currentVideo.title.toLowerCase().split(' ').filter(w => w.length > 3);
  const relatedWords = relatedVideo.title.toLowerCase().split(' ').filter(w => w.length > 3);
  const sharedWords = currentWords.filter(word => relatedWords.includes(word));
  score += sharedWords.length * 5;
  
  // Popularity bonus: +1-10 points based on views
  const viewScore = Math.min(10, Math.floor((relatedVideo.views || 0) / 1000));
  score += viewScore;
  
  return Math.min(100, score); // Cap at 100
}

// Helper function to determine video relation type
function determineVideoRelationType(currentVideo, relatedVideo) {
  if (currentVideo.category === relatedVideo.category) {
    const sharedTags = currentVideo.tags?.filter(tag => 
      relatedVideo.tags?.includes(tag)
    ) || [];
    
    if (sharedTags.length > 0) {
      return 'category-tags';
    }
    return 'category';
  }
  
  if (currentVideo.tags && relatedVideo.tags) {
    const sharedTags = currentVideo.tags.filter(tag => 
      relatedVideo.tags.includes(tag)
    );
    if (sharedTags.length > 0) {
      return 'tags';
    }
  }
  
  // Check title similarity
  const currentWords = currentVideo.title.toLowerCase().split(' ').filter(w => w.length > 3);
  const relatedWords = relatedVideo.title.toLowerCase().split(' ').filter(w => w.length > 3);
  const sharedWords = currentWords.filter(word => relatedWords.includes(word));
  
  if (sharedWords.length > 0) {
    return 'title';
  }
  
  return 'popular';
}


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
      sourceWebsite,
      duration,
      videoId: providedVideoId
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
    const videoId = counter.seq.toString();

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
        videoId: providedVideoId || videoId, // Use provided videoId if available, otherwise use generated one
        addedBy: req.user.id,
        duration: duration || null,
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
          videoId: providedVideoId || metadata.videoId || videoId,
          duration: duration || metadata.duration || null,
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
          videoId: providedVideoId || videoId,
          duration: duration || null
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
    const { 
      url, 
      customSelectors = [], 
      fileExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'],
      scanScriptTags = true,
      scanIframeAttributes = true, 
      scanDataAttributes = true,
      followExternalLinks = false,
      scanOnlyMainContent = false,
      minVideoDuration = 0,
      maxScanDepth = 1,
      browser = 'chrome',
      maxPages = 1,          // Number of pages to scan (for pagination)
      maxVideos = 500,       // Maximum number of videos to extract
      enableAdultOptimizations = true,  // Enable adult site specific optimizations
      extractStreamingUrls = true,      // Extract HLS/DASH streaming URLs
      triggerLazyLoading = true,        // Try to trigger lazy loading
      clickLoadMore = true              // Try to click "Load More" buttons
    } = req.body;

    if (!url) {
      return res.status(400).json({
        status: 'fail',
        message: 'URL is required',
      });
    }

    // Log the extraction attempt
    console.log(`🔍 Video extraction requested for URL: ${url}`);
    console.log(`📋 Configuration: ${JSON.stringify({
      customSelectors,
      fileExtensions,
      scanScriptTags,
      scanIframeAttributes,
      scanDataAttributes,
      followExternalLinks,
      scanOnlyMainContent,
      minVideoDuration,
      maxScanDepth,
      browser,
      maxPages,
      maxVideos
    }, null, 2)}`);

    // Import the page scraper utility
    const { scrapePageForVideos } = require('../utils/metadataExtractor');

    // Configure extraction options for Playwright
    const options = {
      // Browser configuration
      browser,
      playwrightOptions: {
        headless: true,
        timeout: 60000, // 60 seconds timeout
      },
      
      // Viewport
      viewport: {
        width: browser === 'mobile' ? 375 : 1920,
        height: browser === 'mobile' ? 812 : 1080,
      },
      
      // Extraction configuration
      customSelectors,
      fileExtensions,
      scanScriptTags,
      scanDataAttributes,
      scanIframeAttributes,
      
      // Performance options
      timeout: 60000,
      additionalWaitTime: 5000,
      
      // Behavior options
      scrollPage: true,
      blockAds: true,
      debug: process.env.NODE_ENV === 'development',
      
      // Content scanning
      followExternalLinks,
      maxScanDepth,
      minVideoDuration,
      scanOnlyMainContent,
      
      // Pagination options
      maxPages,
      maxVideos,
      
      // Age verification
      ageVerification: true,
      
      // Adult site optimizations
      enableAdultOptimizations,
      extractStreamingUrls,
      triggerLazyLoading,
      clickLoadMore,
      

    };

    // Extract all videos from the page
    console.log(`🚀 Starting video extraction with options: ${JSON.stringify(options, null, 2)}`);
    const result = await scrapePageForVideos(url, options);

    // Process the results to enhance with additional metadata
    const enhancedVideos = result.videos.map(video => {
      // Add confidence if not present (calculated by the extractor)
      const confidence = video.confidence || calculateConfidenceScore(video);
      
      return {
        ...video,
        confidence,
        extractedAt: new Date().toISOString()
      };
    });

    // Sort videos by confidence score (highest first)
    enhancedVideos.sort((a, b) => b.confidence - a.confidence);

    // Log extraction success
    console.log(`✅ Successfully extracted ${enhancedVideos.length} videos from ${url}`);

    res.status(200).json({
      status: 'success',
      data: {
        url: result.url,
        domain: result.domain,
        pageTitle: result.metadata?.pageTitle || '',
        isAdultContent: result.isAdultContent || false,
        videos: enhancedVideos,
        count: enhancedVideos.length,
        extractionMethods: result.metadata?.extractionMethods || [],
        pagination: result.metadata?.pagination || { totalPages: 1, pagesScanned: 1 },

        extractionTime: new Date().toISOString()
      },
    });
  } catch (err) {
    console.error('❌ Error extracting videos from page:', err);
    
    // Provide more detailed error response
    const errorMessage = err.message || 'Failed to extract videos from page';
    const errorDetails = {
      url: req.body.url,
      errorType: err.name,
      errorStack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };
    
    res.status(500).json({
      status: 'error',
      message: errorMessage,
      details: errorDetails
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

/**
 * Calculate confidence score for a video
 */
function calculateConfidenceScore(video) {
  let score = 0.5; // Default medium confidence
  
  // Adjust based on video type
  if (video.type === 'direct') score += 0.3;
  if (video.type === 'hls-stream' || video.type === 'dash-stream') score += 0.15;
  if (video.type === 'youtube' || video.type === 'vimeo') score += 0.1;
  
  // Adjust based on extraction method
  if (video.foundBy?.includes('video-element')) score += 0.2;
  if (video.foundBy?.includes('network-request')) score += 0.15;
  if (video.foundBy?.includes('jwplayer') || video.foundBy?.includes('videojs')) score += 0.1;
  if (video.foundBy?.includes('json-ld')) score += 0.2;
  
  // Adjust based on metadata completeness
  if (video.title && video.title !== `Video from ${video.sourceWebsite}`) score += 0.05;
  if (video.thumbnailUrl) score += 0.1;
  if (video.quality && video.quality !== 'unknown') score += 0.05;
  
  // Cap score at 1.0
  return Math.min(score, 1.0);
} 

// Get trending videos
exports.getTrendingVideos = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    
    // Convert string values to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Find videos with isTrending = true
    const videos = await Video.find({ active: true, isTrending: true })
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: 'addedBy',
        select: 'username'
      });
    
    // Get total count for pagination
    const totalResults = await Video.countDocuments({ active: true, isTrending: true });
    
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
    console.error('Error fetching trending videos:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching trending videos'
    });
  }
}; 
const Collection = require('../models/Collection');
const Video = require('../models/Video');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Helper function to check collection ownership
const checkOwnership = (collection, userId) => {
  if (!collection.owner.equals(userId)) {
    return false;
  }
  return true;
};

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
};

// Get all collections for the current user
exports.getUserCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ 
      owner: req.user.id,
      active: true 
    })
    .sort('-createdAt')
    .populate({
      path: 'videos',
      select: 'title thumbnailUrl category',
      options: { limit: 5 }
    });

    // Get user collection statistics
    const stats = await Collection.getUserCollectionStats(req.user.id);

    res.status(200).json({
      status: 'success',
      results: collections.length,
      stats: stats.length > 0 ? stats[0] : { totalCollections: 0, totalVideosInCollections: 0 },
      data: {
        collections
      }
    });
  } catch (err) {
    console.error('Error getting collections:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching collections'
    });
  }
};

// Get single collection by ID
exports.getCollection = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid collection ID format'
      });
    }
    
    const collection = await Collection.findById(id)
      .populate({
        path: 'videos',
        select: 'title description thumbnailUrl category tags sourceWebsite views'
      })
      .populate({
        path: 'owner',
        select: 'username'
      });

    if (!collection || !collection.active) {
      return res.status(404).json({
        status: 'fail',
        message: 'Collection not found'
      });
    }

    // Check if user is the owner (non-owners can still view but we'll track that info)
    const isOwner = req.user && checkOwnership(collection, req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        collection,
        isOwner
      }
    });
  } catch (err) {
    console.error('Error getting collection:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching collection'
    });
  }
};

// Create a new collection
exports.createCollection = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Collection name is required'
      });
    }

    const newCollection = await Collection.create({
      name,
      description,
      owner: req.user.id,
      videos: []
    });

    res.status(201).json({
      status: 'success',
      data: {
        collection: newCollection
      }
    });
  } catch (err) {
    console.error('Error creating collection:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Error creating collection'
    });
  }
};

// Update collection (name and description only)
exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if ID is valid ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid collection ID format'
      });
    }
    
    const updatableFields = {};
    
    if (name) updatableFields.name = name;
    if (description !== undefined) updatableFields.description = description;

    const collection = await Collection.findById(id);

    if (!collection || !collection.active) {
      return res.status(404).json({
        status: 'fail',
        message: 'Collection not found'
      });
    }

    // Check ownership
    if (!checkOwnership(collection, req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this collection'
      });
    }

    // Update collection
    const updatedCollection = await Collection.findByIdAndUpdate(
      id,
      updatableFields,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        collection: updatedCollection
      }
    });
  } catch (err) {
    console.error('Error updating collection:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating collection'
    });
  }
};

// Delete collection (soft delete)
exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid collection ID format'
      });
    }
    
    const collection = await Collection.findById(id);

    if (!collection || !collection.active) {
      return res.status(404).json({
        status: 'fail',
        message: 'Collection not found'
      });
    }

    // Check ownership
    if (!checkOwnership(collection, req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this collection'
      });
    }

    // Soft delete
    collection.active = false;
    await collection.save();

    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    console.error('Error deleting collection:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting collection'
    });
  }
};

// Add video to collection
exports.addVideoToCollection = async (req, res) => {
  try {
    const { videoId } = req.body;
    const { id: collectionId } = req.params;

    // Check if collection ID is valid ObjectId
    if (!isValidObjectId(collectionId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid collection ID format'
      });
    }
    
    // Check if video ID is valid ObjectId
    if (!isValidObjectId(videoId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid video ID format'
      });
    }

    if (!videoId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Video ID is required'
      });
    }

    // Validate video exists
    const video = await Video.findById(videoId);
    if (!video || !video.active) {
      return res.status(404).json({
        status: 'fail',
        message: 'Video not found'
      });
    }

    // Get collection
    const collection = await Collection.findById(collectionId);
    if (!collection || !collection.active) {
      return res.status(404).json({
        status: 'fail',
        message: 'Collection not found'
      });
    }

    // Check ownership
    if (!checkOwnership(collection, req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to modify this collection'
      });
    }

    // Add video to collection
    await collection.addVideo(videoId);

    // Return updated collection with the newly added video
    const updatedCollection = await Collection.findById(collectionId)
      .populate({
        path: 'videos',
        select: 'title thumbnailUrl'
      });

    res.status(200).json({
      status: 'success',
      data: {
        collection: updatedCollection,
        video
      }
    });
  } catch (err) {
    console.error('Error adding video to collection:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error adding video to collection'
    });
  }
};

// Remove video from collection
exports.removeVideoFromCollection = async (req, res) => {
  try {
    const { id: collectionId, videoId } = req.params;

    // Check if collection ID is valid ObjectId
    if (!isValidObjectId(collectionId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid collection ID format'
      });
    }
    
    // Check if video ID is valid ObjectId
    if (!isValidObjectId(videoId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid video ID format'
      });
    }

    // Get collection
    const collection = await Collection.findById(collectionId);
    if (!collection || !collection.active) {
      return res.status(404).json({
        status: 'fail',
        message: 'Collection not found'
      });
    }

    // Check ownership
    if (!checkOwnership(collection, req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to modify this collection'
      });
    }

    // Check if video exists in collection
    if (!collection.videos.includes(videoId)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Video not found in this collection'
      });
    }

    // Remove video from collection
    await collection.removeVideo(videoId);

    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    console.error('Error removing video from collection:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error removing video from collection'
    });
  }
};

// Get collection statistics for the current user
exports.getUserCollectionStats = async (req, res) => {
  try {
    const stats = await Collection.getUserCollectionStats(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        stats: stats.length > 0 ? stats[0] : { 
          totalCollections: 0, 
          totalVideosInCollections: 0,
          collections: [] 
        }
      }
    });
  } catch (err) {
    console.error('Error getting collection stats:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching collection statistics'
    });
  }
}; 
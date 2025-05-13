const HomeSection = require('../models/HomeSection');
const Video = require('../models/Video');

// Get all active home sections (for front end)
exports.getActiveSections = async (req, res, next) => {
  try {
    // Find all active sections sorted by display order
    const sections = await HomeSection.find({ isActive: true })
      .sort('displayOrder')
      .populate({
        path: 'videos',
        select: 'title thumbnailUrl category tags views sourceWebsite createdAt',
      });

    // For each section, fetch the appropriate videos based on section type
    const populatedSections = await Promise.all(
      sections.map(async (section) => {
        // If section has custom videos, return as is
        if (section.sectionType === 'custom' && section.videos && section.videos.length) {
          return section;
        }

        // For other section types, query videos dynamically
        let query = { active: true };
        const limit = section.maxItems || 12;
        let sort = '-createdAt'; // Default sort by newest

        // Apply filters based on section type
        switch (section.sectionType) {
          case 'category':
            query.category = section.category;
            break;
          case 'trending':
            sort = '-views';
            break;
          case 'newest':
            sort = '-createdAt';
            break;
          // featured - just get top videos
          default:
            break;
        }

        // Apply additional filters if specified
        if (section.filterTags && section.filterTags.length) {
          query.tags = { $in: section.filterTags };
        }

        if (section.prioritySource) {
          query.sourceWebsite = section.prioritySource;
        }

        if (section.minViews > 0) {
          query.views = { $gte: section.minViews };
        }

        // Fetch videos based on query
        const videos = await Video.find(query)
          .sort(sort)
          .limit(limit)
          .select('title thumbnailUrl category tags views sourceWebsite createdAt');

        // Return section with dynamically fetched videos
        return {
          ...section.toObject(),
          videos
        };
      })
    );

    res.status(200).json({
      status: 'success',
      results: populatedSections.length,
      data: {
        sections: populatedSections,
      },
    });
  } catch (err) {
    console.error('Error getting home sections:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching home sections',
    });
  }
};

// Get all sections (admin)
exports.getAllSections = async (req, res, next) => {
  try {
    const sections = await HomeSection.find()
      .sort('displayOrder')
      .populate({
        path: 'videos',
        select: 'title thumbnailUrl category sourceWebsite',
      })
      .populate({
        path: 'createdBy',
        select: 'username',
      })
      .populate({
        path: 'updatedBy',
        select: 'username',
      });

    res.status(200).json({
      status: 'success',
      results: sections.length,
      data: {
        sections,
      },
    });
  } catch (err) {
    console.error('Error getting home sections:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching home sections',
    });
  }
};

// Get a single section
exports.getSection = async (req, res, next) => {
  try {
    const section = await HomeSection.findById(req.params.id)
      .populate({
        path: 'videos',
        select: 'title thumbnailUrl category tags views sourceWebsite createdAt',
      })
      .populate({
        path: 'createdBy',
        select: 'username',
      })
      .populate({
        path: 'updatedBy',
        select: 'username',
      });

    if (!section) {
      return res.status(404).json({
        status: 'fail',
        message: 'No section found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        section,
      },
    });
  } catch (err) {
    console.error('Error getting section:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching section',
    });
  }
};

// Create a new section
exports.createSection = async (req, res, next) => {
  try {
    // Count existing sections to determine display order
    const sectionCount = await HomeSection.countDocuments();
    
    // If display order not specified, add to the end
    if (req.body.displayOrder === undefined) {
      req.body.displayOrder = sectionCount;
    }
    
    // Set creator
    req.body.createdBy = req.user.id;
    
    // Create section
    const section = await HomeSection.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        section,
      },
    });
  } catch (err) {
    console.error('Error creating section:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Error creating section',
    });
  }
};

// Update a section
exports.updateSection = async (req, res, next) => {
  try {
    // Set updater
    req.body.updatedBy = req.user.id;
    
    const section = await HomeSection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: 'videos',
      select: 'title thumbnailUrl category',
    });

    if (!section) {
      return res.status(404).json({
        status: 'fail',
        message: 'No section found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        section,
      },
    });
  } catch (err) {
    console.error('Error updating section:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Error updating section',
    });
  }
};

// Delete a section
exports.deleteSection = async (req, res, next) => {
  try {
    const section = await HomeSection.findByIdAndDelete(req.params.id);

    if (!section) {
      return res.status(404).json({
        status: 'fail',
        message: 'No section found with that ID',
      });
    }
    
    // Reorder the remaining sections
    await reorderSectionsAfterDelete(section.displayOrder);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Error deleting section:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting section',
    });
  }
};

// Reorder sections
exports.reorderSections = async (req, res, next) => {
  try {
    const { sectionIds } = req.body;
    
    if (!Array.isArray(sectionIds)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Section IDs must be provided as an array',
      });
    }
    
    // Update the display order of each section
    const updates = sectionIds.map((id, index) => 
      HomeSection.findByIdAndUpdate(id, { displayOrder: index })
    );
    
    await Promise.all(updates);
    
    res.status(200).json({
      status: 'success',
      message: 'Sections reordered successfully',
    });
  } catch (err) {
    console.error('Error reordering sections:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error reordering sections',
    });
  }
};

// Add videos to custom section
exports.addVideosToSection = async (req, res, next) => {
  try {
    const { videos } = req.body;
    
    if (!Array.isArray(videos)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Videos must be provided as an array of IDs',
      });
    }
    
    const section = await HomeSection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        status: 'fail',
        message: 'No section found with that ID',
      });
    }
    
    // Add new videos, avoiding duplicates
    const existingVideoIds = section.videos.map(v => v.toString());
    const newVideoIds = videos.filter(id => !existingVideoIds.includes(id));
    
    section.videos = [...section.videos, ...newVideoIds];
    section.updatedBy = req.user.id;
    
    await section.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        section,
      },
    });
  } catch (err) {
    console.error('Error adding videos to section:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error adding videos to section',
    });
  }
};

// Remove videos from custom section
exports.removeVideosFromSection = async (req, res, next) => {
  try {
    const { videos } = req.body;
    
    if (!Array.isArray(videos)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Videos must be provided as an array of IDs',
      });
    }
    
    const section = await HomeSection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        status: 'fail',
        message: 'No section found with that ID',
      });
    }
    
    // Remove specified videos
    section.videos = section.videos.filter(
      videoId => !videos.includes(videoId.toString())
    );
    section.updatedBy = req.user.id;
    
    await section.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        section,
      },
    });
  } catch (err) {
    console.error('Error removing videos from section:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error removing videos from section',
    });
  }
};

// Reorder sections after deletion
const reorderSectionsAfterDelete = async (deletedOrder) => {
  await HomeSection.updateMany(
    { displayOrder: { $gt: deletedOrder } },
    { $inc: { displayOrder: -1 } }
  );
}; 
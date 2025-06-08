const SupportSubmission = require('../models/SupportSubmission');

// Create a new support submission
exports.createSubmission = async (req, res) => {
  try {
    const {
      type,
      name,
      email,
      subject,
      message,
      additionalData = {}
    } = req.body;

    // Validate required fields
    if (!type || !name || !email || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: type, name, email, message'
      });
    }

    // Validate type is one of the allowed values
    if (!['contact-us', 'partnership-program', 'content-removal'].includes(type)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid submission type. Must be one of: contact-us, partnership-program, content-removal'
      });
    }

    // Create new submission
    const submission = await SupportSubmission.create({
      type,
      name,
      email,
      subject: subject || `${type} submission`,
      message,
      additionalData,
      userId: req.user ? req.user.id : null,
      username: req.user ? req.user.username : 'guest',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown'
    });

    res.status(201).json({
      status: 'success',
      data: {
        submission
      }
    });
  } catch (err) {
    console.error('Error creating support submission:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error submitting your request. Please try again.'
    });
  }
};

// Get all submissions (admin only)
exports.getAllSubmissions = async (req, res) => {
  try {
    // Build filter
    const filter = {};
    
    // Apply type filter if provided
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Apply status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Apply date range filter if provided
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Apply search filter if provided
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { username: searchRegex }
      ];
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Query with filter, pagination and sorting
    const submissions = await SupportSubmission.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await SupportSubmission.countDocuments(filter);
    
    res.status(200).json({
      status: 'success',
      results: submissions.length,
      data: {
        submissions,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Error fetching support submissions:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching submissions'
    });
  }
};

// Get submission by ID (admin only)
exports.getSubmission = async (req, res) => {
  try {
    const submission = await SupportSubmission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No submission found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        submission
      }
    });
  } catch (err) {
    console.error('Error fetching support submission:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching submission'
    });
  }
};

// Update submission status (admin only)
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    // Validate status
    if (!['pending', 'in-progress', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status. Must be one of: pending, in-progress, resolved, rejected'
      });
    }
    
    const submission = await SupportSubmission.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        adminNotes: adminNotes || '',
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!submission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No submission found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        submission
      }
    });
  } catch (err) {
    console.error('Error updating support submission:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating submission'
    });
  }
};

// Delete submission (admin only)
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await SupportSubmission.findByIdAndDelete(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No submission found with that ID'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    console.error('Error deleting support submission:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting submission'
    });
  }
};

// Get submission statistics (admin only)
exports.getSubmissionStats = async (req, res) => {
  try {
    const stats = await SupportSubmission.aggregate([
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          pendingSubmissions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          resolvedSubmissions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          },
          contactSubmissions: {
            $sum: {
              $cond: [{ $eq: ['$type', 'contact-us'] }, 1, 0]
            }
          },
          partnershipSubmissions: {
            $sum: {
              $cond: [{ $eq: ['$type', 'partnership-program'] }, 1, 0]
            }
          },
          removalSubmissions: {
            $sum: {
              $cond: [{ $eq: ['$type', 'content-removal'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    // If no submissions yet, return zeros
    const defaultStats = {
      totalSubmissions: 0,
      pendingSubmissions: 0,
      resolvedSubmissions: 0,
      contactSubmissions: 0,
      partnershipSubmissions: 0,
      removalSubmissions: 0
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        stats: stats.length > 0 ? stats[0] : defaultStats
      }
    });
  } catch (err) {
    console.error('Error fetching support stats:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching statistics'
    });
  }
}; 
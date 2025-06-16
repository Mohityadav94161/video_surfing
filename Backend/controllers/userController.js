const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper function for consistent response format
const sendResponse = (req, res, statusCode, message, data) => {
  return res.status(statusCode).json({
    status: statusCode >= 400 ? 'error' : 'success',
    message,
    data
  });
};

// Filter object to remove unwanted fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Update current user data
exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return sendResponse(req, res, 400, 'This route is not for password updates. Please use /updatePassword.', null);
    }

    // 2) Filter out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'username', 'email', 'avatar');

    // 3) Check if username is being updated and if it's already taken
    if (filteredBody.username && filteredBody.username !== req.user.username) {
      const existingUser = await User.findOne({ username: filteredBody.username });
      if (existingUser) {
        return sendResponse(req, res, 400, 'Username already exists', null);
      }
    }

    // 4) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    sendResponse(req, res, 200, 'User updated successfully', { user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    return sendResponse(req, res, 500, 'Error updating user', null);
  }
};

// Update current user password
exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    const { currentPassword, password, passwordConfirm } = req.body;

    if (!currentPassword || !password || !passwordConfirm) {
      return sendResponse(req, res, 400, 'Please provide current password, new password, and confirm password', null);
    }

    if (!(await user.correctPassword(currentPassword, user.password))) {
      return sendResponse(req, res, 401, 'Your current password is incorrect', null);
    }

    // 3) Check if new password and confirm password match
    if (password !== passwordConfirm) {
      return sendResponse(req, res, 400, 'New password and confirm password do not match', null);
    }

    // 4) If so, update password
    user.password = password;
    await user.save();

    sendResponse(req, res, 200, 'Password updated successfully', null);
  } catch (err) {
    console.error('Error updating password:', err);
    return sendResponse(req, res, 500, 'Error updating password', null);
  }
};

// Delete current user (deactivate)
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    sendResponse(req, res, 204, 'User deleted successfully', null);
  } catch (err) {
    console.error('Error deleting user:', err);
    return sendResponse(req, res, 500, 'Error deleting user', null);
  }
};

// Update avatar immediately when selected
exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return sendResponse(req, res, 400, 'Please provide an avatar', null);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true, runValidators: true }
    );

    sendResponse(req, res, 200, 'Avatar updated successfully', { user: updatedUser });
  } catch (err) {
    console.error('Error updating avatar:', err);
    return sendResponse(req, res, 500, 'Error updating avatar', null);
  }
};
/**
 * Format duration in seconds to MM:SS or HH:MM:SS format
 * @param {number} duration - Duration in seconds
 * @param {string} videoId - Video ID for fallback generation
 * @returns {string} Formatted duration string
 */
export const formatDuration = (duration, videoId = null) => {
  if (duration && typeof duration === 'number' && duration > 0) {
    // If we have an actual duration, format it properly
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) {
      // Format as HH:MM:SS
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // Format as MM:SS
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  } else if (videoId) {
    // Generate a pseudo-random duration based on the video ID
    // This will be consistent for the same video
    const hash = videoId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Generate a duration between 3:00 and 25:00 minutes
    const totalSeconds = Math.abs(hash % 1320) + 180; // 180 to 1500 seconds
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  // Fallback for no ID or duration
  return "5:30";
};

/**
 * Format view count to a readable string
 * @param {number} count - View count
 * @returns {string} Formatted view count
 */
export const formatViewCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * Format date to relative time
 * @param {string} dateString - Date string
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
};

/**
 * Format date to a readable format
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}; 
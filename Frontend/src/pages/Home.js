"use client"

import { useState, useEffect } from "react"
import { Pagination, Spin, Button, Select, Tag, message, Modal } from "antd"
import {
  FireOutlined,
  EyeOutlined,
  TagOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  DislikeOutlined,
  LikeFilled,
  DislikeFilled
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./Home.css"

const { Option } = Select

const Home = () => {
  const [videos, setVideos] = useState([])
  const [filteredVideos, setFilteredVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState(null)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalVideos, setTotalVideos] = useState(0)
  const [userReactions, setUserReactions] = useState({}) // Store user reactions by video ID
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Track authentication status
  
  const navigate = useNavigate()

  // const [showPopup, setShowPopup] = useState(true);

  // useEffect(() => {
  //   if (showPopup) {
  //     Modal.info({
  //       title: 'Welcome to Video Surfing',
  //       content: 'This is a popup that will be displayed when the component mounts.',
  //       onOk: () => setShowPopup(false),
  //     });
  //   }
  // }, [showPopup]);
  
  // Predefined static tags for filtering
  const predefinedTags = [
    "Brunette", 
    "Blonde", 
    "Lesbian", 
    "Hot", 
    "Balochistan", 
    "Ebony", 
    "Asian", 
    "Busty",
    "china"
  ]

  // Format view count
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }
  
  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await axios.get('/api/videos', {
          params: {
            page: currentPage,
            limit: 100
          }
        })
        
        const { videos: fetchedVideos, total } = response.data.data
        
        // Ensure videos have tags array
        const processedVideos = fetchedVideos.map(video => ({
          ...video,
          tags: video.tags || []
        }))
        
        setVideos(processedVideos)
        setFilteredVideos(processedVideos)
        setTotalVideos(total)
        
        // Fetch user reactions if authenticated
        if (isAuthenticated) {
          fetchUserReactions()
        }
      } catch (err) {
        console.error('Error fetching videos:', err)
        setError('Failed to load videos. Please try again later.')
        
        // Fallback to empty array if API fails
        setVideos([])
        setFilteredVideos([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchVideos()
  }, [currentPage])
  
  // Filter videos when a tag is selected
  useEffect(() => {
    if (selectedTag && predefinedTags.includes(selectedTag)) {
      const filtered = videos.filter(video => 
        video.tags && video.tags.includes(selectedTag)
      )
      setFilteredVideos(filtered)
    } else {
      setFilteredVideos(videos)
    }
  }, [selectedTag, videos, predefinedTags])

  // Handle tag selection
  const handleTagClick = (tag) => {
    // Only handle clicks for predefined tags
    if (predefinedTags.includes(tag)) {
      if (selectedTag === tag) {
        setSelectedTag(null) // Deselect if already selected
      } else {
        setSelectedTag(tag)
      }
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Fetch user reactions for videos
  const fetchUserReactions = async () => {
    try {
      // Only fetch if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Create a new object to store reactions
      const reactions = {};
      
      // Get current videos from state
      const currentVideos = videos;
      
      // For each video, fetch the user's reaction
      for (const video of currentVideos) {
        const videoId = video._id || video.id;
        try {
          const response = await axios.get(`/api/videos/${videoId}/reactions`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.data.currentUserReaction) {
            reactions[videoId] = response.data.data.currentUserReaction;
          }
        } catch (error) {
          console.error(`Error fetching reaction for video ${videoId}:`, error);
          // Continue with other videos even if one fails
        }
      }
      
      setUserReactions(reactions);
    } catch (err) {
      console.error('Error fetching user reactions:', err);
    }
  };
  
  // Handle video click to increment view count
  const handleVideoClick = async (video) => {
    try {
      // Record the view
      await axios.post(`/api/videos/${video._id || video.id}/view`);
      
      // Navigate to the video page or open external URL
      if (video.originalUrl) {
        window.open(video.originalUrl, '_blank');
      } else {
        navigate(`/video/${video._id || video.id}`);
      }
    } catch (err) {
      console.error('Error recording view:', err);
      // Still navigate even if recording view fails
      if (video.originalUrl) {
        window.open(video.originalUrl, '_blank');
      } else {
        navigate(`/video/${video._id || video.id}`);
      }
    }
  };
  
  // Handle like/dislike
  const handleReaction = async (e, videoId, reactionType) => {
    e.stopPropagation(); // Prevent video click event
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        message.warning('Please log in to like or dislike videos');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Send reaction to API
      const response = await axios.post(
        `/api/videos/${videoId}/reactions`,
        { type: reactionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update video likes/dislikes count in the videos array
      const updatedVideos = videos.map(video => {
        if ((video._id || video.id) === videoId) {
          return {
            ...video,
            likesCount: response.data.data.likes,
            dislikesCount: response.data.data.dislikes
          };
        }
        return video;
      });
      
      setVideos(updatedVideos);
      
      // Also update filtered videos
      const updatedFilteredVideos = filteredVideos.map(video => {
        if ((video._id || video.id) === videoId) {
          return {
            ...video,
            likesCount: response.data.data.likes,
            dislikesCount: response.data.data.dislikes
          };
        }
        return video;
      });
      
      setFilteredVideos(updatedFilteredVideos);
      
      // Update user reactions
      const newUserReactions = { ...userReactions };
      
      if (response.data.data.currentUserReaction) {
        newUserReactions[videoId] = response.data.data.currentUserReaction;
      } else {
        // If reaction was removed
        delete newUserReactions[videoId];
      }
      
      setUserReactions(newUserReactions);
      
      // Show success message
      message.success(response.data.message);
      
    } catch (err) {
      console.error('Error toggling reaction:', err);
      message.error('Failed to process your reaction. Please try again.');
    }
  };

  return (
    <div className="home-container">

      {/* Banner ad */}
      <div className="banner-ad">
  <div className="banner-content">
    <h2>ADVERTISEMENT</h2>
    <h3>Enjoy Premium Access – Free for 7 Days!</h3>
    <Button
      type="primary"
      className="join-button"
      onClick={() => window.open('https://your-advertiser-link.com', '_blank')}
    >
      Learn More
    </Button>
  </div>
</div>


      {/* Video Tags */}
      <div className="category-filters">
        <div className="tag-header">
          {/* <TagOutlined /> <span>Filter by Tags:</span> */}
        </div>
        {predefinedTags.map((tag, index) => (
          <Tag 
            key={index}
            color={selectedTag === tag ? "#FF1493" : "default"}
            className="video-tag"
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </Tag>
        ))}
        {selectedTag && (
          <Button 
            type="link" 
            size="small" 
            onClick={() => setSelectedTag(null)}
            className="clear-tag-btn"
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Video filters and sorting */}
      {/* <div className="video-filters">
        <div className="filter-left">
          <Button type="primary" className="recommended-button">
            <FireOutlined /> Recommended Videos
          </Button>
        </div>

        <div className="filter-right">
          <Select defaultValue="quality" className="filter-select">
            <Option value="quality">Quality</Option>
            <Option value="hd">HD Only</Option>
            <Option value="4k">4K Only</Option>
          </Select>

          <Select defaultValue="duration" className="filter-select">
            <Option value="duration">Duration</Option>
            <Option value="short">Short (&lt; 10m)</Option>
            <Option value="medium">Medium (10-20m)</Option>
            <Option value="long">Long (&gt; 20m)</Option>
          </Select>
        </div>
      </div> */}

      {/* Main content - Video grid */}
      <div className="content-container">
        <h2 className="section-title">Latest Videos</h2>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>Loading videos...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <Button 
              type="primary" 
              onClick={() => {
                setCurrentPage(1);
                setSelectedTag(null);
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {selectedTag && predefinedTags.includes(selectedTag) && (
              <div className="filter-info">
                <span>Showing videos tagged with: <Tag color="#FF1493">{selectedTag}</Tag></span>
                <span className="results-count">({filteredVideos.length} results)</span>
              </div>
            )}
            
            {filteredVideos.length === 0 ? (
              <div className="no-results">
                <p>No videos found with the selected tag.</p>
                <Button type="primary" onClick={() => setSelectedTag(null)}>Show all videos</Button>
              </div>
            ) : (
              <div className="video-grid">
                {filteredVideos.map((video) => (
                  <div 
                    key={video._id || video.id} 
                    className="video-card"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="video-thumbnail">
                      <img 
                        src={video.thumbnailUrl || '/home.jpg'} 
                        alt={video.title} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/home.jpg';
                        }}
                      />
                      <div className="video-overlay">
                        <div className="play-button"></div>
                      </div>
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.title}</h3>
                      
                      {/* Views count section */}
                      <div className="video-views-section">
                        <EyeOutlined /> 
                        <span className="views-count">{formatViewCount(video.views || 0)} views</span>
                      </div>
                      
                      {/* Likes and dislikes section */}
                      <div className="video-reactions">
                        <div className="reaction-buttons">
                          <button 
                            className={`reaction-btn like-btn ${userReactions[video._id || video.id] === 'like' ? 'active' : ''}`}
                            onClick={(e) => handleReaction(e, video._id || video.id, 'like')}
                          >
                            {userReactions[video._id || video.id] === 'like' ? <LikeFilled /> : <LikeOutlined />}
                            <span>{formatViewCount(video.likesCount || 0)}</span>
                          </button>
                          
                          <button 
                            className={`reaction-btn dislike-btn ${userReactions[video._id || video.id] === 'dislike' ? 'active' : ''}`}
                            onClick={(e) => handleReaction(e, video._id || video.id, 'dislike')}
                          >
                            {userReactions[video._id || video.id] === 'dislike' ? <DislikeFilled /> : <DislikeOutlined />}
                            <span>{formatViewCount(video.dislikesCount || 0)}</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="video-stats">
                        <span className="video-date">
                          <ClockCircleOutlined /> {formatRelativeTime(video.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && !error && filteredVideos.length > 0 && (
          <div className="pagination-container">
            <Pagination 
              current={currentPage}
              total={totalVideos}
              pageSize={100}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
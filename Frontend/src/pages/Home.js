"use client"

import { useState, useEffect } from "react"
import { Pagination, Spin, Button, Select, Tag, message } from "antd"
import {
  FireOutlined,
  EyeOutlined,
  TagOutlined,
  ClockCircleOutlined
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0
  })
  
  const navigate = useNavigate()
  
  // Get all unique tags from videos
  const getAllTags = (videos) => {
    const tagsSet = new Set()
    videos.forEach(video => {
      video.tags.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet)
  }

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
            page: pagination.current,
            limit: pagination.pageSize
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
        setPagination(prev => ({
          ...prev,
          total
        }))
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
  }, [pagination.current, pagination.pageSize])
  
  // Filter videos when a tag is selected
  useEffect(() => {
    if (selectedTag) {
      const filtered = videos.filter(video => 
        video.tags.includes(selectedTag)
      )
      setFilteredVideos(filtered)
    } else {
      setFilteredVideos(videos)
    }
  }, [selectedTag, videos])

  // Handle tag selection
  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(null) // Deselect if already selected
    } else {
      setSelectedTag(tag)
    }
  }

  return (
    <div className="home-container">

      {/* Banner ad */}
      <div className="banner-ad">
        <div className="banner-content">
          <h2>PREMIUM CONTENT</h2>
          <h3>$0.00 FOR 7 DAYS</h3>
          <Button type="primary" className="join-button">
            JOIN NOW
          </Button>
        </div>
      </div>

      {/* Video Tags */}
      <div className="category-filters">
        <div className="tag-header">
          <TagOutlined /> <span>Filter by Tags:</span>
        </div>
        {!loading && getAllTags(videos).map((tag, index) => (
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
      <div className="video-filters">
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
      </div>

      {/* Main content - Video grid */}
      <div className="content-container">
        <h2 className="section-title">Recommended Videos</h2>

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
                setPagination(prev => ({ ...prev, current: 1 }));
                setSelectedTag(null);
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {selectedTag && (
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
                    onClick={() => navigate(`/video/${video._id || video.id}`)}
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
                      <div className="video-source">{video.sourceWebsite}</div>
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.title}</h3>
                      <div className="video-tags">
                        {video.tags && video.tags.map((tag, tagIndex) => (
                          <Tag 
                            key={tagIndex} 
                            className="video-card-tag"
                            color={tag === selectedTag ? "#FF1493" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagClick(tag);
                            }}
                          >
                            {tag}
                          </Tag>
                        ))}
                      </div>
                      <div className="video-stats">
                        <span className="video-views">
                          <EyeOutlined /> {formatViewCount(video.views || 0)}
                        </span>
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
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={(page, pageSize) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize
                }))
                // Scroll to top when changing page
                window.scrollTo(0, 0)
              }}
              showSizeChanger
              pageSizeOptions={["8", "16", "24", "32"]}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
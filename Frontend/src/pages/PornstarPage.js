"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Pagination, Spin, Button, Select, Tag, Modal, Input, message, List, Checkbox } from "antd"
import {EyeOutlined,AppstoreOutlined,UnorderedListOutlined,FolderAddOutlined,PlusOutlined,FolderOutlined,} from "@ant-design/icons"
import api from "../utils/axiosConfig"
import "./Home.css"
import { useCollections } from '../contexts/CollectionContext'
import { useAuth } from '../contexts/AuthContext'

const { Option } = Select

const PornstarPage = () => {
  const { pornstar } = useParams()
  const navigate = useNavigate()
  
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalVideos, setTotalVideos] = useState(0)
  const [viewMode, setViewMode] = useState("grid")
  const [sortOption, setSortOption] = useState("recent")
  
  const { isAuthenticated } = useAuth()
  
  const { collections, loading: collectionsLoading, createCollection, addVideoToCollection, fetchUserCollections } = useCollections();
  
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M"
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K"
    }
    return count.toString()
  }

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `${months} month${months > 1 ? "s" : ""} ago`
    } else {
      const years = Math.floor(diffInSeconds / 31536000)
      return `${years} year${years > 1 ? "s" : ""} ago`
    }
  }

  const getSortParameter = (sortOption) => {
    switch (sortOption) {
      case "recent":
        return "-createdAt"
      case "popular":
        return "-views"
      case "trending":
        return "-likes"
      case "oldest":
        return "createdAt"
      default:
        return "-createdAt"
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const videoResponse = await api.get("/videos", {
          params: {
            page: currentPage,
            limit: 64,
            tag: pornstar,
            sort: getSortParameter(sortOption),
          },
        })

        const responseData = videoResponse.data
        const fetchedVideos = responseData.data.videos
        const totalCount = responseData.total

        const processedVideos = fetchedVideos.map((video) => ({
          ...video,
          tags: video.tags || [],
        }))

        setVideos(processedVideos)
        setTotalVideos(totalCount)
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load content. Please try again later.")
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    if (pornstar) {
      fetchData()
    }
  }, [pornstar, currentPage, sortOption])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const handleSortChange = (value) => {
    setSortOption(value)
    setCurrentPage(1)
  }

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`)
  }

  const handleSaveVideo = (video) => {
    if (!isAuthenticated) {
      message.warning('Please login to save videos to collections');
      return;
    }
    setSelectedVideo(video);
    setSaveModalVisible(true);
  };

  const handleSaveToCollections = async () => {
    if (!selectedVideo) return;

    setSaveLoading(true);
    try {
      // Create new collection if specified
      if (newCollectionName.trim()) {
        await createCollection({
          name: newCollectionName.trim(),
          description: `Collection for ${selectedVideo.title}`,
          isPrivate: false
        });
        setNewCollectionName("");
      }

      // Add video to selected collections
      for (const collectionId of selectedCollections) {
        await addVideoToCollection(collectionId, selectedVideo._id);
      }

      message.success('Video saved to collections successfully!');
      setSaveModalVisible(false);
      setSelectedCollections([]);
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error saving video:', error);
      message.error('Failed to save video. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading {pornstar} videos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-container">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-title-section">
          <h1 className="home-title">
            {pornstar} Videos
          </h1>
          <p className="home-subtitle">
            Discover content featuring {pornstar}
          </p>
        </div>

        <div className="home-controls">
          <div className="view-controls">
            <Button
              type={viewMode === "grid" ? "primary" : "default"}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode("grid")}
              size="small"
            >
              Grid
            </Button>
            <Button
              type={viewMode === "list" ? "primary" : "default"}
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode("list")}
              size="small"
            >
              List
            </Button>
          </div>

          <Select
            value={sortOption}
            onChange={handleSortChange}
            style={{ width: 150 }}
            size="small"
          >
            <Option value="recent">Most Recent</Option>
            <Option value="popular">Most Popular</Option>
            <Option value="trending">Trending</Option>
            <Option value="oldest">Oldest First</Option>
          </Select>
        </div>
      </div>

      {/* Videos Grid */}
      <div className={`videos-container ${viewMode}`}>
        {videos.map((video) => (
          <div key={video._id} className={`video-card ${viewMode}`}>
            <div className="video-thumbnail-container" onClick={() => handleVideoClick(video._id)}>
              <img
                src={video.thumbnailUrl || "/placeholder.jpg"}
                alt={video.title}
                className="video-thumbnail"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/placeholder.jpg"
                }}
              />
              <div className="video-duration">{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</div>
              <div className="video-overlay">
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVideoClick(video._id)
                  }}
                >
                  Watch
                </Button>
              </div>
            </div>

            <div className="video-info">
              <h3 className="video-title" onClick={() => handleVideoClick(video._id)}>
                {video.title}
              </h3>
              <div className="video-meta">
                <span className="video-views">{formatViewCount(video.views)} views</span>
                <span className="video-time">{formatRelativeTime(video.createdAt)}</span>
              </div>
              <div className="video-tags">
                {video.tags?.slice(0, 3).map((tag, index) => (
                  <Tag key={index} className="video-tag" size="small">
                    {tag.name}
                  </Tag>
                ))}
              </div>
              <div className="video-actions">
                <Button
                  type="text"
                  icon={<FolderAddOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSaveVideo(video)
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalVideos > 64 && (
        <div className="pagination-container">
          <Pagination
            current={currentPage}
            total={totalVideos}
            pageSize={64}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} videos`}
          />
        </div>
      )}

      {/* Save to Collection Modal */}
      <Modal
        title="Save to Collection"
        open={saveModalVisible}
        onOk={handleSaveToCollections}
        onCancel={() => setSaveModalVisible(false)}
        confirmLoading={saveLoading}
        okText="Save"
      >
        <div style={{ marginBottom: 16 }}>
          <h4>Select Collections:</h4>
          <Checkbox.Group
            value={selectedCollections}
            onChange={setSelectedCollections}
          >
            <List
              dataSource={collections}
              renderItem={(collection) => (
                <List.Item key={collection._id}>
                  <Checkbox value={collection._id}>
                    {collection.name}
                  </Checkbox>
                </List.Item>
              )}
            />
          </Checkbox.Group>
        </div>
        
        <div>
          <h4>Or Create New Collection:</h4>
          <Input
            placeholder="Collection name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}

export default PornstarPage
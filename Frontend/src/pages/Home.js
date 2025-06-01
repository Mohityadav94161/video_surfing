"use client"

import { useState, useEffect } from "react"
import { Pagination, Spin, Button, Select, Tag, Modal } from "antd"
import {
  EyeOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"

import axios from "axios"
import "./Home.css"
import { useRef } from "react"

const { Option } = Select

const Home = () => {
  const [videos, setVideos] = useState([])
  const [filteredVideos, setFilteredVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState(null)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalVideos, setTotalVideos] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Track authentication status
  const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
  const [ageVerificationVisible, setAgeVerificationVisible] = useState(false)
  const [popularTags, setPoppularTags] = useState(["Brunette", "Blonde", "Lesbian", "Hot", "Balochistan", "Ebony", "Asian", "Busty", "china"])

  const [tagLoading, setTagLoading] = useState(false)
  const [tagError, setTagError] = useState(null)
  const [visibleCount, setVisibleCount] = useState(7);
  const [tagReady, setTagReady] = useState(false)

  const initialLoadDone = useRef(false)





  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();

  const showMoreTags = () => {
    setVisibleCount((prev) => prev + 7);
  };

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

  // Format view count
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M"
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K"
    }
    return count.toString()
  }

  // Format date to relative time
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

  // useEffect(() => {
  //   const tagParam = searchParams.get("tag")

  //   if (popularTags.length > 0 && !initialLoadDone.current) {
  //     const matchedTag = popularTags.find(tag => tag.name === tagParam)

  //     if (tagParam && matchedTag) {
  //       setSelectedTag(matchedTag)
  //     } else {
  //       setSelectedTag(null)
  //     }

  //     setTagReady(true)
  //     initialLoadDone.current = true // Prevents double load
  //   }
  // }, [searchParams, popularTags])




  useEffect(() => {
    const fetchPopularTags = async () => {
      setTagLoading(true);
      setTagError(null);

      try {
        const response = await axios.get("/api/videos/tags");
        const tags = response.data.data.tags;
        setPoppularTags(tags || []);
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError("Failed to load tags. Please try again later.");
      } finally {
        setTagLoading(false);
      }
    };

    fetchPopularTags();
  }, []);


  // Fetch videos from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Tags First
        const tagResponse = await axios.get("/api/videos/tags");
        const tags = tagResponse.data.data.tags || [];
        setPoppularTags(tags);

        // 2. Sync selectedTag with URL param
        const tagParam = searchParams.get("tag");
        let matchedTag = null;
        if (tagParam) {
          matchedTag = tags.find((t) => t.name === tagParam);
        }
        setSelectedTag(matchedTag || null); // also handles invalid tag
        const tagName = matchedTag?.name;

        // 3. Fetch Videos based on tag + currentPage
        const videoResponse = await axios.get("/api/videos", {
          params: {
            page: currentPage,
            limit: 100,
            tag: tagName,
          },
        });

        const { videos: fetchedVideos, total } = videoResponse.data.data;
        const processedVideos = fetchedVideos.map((video) => ({
          ...video,
          tags: video.tags || [],
        }));

        setVideos(processedVideos);
        setFilteredVideos(processedVideos);
        setTotalVideos(total);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load content. Please try again later.");
        setVideos([]);
        setFilteredVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchParams]); // Run when page or ?tag changes




  // Filter videos when a tag is selected
  // useEffect(() => {
  //   if (selectedTag && predefinedTags.includes(selectedTag)) {
  //     const filtered = videos.filter((video) => video.tags && video.tags.includes(selectedTag))
  //     setFilteredVideos(filtered)
  //   } else {
  //     setFilteredVideos(videos)
  //   }
  // }, [selectedTag, videos, predefinedTags])

  // Handle tag selection
  const handleTagClick = (tag) => {
    const currentTag = searchParams.get("tag");

    if (currentTag === tag?.name) {
      searchParams.delete("tag");
      setSelectedTag(null);
    } else {
      searchParams.set("tag", tag?.name);
      setSelectedTag(tag);
    }

    // Trigger sync
    setSearchParams(searchParams);
    setCurrentPage(1); // Reset to first page on new filter
  };


  const handlePageChange = (page) => {
    setCurrentPage(page)
  }



  // Check if user is authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem("token")
        if (token) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error("Error checking authentication:", err)
        setIsAuthenticated(false)
      }
    }

    checkAuthStatus()
  }, [])

  // Handle video click to increment view count
  const handleVideoClick = async (video) => {
    try {
      // Record the view
      await axios.post(`/api/videos/${video._id || video.id}/view`)

      // Navigate to the video page or open external URL
      if (video.originalUrl) {
        window.open(video.originalUrl, "_blank")
      } else {
        navigate(`/video/${video._id || video.id}`)
      }
    } catch (err) {
      console.error("Error recording view:", err)
      // Still navigate even if recording view fails
      if (video.originalUrl) {
        window.open(video.originalUrl, "_blank")
      } else {
        navigate(`/video/${video._id || video.id}`)
      }
    }
  }

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid")
  }

  // Check for age verification on component mount
  useEffect(() => {
    const hasVerifiedAge = localStorage.getItem("ageVerified")
    if (!hasVerifiedAge) {
      setAgeVerificationVisible(true)
    }
  }, [])

  const handleAgeVerification = (isAdult) => {
    if (isAdult) {
      localStorage.setItem("ageVerified", "true")
      setAgeVerificationVisible(false)
    } else {
      navigate("/age-restricted")
    }
  }

  const location = useLocation()

  // Add URL parameter handling
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tagFromUrl = urlParams.get("tag")
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl)
    }
  }, [location.search])

  return (
    <div className="home-container">
      {/* Age Verification Modal */}
      <Modal
        open={ageVerificationVisible}
        footer={null}
        centered
        closable={false}
        maskClosable={false}
        className="age-verification-modal"
      // width={400}
      >
        <div style={{ textAlign: "center", }}>
          <VideoCameraOutlined style={{ fontSize: "48px", color: "#ff1493", marginBottom: "20px" }} />
          <h2 style={{ color: "#ff1493", marginBottom: "20px" }}>Video Surfing</h2>
          <p style={{ color: "white", marginBottom: "30px", lineHeight: "1.6" }}>
            This website contains adult content and is intended for users who are 18 years of age or older. By entering
            this site, you confirm that you are of legal age to view adult content in your jurisdiction.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <Button
              type="primary"
              onClick={() => handleAgeVerification(true)}
              style={{
                backgroundColor: "#ff1493",
                borderColor: "#ff1493",
                padding: "8px 20px",
                height: "auto",
              }}
            >
              I'm 18 or older - Enter
            </Button>
            <Button
              onClick={() => handleAgeVerification(false)}
              style={{
                backgroundColor: "rgba(60, 60, 60, 0.8)",
                borderColor: "#444",
                color: "white",
                padding: "8px 20px",
                height: "auto",
              }}
            >
              I'm under 18 - Exit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Banner ad */}
      <div className="banner-ad">
        <div className="banner-content">
          <h2>ADVERTISEMENT</h2>
          <h3>Enjoy Premium Access – Free for 7 Days!</h3>
          <Button
            type="primary"
            className="join-button"
            onClick={() => window.open("https://your-advertiser-link.com", "_blank")}
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Video Tags */}
      <div className="category-filters">
        <div className="tag-header">
          {/* Optional: Add icon or heading here */}
        </div>

        <Spin spinning={tagLoading}>
          <div className="tag-list">
            {popularTags.slice(0, visibleCount).map((tag, index) => (
              <Tag
                key={index}
                color={selectedTag === tag ? "#FF1493" : "default"}
                className="video-tag"
                onClick={() => handleTagClick(tag)}
              >
                {tag?.name}
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

            {visibleCount < popularTags.length && (
              <Button type="text" size="small" onClick={showMoreTags} className="show-more-btn">
                Show More
              </Button>
            )}
          </div>
        </Spin>
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
        <div className="section-header">
          <h2 className="section-title">Latest Videos</h2>
          <div className="view-toggle-mobile">
            <Button
              type={viewMode === "grid" ? "primary" : "default"}
              icon={viewMode === "grid" ? <AppstoreOutlined /> : <UnorderedListOutlined />}
              onClick={toggleViewMode}
              className="view-toggle-btn"
              style={{
                backgroundColor: viewMode === "grid" ? "#ff1493" : "transparent",
                borderColor: "#ff1493",
                color: viewMode === "grid" ? "white" : "#ff1493",
              }}
            />
          </div>
        </div>

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
                setCurrentPage(1)
                setSelectedTag(null)
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {selectedTag && popularTags.includes(selectedTag) && (
              <div className="filter-info">
                <span>
                  Showing videos tagged with: <Tag color="#FF1493">{selectedTag?.name}</Tag>
                </span>
                <span className="results-count">({filteredVideos.length} results)</span>
              </div>
            )}

            {filteredVideos.length === 0 ? (
              <div className="no-results">
                <p>No videos found with the selected tag.</p>
                <Button type="primary" onClick={() => setSelectedTag(null)}>
                  Show all videos
                </Button>
              </div>
            ) : (
              <>
                {viewMode === "list" ? (
                  <div className={`video-grid list-view`}>
                    {filteredVideos.map((video) => (
                      <div key={video._id || video.id} className="video-card" onClick={() => handleVideoClick(video)}>
                        <div className="video-thumbnail">
                          <img
                            src={video.thumbnailUrl || "/home.jpg"}
                            alt={video.title}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/home.jpg"
                            }}
                          />
                          <div className="video-overlay">
                            <div className="play-button"></div>
                          </div>
                          <div className="video-duration">{video.duration || "5:30"}</div>
                        </div>
                        <div className="video-info">
                          <h3 className="video-title">{video.title}</h3>
                          <div className="video-stats-row">
                            <div className="video-views">
                              <EyeOutlined />
                              <span>{formatViewCount(video.views || 0)}</span>
                            </div>
                            <div className="video-likes">
                              <LikeOutlined />
                              <span>{formatViewCount(video.likesCount || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="video-grid">
                    {filteredVideos.map((video) => (
                      <div key={video._id || video.id} className="video-card" onClick={() => handleVideoClick(video)}>
                        <div className="video-thumbnail">
                          <img
                            src={video.thumbnailUrl || "/home.jpg"}
                            alt={video.title}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/home.jpg"
                            }}
                          />
                          <div className="video-overlay">
                            <div className="play-button"></div>
                          </div>
                          <div className="video-duration">{video.duration || "5:30"}</div>
                        </div>
                        <div className="video-info">
                          <h3 className="video-title">{video.title}</h3>
                          <div className="video-stats-row">
                            <div className="video-views">
                              <EyeOutlined />
                              <span>{formatViewCount(video.views || 0)}</span>
                            </div>
                            <div className="video-likes">
                              <LikeOutlined />
                              <span>{formatViewCount(video.likesCount || 0)}</span>
                            </div>
                          </div>
                          <div className="video-upload-date">
                            <ClockCircleOutlined />
                            <span>{formatRelativeTime(video.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
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

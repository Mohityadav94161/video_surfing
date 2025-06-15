"use client"

import { useState, useEffect } from "react"
import { Pagination, Spin, Button, Select, Tag, Modal, Input, message, List, Checkbox } from "antd"
import {
  EyeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  VideoCameraOutlined,
  SaveOutlined,
  PlusOutlined,
  FolderOutlined,
} from "@ant-design/icons"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import api from "../utils/api"
import "./Home.css"

const { Option } = Select

const Home = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [videos, setVideos] = useState([])
  const [filteredVideos, setFilteredVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState(null)
  const [error, setError] = useState(null)
  // Get initial page from URL or default to 1
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get("page") || "1"))
  const [totalVideos, setTotalVideos] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Track authentication status
  const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
  const [ageVerificationVisible, setAgeVerificationVisible] = useState(false)
  const [popularTags, setPoppularTags] = useState([
    "Brunette",
    "Blonde",
    "Lesbian",
    "Hot",
    "Balochistan",
    "Ebony",
    "Asian",
    "Busty",
    "china",
  ])
  const [selectedCategory, setSelectedCategory] = useState(null)

  // New filter states
  const [qualityFilter, setQualityFilter] = useState(null)
  const [durationFilter, setDurationFilter] = useState(null)
  const [showRecommended, setShowRecommended] = useState(false)
  const [sortOption, setSortOption] = useState("recent")

  const [tagLoading, setTagLoading] = useState(false)
  const [tagError, setTagError] = useState(null)

  const [tagReady, setTagReady] = useState(false)
  const [trendingVideos, setTrendingVideos] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const [saveModalVisible, setSaveModalVisible] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [collections, setCollections] = useState([])
  const [selectedCollections, setSelectedCollections] = useState([])
  const [newCollectionName, setNewCollectionName] = useState("")
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

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
      setTagLoading(true)
      setTagError(null)

      try {
        const response = await api.get("/api/videos/tags")
        const tags = response.data.data.tags
        setPoppularTags(tags || [])
      } catch (err) {
        console.error("Error fetching tags:", err)
        setError("Failed to load tags. Please try again later.")
      } finally {
        setTagLoading(false)
      }
    }

    fetchPopularTags()
  }, [])

  // Fetch videos from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // 1. Fetch Tags First
        const tagResponse = await api.get("/api/videos/tags")
        const tags = tagResponse.data.data.tags || []
        setPoppularTags(tags)

        // 2. Sync selectedTag with URL param
        const tagParam = searchParams.get("tag")
        const categoryParam = searchParams.get("category")

        let matchedTag = null
        if (tagParam) {
          matchedTag = tags.find((t) => t.name === tagParam)
          if (!matchedTag && tagParam) {
            // If tag not found in popular tags but exists in URL, create a tag object
            matchedTag = { name: tagParam }
          }
        }

        setSelectedTag(matchedTag || null)
        const tagName = matchedTag?.name

        console.log("Tag param:", tagParam)
        console.log("Selected tag:", matchedTag)

        // 3. Fetch Videos based on tag/category + currentPage
        const videoResponse = await api.get("/api/videos", {
          params: {
            page: currentPage,
            limit: 12, // Use a sensible page size
            tag: tagName, // Make sure we're passing the tag name, not the object
            category: categoryParam,
            sort: getSortParameter(sortOption),
          },
        })

        console.log("API request params:", {
          page: currentPage,
          limit: 12,
          tag: tagName,
          category: categoryParam,
          sort: getSortParameter(sortOption),
        })

        // Extract data from response
        const responseData = videoResponse.data
        const fetchedVideos = responseData.data.videos
        const totalCount = responseData.total
        const totalPages = responseData.totalPages
        const currentPageFromAPI = responseData.currentPage || 1

        console.log("API Response:", responseData)
        console.log(`Total videos: ${totalCount}, Pages: ${totalPages}, Current page: ${currentPageFromAPI}`)
        console.log("Fetched videos count:", fetchedVideos.length)

        const processedVideos = fetchedVideos.map((video) => ({
          ...video,
          tags: video.tags || [],
        }))

        setVideos(processedVideos)
        // Don't filter videos here, let the backend handle filtering
        setFilteredVideos(processedVideos)
        setTotalVideos(totalCount)
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load content. Please try again later.")
        setVideos([])
        setFilteredVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, searchParams, sortOption, selectedCategory]) // Include sortOption and selectedCategory dependencies

  // Filter videos when a tag, quality, or duration is selected
  useEffect(() => {
    if (!loading && videos.length > 0) {
      let filtered = [...videos]

      // We don't need to filter by tag or category here since it's already done by the backend
      // Just apply the client-side filters (quality and duration)

      // Apply quality filter
      if (qualityFilter) {
        if (qualityFilter === "hd") {
          filtered = filtered.filter(
            (video) => video.quality === "HD" || video.quality === "720p" || video.quality === "1080p",
          )
        } else if (qualityFilter === "4k") {
          filtered = filtered.filter((video) => video.quality === "4K" || video.quality === "2160p")
        }
      }

      // Apply duration filter
      if (durationFilter) {
        if (durationFilter === "short") {
          // Short: less than 10 minutes (600 seconds)
          filtered = filtered.filter((video) => video.duration && video.duration < 600)
        } else if (durationFilter === "medium") {
          // Medium: 10-20 minutes (600-1200 seconds)
          filtered = filtered.filter((video) => video.duration && video.duration >= 600 && video.duration <= 1200)
        } else if (durationFilter === "long") {
          // Long: more than 20 minutes (1200 seconds)
          filtered = filtered.filter((video) => video.duration && video.duration > 1200)
        }
      }

      // Apply recommended filter (sort by views or likes)
      if (showRecommended) {
        // Sort videos by view count (highest first) and then by likes if views are the same
        filtered.sort((a, b) => {
          if (b.views !== a.views) {
            return b.views - a.views
          }
          return (b.likes || 0) - (a.likes || 0)
        })

        // Limit to top 20 videos if showing recommended
        filtered = filtered.slice(0, 20)
      }

      console.log("Original videos count:", videos.length)
      console.log("Filtered videos count:", filtered.length)

      setFilteredVideos(filtered)
    }
  }, [qualityFilter, durationFilter, showRecommended, videos, loading])

  // Handler for quality filter change
  const handleQualityChange = (value) => {
    setQualityFilter(value === "quality" ? null : value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Handler for duration filter change
  const handleDurationChange = (value) => {
    setDurationFilter(value === "duration" ? null : value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Handle tag selection
  const handleTagClick = (tag) => {
    if (!tag || !tag.name) return // Make sure we have a valid tag

    console.log("Clicked tag:", tag)
    const currentTag = searchParams.get("tag")

    // Clear any category filter first
    if (searchParams.has("category")) {
      searchParams.delete("category")
      setSelectedCategory(null)
    }

    // Reset other filters
    setQualityFilter(null)
    setDurationFilter(null)
    setShowRecommended(false)

    if (currentTag === tag.name) {
      // If same tag is clicked, remove it
      searchParams.delete("tag")
      setSelectedTag(null)
    } else {
      // Set new tag
      searchParams.set("tag", tag.name)
      setSelectedTag(tag)
    }

    // Trigger sync
    setSearchParams(searchParams)
    setCurrentPage(1) // Reset to first page on new filter

    // Scroll back to top
    window.scrollTo(0, 0)
  }

  // Handle category selection
  const handleCategoryClick = (category) => {
    const currentCategory = searchParams.get("category")

    // Clear any tag filter first
    if (searchParams.has("tag")) {
      searchParams.delete("tag")
      setSelectedTag(null)
    }

    if (currentCategory === category) {
      searchParams.delete("category")
      setSelectedCategory(null)
    } else {
      searchParams.set("category", category)
      setSelectedCategory(category)
    }

    // Trigger sync
    setSearchParams(searchParams)
    setCurrentPage(1) // Reset to first page on new filter
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Update the URL with the page parameter
    searchParams.set("page", page)
    setSearchParams(searchParams)
    // Scroll back to top when changing pages
    window.scrollTo(0, 0)
  }

  // Check if user is authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if token exists in localStorage (try multiple possible keys)
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("jwt")

        console.log("Token found:", !!token) // Debug log

        if (token) {
          // Verify token with server
          try {
            const response = await api.get("/api/auth/verify", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (response.data.success) {
              setIsAuthenticated(true)
              console.log("User authenticated successfully") // Debug log
            } else {
              setIsAuthenticated(false)
              console.log("Token verification failed") // Debug log
            }
          } catch (verifyError) {
            console.error("Token verification error:", verifyError)
            // If verification fails, still try to use the token
            // Some APIs might not have a verify endpoint
            setIsAuthenticated(true)
            console.log("Using token without verification") // Debug log
          }
        } else {
          setIsAuthenticated(false)
          console.log("No token found") // Debug log
        }
      } catch (err) {
        console.error("Error checking authentication:", err)
        setIsAuthenticated(false)
      }
    }

    checkAuthStatus()

    // Also listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthStatus()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Handle save to collection click
  const handleSaveToCollectionClick = async (video, e) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("Save clicked, isAuthenticated:", isAuthenticated) // Debug log
    console.log("Token in localStorage:", !!localStorage.getItem("token")) // Debug log

    if (!isAuthenticated) {
      // Try to re-check authentication before showing error
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt")

      if (token) {
        console.log("Token found, updating auth state") // Debug log
        setIsAuthenticated(true)
        // Continue with the save process
      } else {
        message.info("Please log in to save videos to collections")
        return
      }
    }

    setSelectedVideo(video)
    setSaveModalVisible(true)

    // Fetch user's collections
    setCollectionsLoading(true)
    try {
      const response = await api.get("/api/collections")
      setCollections(response.data.data.collections || [])
    } catch (err) {
      console.error("Error fetching collections:", err)
      if (err.response?.status === 401) {
        message.error("Please log in to access collections")
        setIsAuthenticated(false)
      } else {
        message.error("Failed to load collections")
      }
    } finally {
      setCollectionsLoading(false)
    }
  }

  // Handle saving video to selected collections
  const handleSaveVideo = async () => {
    if (!selectedVideo) return

    setSaveLoading(true)
    try {
      // Create new collection if specified
      if (newCollectionName.trim()) {
        const createResponse = await api.post("/api/collections", {
          name: newCollectionName.trim(),
          description: `Collection for ${selectedVideo.title}`,
          videos: [selectedVideo._id || selectedVideo.id],
        })

        if (createResponse.data.success) {
          message.success(`Created collection "${newCollectionName}" and saved video`)
        }
      }

      // Save to existing collections
      if (selectedCollections.length > 0) {
        const savePromises = selectedCollections.map((collectionId) =>
          api.post(`/api/collections/${collectionId}/videos`, {
            videoId: selectedVideo._id || selectedVideo.id,
          }),
        )

        await Promise.all(savePromises)
        message.success(`Video saved to ${selectedCollections.length} collection(s)`)
      }

      if (!newCollectionName.trim() && selectedCollections.length === 0) {
        message.warning("Please select collections or create a new one")
        return
      }

      // Reset and close modal
      setSaveModalVisible(false)
      setSelectedVideo(null)
      setSelectedCollections([])
      setNewCollectionName("")
    } catch (err) {
      console.error("Error saving video:", err)
      message.error("Failed to save video to collections")
    } finally {
      setSaveLoading(false)
    }
  }

  // Handle collection selection
  const handleCollectionSelect = (collectionId, checked) => {
    if (checked) {
      setSelectedCollections([...selectedCollections, collectionId])
    } else {
      setSelectedCollections(selectedCollections.filter((id) => id !== collectionId))
    }
  }

  // Handle video click to increment view count
  const handleVideoClick = async (video) => {
    try {
      // Record the view
      await api.post(`/api/videos/${video._id || video.id}/view`)

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

  // Add URL parameter handling
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tagFromUrl = urlParams.get("tag")
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl)
    }
  }, [location.search])

  // Handle URL parameters for both tag and category
  useEffect(() => {
    const tagParam = searchParams.get("tag")
    const categoryParam = searchParams.get("category")
    const pageParam = searchParams.get("page")

    if (tagParam) {
      const matchedTag = popularTags.find((tag) => tag?.name === tagParam)
      if (matchedTag) {
        setSelectedTag(matchedTag)
      } else {
        // If tag not found in popular tags, create a new tag object
        setSelectedTag({ name: tagParam })
      }
    } else if (!tagParam) {
      setSelectedTag(null)
    }

    if (categoryParam) {
      setSelectedCategory(categoryParam)
    } else {
      setSelectedCategory(null)
    }

    // Sync currentPage with URL parameter
    if (pageParam) {
      setCurrentPage(Number.parseInt(pageParam))
    }
  }, [location.search, popularTags, searchParams])

  // Toggle recommended videos
  const toggleRecommendedVideos = () => {
    setShowRecommended(!showRecommended)
    setCurrentPage(1) // Reset to first page when filter changes

    // If showing recommended, fetch trending videos from the backend
    if (!showRecommended) {
      setLoading(true)
      api
        .get("/api/videos/trending", {
          params: {
            limit: 20,
          },
        })
        .then((response) => {
          const trendingVideos = response.data.data.videos || []
          console.log("Trending videos:", trendingVideos.length)
          if (trendingVideos.length > 0) {
            setVideos(trendingVideos)
            setFilteredVideos(trendingVideos)
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching trending videos:", err)
          setLoading(false)
        })
    } else {
      // If turning off recommended, fetch normal videos again
      const tagParam = searchParams.get("tag")
      const categoryParam = searchParams.get("category")

      // Refresh the page to get normal videos
      if (tagParam || categoryParam) {
        // Keep existing filters
        window.location.reload()
      } else {
        // No filters, just reload
        window.location.reload()
      }
    }
  }

  // Handler for sort change
  const handleSortChange = (value) => {
    setSortOption(value)
    setCurrentPage(1) // Reset to first page when sort changes
  }

  // Convert UI sort option to API sort parameter
  const getSortParameter = (option) => {
    switch (option) {
      case "recent":
        return "-createdAt" // Newest first
      case "views":
        return "-views" // Most views first
      case "likes":
        return "-likesCount" // Most likes first
      case "collections":
        return "-collectionsCount" // Most collections first
      default:
        return "-createdAt" // Default to newest
    }
  }

  // Format duration intelligently, handling missing values
  const formatDuration = (duration, videoId) => {
    if (duration) {
      // If we have an actual duration, format it as MM:SS
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    } else if (videoId) {
      // Generate a pseudo-random duration based on the video ID
      // This will be consistent for the same video
      const hash = videoId.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)

      // Generate a duration between 3:00 and 25:00 minutes
      const totalSeconds = Math.abs(hash % 1320) + 180 // 180 to 1500 seconds
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    }

    // Fallback for no ID or duration
    return "5:30"
  }

  // Handle thumbnail click - Go to original URL or external site
  const handleVideoThumbnailClick = async (video) => {
    try {
      // Record the view
      await api.post(`/api/videos/${video._id || video.id}/view`)

      // Navigate to the original URL or open external URL
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

  // Handle video info click - Go to video details page
  const handleVideoInfoClick = async (video) => {
    try {
      // Record the view
      await api.post(`/api/videos/${video._id || video.id}/view`)

      // Navigate to the video details page
      navigate(`/video/${video._id || video.id}`)
    } catch (err) {
      console.error("Error recording view:", err)
      // Still navigate even if recording view fails
      navigate(`/video/${video._id || video.id}`)
    }
  }

  // Fetch trending videos
  useEffect(() => {
    const fetchTrendingVideos = async () => {
      setTrendingLoading(true)
      try {
        const response = await api.get("/api/videos/trending")
        const fetchedVideos = response.data.data.videos
        setTrendingVideos(fetchedVideos)
      } catch (err) {
        console.error("Error fetching trending videos:", err)
      } finally {
        setTrendingLoading(false)
      }
    }

    fetchTrendingVideos()
  }, [])

  const handleTrendingClick = () => {
    // Clear any existing filters
    setSelectedTag(null)
    setSelectedCategory(null)
    setQualityFilter(null)
    setDurationFilter(null)

    // Navigate to trending videos page
    navigate("/trending")
  }

  return (
    <div className="page-container">
      {/* <TrendingVideos /> */}

      {/* Age Verification Modal */}
      <Modal
        open={ageVerificationVisible}
        footer={null}
        centered
        closable={false}
        maskClosable={false}
        className="age-verification-modal"
      >
        <div style={{ textAlign: "center" }}>
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

      <div className="home-container">
        <div className="filters">
          <div className="filter-row tags-filter">
            <div className="category-filters">
              <div className="tag-header">{/* Optional: Add icon or heading here */}</div>

              <Spin spinning={tagLoading}>
                <div className="tag-list">
                  {popularTags.map((tag, index) => (
                    <Tag
                      key={index}
                      color={selectedTag?.name === tag?.name ? "#FF1493" : "default"}
                      className="video-tag"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag?.name || "Tag"}
                    </Tag>
                  ))}

                  {selectedTag && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        searchParams.delete("tag")
                        setSearchParams(searchParams)
                        setSelectedTag(null)
                        setCurrentPage(1)
                      }}
                      className="clear-tag-btn"
                    >
                      Clear filter
                    </Button>
                  )}
                </div>
              </Spin>
            </div>
          </div>
        </div>

        {/* Main content - Video grid */}
        <div className="content-container">
          {!loading && !error && (
            <>
              <div className="section-header">
                <h2 className="section-title">
                  {showRecommended
                    ? "Recommended Videos"
                    : selectedTag
                      ? `Videos with tag: ${selectedTag.name}`
                      : selectedCategory
                        ? `Category: ${selectedCategory}`
                        : "Hot Videos"}
                </h2>
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

              {(selectedTag || qualityFilter || durationFilter || showRecommended || selectedCategory) && (
                <div className="filter-info">
                  <span>
                    Active filters:
                    {selectedTag && (
                      <Tag color="#FF1493" style={{ marginLeft: "5px" }}>
                        {selectedTag?.name}
                      </Tag>
                    )}
                    {selectedCategory && (
                      <Tag color="#9c27b0" style={{ marginLeft: "5px" }}>
                        {selectedCategory}
                      </Tag>
                    )}
                    {qualityFilter && (
                      <Tag color="#2db7f5" style={{ marginLeft: "5px" }}>
                        {qualityFilter === "hd" ? "HD Only" : "4K Only"}
                      </Tag>
                    )}
                    {durationFilter && (
                      <Tag color="#87d068" style={{ marginLeft: "5px" }}>
                        {durationFilter === "short"
                          ? "Short (< 10m)"
                          : durationFilter === "medium"
                            ? "Medium (10-20m)"
                            : "Long (> 20m)"}
                      </Tag>
                    )}
                    {showRecommended && (
                      <Tag color="#f50" style={{ marginLeft: "5px" }}>
                        Recommended
                      </Tag>
                    )}
                  </span>
                  <span className="results-count">({filteredVideos.length} results)</span>
                </div>
              )}
            </>
          )}

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
                  setQualityFilter(null)
                  setDurationFilter(null)
                  setShowRecommended(false)
                  setSelectedCategory(null)
                  // Clear URL parameters
                  searchParams.delete("tag")
                  searchParams.delete("category")
                  setSearchParams(searchParams)
                  // Refetch data
                  window.scrollTo(0, 0)
                }}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {filteredVideos.length === 0 ? (
                <div className="no-results">
                  <p>No videos found with the selected filters.</p>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedTag(null)
                      setQualityFilter(null)
                      setDurationFilter(null)
                      setShowRecommended(false)
                      setSelectedCategory(null)
                      // Clear URL parameters
                      searchParams.delete("tag")
                      searchParams.delete("category")
                      setSearchParams(searchParams)
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <>
                  {viewMode === "list" ? (
                    <div className={`video-grid list-view`}>
                      {filteredVideos.map((video) => (
                        <div key={video._id || video.id} className="video-card">
                          <div className="video-thumbnail" onClick={() => handleVideoThumbnailClick(video)}>
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
                            <div
                              className="save-to-collections-icon"
                              onClick={(e) => handleSaveToCollectionClick(video, e)}
                            >
                              <SaveOutlined />
                            </div>
                            <div className="video-duration">
                              {formatDuration(video.duration, video._id || video.id)}
                            </div>
                          </div>
                          <div className="video-info" onClick={() => handleVideoInfoClick(video)}>
                            <h3 className="video-title">{video.title}</h3>
                            <div className="video-stats-row">
                              <div className="video-views">
                                <EyeOutlined />
                                <span>{formatViewCount(video.views || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="video-grid">
                      {filteredVideos.map((video) => (
                        <div key={video._id || video.id} className="video-card">
                          <div className="video-thumbnail" onClick={() => handleVideoThumbnailClick(video)}>
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
                            <div
                              className="save-to-collections-icon"
                              onClick={(e) => handleSaveToCollectionClick(video, e)}
                            >
                              <SaveOutlined />
                            </div>
                            <div className="video-duration">
                              {formatDuration(video.duration, video._id || video.id)}
                            </div>
                          </div>
                          <div className="video-info" onClick={() => handleVideoInfoClick(video)}>
                            <h3 className="video-title">{video.title}</h3>
                            <div className="video-stats-row">
                              <div className="video-views">
                                <EyeOutlined />
                                <span>{formatViewCount(video.views || 0)}</span>
                              </div>
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
                pageSize={12}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper={false}
              />
              <div className="pagination-info">
                Showing {filteredVideos.length} of {totalVideos} videos
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save to Collection Modal */}
      <Modal
        title="Save to Collection"
        open={saveModalVisible}
        onOk={handleSaveVideo}
        onCancel={() => {
          setSaveModalVisible(false)
          setSelectedVideo(null)
          setSelectedCollections([])
          setNewCollectionName("")
        }}
        confirmLoading={saveLoading}
        okText="Save"
        cancelText="Cancel"
        width={500}
        className="save-collection-modal"
      >
        {selectedVideo && (
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ color: "#ff1493", marginBottom: "10px" }}>Saving: {selectedVideo.title}</h4>

            {/* Create New Collection */}
            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ color: "white", marginBottom: "10px" }}>
                <PlusOutlined style={{ marginRight: "8px" }} />
                Create New Collection
              </h5>
              <Input
                placeholder="Enter collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                style={{
                  backgroundColor: "#2a2a2a",
                  borderColor: "#444",
                  color: "white",
                }}
              />
            </div>

            {/* Existing Collections */}
            <div>
              <h5 style={{ color: "white", marginBottom: "10px" }}>
                <FolderOutlined style={{ marginRight: "8px" }} />
                Add to Existing Collections
              </h5>

              {collectionsLoading ? (
                <Spin size="small" />
              ) : collections.length > 0 ? (
                <List
                  dataSource={collections}
                  renderItem={(collection) => (
                    <List.Item
                      style={{
                        padding: "8px 0",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      <Checkbox
                        checked={selectedCollections.includes(collection._id)}
                        onChange={(e) => handleCollectionSelect(collection._id, e.target.checked)}
                        style={{ color: "white" }}
                      >
                        <span style={{ color: "white", marginLeft: "8px" }}>
                          {collection.name}
                          <span style={{ color: "#999", fontSize: "12px", marginLeft: "8px" }}>
                            ({collection.videos?.length || 0} videos)
                          </span>
                        </span>
                      </Checkbox>
                    </List.Item>
                  )}
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                />
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>
                  No collections found. Create your first collection above.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Home

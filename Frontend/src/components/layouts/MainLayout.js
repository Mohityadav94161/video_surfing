"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import {
  Layout,
  Input,
  Button,
  Avatar,
  theme,
  Badge,
  Divider,
  Typography,
  Drawer,
  Modal,
  message,
  Row,
  Col,
  Dropdown,
  AutoComplete,
} from "antd"
import {
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  DashboardOutlined,
  MenuOutlined,
  FolderOutlined,
  UploadOutlined,
  SearchOutlined,
  CustomerServiceOutlined,
  QuestionCircleOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  PhoneOutlined,
  CaretDownOutlined,
} from "@ant-design/icons"
import { useAuth } from "../../contexts/AuthContext"
import "./MainLayout.css"
import "../../components/ModalStyles.css"
import api from "../../utils/axiosConfig"
import LoginForm from "../../components/LoginForm"
import RegisterForm from "../../components/RegisterForm"
import BackgroundTaskIndicator from "../BackgroundTaskIndicator"

const { Header, Content, Footer } = Layout
const { Search } = Input
const { Text, Title } = Typography

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isAdmin, user, logout, login, register, loading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginVisible, setLoginVisible] = useState(false)
  const [registerVisible, setRegisterVisible] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [menuData, setMenuData] = useState({
    Trending: [],
    Categories: [],
    Pornstars: [],
    Recommended: [],
    home: [],
  })
  const [pendingAction, setPendingAction] = useState(null)
  // Add state for displayed videos limit and pagination
  const [displayLimit, setDisplayLimit] = useState({
    Trending: 6,
    Categories: 6,
    Pornstars: 6,
    Recommended: 6,
  })

  // Search recommendations
  const searchRecommendations = ["Hot", "Blonde", "Short", "Blondie", "Brunette", "Busty", "Asian", "Ebony", "Lesbian"]

  // Theme token for styling
  const { token } = theme.useToken()

  // Track scroll position for header effects
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  // Scroll to top on route changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname, location.search])

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchVisible(false)
    setDesktopMenuOpen(false)
    setActiveDropdown(null)
  }, [location.pathname])

  // Execute pending action after successful authentication
  useEffect(() => {
    if (isAuthenticated && pendingAction) {
      const actionToExecute = pendingAction
      setPendingAction(null)
      actionToExecute()
    }
  }, [isAuthenticated, pendingAction])

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // Fetch categories
        const categoryResponse = await api.get("/videos/categories")
        const categories = categoryResponse.data.data.categories || []

        // Fetch tags for trending and pornstars
        const tagsResponse = await api.get("/videos/tags")
        const tags = tagsResponse.data.data.tags || []

        // Make sure tags are properly formatted
        const formattedTags = tags.map((tag) => {
          // If tag is already an object with name property, return it
          if (tag && typeof tag === "object" && tag.name) {
            return tag
          }
          // If tag is a string, convert it to object with name property
          if (typeof tag === "string") {
            return { name: tag }
          }
          // Default fallback
          return { name: String(tag || "Unknown") }
        })

        // For trending videos, find actual videos with isTrending flag
        const trendingResponse = await api.get("/videos", {
          params: {
            isTrending: true,
            limit: 12,
          },
        })

        // Create trending tags with thumbnails
        const trendingVideos = trendingResponse.data.data.videos || []
        const trendingTags = trendingVideos.map((video) => ({
          name: video.title,
          thumbnail: video.thumbnailUrl,
          tag: video.tags?.[0]?.name || "trending",
          id: video._id,
        }))

        // If not enough trending videos, supplement with regular tags
        if (trendingTags.length < 12) {
          const additionalTags = formattedTags
            .filter((tag) => !trendingTags.find((t) => t.tag === tag.name))
            .slice(0, 12 - trendingTags.length)
            .map((tag) => ({
              name: tag.name,
              tag: tag.name,
            }))

          trendingTags.push(...additionalTags)
        }

        // Filter tags for pornstars (using some tags as pornstar names for demo)
        const pornstarTags = formattedTags
          .filter((tag) => ["Brunette", "Blonde", "Asian", "Ebony", "Latina", "Redhead"].includes(tag?.name))
          .slice(0, 12)

        // For recommended, we'll fetch most popular videos
        const videosResponse = await api.get("/videos", {
          params: {
            sort: "-views",
            limit: 12,
          },
        })

        // Extract categories from popular videos
        const recommendedCategories = videosResponse.data.data.videos
          .map((video) => video.category)
          .filter(Boolean)
          .filter((value, index, self) => self.indexOf(value) === index)
          .slice(0, 12)

        // Fallback categories if none found
        const fallbackCategories = [
          "Amateur",
          "Anal",
          "Asian",
          "BBW",
          "Big Ass",
          "Big Tits",
          "Blonde",
          "Blowjob",
          "Brunette",
          "Cumshot",
          "Ebony",
          "MILF",
        ]
        const finalCategories = categories.length > 0 ? categories : fallbackCategories

        // Fallback recommended if none found
        const finalRecommended =
          recommendedCategories.length > 0 ? recommendedCategories : fallbackCategories.slice(0, 8)

        // Enhanced pornstar tags with more variety
        const enhancedPornstarTags = [
          ...pornstarTags,
          ...formattedTags
            .filter((tag) => ["Teen", "MILF", "Mature", "Young", "Petite", "Curvy"].includes(tag?.name))
            .slice(0, 12 - pornstarTags.length),
        ]

        // Add home menu with recent items
        const homeMenu = videosResponse.data.data.videos.slice(0, 6).map((video) => ({
          name: video.title,
          thumbnail: video.thumbnailUrl,
          id: video._id,
        }))

        setMenuData({
          home: homeMenu,
          Categories: finalCategories,
          Trending: trendingTags,
          Pornstars: enhancedPornstarTags,
          Recommended: finalRecommended,
        })
      } catch (err) {
        console.error("Error fetching menu data:", err)
      }
    }

    fetchMenuData();

  },[])
  // console.log('object ',menuData[activeDropdown])

  const handleSearch = (value) => {
    if (value.trim()) {
      // First save the search term to avoid race conditions
      const searchValue = value.trim()
      setSearchTerm(searchValue)

      // Navigate to search page with the query
      navigate(`/search?q=${encodeURIComponent(searchValue)}`)

      // Close search overlay on mobile
      setSearchVisible(false)
    }
  }

  const handleRecommendationClick = (recommendation) => {
    setSearchTerm(recommendation)
    handleSearch(recommendation)
  }

  const handleLogoClick = () => {
    navigate("/")
    window.location.href = "/"
  }

  // Desktop avatar dropdown items
  const desktopAvatarMenuItems = !isAuthenticated
    ? [
        {
          key: "login",
          label: (
            <div onClick={() => setLoginVisible(true)} style={{ padding: "8px 0" }}>
              <LoginOutlined style={{ marginRight: 8 }} />
              Login
            </div>
          ),
        },
        {
          key: "register",
          label: (
            <div onClick={() => setRegisterVisible(true)} style={{ padding: "8px 0" }}>
              <UserAddOutlined style={{ marginRight: 8 }} />
              Register
            </div>
          ),
        },
        {
          type: "divider",
        },
        {
          key: "collections",
          label: (
            <div onClick={() => handleProtectedAction(() => navigate("/collections"))} style={{ padding: "8px 0" }}>
              <FolderOutlined style={{ marginRight: 8 }} />
              My Collections
            </div>
          ),
        },
        {
          key: "upload",
          label: (
            <div onClick={() => handleProtectedAction(() => navigate("/upload-video"))} style={{ padding: "8px 0" }}>
              <UploadOutlined style={{ marginRight: 8 }} />
              Upload Videos
            </div>
          ),
        },
        {
          key: "support",
          label: (
            <div onClick={() => navigate("/support?page=contact-us")} style={{ padding: "8px 0" }}>
              Contact Support
            </div>
          ),
        },
      ]
    : [
        {
          key: "collections",
          label: (
            <div onClick={() => navigate("/collections")} style={{ padding: "8px 0" }}>
              <FolderOutlined style={{ marginRight: 8 }} />
              My Collections
            </div>
          ),
        },
        {
          key: "upload",
          label: (
            <div onClick={() => navigate("/upload-video")} style={{ padding: "8px 0" }}>
              <UploadOutlined style={{ marginRight: 8 }} />
              Upload Videos
            </div>
          ),
        },
        {
          key: "support",
          label: (
            <div onClick={() => navigate("/support?page=contact-us")} style={{ padding: "8px 0" }}>
              Contact Support
            </div>
          ),
        },
        {
          type: "divider",
        },
        {
          key: "profile",
          label: (
            <div onClick={() => navigate("/profile")} style={{ padding: "8px 0" }}>
              <UserOutlined style={{ marginRight: 8 }} />
              Profile
            </div>
          ),
        },
        ...(isAdmin
          ? [
              {
                key: "admin",
                label: (
                  <div onClick={() => navigate("/admin")} style={{ padding: "8px 0" }}>
                    <DashboardOutlined style={{ marginRight: 8 }} />
                    Admin Dashboard
                  </div>
                ),
              },
            ]
          : []),
        {
          key: "logout",
          label: (
            <div onClick={logout} style={{ padding: "8px 0", color: "#ff4d4f" }}>
              <LogoutOutlined style={{ marginRight: 8 }} />
              Logout
            </div>
          ),
        },
      ]

  // Search suggestions for AutoComplete
  const searchOptions = searchRecommendations.map((item) => ({
    value: item,
    label: (
      <div style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
        <SearchOutlined style={{ marginRight: 8, color: "#ff1493" }} />
        {item}
      </div>
    ),
  }))

  const handleProtectedAction = (action) => {
    if (!isAuthenticated) {
      setPendingAction(() => action)
      setLoginVisible(true)
      setAvatarMenuOpen(false)
    } else {
      action()
      setAvatarMenuOpen(false)
    }
  }

  // Handle header dropdown hover
  const handleHeaderMenuHover = (menuType) => {
    // Don't show dropdown for home menu item
    if (menuType !== "home") {
      setActiveDropdown(menuType)
    }
  }

  const handleHeaderMenuLeave = () => {
    setActiveDropdown(null)
  }

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Header
        className={`main-header ${scrolled ? "scrolled" : ""}`}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          width: "100%",
          padding: "0 40px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
          transition: "all 0.3s ease",
          background: "#101827",
        }}
      >
        {/* Desktop navigation */}
        <div className="desktop-nav-new">
          {/* Left side - Menu icon and Logo */}
          <div className="desktop-left">
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: "#FF1493", fontSize: "24px" }} />}
              onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
              className="desktop-menu-button"
              style={{
                border: "none",
                background: "transparent",
                boxShadow: "none",
                padding: 0,
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />

            <div className="desktop-logo-container">
              <Link to="/" className="logo" aria-label="XFansTube Home" onClick={handleLogoClick}>
                <img src="/xfans_logo.svg" alt="XFansTube" style={{ height: "36px", width: "auto" }} />
              </Link>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="desktop-center">
            <AutoComplete
              options={searchOptions}
              onSelect={handleRecommendationClick}
              onSearch={setSearchTerm}
              value={searchTerm}
              className="desktop-search"
              dropdownClassName="desktop-search-dropdown"
            >
              <Search placeholder="Search videos..." allowClear onSearch={handleSearch} />
            </AutoComplete>
          </div>

          {/* Right side - Avatar */}
          <div className="desktop-right">
            <Dropdown
              menu={{ items: desktopAvatarMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="desktop-avatar-dropdown"
            >
              <Button
                type="text"
                className="desktop-avatar-button"
                style={{
                  border: "none",
                  background: "transparent",
                  boxShadow: "none",
                  padding: 0,
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!isAuthenticated ? (
                  <Avatar className="desktop-avatar" icon={<UserOutlined />} />
                ) : (
                  <Badge dot={isAdmin} color="green">
                    <Avatar
                      className="desktop-avatar"
                      src={user?.avatar || "/avatars/banana.png"}
                      icon={!user?.avatar && <UserOutlined />}
                    />
                  </Badge>
                )}
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="mobile-nav">
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: "#FF1493", fontSize: "24px" }} />}
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-button"
            style={{
              border: "none",
              background: "transparent",
              boxShadow: "none",
              padding: 0,
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          <div className="mobile-logo-container">
            <Link to="/" className="logo" aria-label="XFansTube Home" onClick={handleLogoClick}>
              <img src="/xfans_logo.svg" alt="XFansTube" style={{ height: "24px", width: "auto" }} />
            </Link>
          </div>

          <Button
            type="text"
            icon={<SearchOutlined style={{ color: "#FF1493", fontSize: "24px" }} />}
            onClick={() => setSearchVisible(!searchVisible)}
            className="mobile-search-button"
            style={{
              border: "none",
              background: "transparent",
              boxShadow: "none",
              padding: 0,
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          <Button
            type="text"
            onClick={() => setAvatarMenuOpen(true)}
            className="mobile-avatar-button"
            style={{
              border: "none",
              background: "transparent",
              boxShadow: "none",
              padding: 0,
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              className="mobile-avatar"
              src={isAuthenticated ? user?.avatar || "/avatars/banana.png" : undefined}
              icon={<UserOutlined />}
            />
          </Button>
        </div>

        {/* Mobile search overlay */}
        {searchVisible && (
          <>
            {/* Search backdrop */}
            <div className="mobile-search-backdrop" onClick={() => setSearchVisible(false)} />

            {/* Search overlay covering navbar */}
            <div className="mobile-search-navbar-overlay">
              <Search
                placeholder="Search videos..."
                allowClear
                enterButton
                onSearch={handleSearch}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mobile-search-input"
                autoFocus
              />
              <Button type="text" className="mobile-search-cancel" onClick={() => setSearchVisible(false)}>
                Cancel
              </Button>
            </div>

            {/* Search recommendations */}
            <div className="mobile-search-recommendations">
              <div className="recommendations-container">
                <div className="recommendations-title">Popular searches</div>
                <div className="recommendations-list">
                  {searchRecommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="recommendation-item"
                      onClick={() => handleRecommendationClick(recommendation)}
                    >
                      <SearchOutlined className="recommendation-icon" />
                      <span className="recommendation-text">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </Header>

      {/* Header Main Menu */}
      <div className="header-main-menu">
        <div className="header-main-menu-inner">
          <div
            className="header-menu-item"
            onClick={() => {
              window.location.href = "/"
            }}
          >
            Home
          </div>
          <div
            className="header-menu-item"
            onMouseEnter={() => handleHeaderMenuHover("Trending")}
            onMouseLeave={handleHeaderMenuLeave}
            onClick={() => navigate("/trending")}
          >
            Trending <CaretDownOutlined style={{ fontSize: "12px", marginLeft: "4px" }} />
          </div>
          <div
            className="header-menu-item"
            onMouseEnter={() => handleHeaderMenuHover("Categories")}
            onMouseLeave={handleHeaderMenuLeave}
            onClick={() => navigate("/categories")}
          >
            Categories <CaretDownOutlined style={{ fontSize: "12px", marginLeft: "4px" }} />
          </div>
          <div
            className="header-menu-item"
            onMouseEnter={() => handleHeaderMenuHover("Pornstars")}
            onMouseLeave={handleHeaderMenuLeave}
            onClick={() => navigate("/pornstars")}
          >
            Pornstars <CaretDownOutlined style={{ fontSize: "12px", marginLeft: "4px" }} />
          </div>
          <div
            className="header-menu-item"
            onMouseEnter={() => handleHeaderMenuHover("Recommended")}
            onMouseLeave={handleHeaderMenuLeave}
            onClick={() => navigate("/recommended")}
          >
            Recommended <CaretDownOutlined style={{ fontSize: "12px", marginLeft: "4px" }} />
          </div>
        </div>
      </div>

      {/* Header Dropdown Overlay */}
      {activeDropdown && (
        <>
          <div className="header-dropdown-overlay" onClick={() => setActiveDropdown(null)} />
          <div
            className="header-dropdown-content"
            onMouseEnter={() => setActiveDropdown(activeDropdown)}
            onMouseLeave={handleHeaderMenuLeave}
          >
            <div className="header-dropdown-grid">
              {activeDropdown === "Trending" &&
                Array.isArray(menuData[activeDropdown]) &&
                menuData[activeDropdown].slice(0, displayLimit.Trending).map((item, index) => (
                  <div
                    key={index}
                    className="header-dropdown-card"
                    onClick={() => {
                      if (item.id) {
                        // If it's a video, navigate to video page
                        navigate(`/video/${item.id}`)
                      } else {
                        // Otherwise filter by tag
                        navigate(`/?tag=${item.tag || item.name}`)
                      }
                      setActiveDropdown(null)

                      // Force a page refresh to ensure filters apply correctly
                      if (window.location.pathname === "/" && !item.id) {
                        window.location.reload()
                      }
                    }}
                  >
                    <img
                      src={
                        item.thumbnail || `/placeholder.svg?height=120&width=200&text=${encodeURIComponent(item.name)}`
                      }
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/home.jpg"
                      }}
                    />
                    <div className="header-dropdown-card-content">
                      <h4 className="header-dropdown-card-title">{item.name}</h4>
                    </div>
                  </div>
                ))}

              {activeDropdown === "Categories" &&
                Array.isArray(menuData[activeDropdown]) &&
                menuData[activeDropdown].slice(0, displayLimit.Categories).map((item, index) => (
                  <div
                    key={index}
                    className="header-dropdown-card"
                    onClick={() => {
                      navigate(`/categories/${encodeURIComponent(item)}`)
                      setActiveDropdown(null)
                    }}
                  >
                    <img
                      src={`/categories/${item.toLowerCase()}.jpg`}
                      alt={item}
                      onError={(e) => {
                        e.target.onerror = null
                        // Fallback to a default category image or home.jpg
                        e.target.src = "/home.jpg"
                      }}
                    />
                    <div className="header-dropdown-card-content">
                      <h4 className="header-dropdown-card-title">{item}</h4>
                    </div>
                  </div>
                ))}

              {activeDropdown !== "home" &&
                activeDropdown !== "Trending" &&
                activeDropdown !== "Categories" &&
                Array.isArray(menuData[activeDropdown]) &&
                menuData[activeDropdown].slice(0, displayLimit[activeDropdown]).map((item, index) => (
                  <div
                    key={index}
                    className="header-dropdown-card"
                    onClick={() => {
                      // Handle navigation based on dropdown type
                      if (activeDropdown === "Pornstars") {
                        navigate(`/pornstars/${encodeURIComponent(item?.name || item)}`)
                      } else if (activeDropdown === "Recommended") {
                        navigate(`/recommended`)
                      }
                      setActiveDropdown(null)
                    }}
                  >
                    <img
                      src={`/placeholder.svg?height=120&width=200&text=${encodeURIComponent(item?.name || item)}`}
                      alt={`${activeDropdown} ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/home.jpg"
                      }}
                    />
                    <div className="header-dropdown-card-content">
                      <h4 className="header-dropdown-card-title">{item?.name || item}</h4>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Desktop menu drawer - Fixed alignment */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", color: "white" }}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: "#FF1493", fontSize: "24px" }} />}
              onClick={() => setDesktopMenuOpen(false)}
              style={{
                padding: 0,
                marginRight: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "48px",
                width: "48px",
                border: "none",
                background: "transparent",
                boxShadow: "none",
              }}
            />
            <Link to="/" className="logo" aria-label="XFansTube Home" onClick={handleLogoClick}>
              <img src="/xfans_logo.svg" alt="XFansTube" style={{ height: "36px", width: "auto" }} />
            </Link>
          </div>
        }
        placement="left"
        onClose={() => setDesktopMenuOpen(false)}
        open={desktopMenuOpen}
        width={360}
        styles={{
          header: { backgroundColor: "black", color: "white", paddingLeft: "40px" }, // Align with navbar
          body: { backgroundColor: "black", padding: 0 },
          footer: { backgroundColor: "black" },
        }}
        closeIcon={false}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0", padding: "0" }}>
          {/* Footer Links Section */}
          <div style={{ padding: "40px" }}>
            <div style={{ marginBottom: "15px", color: "#FF1493", fontWeight: "bold", fontSize: "14px" }}>About</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Button
                icon={<CustomerServiceOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/support")
                  setDesktopMenuOpen(false)
                }}
              >
                Support Center
              </Button>
              <Button
                icon={<QuestionCircleOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/faq")
                  setDesktopMenuOpen(false)
                }}
              >
                FAQs
              </Button>
              <Button
                icon={<FileProtectOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/privacy-policy")
                  setDesktopMenuOpen(false)
                }}
              >
                Privacy Policy
              </Button>
              <Button
                icon={<FileTextOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/terms-of-service")
                  setDesktopMenuOpen(false)
                }}
              >
                Terms of Service
              </Button>
              <Button
                icon={<PhoneOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/support?page=contact-us")
                  setDesktopMenuOpen(false)
                }}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Mobile menu drawer - Fixed alignment */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", color: "white" }}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: "#FF1493", fontSize: "24px" }} />}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: 0,
                marginRight: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "40px",
                width: "40px",
                border: "none",
                background: "transparent",
                boxShadow: "none",
              }}
            />
            <Link to="/" className="logo" aria-label="XFansTube Home" onClick={handleLogoClick}>
              <img src="/xfans_logo.svg" alt="XFansTube" style={{ height: "24px", width: "auto" }} />
            </Link>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        styles={{
          header: { backgroundColor: "black", color: "white", paddingLeft: "20px" }, // Align with mobile navbar
          body: { backgroundColor: "black", padding: 0 },
          footer: { backgroundColor: "black" },
        }}
        closeIcon={false}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0", padding: "0" }}>
          {/* Footer Links Section */}
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "15px", color: "#FF1493", fontWeight: "bold", fontSize: "14px" }}>About</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Button
                icon={<CustomerServiceOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/support")
                  setMobileMenuOpen(false)
                }}
              >
                Support Center
              </Button>
              <Button
                icon={<QuestionCircleOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/faq")
                  setMobileMenuOpen(false)
                }}
              >
                FAQs
              </Button>
              <Button
                icon={<FileProtectOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/privacy-policy")
                  setMobileMenuOpen(false)
                }}
              >
                Privacy Policy
              </Button>
              <Button
                icon={<FileTextOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/terms-of-service")
                  setMobileMenuOpen(false)
                }}
              >
                Terms of Service
              </Button>
              <Button
                icon={<PhoneOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "4px 0" }}
                onClick={() => {
                  navigate("/support?page=contact-us")
                  setMobileMenuOpen(false)
                }}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Avatar menu drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", color: "white" }}>
            <UserOutlined style={{ marginRight: 8 }} />
            <span>{isAuthenticated ? user?.username || "User" : "Account"}</span>
          </div>
        }
        placement="right"
        onClose={() => setAvatarMenuOpen(false)}
        open={avatarMenuOpen}
        width={280}
        styles={{
          header: { backgroundColor: "black", color: "white" },
          body: { backgroundColor: "black", padding: 0 },
          footer: { backgroundColor: "black" },
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0", padding: "0" }}>
          {!isAuthenticated ? (
            <>
              <div style={{ padding: "20px", borderBottom: "1px solid #333" }}>
                <div style={{ marginBottom: "15px", color: "#FF1493", fontWeight: "bold", fontSize: "14px" }}>
                  Account
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <Button
                    icon={<LoginOutlined />}
                    block
                    type="primary"
                    style={{
                      backgroundColor: "#FF1493",
                      color: "white",
                      border: "none",
                    }}
                    onClick={() => {
                      setLoginVisible(true)
                      setAvatarMenuOpen(false)
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    icon={<UserAddOutlined />}
                    block
                    type="primary"
                    style={{
                      backgroundColor: "#FF1493",
                      color: "white",
                      border: "none",
                    }}
                    onClick={() => {
                      setRegisterVisible(true)
                      setAvatarMenuOpen(false)
                    }}
                  >
                    Register
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: "20px", borderBottom: "1px solid #333" }}>
              <div style={{ marginBottom: "15px", color: "#FF1493", fontWeight: "bold", fontSize: "14px" }}>
                Welcome, {user?.username}
              </div>
            </div>
          )}

          {/* Common options */}
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Button
                icon={<FolderOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "8px 0" }}
                onClick={() => handleProtectedAction(() => navigate("/collections"))}
              >
                My Collections
              </Button>
              <Button
                icon={<UploadOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "8px 0" }}
                onClick={() => handleProtectedAction(() => navigate("/upload-video"))}
              >
                Upload Videos
              </Button>
              <Button
                icon={<PhoneOutlined />}
                type="text"
                style={{ justifyContent: "flex-start", color: "white", padding: "8px 0" }}
                onClick={() => {
                  navigate("/support?page=contact-us")
                  setAvatarMenuOpen(false)
                }}
              >
                Contact Support
              </Button>

              {isAuthenticated && (
                <>
                  <div style={{ borderTop: "1px solid #333", margin: "15px 0 10px 0" }}></div>
                  <Button
                    icon={<UserOutlined />}
                    type="text"
                    style={{ justifyContent: "flex-start", color: "white", padding: "8px 0" }}
                    onClick={() => {
                      navigate("/profile")
                      setAvatarMenuOpen(false)
                    }}
                  >
                    Profile
                  </Button>
                  {isAdmin && (
                    <Button
                      icon={<DashboardOutlined />}
                      type="text"
                      style={{ justifyContent: "flex-start", color: "white", padding: "8px 0" }}
                      onClick={() => {
                        navigate("/admin")
                        setAvatarMenuOpen(false)
                      }}
                    >
                      Admin Dashboard
                    </Button>
                  )}
                  <Button
                    icon={<LogoutOutlined />}
                    type="text"
                    danger
                    style={{ justifyContent: "flex-start", padding: "8px 0" }}
                    onClick={() => {
                      logout()
                      setAvatarMenuOpen(false)
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Drawer>

      <Content
        style={{
          padding: 0,
          margin: "5px 60px 60px 60px",
          minHeight: "20vh",
          background: "transparent",
        }}
      >
        <Outlet />
      </Content>

      {/* Login Modal */}
      <Modal
        title="Login"
        open={loginVisible}
        onCancel={() => setLoginVisible(false)}
        footer={null}
        centered
        className="auth-modal custom-login-modal"
      >
        <LoginForm
          onLoginSuccess={(user) => {
            // console.log('MainLayout: Login success callback triggered with user:', user);
            setLoginVisible(false);
            message.success("Logged in successfully!");
            // console.log('MainLayout: Reloading page to refresh auth state');
            window.location.reload(); // Ensure the page refreshes with the new auth state
          }}
          onSwitchToRegister={() => {
            setLoginVisible(false)
            setRegisterVisible(true)
          }}
        />
      </Modal>

      {/* Register Modal */}
      <Modal
        title="Register"
        open={registerVisible}
        onCancel={() => setRegisterVisible(false)}
        footer={null}
        centered
        className="auth-modal custom-register-modal"
      >
        <RegisterForm
          onRegisterSuccess={() => {
            setRegisterVisible(false)
            message.success("Registered successfully!")
            window.location.reload() // Ensure the page refreshes with the new auth state
          }}
          onSwitchToLogin={() => {
            setRegisterVisible(false)
            setLoginVisible(true)
          }}
        />
      </Modal>

      <Footer
        style={{
          textAlign: "center",
          background: "#101827",
          padding: "24px 50px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Title level={5} style={{ color: "white", marginBottom: "16px" }}>
                Help & Support
              </Title>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <a
                  href="/support"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = "/support"
                  }}
                >
                  Support Center
                </a>
                <a
                  href="/support?page=contact-us"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = "/support?page=contact-us"
                  }}
                >
                  Contact Us
                </a>
                <a
                  href="/faq"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = "/faq"
                  }}
                >
                  FAQs
                </a>
                {isAuthenticated && (
                  <a
                    href="/feedback"
                    className="footer-link"
                    style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = "/feedback"
                    }}
                  >
                    Feedback
                  </a>
                )}
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Title level={5} style={{ color: "white", marginBottom: "16px" }}>
                Legal
              </Title>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <a
                  href="/terms-of-service"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = "/terms-of-service"
                  }}
                >
                  Terms of Service
                </a>
                <a
                  href="/privacy-policy"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = "/privacy-policy"
                  }}
                >
                  Privacy Policy
                </a>
                <a
                  href="/support?page=eu-dsa"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = "/support?page=eu-dsa"
                  }}
                >
                  EU DSA
                </a>
                <a
                  href="/support?page=2257-statement"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = "/support?page=2257-statement"
                  }}
                >
                  2257 Statement
                </a>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Title level={5} style={{ color: "white", marginBottom: "16px" }}>
                Content Policies
              </Title>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Link
                  to="/support?page=content-removal"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493" }}
                >
                  Content Removal/DMCA
                </Link>
                <Link
                  to="/support?page=content-protection"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493" }}
                >
                  Content Protection
                </Link>
                <Link
                  to="/support?page=csam-policy"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493" }}
                >
                  CSAM Policy
                </Link>
                <Link
                  to="/support?page=questionable-content"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493" }}
                >
                  Content Guidelines
                </Link>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Title level={5} style={{ color: "white", marginBottom: "16px" }}>
                Creators
              </Title>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Link
                  to="/support?page=partnership-program"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493" }}
                >
                  Partnership Program
                </Link>
                <a
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault()
                    handleProtectedAction(() => navigate("/upload-video"))
                  }}
                >
                  Upload Videos
                </a>
                <a
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault()
                    handleProtectedAction(() => navigate("/profile"))
                  }}
                >
                  Manage Profile
                </a>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: "20px 0", color: "rgba(255, 255, 255, 0.80)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <Text style={{ color: "rgba(255, 255, 255, 0.80)" }}>
                <img
                  src="/xfans_logo.svg"
                  alt="XFansTube"
                  style={{ height: "20px", width: "auto", marginRight: "8px", verticalAlign: "middle" }}
                />
                ©{new Date().getFullYear()} - All rights reserved
              </Text>
            </div>
            <a href="https://www.rtalabel.org/" target="_blank" rel="noopener noreferrer">
              <img src="/RTA_v1.svg" alt="RTA" style={{ height: "24px" }} />
            </a>
          </div>
        </div>
      </Footer>

      {/* Background Task Indicator */}
      <BackgroundTaskIndicator />
    </Layout>
  )
}

export default MainLayout

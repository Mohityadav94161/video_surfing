"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import {
  Layout,
  Menu,
  Input,
  Button,
  Dropdown,
  Space,
  Avatar,
  theme,
  Badge,
  Divider,
  Typography,
  Drawer,
  Modal,
  Form,
  message,
  Row,
  Col,
} from "antd"
import {
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  DashboardOutlined,
  VideoCameraOutlined,
  MenuOutlined,
  FolderOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { useAuth } from "../../contexts/AuthContext"
import "./MainLayout.css"
import "../../components/ModalStyles.css"

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

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchVisible(false)
  }, [location.pathname])

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`)
      setSearchVisible(false)
    }
  }

  const handleRecommendationClick = (recommendation) => {
    setSearchTerm(recommendation)
    handleSearch(recommendation)
  }

  const userMenuItems = [
    {
      key: "profile",
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "divider",
      type: "divider",
    },
    {
      key: "logout",
      label: <span onClick={logout}>Logout</span>,
      icon: <LogoutOutlined />,
      danger: true,
    },
  ]

  // Add admin dashboard link if user is admin
  if (isAdmin) {
    userMenuItems.unshift({
      key: "admin",
      label: <Link to="/admin">Admin Dashboard</Link>,
      icon: <DashboardOutlined />,
    })
  }

  // Avatar menu items
  const avatarMenuItems = !isAuthenticated
    ? [
        {
          key: "login",
          label: "Login",
          icon: <LoginOutlined />,
          onClick: () => setLoginVisible(true),
        },
        {
          key: "register",
          label: "Register",
          icon: <UserAddOutlined />,
          onClick: () => setRegisterVisible(true),
        },
        {
          key: "divider1",
          type: "divider",
        },
        {
          key: "collections",
          label: "My Collections",
          icon: <FolderOutlined />,
          onClick: () => navigate("/collections"),
        },
        {
          key: "upload",
          label: "Upload Videos",
          icon: <UploadOutlined />,
          onClick: () => navigate("/upload-video"),
        },
        {
          key: "support",
          label: "Contact Support",
          onClick: () => navigate("/support?page=contact-us"),
        },
      ]
    : [
        {
          key: "collections",
          label: "My Collections",
          icon: <FolderOutlined />,
          onClick: () => navigate("/collections"),
        },
        {
          key: "upload",
          label: "Upload Videos",
          icon: <UploadOutlined />,
          onClick: () => navigate("/upload-video"),
        },
        {
          key: "support",
          label: "Contact Support",
          onClick: () => navigate("/support?page=contact-us"),
        },
        {
          key: "divider1",
          type: "divider",
        },
        {
          key: "profile",
          label: "Profile",
          icon: <UserOutlined />,
          onClick: () => navigate("/profile"),
        },
        ...(isAdmin
          ? [
              {
                key: "admin",
                label: "Admin Dashboard",
                icon: <DashboardOutlined />,
                onClick: () => navigate("/admin"),
              },
            ]
          : []),
        {
          key: "logout",
          label: "Logout",
          icon: <LogoutOutlined />,
          onClick: logout,
          danger: true,
        },
      ]

  const handleProtectedAction = (action) => {
    if (!isAuthenticated) {
      setLoginVisible(true)
      setAvatarMenuOpen(false)
    } else {
      action()
      setAvatarMenuOpen(false)
    }
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
          padding: "0 20px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
          transition: "all 0.3s ease",
          background: "#101827",
          paddingLeft: "5%",
        }}
      >
        {/* Desktop navigation */}
        <div className="desktop-nav">
          <div className="logo-container">
            <Link to="/" className="logo" aria-label="Video Surfing Home">
              <VideoCameraOutlined className="logo-icon" />
              <span className="logo-text">Video Surfing</span>
            </Link>
          </div>

          <Search
            placeholder="Search videos..."
            allowClear
            onSearch={handleSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="desktop-search"
          />

          <Menu
            theme="dark"
            mode="vertical"
            selectedKeys={[location.pathname === "/" ? "home" : location.pathname.split("/")[1]]}
            className="desktop-menu"
          >
            {isAuthenticated && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Button
                  icon={<FolderOutlined />}
                  onClick={() => navigate("/collections")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1f1f1f",
                    color: "white",
                    border: "1px solid #FF1493",
                  }}
                >
                  My Collections
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => navigate("/upload-video")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1f1f1f",
                    color: "white",
                    border: "1px solid #FF1493",
                  }}
                >
                  Upload
                </Button>
              </div>
            )}

            {!isAuthenticated ? (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Button
                  type="primary"
                  onClick={() => setLoginVisible(true)}
                  style={{
                    backgroundColor: "#FF1493",
                    color: "white",
                    border: "none",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  className="login-btn"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)"
                    e.currentTarget.style.boxShadow = "0 4px 10px rgba(255, 20, 147, 0.3)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  Login
                </Button>
                <Button
                  type="primary"
                  onClick={() => setRegisterVisible(true)}
                  style={{
                    backgroundColor: "#FF1493",
                    color: "white",
                    border: "none",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  className="register-btn"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)"
                    e.currentTarget.style.boxShadow = "0 4px 10px rgba(255, 20, 147, 0.3)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  Register
                </Button>
              </div>
            ) : (
              <Menu.Item key="user">
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Space>
                    <Badge dot={isAdmin} color="green">
                      <Avatar className="user-avatar" icon={<UserOutlined />} />
                    </Badge>
                    <span className="username">{user?.username || "User"}</span>
                  </Space>
                </Dropdown>
              </Menu.Item>
            )}
          </Menu>
        </div>

        {/* Mobile navigation */}
        <div className="mobile-nav">
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: "#FF1493", fontSize: "20px" }} />}
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-button"
          />

          <div className="mobile-logo-container">
            <Link to="/" className="logo" aria-label="Video Surfing Home" onClick={() => navigate("/")}>
              <VideoCameraOutlined className="logo-icon" />
            </Link>
          </div>

          <Button
            type="text"
            icon={<SearchOutlined style={{ color: "#FF1493", fontSize: "20px" }} />}
            onClick={() => setSearchVisible(!searchVisible)}
            className="mobile-search-button"
          />

          <Button type="text" onClick={() => setAvatarMenuOpen(true)} className="mobile-avatar-button">
            <Avatar className="mobile-avatar" icon={<UserOutlined />} />
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
                onSearch={(value) => {
                  handleSearch(value)
                }}
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

      {/* Mobile menu drawer - Footer links only */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", color: "white" }}>
            <MenuOutlined style={{ marginRight: 8 }} />
            <span>Menu</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        styles={{
          header: { backgroundColor: "black", color: "white" },
          body: { backgroundColor: "black", padding: 0 },
          footer: { backgroundColor: "black" },
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0", padding: "0" }}>
          {/* Footer Links Section */}
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "15px", color: "#FF1493", fontWeight: "bold", fontSize: "14px" }}>About</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Button
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
          margin: 0,
          minHeight: "100vh",
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
        <Form
          onFinish={async (values) => {
            try {
              const { username, password } = values
              const result = await login(username, password)
              if (result.success) {
                setLoginVisible(false)
                message.success("Logged in successfully!")
              }
            } catch (error) {
              console.error("Login error:", error)
              message.error("Login failed. Please try again.")
            }
          }}
        >
          <Form.Item name="username" rules={[{ required: true, message: "Please input your username!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "#FF1493",
                color: "white",
                border: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              block
              loading={loading}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)"
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(255, 20, 147, 0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              Login
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <Button
              type="link"
              onClick={() => {
                setLoginVisible(false)
                setRegisterVisible(true)
              }}
            >
              Don't have an account? Register now
            </Button>
          </div>
        </Form>
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
        <Form
          onFinish={async (values) => {
            try {
              const { username, password } = values
              const result = await register(username, password)
              if (result.success) {
                setRegisterVisible(false)
                message.success("Registered successfully!")
              }
            } catch (error) {
              console.error("Registration error:", error)
              message.error("Registration failed. Please try again.")
            }
          }}
        >
          <Form.Item name="username" rules={[{ required: true, message: "Please input your username!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("The two passwords do not match!"))
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "#FF1493",
                color: "white",
                border: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              block
              loading={loading}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)"
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(255, 20, 147, 0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              Register
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <Button
              type="link"
              onClick={() => {
                setRegisterVisible(false)
                setLoginVisible(true)
              }}
            >
              Already have an account? Login
            </Button>
          </div>
        </Form>
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
                <Link to="/support" className="footer-link" style={{ margin: "5px 0", color: "#FF1493" }}>
                  Support Center
                </Link>
                <Link
                  to="/support?page=contact-us"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493" }}
                >
                  Contact Us
                </Link>
                <Link to="/faq" className="footer-link" style={{ margin: "5px 0", color: "#FF1493" }}>
                  FAQs
                </Link>
                {isAuthenticated && (
                  <Link to="/feedback" className="footer-link" style={{ margin: "5px 0", color: "#FF1493" }}>
                    Feedback
                  </Link>
                )}
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Title level={5} style={{ color: "white", marginBottom: "16px" }}>
                Legal
              </Title>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Link to="/terms-of-service" className="footer-link" style={{ margin: "5px 0", color: "#FF1493" }}>
                  Terms of Service
                </Link>
                <Link to="/privacy-policy" className="footer-link" style={{ margin: "5px 0", color: "#FF1493" }}>
                  Privacy Policy
                </Link>
                <Link to="/support?page=eu-dsa" className="footer-link" style={{ margin: "5px 0", color: "#FF1493" }}>
                  EU DSA
                </Link>
                <Link
                  to="/support?page=2257-statement"
                  className="footer-link"
                  style={{ margin: "5px 0", color: "#FF1493" }}
                >
                  2257 Statement
                </Link>
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
                <Link to="/upload-video" className="footer-link" style={{ margin: "5px 0", color: "#FF1493" }}>
                  Upload Videos
                </Link>
                <Link to="/profile" className="footer-link" style={{ margin: "5px 0", color: "#FF1493" }}>
                  Manage Profile
                </Link>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: "20px 0", color: "rgba(255, 255, 255, 0.80)" }} />
          <div>
            <Text style={{ color: "rgba(255, 255, 255, 0.80)" }}>
              Video Surfing ©{new Date().getFullYear()} - Your curated video directory
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  )
}

export default MainLayout

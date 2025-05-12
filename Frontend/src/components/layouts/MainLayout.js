import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Input, Button, Dropdown, Space, Avatar, theme, Badge, Divider, Typography, Drawer } from 'antd';
import { 
  HomeOutlined, 
  SearchOutlined, 
  UserOutlined, 
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  DashboardOutlined,
  PlayCircleOutlined,
  VideoCameraOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './MainLayout.css';

const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG, colorPrimary },
  } = theme.useToken();

  // Track scroll position for header effects
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchVisible(false);
  }, [location.pathname]);

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      setSearchVisible(false);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />
    },
    {
      key: 'divider',
      type: 'divider'
    },
    {
      key: 'logout',
      label: <span onClick={logout}>Logout</span>,
      icon: <LogoutOutlined />,
      danger: true
    }
  ];

  // Add admin dashboard link if user is admin
  if (isAdmin) {
    userMenuItems.unshift({
      key: 'admin',
      label: <Link to="/admin">Admin Dashboard</Link>,
      icon: <DashboardOutlined />
    });
  }

  // Mobile menu items
  const mobileMenuItems = [
    {
      key: 'home',
      label: 'Home',
      icon: <HomeOutlined />,
      onClick: () => navigate('/')
    },
    {
      key: 'explore',
      label: 'Explore',
      icon: <PlayCircleOutlined />,
      onClick: () => navigate('/search')
    },
  ];

  if (!isAuthenticated) {
    mobileMenuItems.push(
      {
        key: 'login',
        label: 'Login',
        icon: <LoginOutlined />,
        onClick: () => navigate('/login')
      },
      {
        key: 'register',
        label: 'Register',
        icon: <UserAddOutlined />,
        onClick: () => navigate('/register')
      }
    );
  } else {
    if (isAdmin) {
      mobileMenuItems.push({
        key: 'admin',
        label: 'Admin Dashboard',
        icon: <DashboardOutlined />,
        onClick: () => navigate('/admin')
      });
    }
    mobileMenuItems.push(
      {
        key: 'profile',
        label: 'Profile',
        icon: <UserOutlined />,
        onClick: () => navigate('/profile')
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: logout
      }
    );
  }

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header
        className={`main-header ${scrolled ? 'scrolled' : ''}`}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%',
          padding: '0 20px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, #001529, #003a70)'
        }}
      >
        <div className="logo-container">
          <Link to="/" className="logo" aria-label="Video Surfing Home">
            <VideoCameraOutlined className="logo-icon" />
            <span className="logo-text">Video Surfing</span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <div className="desktop-nav">
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
            mode="horizontal"
            selectedKeys={[location.pathname === '/' ? 'home' : location.pathname.split('/')[1]]}
            className="desktop-menu"
          >
            <Menu.Item key="home" icon={<HomeOutlined />}>
              <Link to="/">Home</Link>
            </Menu.Item>
            
            <Menu.Item key="search" icon={<PlayCircleOutlined />}>
              <Link to="/search">Explore</Link>
            </Menu.Item>
            
            {!isAuthenticated ? (
              <>
                <Menu.Item key="login" icon={<LoginOutlined />}>
                  <Link to="/login">Login</Link>
                </Menu.Item>
                <Menu.Item key="register" icon={<UserAddOutlined />}>
                  <Link to="/register">Register</Link>
                </Menu.Item>
              </>
            ) : (
              <Menu.Item key="user">
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Space>
                    <Badge dot={isAdmin} color="green">
                      <Avatar 
                        className="user-avatar"
                        icon={<UserOutlined />}
                      />
                    </Badge>
                    <span className="username">{user?.username || 'User'}</span>
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
            icon={<SearchOutlined style={{ color: 'white', fontSize: '20px' }} />} 
            onClick={() => setSearchVisible(!searchVisible)}
            className="mobile-search-button"
          />
          
          <Button 
            type="text" 
            icon={<MenuOutlined style={{ color: 'white', fontSize: '20px' }} />} 
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-button"
          />
          
          {isAuthenticated && (
            <Avatar 
              className="mobile-avatar"
              icon={<UserOutlined />}
              onClick={() => setMobileMenuOpen(true)}
            />
          )}
        </div>
        
        {/* Mobile search overlay */}
        <div className={`mobile-search-overlay ${searchVisible ? 'visible' : ''}`}>
          <Search
            placeholder="Search videos..."
            allowClear
            enterButton
            onSearch={(value) => {
              handleSearch(value);
              setSearchVisible(false);
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mobile-search-input"
          />
          <Button 
            type="text" 
            className="mobile-search-close"
            onClick={() => setSearchVisible(false)}
          >
            Cancel
          </Button>
        </div>
      </Header>
      
      {/* Mobile menu drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <VideoCameraOutlined style={{ marginRight: 8 }} />
            <span>Video Surfing</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={250}
      >
        <Menu mode="vertical" style={{ border: 'none' }}>
          {mobileMenuItems.map(item => (
            <Menu.Item 
              key={item.key} 
              icon={item.icon} 
              onClick={item.onClick}
              style={{ margin: '8px 0' }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>
      
      <Content style={{ padding: '16px', marginTop: 0 }}>
        <div
          className="content-container"
          style={{
            padding: 24,
            minHeight: 380,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          <Outlet />
        </div>
      </Content>
      
      <Footer style={{ 
        textAlign: 'center',
        background: '#f5f5f5',
        padding: '24px 50px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Link to="/" className="footer-link" style={{ margin: '0 15px', color: 'rgba(0, 0, 0, 0.65)' }}>Home</Link>
            <Link to="/search" className="footer-link" style={{ margin: '0 15px', color: 'rgba(0, 0, 0, 0.65)' }}>Explore</Link>
            <Link to="/login" className="footer-link" style={{ margin: '0 15px', color: 'rgba(0, 0, 0, 0.65)' }}>Login</Link>
          </div>
          <Divider style={{ margin: '10px 0' }} />
          <div>
            <Text style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              Video Surfing ©{new Date().getFullYear()} - Your curated video directory
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout; 
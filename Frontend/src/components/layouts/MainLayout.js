import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Input, Button, Dropdown, Space, Avatar, theme, Badge, Divider, Typography, Drawer, Modal, Form, message } from 'antd';
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
  MenuOutlined,
  FolderOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './MainLayout.css';

const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user, logout, login, register, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  
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
  const mobileMenuItems = [];

  if (!isAuthenticated) {
    mobileMenuItems.push(
      {
        key: 'login',
        label: 'Login',
        icon: <LoginOutlined />,
        onClick: () => {
          setMobileMenuOpen(false);
          setLoginVisible(true);
        }
      },
      {
        key: 'register',
        label: 'Register',
        icon: <UserAddOutlined />,
        onClick: () => {
          setMobileMenuOpen(false);
          setRegisterVisible(true);
        }
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
        key: 'upload-video',
        label: 'Upload Video',
        icon: <UploadOutlined />,
        onClick: () => navigate('/upload-video')
      },
      {
        key: 'collections',
        label: 'My Collections',
        icon: <FolderOutlined />,
        onClick: () => navigate('/collections')
      },
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
          background: '#000000'
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

            {isAuthenticated && (
              <Menu.Item key="collections" icon={<FolderOutlined />}>
                <Link to="/collections">My Collections</Link>
              </Menu.Item>
            )}
            
            {isAuthenticated && (
              <Menu.Item key="upload-video" icon={<UploadOutlined />}>
                <Link to="/upload-video">Upload Video</Link>
              </Menu.Item>
            )}
            
            {!isAuthenticated ? (
              <>
                <Menu.Item key="login" icon={<LoginOutlined />}>
                  <Button type="link" onClick={() => setLoginVisible(true)}>Login</Button>
                </Menu.Item>
                <Menu.Item key="register" icon={<UserAddOutlined />}>
                  <Button type="link" onClick={() => setRegisterVisible(true)}>Register</Button>
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
            icon={<SearchOutlined style={{ color: '#FF1493', fontSize: '20px' }} />} 
            onClick={() => setSearchVisible(!searchVisible)}
            className="mobile-search-button"
          />
          
          <Button 
            type="text" 
            icon={<MenuOutlined style={{ color: '#FF1493', fontSize: '20px' }} />} 
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
          <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
            <VideoCameraOutlined style={{ marginRight: 8 }} />
            <span>Video Surfing</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={250}
        styles={{
          header: { backgroundColor: 'black', color: 'white' },
          body: { backgroundColor: 'black', padding: 0 },
          footer: { backgroundColor: 'black' }
        }}
      >
        <Menu 
          mode="vertical" 
          style={{ 
            border: 'none', 
            backgroundColor: 'black', 
            color: 'white' 
          }}
          theme="dark"
        >
          {mobileMenuItems.map(item => (
            <Menu.Item 
              key={item.key} 
              icon={item.icon} 
              onClick={item.onClick}
              style={{ margin: '8px 0', color: 'white' }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>
      
      {/* <Content style={{ padding: '16px', marginTop: 0 }}>
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
      </Content> */}
      
      <Content style={{ 
        padding: 0,
        margin: 0,
        minHeight: '100vh',
        background: 'transparent' 
      }}>
        <Outlet />
      </Content>
      
      {/* Login Modal */}
      <Modal
        title="Login"
        open={loginVisible}
        onCancel={() => setLoginVisible(false)}
        footer={null}
        centered
      >
        <Form onFinish={async (values) => {
          try {
            const { email, password } = values;
            const result = await login(email, password);
            if (result.success) {
              setLoginVisible(false);
              message.success('Logged in successfully!');
            }
          } catch (error) {
            console.error('Login error:', error);
            message.error('Login failed. Please try again.');
          }
        }}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ backgroundColor: '#FF1493' }} 
              block
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => {
              setLoginVisible(false);
              setRegisterVisible(true);
            }}>
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
      >
        <Form onFinish={async (values) => {
          try {
            const { username, email, password } = values;
            const result = await register(username, email, password);
            if (result.success) {
              setRegisterVisible(false);
              message.success('Registered successfully!');
            }
          } catch (error) {
            console.error('Registration error:', error);
            message.error('Registration failed. Please try again.');
          }
        }}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
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
              style={{ backgroundColor: '#FF1493' }} 
              block
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => {
              setRegisterVisible(false);
              setLoginVisible(true);
            }}>
              Already have an account? Login
            </Button>
          </div>
        </Form>
      </Modal>
      
      <Footer style={{ 
        textAlign: 'center',
        background: '#292929',
        padding: '24px 50px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Link to="/support" className="footer-link" style={{ margin: '0 15px', color: '#FF1493' }}>Support</Link>
            <Link to="/terms-of-service" className="footer-link" style={{ margin: '0 15px', color: '#FF1493' }}>Terms of Service</Link>
            <Link to="/privacy-policy" className="footer-link" style={{ margin: '0 15px', color: '#FF1493' }}>Privacy Policy</Link>
            <Link to="/faq" className="footer-link" style={{ margin: '0 15px', color: '#FF1493' }}>FAQs</Link>
          </div>
          <Divider style={{ margin: '10px 0', color: 'rgba(255, 255, 255, 0.80)'}} />
          <div>
            <Text style={{ color: 'rgba(255, 255, 255, 0.80)' }}>
              Video Surfing ©{new Date().getFullYear()} - Your curated video directory
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout; 
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme, Typography, Avatar, Dropdown, Space, Spin, message } from 'antd';
import {
  DashboardOutlined,
  VideoCameraAddOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloudUploadOutlined,
  LayoutOutlined,
  BarChartOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading, initializing, isAdmin, loadUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [verifyingAuth, setVerifyingAuth] = useState(true);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const currentPath = location.pathname;

  // Verify admin authentication only once on component mount
  useEffect(() => {
    const verifyAdminAuth = async () => {
      // console.log('Verifying admin authentication...');
      setVerifyingAuth(true);
      
      // Check if user is already loaded and is admin
      if (user && user.role === 'admin') {
        // console.log('User already authenticated as admin');
        setVerifyingAuth(false);
        return;
      }
      
      try {
        // Try to load the user only if we need to
        const result = await loadUser(true);
        // console.log('Load user result:', result);
        
        if (!result.success) {
          // console.log('Authentication failed:', result.reason);
          message.error('Authentication failed. Please login again.');
          navigate('/');
          return;
        }
        
        if (!result.user || result.user.role !== 'admin') {
          // console.log('Not an admin user:', result.user);
          message.error('You do not have admin privileges.');
          navigate('/');
          return;
        }
        
        // console.log('Admin authentication successful');
      } catch (err) {
        console.error('Verification error:', err);
        message.error('Authentication error. Please login again.');
        navigate('/');
      } finally {
        setVerifyingAuth(false);
      }
    };
    
    verifyAdminAuth();
    // Only run this effect once on mount
  }, []);

  const userMenuItems = [
    {
      key: 'home',
      label: <Link to="/">Go to Home</Link>,
      icon: <HomeOutlined />
    },
    {
      key: 'profile',
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />
    },
    {
      key: 'logout',
      label: <span onClick={logout}>Logout</span>,
      icon: <LogoutOutlined />
    }
  ];

  // Show a loading indicator while checking authentication
  if (initializing || verifyingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading admin panel..." />
      </div>
    );
  }

  // If not admin after verification, we shouldn't get here due to the redirect,
  // but this is an extra safety check
  if (!isAdmin) {
    // console.log('User is not admin, redirecting');
    navigate('/');
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          padding: '16px', 
          color: 'white', 
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {!collapsed && (
            <Typography.Title 
              level={4} 
              style={{ color: 'white', margin: '8px 0' }}
            >
              Admin Dashboard
            </Typography.Title>
          )}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[currentPath === '/admin' ? 'dashboard' : 'add-video']}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/admin">Dashboard</Link>,
            },
            {
              key: 'add-video',
              icon: <VideoCameraAddOutlined />,
              label: <Link to="/admin/add-video">Add Video</Link>,
            },
            {
              key: 'bulk-upload',
              icon: <CloudUploadOutlined />,
              label: <Link to="/admin/bulk-upload">Bulk Upload</Link>,
            },
            // {
            //   key: 'analytics',
            //   icon: <BarChartOutlined />,
            //   label: <Link to="/admin/analytics">Analytics & Tracking</Link>,
            // },
            {
              key: 'support-submissions',
              icon: <MessageOutlined />,
              label: <Link to="/admin/support-submissions">Support Submissions</Link>,
            },
            // {
            //   key: 'test',
            //   icon: <UserOutlined />,
            //   label: <Link to="/admin/test">Test Component</Link>,
            // }
          ]}
        />
      </Sider>
      
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ marginLeft: 16 }}>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, 
              {
                className: 'trigger',
                onClick: () => setCollapsed(!collapsed),
                style: { fontSize: '18px' }
              }
            )}
          </div>
          
          <div style={{ marginRight: 20 }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space>
                <Avatar icon={<UserOutlined />} />
                {user?.username || 'Admin'}
              </Space>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 
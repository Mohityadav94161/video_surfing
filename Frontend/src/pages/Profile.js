import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Tabs, 
  Button, 
  Form, 
  Input, 
  message, 
  Divider, 
  Row, 
  Col,
  Spin,
  Empty
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  HeartOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favoriteVideos, setFavoriteVideos] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Set form values when user data is available
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
      });
    }
  }, [user, form]);

  // Fetch favorite videos
  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoriteVideos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      message.error('Failed to load favorite videos');
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Fetch watch history
  const fetchWatchHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching watch history:', error);
      message.error('Failed to load watch history');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load data when tab changes
  const handleTabChange = (activeKey) => {
    if (activeKey === '2' && favoriteVideos.length === 0) {
      fetchFavorites();
    } else if (activeKey === '3' && watchHistory.length === 0) {
      fetchWatchHistory();
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch('/api/users/updateMe', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch('/api/users/updatePassword', {
        currentPassword: values.currentPassword,
        password: values.newPassword,
        passwordConfirm: values.confirmPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Password updated successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error updating password:', error);
      message.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/users/deleteMe', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      message.error('Failed to delete account');
    }
  };

  if (authLoading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <Row gutter={[24, 24]} className="profile-row">
        <Col xs={24} md={8} lg={6}>
          <Card className="profile-card user-info-card">
            <div className="profile-header">
              <Avatar 
                size={100} 
                icon={<UserOutlined />} 
                className="profile-avatar"
              />
              <div className="profile-name">
                <Title level={3}>{user.username}</Title>
                <Text type="secondary">Member since {new Date(user.createdAt).toLocaleDateString()}</Text>
              </div>
            </div>
            
            <Divider />
            
            <div className="profile-stats">
              <div className="stat-item">
                <Text strong>Favorites</Text>
                <Text>{favoriteVideos.length}</Text>
              </div>
              <div className="stat-item">
                <Text strong>Watched</Text>
                <Text>{watchHistory.length}</Text>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={16} lg={18}>
          <Card className="profile-card">
            <Tabs defaultActiveKey="1" onChange={handleTabChange}>
              <TabPane 
                tab={<span><SettingOutlined /> Account Settings</span>} 
                key="1"
              >
                <div className="profile-section">
                  <div className="section-header">
                    <Title level={4}>Profile Information</Title>
                    {!editMode ? (
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => setEditMode(true)}
                        className="edit-button"
                      >
                        Edit
                      </Button>
                    ) : (
                      <Button 
                        type="text" 
                        icon={<CloseOutlined />} 
                        onClick={() => setEditMode(false)}
                        className="cancel-button"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                  
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleProfileUpdate}
                    disabled={!editMode}
                    className="profile-form"
                  >
                    <Form.Item
                      name="username"
                      label="Username"
                      rules={[{ required: true, message: 'Please enter your username' }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                    
                    {editMode && (
                      <Form.Item>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          icon={<SaveOutlined />} 
                          loading={loading}
                          className="save-button"
                        >
                          Save Changes
                        </Button>
                      </Form.Item>
                    )}
                  </Form>
                </div>
                
                <Divider />
                
                <div className="profile-section">
                  <Title level={4}>Change Password</Title>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                    className="profile-form"
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[{ required: true, message: 'Please enter your current password' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    
                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        { required: true, message: 'Please enter your new password' },
                        { min: 8, message: 'Password must be at least 8 characters' }
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    
                    <Form.Item
                      name="confirmPassword"
                      label="Confirm New Password"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        className="password-button"
                      >
                        Update Password
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
                
                <Divider />
                
                <div className="profile-section danger-zone">
                  <Title level={4}>Danger Zone</Title>
                  <p>Once you delete your account, there is no going back. Please be certain.</p>
                  <Button 
                    danger 
                    onClick={handleDeleteAccount}
                    className="delete-button"
                  >
                    Delete Account
                  </Button>
                </div>
              </TabPane>
              
              <TabPane 
                tab={<span><HeartOutlined /> Favorites</span>} 
                key="2"
              >
                {loadingFavorites ? (
                  <div className="tab-loading">
                    <Spin />
                    <p>Loading favorites...</p>
                  </div>
                ) : favoriteVideos.length > 0 ? (
                  <div className="video-grid">
                    {favoriteVideos.map(video => (
                      <div 
                        key={video._id} 
                        className="video-card"
                        onClick={() => navigate(`/video/${video._id}`)}
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
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty 
                    description="No favorite videos yet" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="empty-state"
                  />
                )}
              </TabPane>
              
              <TabPane 
                tab={<span><HistoryOutlined /> Watch History</span>} 
                key="3"
              >
                {loadingHistory ? (
                  <div className="tab-loading">
                    <Spin />
                    <p>Loading watch history...</p>
                  </div>
                ) : watchHistory.length > 0 ? (
                  <div className="video-grid">
                    {watchHistory.map(video => (
                      <div 
                        key={video._id} 
                        className="video-card"
                        onClick={() => navigate(`/video/${video._id}`)}
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
                          <div className="video-watched-date">
                            Watched on {new Date(video.watchedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty 
                    description="No watch history yet" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="empty-state"
                  />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
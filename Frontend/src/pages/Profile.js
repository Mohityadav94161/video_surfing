import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Button,
  Form,
  Input,
  message,
  Divider,
  Row,
  Col,
  Spin,
  Modal,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EditOutlined,
  FolderAddOutlined,
  CloseOutlined,
  CheckCircleTwoTone,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const { Title, Text } = Typography;

const avatarOptions = [
  '/avatars/banana.png',
  '/avatars/avacado.png',
  '/avatars/berries.png',
  '/avatars/coconut.png',
  '/avatars/cucumber.png',
  '/avatars/melon.png',
  '/avatars/mango.png',
  '/avatars/watermelon.jpg',
  '/avatars/pineapple.jpg',
];

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading, logout, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '/avatars/avatar1.png');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
      });
      setSelectedAvatar(user.avatar || '/avatars/avatar1.png');
    }
  }, [user, form]);

  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        '/users/updateMe',
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update user context with new data
      updateUser(response.data.data.user);
      message.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.success('Profile updated successfully');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(
        '/users/updatePassword',
        {
          currentPassword: values.currentPassword,
          password: values.newPassword,
          passwordConfirm: values.confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success('Password updated successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error updating password:', error);
      message.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/users/deleteMe', {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      message.error('Failed to delete account');
    }
  };

  const handleAvatarClick = () => {
    setAvatarModalVisible(true);
  };

  const handleAvatarSelect = async (avatar) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Save avatar immediately to database
      const response = await axios.patch(
        '/users/updateAvatar',
        { avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state and context
      setSelectedAvatar(avatar);
      updateUser({ avatar });
      setAvatarModalVisible(false);
      message.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      message.error('Failed to update avatar');
    } finally {
      setLoading(false);
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

  if (!user) return null;

  return (
    <div className="profile-container">
      <Row gutter={[24, 24]} className="profile-row">
        <Col xs={24} md={8} lg={6}>
          <Card className="profile-card user-info-card">
            <div className="profile-header">
            <div className="avatar-container" onClick={handleAvatarClick}>
  <Avatar
    size={100}
    src={selectedAvatar || '/avatars/banana.png'}
    icon={!selectedAvatar && <UserOutlined />}
    className="profile-avatar"
  />
  <EditOutlined className="avatar-edit-icon" style={{color:'#1890ff'}} />
</div>

              <div className="profile-name">
                <Title level={3}>{user.username}</Title>
                <Text type="secondary">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </div>
            </div>
            <Divider />
          </Card>
        </Col>

        <Col xs={24} md={16} lg={18}>
          <Card className="profile-card">
            {/* Profile Info Section */}
            <div className="profile-section">
              <div className="section-header">
                <Title level={4}>Profile Information</Title>
                {!editMode ? (
                  <Button type="primary" icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                    Edit
                  </Button>
                ) : (
                  <Button type="text" icon={<CloseOutlined />} onClick={() => setEditMode(false)}>
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
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>

                {editMode && (
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<FolderAddOutlined />}
                      loading={loading}
                    >
                      Save Changes
                    </Button>
                  </Form.Item>
                )}
              </Form>
            </div>

            <Divider />

            {/* Password Section */}
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
                    { min: 8, message: 'Password must be at least 8 characters' },
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
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Update Password
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <Divider />

            {/* Danger Zone */}
            <div className="profile-section danger-zone">
              <Title level={4}>Danger Zone</Title>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
              <Button danger onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Avatar Modal */}
      <Modal
        title="Choose Your Avatar"
        open={avatarModalVisible}
        onCancel={() => setAvatarModalVisible(false)}
        footer={null}
      >
        <div className="avatar-selection">
          <Row gutter={[16, 64]}>
            {avatarOptions.map((avatar) => (
              <Col span={8} key={avatar}>
                <div
                  className={`avatar-option ${
                    selectedAvatar === avatar ? 'selected' : ''
                  }`}
                  onClick={() => handleAvatarSelect(avatar)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <Avatar src={avatar} size={64} />
                  {selectedAvatar === avatar}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;

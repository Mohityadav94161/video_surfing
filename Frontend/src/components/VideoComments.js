import React, { useState, useEffect } from 'react';
import { 
  List, 
  Avatar, 
  Input, 
  Button, 
  Form, 
  Divider, 
  message,
  Typography,
  Empty,
  Spin,
  Tooltip,
  Popconfirm,
  Card,
  Space
} from 'antd';
import { 
  UserOutlined,
  DeleteOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';
import './VideoComments.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const VideoComments = ({ videoId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Fetch comments on load and when videoId changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!videoId) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/videos/${videoId}/comments`);
        setComments(response.data.data.comments || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        message.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [videoId]);

  const handleSubmit = async (values) => {
    if (!values.comment.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/videos/${videoId}/comments`, {
        text: values.comment
      });
      
      // Add new comment to the list
      setComments([response.data.data.comment, ...comments]);
      
      // Clear form
      form.resetFields();
      message.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/videos/comments/${commentId}`);
      
      // Remove deleted comment from list
      setComments(comments.filter(comment => comment._id !== commentId));
      message.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      message.error('Failed to delete comment');
    }
  };

  // Check if user can delete a comment (admin or comment owner)
  const canDeleteComment = (comment) => {
    if (!isAuthenticated || !user) return false;
    return user.role === 'admin' || user._id === comment.user._id;
  };

  return (
    <div className="comments-section">
      <Title level={4} className="comments-title">
        <Space>
          <CommentOutlined />
          Comments
          {comments.length > 0 && ` (${comments.length})`}
        </Space>
      </Title>
      <Divider />
      
      {isAuthenticated ? (
        <div className="comment-form" style={{ marginBottom: 24 }}>
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item 
              name="comment" 
              rules={[{ required: true, message: 'Please write something!' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="Add your comment..." 
              />
            </Form.Item>
            <Form.Item>
              <Button 
                htmlType="submit" 
                type="primary" 
                loading={submitting}
                icon={<CommentOutlined />}
                className="comment-button"
              >
                Add Comment
              </Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <div className="login-prompt" style={{ marginBottom: 24 }}>
          <Text type="secondary">Please log in to leave a comment</Text>
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin />
        </div>
      ) : comments.length === 0 ? (
        <div className="empty-comments">
          <Empty description="No comments yet" />
        </div>
      ) : (
        <List
          className="comment-list fade-in"
          dataSource={comments}
          itemLayout="horizontal"
          renderItem={comment => (
            <List.Item
              className="fade-in"
              actions={
                canDeleteComment(comment) ? [
                  <Popconfirm
                    title="Are you sure you want to delete this comment?"
                    onConfirm={() => handleDeleteComment(comment._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      size="small"
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                ] : []
              }
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} className="comment-avatar" />}
                title={
                  <div className="comment-meta">
                    <Text strong className="comment-username">{comment.user.username}</Text>
                    <Tooltip title={new Date(comment.createdAt).toLocaleString()}>
                      <Text type="secondary" className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Text>
                    </Tooltip>
                  </div>
                }
                description={<div className="comment-text">{comment.text}</div>}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default VideoComments; 
import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Form, 
  Input, 
  Button, 
  Card, 
  Alert, 
  Spin, 
  Divider,
  Tag,
  Space,
  message,
  Select,
  Image,
  Breadcrumb,
  Tooltip
} from 'antd';
import { 
  FolderAddOutlined,
  RollbackOutlined,
  InfoCircleOutlined,
  TagsOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';


const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [video, setVideo] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch all available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/videos/categories');
        setCategories(response.data.data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        message.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Fetch video data for editing
  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axiosInstance.get(`/videos/${id}`);
        const videoData = response.data.data.video;
        setVideo(videoData);
        
        // Set form values
        form.setFieldsValue({
          title: videoData.title,
          description: videoData.description || '',
          category: videoData.category,
          tags: videoData.tags.join(', '),
          active: videoData.active
        });
      } catch (err) {
        console.error('Error fetching video:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load video data.';
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideo();
    } else {
      setError('No video ID provided');
      setLoading(false);
    }
  }, [id, form]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Process tags if they were entered as comma-separated string
      let processedTags = values.tags;
      if (typeof values.tags === 'string') {
        processedTags = values.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }
      
      // Prepare payload
      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        tags: processedTags,
        active: values.active,
        isTrending: values.trending
      };
      
      // Call the API to update the video
      await axiosInstance.patch(`/videos/${id}`, payload);
      
      setSuccess(true);
      message.success('Video updated successfully!');
      
      // Wait for a moment to show success state, then navigate back
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating video:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update video. Please try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading video data...</Text>
        </div>
      </div>
    );
  }

  if (error && !video) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button onClick={() => navigate('/admin')} type="primary">
            Back to Dashboard
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/admin">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Edit Video</Breadcrumb.Item>
        {video && <Breadcrumb.Item>{video.title}</Breadcrumb.Item>}
      </Breadcrumb>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Edit Video</Title>
        <Button 
          type="default" 
          icon={<RollbackOutlined />}
          onClick={() => navigate('/admin')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}
      
      {success && (
        <Alert
          message="Success"
          description="Video updated successfully!"
          type="success"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}
      
      {video && (
        <Card title="Video Information">
          <div style={{ marginBottom: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                style={{ maxWidth: '100%', maxHeight: '300px' }}
                fallback="https://via.placeholder.com/640x360?text=No+Thumbnail"
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <Tag color="blue">{video.sourceWebsite}</Tag>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Added: {new Date(video.createdAt).toLocaleDateString()}
              </Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Views: {video.views}
              </Text>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <Text strong>Video ID: </Text>
              <Tooltip title="Click to copy">
                <Tag 
                  color="green" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(video.videoId || '');
                    message.success('Video ID copied to clipboard');
                  }}
                >
                  {video.videoId || 'N/A'}
                </Tag>
              </Tooltip>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                (Users can search by this ID)
              </Text>
            </div>
            
            <a href={video.originalUrl} target="_blank" rel="noopener noreferrer">
              <Button type="link" style={{ padding: 0 }}>
                View Original Source
              </Button>
            </a>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              active: true
            }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter the video title' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} />
            </Form.Item>
            
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select>
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="tags"
              label="Tags"
              extra="Comma-separated list of tags (e.g. music, rock, 2023)"
            >
              <Input prefix={<TagsOutlined />} placeholder="tag1, tag2, tag3" />
            </Form.Item>
            
            <Form.Item
              name="active"
              valuePropName="checked"
              label="Status"
            >
              <Select>
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="trending"
              valuePropName="checked"
              label="Trending"
            >
              <Select>
                <Option value={true}>Yes</Option>
                <Option value={false}>No</Option>
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<FolderAddOutlined />}
                size="large"
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
      
      <Card title="Tips" style={{ marginTop: 20 }}>
        <Space direction="vertical">
          <div>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            <Text strong>Categories:</Text> Select the most appropriate category for better discovery
          </div>
          <div>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            <Text strong>Tags:</Text> Use specific and relevant tags to improve searchability
          </div>
          <div>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            <Text strong>Status:</Text> Set to inactive if you want to temporarily hide the video
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default EditVideo; 
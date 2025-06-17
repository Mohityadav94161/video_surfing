import React, { useState, useEffect } from 'react';
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
  Modal
} from 'antd';
import { 
  LinkOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  FolderOutlined
} from '@ant-design/icons';
import axios from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const UploadVideo = () => {
  const [form] = Form.useForm();
  const { isAuthenticated, user } = useAuth();
  const { collections, fetchUserCollections, addVideoToCollection, createCollection } = useCollections();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [addedVideoId, setAddedVideoId] = useState(null);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);

  const categories = [
    'Education',
    'Entertainment',
    'Gaming',
    'Music',
    'News',
    'Sports',
    'Technology',
    'Travel',
    'Other',
  ];

  const videoTypes = [
    { value: 'normal', label: 'Normal Video' },
    { value: 'terbox', label: 'Terbox Video' }
  ];

  // Load user collections
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCollections();
    } else {
      // Redirect to login if not authenticated
      navigate('/login', { 
        state: { from: '/upload-video', message: 'Please login to upload videos' }
      });
    }
  }, [isAuthenticated]);

  const handleExtractMetadata = async () => {
    const url = form.getFieldValue('url');
    
    if (!url) {
      message.error('Please enter a video URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    setVideoInfo(null);
    
    try {
      // Call the metadata extraction API endpoint
      const response = await axios.post('/videos/extract-metadata', { url });
      const metadata = response.data.data.metadata;
      
      setVideoInfo(metadata);
      
      // Pre-fill the form with extracted data
      form.setFieldsValue({
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        tags: metadata.tags.join(', '),
        videoType: 'normal' // Default to normal type
      });
      
    } catch (err) {
      console.error('Error extracting metadata:', err);
      const errorMessage = err.response?.data?.message || 'Failed to extract video information. Please try again or enter details manually.';
      setError(errorMessage);
      
      // Allow the user to enter details manually even if extraction fails
      setVideoInfo({
        title: '',
        description: '',
        category: 'Other',
        tags: [],
        sourceWebsite: new URL(url).hostname,
        thumbnailUrl: 'https://via.placeholder.com/640x360?text=No+Thumbnail'
      });
      
      form.setFieldsValue({
        url: url,
        title: '',
        description: '',
        category: 'Other',
        tags: '',
        videoType: 'normal' // Default to normal type
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionChange = (value) => {
    setSelectedCollections(value);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      message.error('Please enter a collection name');
      return;
    }
    
    setCreatingCollection(true);
    
    try {
      const result = await createCollection(newCollectionName, newCollectionDescription);
      
      if (result.success) {
        message.success(`Collection "${newCollectionName}" created successfully`);
        setSelectedCollections([...selectedCollections, result.collection._id]);
        setShowCreateCollectionModal(false);
        setNewCollectionName('');
        setNewCollectionDescription('');
      }
    } catch (err) {
      console.error('Error creating collection:', err);
    } finally {
      setCreatingCollection(false);
    }
  };

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
        originalUrl: values.url,
        title: values.title,
        description: values.description,
        category: values.category,
        tags: processedTags,
        thumbnailUrl: videoInfo?.thumbnailUrl || 'https://via.placeholder.com/640x360',
        sourceWebsite: videoInfo?.sourceWebsite || new URL(values.url).hostname,
        videoType: values.videoType || 'normal', // Include video type
        addedBy: user?.id // Include the user who added the video
      };
      
      // Call the API endpoint
      const response = await axios.post('/videos', payload);
      const videoId = response.data.data.video._id || response.data.data.video.id;
      setAddedVideoId(videoId);
      
      // Add video to selected collections
      if (selectedCollections.length > 0) {
        await Promise.all(
          selectedCollections.map(collectionId => 
            addVideoToCollection(collectionId, videoId)
          )
        );
      }
      
      setSuccess(true);
      message.success('Video added successfully!');
      
      // Reset form
      form.resetFields();
      setVideoInfo(null);
      setSelectedCollections([]);
      
    } catch (err) {
      console.error('Error adding video:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add video. Please try again.';
      setError(errorMessage);
      
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Title level={2}>Upload Video</Title>
      <Text type="secondary">
        Share videos by uploading a link. The system will automatically extract metadata 
        from the provided URL.
      </Text>
      
      <Divider />
      
      <Card title="Video URL" style={{ marginBottom: 20 }}>
        <Form layout="vertical">
          <Form.Item 
            label="Enter video URL" 
            extra="Paste the URL of the video you want to share"
          >
            <Input 
              prefix={<LinkOutlined />} 
              placeholder="https://example.com/video" 
              size="large"
              value={form.getFieldValue('url')}
              onChange={(e) => form.setFieldsValue({ url: e.target.value })}
            />
          </Form.Item>
          
          <Button 
            type="primary" 
            onClick={handleExtractMetadata} 
            loading={loading}
          >
            Extract Metadata
          </Button>
        </Form>
      </Card>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 10 }}>
            <Text>Extracting metadata from URL...</Text>
          </div>
        </div>
      )}
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}
      
      {videoInfo && (
        <>
          <Alert
            message="Metadata Extracted Successfully"
            description="Please review and edit the information below if needed."
            type="success"
            showIcon
            style={{ marginBottom: 20 }}
          />
          
          <Card 
            title="Video Information" 
            style={{ marginBottom: 20 }}
            extra={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text type="secondary">Source: </Text>
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {videoInfo.sourceWebsite}
                </Tag>
              </div>
            }
          >
            {videoInfo.thumbnailUrl && (
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <img 
                  src={videoInfo.thumbnailUrl} 
                  alt="Video thumbnail" 
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              </div>
            )}
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                url: form.getFieldValue('url'),
                title: videoInfo.title,
                description: videoInfo.description,
                category: videoInfo.category,
                tags: videoInfo.tags?.join(', ') || '',
                videoType: 'normal'
              }}
            >
              <Form.Item
                name="url"
                label="Video URL"
                rules={[{ required: true, message: 'Please enter the video URL' }]}
              >
                <Input disabled />
              </Form.Item>
              
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
                name="videoType"
                label="Video Type"
                rules={[{ required: true, message: 'Please select a video type' }]}
                tooltip={{ 
                  title: 'Choose the format of the video: Normal is standard video, Terbox is for interactive 3D content',
                  icon: <InfoCircleOutlined />
                }}
              >
                <Select>
                  {videoTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="tags"
                label="Tags"
                extra="Comma-separated list of tags"
              >
                <Input placeholder="tag1, tag2, tag3" />
              </Form.Item>

              <Form.Item
                label="Add to Collections"
                extra="Select collections to add this video to"
              >
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Select collections"
                  value={selectedCollections}
                  onChange={handleCollectionChange}
                  optionLabelProp="label"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Button 
                        type="link" 
                        icon={<PlusOutlined />} 
                        onClick={() => setShowCreateCollectionModal(true)}
                        style={{ paddingLeft: 8 }}
                      >
                        Create new collection
                      </Button>
                    </>
                  )}
                >
                  {collections.map(collection => (
                    <Option key={collection._id} value={collection._id} label={collection.name}>
                      <Space>
                        <FolderOutlined />
                        {collection.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  icon={<CheckCircleOutlined />}
                  size="large"
                >
                  Upload Video
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </>
      )}
      
      {success && (
        <Alert
          message="Video Uploaded Successfully"
          description={
            <div>
              <p>Your video has been uploaded and is now available for others to view.</p>
              {selectedCollections.length > 0 && (
                <p>The video was added to {selectedCollections.length} collection{selectedCollections.length !== 1 ? 's' : ''}.</p>
              )}
              <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={() => navigate(`/video/${addedVideoId}`)}>
                  View Video
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={() => setSuccess(false)}>
                  Upload Another Video
                </Button>
              </div>
            </div>
          }
          type="success"
          showIcon
        />
      )}
      
      {/* Modal for creating a new collection */}
      <Modal
        title="Create New Collection"
        open={showCreateCollectionModal}
        onCancel={() => setShowCreateCollectionModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowCreateCollectionModal(false)}>
            Cancel
          </Button>,
          <Button
            key="create"
            type="primary"
            loading={creatingCollection}
            onClick={handleCreateCollection}
          >
            Create
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item
            label="Collection Name"
            required
            rules={[{ required: true, message: 'Please enter a collection name' }]}
          >
            <Input
              placeholder="Enter collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              maxLength={50}
            />
          </Form.Item>
          
          <Form.Item label="Description (Optional)">
            <TextArea
              placeholder="Enter collection description"
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
              rows={3}
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UploadVideo; 
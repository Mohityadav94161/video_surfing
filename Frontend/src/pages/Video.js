import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Row,
  Col,
  Button,
  Tag,
  Divider,
  Spin,
  Alert,
  Card,
  Space,
  Breadcrumb,
  Descriptions,
  Image,
  Tooltip,
  Modal,
  Input,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  CalendarOutlined,
  GlobalOutlined,
  LinkOutlined,
  ShareAltOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import axios from '../utils/axiosConfig';
import VideoComments from '../components/VideoComments';
import VideoReactions from '../components/VideoReactions';
import AddToCollection from '../components/AddToCollection';

const { Title, Text, Paragraph } = Typography;

const Video = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Fetch video details
  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/videos/${id}`);
        setVideo(res.data.data.video);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideo();
    }
  }, [id]);

  // Get category color
  const getCategoryColor = (category) => {
    const categoryColors = {
      Education: 'blue',
      Entertainment: 'purple',
      Gaming: 'geekblue',
      Music: 'magenta',
      News: 'red',
      Sports: 'green',
      Technology: 'cyan',
      Travel: 'orange',
      Other: 'default',
    };
    return categoryColors[category] || 'default';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle redirect to original video
  const handleRedirect = () => {
    if (video?.originalUrl) {
      window.open(video.originalUrl, '_blank');
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        message.success('Copied to clipboard!');
      })
      .catch(() => {
        message.error('Failed to copy. Please try again.');
      });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" type="primary" onClick={() => navigate('/')}>
            Go Back
          </Button>
        }
      />
    );
  }

  if (!video) {
    return (
      <Alert
        message="Video Not Found"
        description="The video you're looking for doesn't exist or has been removed."
        type="warning"
        showIcon
        action={
          <Button size="small" type="primary" onClick={() => navigate('/')}>
            Go Back
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Breadcrumb navigation */}
      <Breadcrumb
        items={[
          { title: <a href="/">Home</a> },
          { title: video.category },
          { title: video.title }
        ]}
        style={{ marginBottom: 16 }}
      />

      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card>
          <div style={{ position: 'relative', textAlign: 'center', marginBottom: 20 }}>
  <Image
    src={video.thumbnailUrl}
    alt={video.title}
    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
    fallback="https://via.placeholder.com/640x360?text=No+Thumbnail"
    preview={false}
  />
  <div
    onClick={handleRedirect}
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '72px',
      height: '72px',
      backgroundColor: 'rgba(255, 20, 147, 0.8)',
      backdropFilter: 'blur(6px)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 0 8px rgba(0,0,0,0.5)',
    }}
  >
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: '18px solid white',
        borderTop: '12px solid transparent',
        borderBottom: '12px solid transparent',
        marginLeft: '4px',
      }}
    />
  </div>
</div>

            <Title level={2}>{video.title}</Title>

            <Space size={[0, 8]} wrap style={{ marginBottom: 16 }}>
              <Tag color={getCategoryColor(video.category)} style={{ fontSize: '14px' }}>
                {video.category}
              </Tag>

              {video.tags && video.tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </Space>

            <Divider />

            <Space align="center" size={[24, 8]} wrap style={{ marginBottom: 16 }}>
              <Tooltip title="Views">
                <Text type="secondary">
                  <Space>
                    <EyeOutlined /> {video.views}
                  </Space>
                </Text>
              </Tooltip>

              <Tooltip title="Date Added">
                <Text type="secondary">
                  <Space>
                    <CalendarOutlined /> {formatDate(video.createdAt)}
                  </Space>
                </Text>
              </Tooltip>

              <Tooltip title="Source Website">
                <Text type="secondary">
                  <Space>
                    <GlobalOutlined /> {video.sourceWebsite}
                  </Space>
                </Text>
              </Tooltip>
              
              <VideoReactions videoId={id} />
            </Space>

            <Divider />

            <Paragraph
              ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
              style={{ fontSize: '16px' }}
            >
              {video.description || 'No description available.'}
            </Paragraph>

            <div className="video-actions-container">
              
              <Button
                type="primary"
                size="large"
                icon={<ShareAltOutlined />}
                style={{ flex: '1 1 auto' }}
                onClick={() => setShareModalVisible(true)}
              >
                Share
              </Button>
              
              <div>
                <AddToCollection video={video} />
              </div>
            </div>
          </Card>
          
          <Card style={{ marginTop: 24 }}>
            <VideoComments videoId={id} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Video Information">
            <Descriptions column={1}>
              <Descriptions.Item label="Added By">
                {video.addedBy?.username || 'Admin'}
              </Descriptions.Item>
              <Descriptions.Item label="Date Added">
                {formatDate(video.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Views">
                {video.views}
              </Descriptions.Item>
              <Descriptions.Item label="Source">
                {video.sourceWebsite}
              </Descriptions.Item>
              <Descriptions.Item label="Video ID">
                {video.videoId || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Disclaimer" style={{ marginTop: 16 }}>
            <Paragraph>
              This platform aggregates videos from various sources across the web. 
              When you click "Watch Video," you will be redirected to the original 
              source website. We do not host or store any video content on our servers.
            </Paragraph>
          </Card>
        </Col>
      </Row>
      
      {/* Share Modal */}
      <Modal
        title="Share Video"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setShareModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Share using Full URL</Text>
            <Input.Group compact>
              <Input
                value={`${window.location.origin}/video/${id}`}
                readOnly
                style={{ width: 'calc(100% - 32px)' }}
              />
              <Tooltip title="Copy">
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(`${window.location.origin}/video/${id}`)}
                />
              </Tooltip>
            </Input.Group>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <Text strong>Share using Video ID</Text>
            <Input.Group compact>
              <Input
                value={`${window.location.origin}/video/${video.videoId}`}
                readOnly
                style={{ width: 'calc(100% - 32px)' }}
              />
              <Tooltip title="Copy">
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(`${window.location.origin}/video/${video.videoId}`)}
                />
              </Tooltip>
            </Input.Group>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <Text strong>Video ID only</Text>
            <Input.Group compact>
              <Input
                value={video.videoId || ''}
                readOnly
                style={{ width: 'calc(100% - 32px)' }}
              />
              <Tooltip title="Copy">
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(video.videoId || '')}
                />
              </Tooltip>
            </Input.Group>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Users can search for this video directly using this ID in the search bar.
            </Text>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default Video; 
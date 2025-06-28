import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Row,
  Col,
  Button,
  Spin,
  Alert,
  Card,
  Space,
  Image,
  Tooltip,
  Modal,
  Input,
  message,
  Popover,
} from 'antd';
import {
  EyeOutlined,
  CalendarOutlined,
  GlobalOutlined,
  ShareAltOutlined,
  CopyOutlined,
  FolderAddOutlined,
  HeartOutlined,
  ExceptionOutlined,
  
} from '@ant-design/icons';
import axios from '../utils/axiosConfig';
import VideoComments from '../components/VideoComments';
import VideoReactions from '../components/VideoReactions';
import AddToCollection from '../components/AddToCollection';
import VideoReportModal from '../components/VideoReportModal';
import api from '../utils/axiosConfig';
import { formatDistanceToNow } from 'date-fns';
import './Video.css';

const { Title, Text, Paragraph } = Typography;

const Video = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedType, setRelatedType] = useState('category');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/videos/${id}`);
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

  // Fetch related videos when main video is loaded
  useEffect(() => {
    const fetchRelatedVideos = async () => {
      if (!video) return;
      
      setRelatedLoading(true);
      try {
        // Use the new enhanced related videos API
        const res = await axios.get(`/videos/${video._id}/related`, {
          params: { limit: 8 }
        });
        
        const data = res.data.data;
        setRelatedVideos(data.videos || []);
        setRelatedType(res.data.relationType || 'category');
      } catch (err) {
        console.error('Error fetching related videos:', err);
        // Fallback to old method if new API fails
        try {
          let params = {
            limit: 8,
            page: 1
          };

          if (video.category) {
            params.category = video.category;
          } else if (video.tags && video.tags.length > 0) {
            params.tag = video.tags[0];
          }

          const res = await axios.get('/videos', { params });
          const fetchedVideos = res.data.data.videos || [];
          const filteredVideos = fetchedVideos.filter(v => v._id !== video._id);
          setRelatedVideos(filteredVideos.slice(0, 8));
          setRelatedType('fallback');
        } catch (fallbackErr) {
          console.error('Error fetching fallback videos:', fallbackErr);
          setRelatedVideos([]);
          setRelatedType('none');
        }
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedVideos();
  }, [video]);

  // Helper functions from Home.js
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M"
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K"
    }
    return count.toString()
  }

  // Format duration intelligently, handling missing values
  const formatDuration = (duration, videoId) => {
    if (duration) {
      // If we have an actual duration, format it as MM:SS
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    }

    // Generate a pseudo-random duration based on video ID
    if (videoId) {
      const hash = videoId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      const minutes = Math.abs(hash) % 15 + 5 // 5-19 minutes
      const seconds = Math.abs(hash >> 8) % 60 // 0-59 seconds
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    }

    // Fallback for no ID or duration
    return "5:30"
  }

  // Handle thumbnail click - Go to original URL or external site
  const handleVideoThumbnailClick = async (video) => {
    try {
      // Record the view
      await api.post(`/videos/${video._id || video.id}/view`)

      // Navigate to the original URL or open external URL
      if (video.originalUrl) {
        window.open(video.originalUrl, '_blank')
      } else {
        // Fallback: construct URL based on source
        const fallbackUrl = `https://${video.sourceWebsite}`
        window.open(fallbackUrl, '_blank')
      }
    } catch (error) {
      console.error('Error recording view or opening video:', error)
      // Still try to open the video even if view recording fails
      if (video.originalUrl) {
        window.open(video.originalUrl, '_blank')
      }
    }
  }

  // Handle video info click - Go to video details page
  const handleVideoInfoClick = async (video) => {
    try {
      // Record the view
      await api.post(`/videos/${video._id || video.id}/view`)

      // Navigate to the video details page
      navigate(`/video/${video._id || video.id}`)
    } catch (error) {
      console.error('Error recording view:', error)
      // Still navigate even if view recording fails
      navigate(`/video/${video._id || video.id}`)
    }
  }

  // Handle save to collection click
  const handleSaveToCollectionClick = async (video, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      message.info("Please log in to save videos to collections");
      return;
    }

    // You can implement collection saving logic here
    message.info("Collection feature not implemented in video page");
  }

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) {
          try {
            const response = await api.get("/auth/verify", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
              setIsAuthenticated(true);
            }
          } catch (err) {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleRedirect = () => {
    if (video?.originalUrl) {
      window.open(video.originalUrl, '_blank');
    }
  };

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

            <Title level={4}>{video.title}</Title>

            <Space align="center" size={[24, 8]} wrap style={{ marginBottom: 16 }}>
  {/* Views */}
  <Text type="secondary">
    <Space>
      <EyeOutlined /> {video.views.toLocaleString()} Views
    </Space>
  </Text>
  
  {/* Separator */}
  <Text type="secondary">|</Text>
  
  {/* Date Added */}
  <Text type="secondary">
    {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
  </Text>
  

  <Text type="secondary">|</Text>
  
  <VideoReactions videoId={id} />

  <Popover
    content={<AddToCollection video={video} />}
    trigger="click"
    placement="bottomRight"
    overlayClassName="add-to-collection-popover"
  >
    <Button 
      type="text" 
      size="small"
      icon={<FolderAddOutlined />}
      style={{ padding: '0 8px' }}
    >
      Add to
    </Button>
  </Popover>
  
  {/* Share Button */}
  <Button 
    type="text" 
    size="small"
    icon={<ShareAltOutlined />}
    style={{ padding: '0 8px' }}
    onClick={() => setShareModalVisible(true)}
  >
    Share
  </Button>
  
  {/* Report Button */}
  <Button 
    type="text" 
    size="small"
    danger
    icon={<ExceptionOutlined />}
    style={{ padding: '0 8px' }}
    onClick={() => setReportModalVisible(true)}
  >
    Report
  </Button>
</Space>

            {/* <Divider />

            <Paragraph
              ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
              style={{ fontSize: '16px' }}
            >
              {video.description || 'No description available.'}
            </Paragraph>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              <Button
                type="primary"
                size="large"
                icon={<ShareAltOutlined />}
                style={{ flex: 1, minWidth: '200px' }}
                onClick={() => setShareModalVisible(true)}
              >
                Share
              </Button>
              
              <div style={{ flex: 1, minWidth: '200px' }}>
                <AddToCollection video={video} />
              </div>
            </div> */}
          </Card>
          
          
        </Col>

        <Col xs={24} md={8}>
          {/* <Card title="Video Information">
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
          </Card> */}

          {/* <Card title="Disclaimer" style={{ marginTop: 16 }}>
            <Paragraph>
              This platform aggregates videos from various sources across the web. 
              When you click "Watch Video," you will be redirected to the original 
              source website. We do not host or store any video content on our servers.
            </Paragraph>
          </Card> */}
        </Col>
      </Row>
      
      {/* Related Videos Section - Full Width */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>Related Videos</Title>
          {relatedVideos.length > 0 && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {relatedType === 'category' && 'Same category'}
              {relatedType === 'mixed' && 'Category + tags'}
              {relatedType === 'fuzzy' && 'Similar content'}
              {relatedType === 'popular' && 'Popular videos'}
              {relatedType === 'fallback' && 'Recommended'}
              {relatedType === 'none' && 'No related videos'}
            </Text>
          )}
        </div>
        {relatedLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin size="large" />
          </div>
        ) : relatedVideos.length > 0 ? (
          <div className="video-grid">
            {relatedVideos.map((video) => (
              <div key={video._id || video.id} className="video-card">
                <div className="video-thumbnail" onClick={() => handleVideoThumbnailClick(video)}>
                  <img
                    src={video.thumbnailUrl || "/home.jpg"}
                    alt={video.title}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/home.jpg"
                    }}
                  />
                  <div className="video-overlay">
                    <div className="play-button"></div>
                  </div>
                  <div
                    className="save-to-collections-icon"
                    onClick={(e) => handleSaveToCollectionClick(video, e)}
                  >
                    <FolderAddOutlined />
                  </div>
                  <div className="video-duration">
                    {formatDuration(video.duration, video._id || video.id)}
                  </div>
                </div>
                <div className="video-info" onClick={() => handleVideoInfoClick(video)}>
                  <h3 className="video-title">{video.title}</h3>
                  <div className="video-stats-row">
                    <div className="video-views">
                      <EyeOutlined />
                      <span>{formatViewCount(video.views || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text type="secondary">No related videos found</Text>
          </div>
        )}
      </div>

      <Card style={{ marginTop: 24 }}>
            <VideoComments videoId={id} />
          </Card>
      
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
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Users can search for this video directly using this ID in the search bar.
            </Text>
        </Space>
      </Modal>
      
      {/* Video Report Modal */}
      <VideoReportModal
        visible={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        video={video}
      />
    </div>
  );
};

export default Video;
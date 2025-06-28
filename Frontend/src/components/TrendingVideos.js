import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Spin, Empty } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import './TrendingVideos.css';

const TrendingVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/videos/trending', {
          params: { limit: 6 } // Limit to 6 videos for the homepage section
        });
        setVideos(response.data.data.videos);
      } catch (err) {
        console.error('Error fetching trending videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, []);

  const handleVideoClick = (video) => {
    navigate(`/videos/${video.videoId}`);
  };

  const handleShowMoreClick = () => {
    navigate('/trending');
  };

  // Format view count
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="trending-videos-container">
      <div className="trending-header">
        <h2><FireOutlined /> Trending Videos</h2>
        <Button 
          type="primary" 
          onClick={handleShowMoreClick}
          className="show-more-btn"
        >
          Show More
        </Button>
      </div>

      {loading ? (
        <div className="trending-loading">
          <Spin size="large" />
        </div>
      ) : videos.length === 0 ? (
        <Empty description="No trending videos available" />
      ) : (
        <Row gutter={[16, 16]}>
          {videos.map((video) => (
            <Col xs={24} sm={12} md={8} key={video._id}>
              <Card 
                hoverable 
                cover={
                  <div className="video-thumbnail-container" onClick={() => handleVideoClick(video)}>
                    <img 
                      alt={video.title} 
                      src={video.thumbnailUrl} 
                      className="video-thumbnail"
                    />
                    <div className="video-views">{formatViewCount(video.views)} views</div>
                  </div>
                }
                className="trending-video-card"
                onClick={() => handleVideoClick(video)}
              >
                <Card.Meta
                  title={video.title}
                  description={
                    <div className="video-meta">
                      <span className="video-uploader">
                        {video.addedBy?.username || 'Unknown user'}
                      </span>
                      <span className="video-time">
                        {formatRelativeTime(video.createdAt)}
                      </span>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default TrendingVideos; 
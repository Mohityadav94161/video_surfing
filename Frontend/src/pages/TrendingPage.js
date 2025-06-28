import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Typography, Pagination, Empty } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import VideoCard from '../components/VideoCard';

const { Title } = Typography;

const TrendingPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const pageSize = 12;
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      setLoading(true);
      try {
        const response = await api.get('/videos/trending', {
          params: {
            page: currentPage,
            limit: pageSize
          }
        });
        const data = response.data;
        setVideos(data.data.videos);
        setTotalVideos(data.total);
      } catch (err) {
        console.error('Error fetching trending videos:', err);
        setError('Failed to load trending videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleVideoClick = (video) => {
    navigate(`/video/${video._id}`);
  };

  return (
    <div className="trending-page">
      <div className="section-header">
        <Title level={2}>
          <FireOutlined style={{ color: '#ff1493', marginRight: '10px' }} />
          Trending Videos
        </Title>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading videos...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <Empty description="No trending videos available" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {videos.map((video) => (
              <Col xs={24} sm={12} md={8} lg={6} key={video._id}>
                <VideoCard video={video} onClick={() => handleVideoClick(video)} />
              </Col>
            ))}
          </Row>

          {totalVideos > pageSize && (
            <div className="pagination-container" style={{ marginTop: '24px', textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                total={totalVideos}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrendingPage; 
import React from 'react';
import { Card, Tag, Typography, Space, Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';
import {
  EyeOutlined,
  CalendarOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
  FolderAddOutlined
} from '@ant-design/icons';
import './VideoCard.css';
import AddToCollection from './AddToCollection';

const { Meta } = Card;
const { Text, Title } = Typography;

const VideoCard = ({ video, viewMode = 'grid' }) => {
  const {
    _id,
    title,
    thumbnailUrl,
    category,
    tags,
    views,
    sourceWebsite,
    createdAt,
    description,
    isRelated,
    isSuggestion,
    searchScore
  } = video;

  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString();
  
  // Default thumbnail if none provided
  const defaultThumbnail = 'https://via.placeholder.com/640x360?text=No+Thumbnail';

  // Get tag color based on category
  const getCategoryColor = (category) => {
    const categoryColors = {
      Education: 'blue',
      Entertainment: 'purple',
      Gaming: 'geekblue',
      Music: 'magenta',
      News: 'orange',
      Sports: 'green',
      Technology: 'cyan',
      Travel: 'gold',
      Other: 'default',
    };
    return categoryColors[category] || 'default';
  };

  // Handle click on add to collection button to prevent card link activation
  const handleAddToCollectionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // List view component
  if (viewMode === 'list') {
    return (
      <Link to={`/video/${_id}`} className="video-card-link">
        <Card 
          className="video-card list-card"
          hoverable
          actions={[
            <div onClick={handleAddToCollectionClick}>
              <AddToCollection video={video} compact={true} />
            </div>
          ]}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8} md={6} className="list-thumbnail-container">
              <div className="thumbnail-wrapper" data-duration={video.duration || "10:30"}>
                <img
                  alt={title}
                  src={thumbnailUrl || defaultThumbnail}
                  className="thumbnail-image"
                />
                <div className="play-overlay">
                  <PlayCircleOutlined className="play-icon" />
                </div>
              </div>
            </Col>
            <Col xs={24} sm={16} md={18}>
              <div className="list-content">
                <Title level={5} ellipsis={{ rows: 2 }} className="video-title">
                  {title}
                </Title>
                
                <Space size={[0, 8]} wrap className="tag-container">
                  <Tag color={getCategoryColor(category)} className="category-tag">
                    {category}
                  </Tag>
                  {isRelated && !isSuggestion && (
                    <Tag color="orange" style={{ fontSize: '10px' }}>
                      Related
                    </Tag>
                  )}
                  {isSuggestion && (
                    <Tag color="purple" style={{ fontSize: '10px' }}>
                      Suggested
                    </Tag>
                  )}
                  {tags && tags.slice(0, 3).map((tag, index) => (
                    <Tag key={index} className="tag">
                      {tag}
                    </Tag>
                  ))}
                  {tags && tags.length > 3 && (
                    <Tag>+{tags.length - 3}</Tag>
                  )}
                </Space>
                
                {description && (
                  <Text type="secondary" ellipsis={{ rows: 2 }} className="description">
                    {description}
                  </Text>
                )}
                
                <div className="video-meta">
                  <Text type="secondary" className="meta-item">
                    <EyeOutlined /> {views} views
                  </Text>
                  <Text type="secondary" className="meta-item">
                    <CalendarOutlined /> {formattedDate}
                  </Text>
                  <Text type="secondary" className="meta-item">
                    <GlobalOutlined /> {sourceWebsite}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Link>
    );
  }

  // Default grid view component
  return (
    <Link to={`/video/${_id}`} className="video-card-link">
      <Card
        hoverable
        className="video-card grid-card"
        cover={
          <div className="thumbnail-container" data-duration={video.duration || "10:30"}>
            <img
              alt={title}
              src={thumbnailUrl || defaultThumbnail}
              className="thumbnail-image"
            />
            <div className="play-overlay">
              <PlayCircleOutlined className="play-icon" />
            </div>
          </div>
        }
        actions={[
          <div onClick={handleAddToCollectionClick}>
            <AddToCollection video={video} compact={true} />
          </div>
        ]}
      >
        <Meta
          title={<Title level={5} ellipsis={{ rows: 2 }} className="video-title">{title}</Title>}
          description={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Tag color={getCategoryColor(category)} className="category-tag">{category}</Tag>
                {isRelated && !isSuggestion && (
                  <Tag color="orange" style={{ fontSize: '10px' }}>
                    Related
                  </Tag>
                )}
                {isSuggestion && (
                  <Tag color="purple" style={{ fontSize: '10px' }}>
                    Suggested
                  </Tag>
                )}
              </div>
              
              <div className="tag-container">
                {tags && tags.slice(0, 2).map((tag, index) => (
                  <Tag key={index} className="tag">
                    {tag}
                  </Tag>
                ))}
                {tags && tags.length > 2 && (
                  <Tag>+{tags.length - 2}</Tag>
                )}
              </div>
              
              <div className="video-meta">
                <Text type="secondary" className="meta-item">
                  <EyeOutlined /> {views}
                </Text>
                <Text type="secondary" className="meta-item">
                  <CalendarOutlined /> {formattedDate}
                </Text>
              </div>
              
              <Text type="secondary" className="meta-item source">
                <GlobalOutlined /> {sourceWebsite}
              </Text>
            </Space>
          }
        />
      </Card>
    </Link>
  );
};

export default VideoCard;
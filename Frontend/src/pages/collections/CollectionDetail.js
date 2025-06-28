import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Card, 
  Spin, 
  Empty, 
  List, 
  Divider, 
  Space, 
  Modal, 
  Tag,
  Grid,
  message 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useCollections } from '../../contexts/CollectionContext';
import axios from '../../utils/axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { removeVideoFromCollection, deleteCollection } = useCollections();
  
  useEffect(() => {
    fetchCollectionDetails();
  }, [id]);
  
  const fetchCollectionDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/collections/${id}`);
      setCollection(response.data.data.collection);
    } catch (err) {
      console.error('Error fetching collection details:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load collection details';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmRemoveVideo = (videoId, videoTitle) => {
    confirm({
      title: `Remove video from collection?`,
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to remove "${videoTitle}" from this collection?`,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        const result = await removeVideoFromCollection(id, videoId);
        if (result.success) {
          // Update collection in state to reflect removal
          setCollection(prev => ({
            ...prev,
            videos: prev.videos.filter(video => video.id !== videoId)
          }));
          message.success('Video removed from collection');
        }
      }
    });
  };
  
  const confirmDeleteCollection = () => {
    confirm({
      title: `Delete collection?`,
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${collection?.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        const result = await deleteCollection(id);
        if (result.success) {
          navigate('/collections');
        }
      }
    });
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Loading collection..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/collections')}
          style={{ padding: 0, marginBottom: 16 }}
        >
          Back to Collections
        </Button>
        
        <Card>
          <Empty 
            description={
              <span>
                Error loading collection: {error}
              </span>
            }
          >
            <Button type="primary" onClick={() => navigate('/collections')}>
              Return to Collections
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }
  
  if (!collection) {
    return (
      <div>
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/collections')}
          style={{ padding: 0, marginBottom: 16 }}
        >
          Back to Collections
        </Button>
        
        <Card>
          <Empty description="Collection not found">
            <Button type="primary" onClick={() => navigate('/collections')}>
              Return to Collections
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/collections')}
        style={{ padding: 0, marginBottom: 16 }}
      >
        Back to Collections
      </Button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2}>{collection.name}</Title>
          <Paragraph type="secondary">
            {collection.description || 'No description'}
          </Paragraph>
        </div>
        
        <Button 
          danger
          icon={<DeleteOutlined />}
          onClick={confirmDeleteCollection}
        >
          Delete Collection
        </Button>
      </div>
      
      <Divider />
      
      <div style={{ marginBottom: 16 }}>
        <Text>
          <Tag color="blue">{collection.videos?.length || 0} video{collection.videos?.length !== 1 ? 's' : ''}</Tag>
        </Text>
      </div>
      
      {!collection.videos || collection.videos.length === 0 ? (
        <Empty 
          description="No videos in this collection yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/search')}>
            Browse Videos
          </Button>
        </Empty>
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
            xxl: 6,
          }}
          dataSource={collection.videos}
          renderItem={(video) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative' }}>
                    <img 
                      alt={video.title} 
                      src={video.thumbnailUrl || 'https://via.placeholder.com/640x360'} 
                      style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                    />
                    <div style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      ':hover': { opacity: 1 }
                    }}>
                      <PlayCircleOutlined style={{ fontSize: 48, color: 'white' }} />
                    </div>
                  </div>
                }
                actions={[
                  <Link to={`/video/${video.id}`} key="play">Play</Link>,
                  <Link 
                    to="#" 
                    key="remove" 
                    onClick={(e) => {
                      e.preventDefault();
                      confirmRemoveVideo(video.id, video.title);
                    }}
                  >
                    Remove
                  </Link>,
                ]}
              >
                <Card.Meta
                  title={
                    <Link to={`/video/${video.id}`}>
                      <Text ellipsis={{ tooltip: video.title }}>
                        {video.title}
                      </Text>
                    </Link>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" ellipsis>
                        {video.description ? video.description.substring(0, 60) + (video.description.length > 60 ? '...' : '') : 'No description'}
                      </Text>
                      {video.category && (
                        <Tag>{video.category}</Tag>
                      )}
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default CollectionDetail; 
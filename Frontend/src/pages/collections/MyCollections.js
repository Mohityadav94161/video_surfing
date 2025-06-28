import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Card, 
  List, 
  Space, 
  Spin, 
  Empty, 
  Tag, 
  Divider, 
  Modal,
  message 
} from 'antd';
import { 
  PlusOutlined, 
  FolderOutlined, 
  DeleteOutlined, 
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useCollections } from '../../contexts/CollectionContext';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const MyCollections = () => {
  const navigate = useNavigate();
  const { 
    collections, 
    loading, 
    error, 
    fetchUserCollections, 
    deleteCollection 
  } = useCollections();

  useEffect(() => {
    fetchUserCollections();
  }, []);

  const showDeleteConfirm = (collectionId, collectionName) => {
    confirm({
      title: `Are you sure you want to delete "${collectionName}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone. All videos in this collection will be removed.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        const result = await deleteCollection(collectionId);
        if (result.success) {
          message.success(`Collection "${collectionName}" deleted successfully`);
        }
      }
    });
  };

  if (loading && collections.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Loading your collections..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>My Collections</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/collections/create')}
        >
          Create Collection
        </Button>
      </div>

      <Paragraph type="secondary">
        Organize your favorite videos into collections for easy access. 
        You can add videos to collections while browsing.
      </Paragraph>

      <Divider />

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Text type="danger">{error}</Text>
        </div>
      )}

      {collections.length === 0 && !loading ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              You don't have any collections yet. Create your first collection to start organizing your videos.
            </span>
          }
        >
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/collections/create')}
          >
            Create Collection
          </Button>
        </Empty>
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={collections}
          renderItem={(collection) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  collection.videos && collection.videos.length > 0 ? (
                    <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                      <img 
                        alt={collection.name} 
                        src={collection.videos[0].thumbnailUrl || 'https://via.placeholder.com/640x360'}
                        style={{ width: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        background: 'rgba(0,0,0,0.7)', 
                        color: 'white',
                        padding: '4px 8px',
                        borderTopLeftRadius: 4
                      }}>
                        <span className="logo-text"><span>XFans</span><span style={{color:'#fff'}}>Tube</span></span> {collection.videos.length}
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      height: 160, 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      background: '#f0f2f5'
                    }}>
                      <FolderOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />
                    </div>
                  )
                }
                actions={[
                  <Link to={`/collections/${collection.id}`} key="view">View</Link>,
                  <Link to="#" key="delete" onClick={(e) => {
                    e.preventDefault();
                    showDeleteConfirm(collection.id, collection.name);
                  }}>Delete</Link>,
                ]}
              >
                <Card.Meta
                  title={<Link to={`/collections/${collection.id}`}>{collection.name}</Link>}
                  description={
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Text type="secondary" ellipsis={{ tooltip: collection.description }}>
                        {collection.description || 'No description'}
                      </Text>
                      <div>
                        <Tag color="blue">
                          {collection.videos?.length || 0} video{(collection.videos?.length || 0) !== 1 ? 's' : ''}
                        </Tag>
                      </div>
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

export default MyCollections; 
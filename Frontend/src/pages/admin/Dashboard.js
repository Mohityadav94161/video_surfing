import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Tooltip,
  Space,
  Popconfirm,
  message,
  Input,
  Select,
  Spin,
  Alert
} from 'antd';
import { 
  PlaySquareOutlined, 
  EyeOutlined, 
  UserOutlined, 
  TagsOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalCategories: 0,
    totalTags: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/videos/categories');
        setCategories(response.data.data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        message.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Fetch videos and stats data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build filter parameters
        const params = new URLSearchParams();
        
        if (filters.search) {
          params.set('search', filters.search);
        }
        
        if (filters.category) {
          params.set('category', filters.category);
        }
        
        // Add pagination params
        params.set('page', pagination.current);
        params.set('limit', pagination.pageSize);
        
        // Sort by newest first
        params.set('sort', '-createdAt');
        
        // Get videos with filters and pagination
        const videosResponse = await axios.get(`/api/videos?${params.toString()}`);
        
        // Get stats data - for admin, we show all videos including inactive ones
        const statsPromise = axios.get('/api/videos/stats');
        const tagsPromise = axios.get('/api/videos/tags');
        
        // Wait for all promises to resolve
        const [statsResponse, tagsResponse] = await Promise.all([statsPromise, tagsPromise]);
        
        // Process video data
        const videosData = videosResponse.data.data.videos;
        const totalVideos = videosResponse.data.total || 0;
        
        // Process stats data
        const totalViews = statsResponse.data.data.totalViews || 0;
        const totalCategories = categories.length;
        const totalTags = tagsResponse.data.data.tags.length || 0;
        
        // Update state
        setVideos(videosData);
        setStats({
          totalVideos,
          totalViews,
          totalCategories,
          totalTags
        });
        
        setPagination({
          ...pagination,
          total: totalVideos,
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, pagination.current, pagination.pageSize, categories.length]);

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
  };

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleCategoryFilter = (value) => {
    setFilters({ ...filters, category: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleStatusFilter = (value) => {
    setFilters({ ...filters, status: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleToggleStatus = async (videoId, currentStatus) => {
    try {
      await axios.patch(`/api/videos/${videoId}`, { active: !currentStatus });
      
      // Update the UI
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video._id === videoId ? { ...video, active: !currentStatus } : video
        )
      );
      
      message.success(`Video ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      console.error('Error updating video status:', err);
      message.error('Failed to update video status');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await axios.delete(`/api/videos/${videoId}`);
      
      // Update the UI
      setVideos(prevVideos => prevVideos.filter(video => video._id !== videoId));
      setStats(prev => ({ ...prev, totalVideos: prev.totalVideos - 1 }));
      
      message.success('Video deleted successfully');
    } catch (err) {
      console.error('Error deleting video:', err);
      message.error('Failed to delete video');
    }
  };

  const handleEdit = (videoId) => {
    navigate(`/admin/edit-video/${videoId}`);
  };

  const handleRefresh = () => {
    // Reset filters and reload
    setFilters({
      search: '',
      category: '',
      status: ''
    });
    setPagination({
      ...pagination,
      current: 1
    });
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/video/${record._id}`}>{text}</Link>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={
          category === 'Education' ? 'blue' :
          category === 'Entertainment' ? 'purple' :
          category === 'Gaming' ? 'geekblue' :
          category === 'Music' ? 'magenta' :
          category === 'Technology' ? 'cyan' : 'default'
        }>
          {category}
        </Tag>
      ),
      filters: categories.map(category => ({ text: category, value: category })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Source',
      dataIndex: 'sourceWebsite',
      key: 'sourceWebsite',
      render: (source) => source,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record._id)}
            />
          </Tooltip>
          
          <Tooltip title={record.active ? 'Deactivate' : 'Activate'}>
            <Button
              type={record.active ? 'default' : 'primary'}
              size="small"
              danger={record.active}
              onClick={() => handleToggleStatus(record._id, record.active)}
            >
              {record.active ? 'Deactivate' : 'Activate'}
            </Button>
          </Tooltip>
          
          <Popconfirm
            title="Are you sure you want to delete this video?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteVideo(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Admin Dashboard</Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </div>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total Videos"
              value={stats.totalVideos}
              prefix={<PlaySquareOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total Views"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Categories"
              value={stats.totalCategories}
              prefix={<FilterOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Unique Tags"
              value={stats.totalTags}
              prefix={<TagsOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
      
      {error && (
        <Alert 
          message="Error" 
          description={error}
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      )}
      
      <Card 
        title="Video Management" 
        style={{ marginBottom: 24 }}
        extra={
          <Link to="/admin/add-video">
            <Button type="primary" icon={<PlusOutlined />}>
              Add New Video
            </Button>
          </Link>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Input.Search
                placeholder="Search by title or tag"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                style={{ width: '100%' }}
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="Filter by Category"
                style={{ width: '100%' }}
                allowClear
                onChange={handleCategoryFilter}
                value={filters.category || undefined}
                loading={loading && categories.length === 0}
              >
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="Filter by Status"
                style={{ width: '100%' }}
                allowClear
                onChange={handleStatusFilter}
                value={filters.status || undefined}
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>
          </Row>
        </div>
        
        <Table
          columns={columns}
          dataSource={videos}
          rowKey="_id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: loading ? <Spin /> : <Text type="secondary">No videos found</Text>
          }}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 
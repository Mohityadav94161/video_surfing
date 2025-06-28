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
  Alert,
  Modal,
  Form,
  Checkbox,
  Dropdown,
  Divider
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
  FilterOutlined,
  CloudUploadOutlined,
  DownOutlined,
  CheckOutlined,
  CloseOutlined,
  FireOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Dashboard = () => {
  const navigate = useNavigate();
  const { loadUser, isAdmin } = useAuth();
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
  
  // Bulk selection and actions state
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkActionModalVisible, setBulkActionModalVisible] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkActionForm] = Form.useForm();
  
  // New category creation state
  const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingNewCategory, setAddingNewCategory] = useState(false);

  // Verify admin token on mount
  useEffect(() => {
    const verifyAdminToken = async () => {
      try {
        // Verify token is valid and user is admin
        const result = await loadUser(true);
        if (!result.success || !result.user || result.user.role !== 'admin') {
          console.log('Admin verification failed:', result);
          message.error('Authentication failed. Please login again.');
          navigate('/');
        }
      } catch (err) {
        console.error('Admin verification error:', err);
      }
    };
    
    verifyAdminToken();
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories with auth token');
        const response = await axiosInstance.get('/videos/categories');
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
          
          // Check if search might be a videoId (no spaces)
          if (filters.search.trim().indexOf(' ') === -1) {
            params.set('videoId', filters.search.trim());
          }
        }
        
        if (filters.category) {
          params.set('category', filters.category);
        }
        
        // Add pagination params
        params.set('page', pagination.current);
        params.set('limit', pagination.pageSize);
        
        // Sort by newest first
        params.set('sort', '-createdAt');
        
        console.log('Fetching videos list with auth token');
        // Get videos with filters and pagination
        const videosResponse = await axiosInstance.get(`/videos?${params.toString()}`);
        
        // Get stats data - for admin, we show all videos including inactive ones
        console.log('Fetching video stats with auth token');
        const statsPromise = axiosInstance.get('/videos/stats');
        const tagsPromise = axiosInstance.get('/videos/tags');
        
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
        console.log('vide data ',videosData)
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
      await axiosInstance.patch(`/videos/${videoId}`, { active: !currentStatus });
      
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
      await axiosInstance.delete(`/videos/${videoId}`);
      
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

  // Bulk selection handlers
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const onSelectAll = (selected, selectedRows, changeRows) => {
    if (selected) {
      setSelectedRowKeys(videos.map(video => video._id));
    } else {
      setSelectedRowKeys([]);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    onSelectAll: onSelectAll,
    getCheckboxProps: (record) => ({
      name: record.title,
    }),
  };

  // Bulk action handlers
  const handleBulkAction = (actionType) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one video');
      return;
    }
    setBulkActionType(actionType);
    setBulkActionModalVisible(true);
    
    // Set initial form values based on action type
    if (actionType === 'category') {
      bulkActionForm.setFieldsValue({ category: '' });
    } else if (actionType === 'tags') {
      bulkActionForm.setFieldsValue({ tags: '' });
    }
  };

  const executeBulkAction = async (values) => {
    setBulkActionLoading(true);
    
    try {
      let updateData = {};
      
      switch (bulkActionType) {
        case 'activate':
          updateData = { active: true };
          break;
        case 'deactivate':
          updateData = { active: false };
          break;
        case 'trending_on':
          updateData = { isTrending: true };
          break;
        case 'trending_off':
          updateData = { isTrending: false };
          break;
        case 'category':
          updateData = { category: values.category };
          break;
        case 'tags':
          const newTags = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
          updateData = { tags: newTags };
          break;
        case 'delete':
          // Handle delete separately
          break;
      }
      
      if (bulkActionType === 'delete') {
        // Delete videos
        await Promise.all(
          selectedRowKeys.map(videoId => 
            axiosInstance.delete(`/videos/${videoId}`)
          )
        );
        
        // Update UI
        setVideos(prevVideos => 
          prevVideos.filter(video => !selectedRowKeys.includes(video._id))
        );
        setStats(prev => ({ 
          ...prev, 
          totalVideos: prev.totalVideos - selectedRowKeys.length 
        }));
        
        message.success(`Successfully deleted ${selectedRowKeys.length} videos`);
      } else {
        // Update videos
        await Promise.all(
          selectedRowKeys.map(videoId => 
            axiosInstance.patch(`/videos/${videoId}`, updateData)
          )
        );
        
        // Update UI
        setVideos(prevVideos => 
          prevVideos.map(video => 
            selectedRowKeys.includes(video._id) 
              ? { ...video, ...updateData }
              : video
          )
        );
        
        const actionNames = {
          activate: 'activated',
          deactivate: 'deactivated',
          trending_on: 'marked as trending',
          trending_off: 'unmarked as trending',
          category: 'category updated',
          tags: 'tags updated'
        };
        
        message.success(`Successfully ${actionNames[bulkActionType]} ${selectedRowKeys.length} videos`);
      }
      
      // Reset selection and close modal
      setSelectedRowKeys([]);
      setBulkActionModalVisible(false);
      bulkActionForm.resetFields();
      
    } catch (err) {
      console.error('Error executing bulk action:', err);
      message.error(`Failed to execute bulk action: ${err.response?.data?.message || err.message}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const bulkActionItems = [
    {
      key: 'activate',
      label: (
        <Space>
          <CheckOutlined style={{ color: '#52c41a' }} />
          Activate Selected
        </Space>
      ),
    },
    {
      key: 'deactivate',
      label: (
        <Space>
          <CloseOutlined style={{ color: '#ff4d4f' }} />
          Deactivate Selected
        </Space>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'trending_on',
      label: (
        <Space>
          <FireOutlined style={{ color: '#fa8c16' }} />
          Mark as Trending
        </Space>
      ),
    },
    {
      key: 'trending_off',
      label: (
        <Space>
          <FireOutlined style={{ color: '#8c8c8c' }} />
          Remove from Trending
        </Space>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'category',
      label: (
        <Space>
          <FolderOutlined style={{ color: '#1890ff' }} />
          Change Category
        </Space>
      ),
    },
    {
      key: 'tags',
      label: (
        <Space>
          <TagsOutlined style={{ color: '#722ed1' }} />
          Update Tags
        </Space>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: (
        <Space>
          <DeleteOutlined style={{ color: '#ff4d4f' }} />
          Delete Selected
        </Space>
      ),
      danger: true,
    },
  ];

  // Add new category function
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      message.warning('Please enter a category name');
      return;
    }
    
    const trimmedName = newCategoryName.trim();
    
    // Check if category already exists
    if (categories.includes(trimmedName)) {
      message.warning('This category already exists');
      return;
    }
    
    setAddingNewCategory(true);
    
    try {
      // Add to categories array
      setCategories(prevCategories => [...prevCategories, trimmedName]);
      
      // Set the new category as selected in the bulk action form
      bulkActionForm.setFieldsValue({ category: trimmedName });
      
      // Close modal and reset
      setNewCategoryModalVisible(false);
      setNewCategoryName('');
      
      message.success(`Category "${trimmedName}" added successfully`);
      
    } catch (err) {
      console.error('Error adding category:', err);
      message.error('Failed to add category. Please try again.');
    } finally {
      setAddingNewCategory(false);
    }
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
      title: 'Video ID',
      dataIndex: 'videoId',
      key: 'videoId',
      render: (videoId) => (
        <Tooltip title="Click to copy">
          <Tag 
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigator.clipboard.writeText(videoId || '');
              message.success('Video ID copied to clipboard');
            }}
          >
            {videoId || 'N/A'}
          </Tag>
        </Tooltip>
      ),
      width: 120,
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
      title: 'isTrending',
      dataIndex: 'isTrending',
      key: 'isTrending',
      render: (isTrending) => (
        <Tag color={isTrending ? 'success' : 'error'}>
         {isTrending?'yes':'No'}
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Admin Dashboard</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => navigate('/admin/add-video')}
            >
              Add Video
            </Button>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={() => navigate('/admin/bulk-upload')}
            >
              Bulk Upload
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Space>
        </Col>
      </Row>
      
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
                placeholder="Search by title, tag, or video ID"
                allowClear
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onSearch={handleSearch}
                style={{ width: 300, marginRight: 16 }}
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
        
        {/* Bulk Actions Toolbar */}
        {selectedRowKeys.length > 0 && (
          <div style={{ 
            marginBottom: 16, 
            padding: '12px 16px', 
            backgroundColor: '#e6f7ff', 
            borderRadius: '6px',
            border: '1px solid #91d5ff'
          }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Text strong style={{ color: '#1890ff' }}>
                    {selectedRowKeys.length} video{selectedRowKeys.length !== 1 ? 's' : ''} selected
                  </Text>
                  <Button 
                    size="small" 
                    type="link" 
                    onClick={() => setSelectedRowKeys([])}
                  >
                    Clear Selection
                  </Button>
                </Space>
              </Col>
              <Col>
                <Dropdown
                  menu={{
                    items: bulkActionItems,
                    onClick: ({ key }) => handleBulkAction(key),
                  }}
                  trigger={['click']}
                >
                  <Button type="primary">
                    Bulk Actions <DownOutlined />
                  </Button>
                </Dropdown>
              </Col>
            </Row>
          </div>
        )}
        
        <Table
          columns={columns}
          dataSource={videos}
          rowKey="_id"
          rowSelection={rowSelection}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: loading ? <Spin /> : <Text type="secondary">No videos found</Text>
          }}
        />
      </Card>
      
      {/* Bulk Action Modal */}
      <Modal
        title={`Bulk Action: ${bulkActionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
        open={bulkActionModalVisible}
        onCancel={() => {
          setBulkActionModalVisible(false);
          bulkActionForm.resetFields();
          setNewCategoryModalVisible(false);
          setNewCategoryName('');
        }}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            This action will be applied to {selectedRowKeys.length} selected video{selectedRowKeys.length !== 1 ? 's' : ''}.
          </Text>
        </div>
        
        <Form
          form={bulkActionForm}
          layout="vertical"
          onFinish={executeBulkAction}
        >
          {bulkActionType === 'category' && (
            <Form.Item
              name="category"
              label="New Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select 
                placeholder="Select category"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <div
                      style={{
                        padding: '8px',
                        cursor: 'pointer',
                        color: '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => setNewCategoryModalVisible(true)}
                    >
                      <PlusOutlined />
                      Add New Category
                    </div>
                  </div>
                )}
              >
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          {bulkActionType === 'tags' && (
            <Form.Item
              name="tags"
              label="New Tags"
              rules={[{ required: true, message: 'Please enter tags' }]}
              extra="Comma-separated list of tags. This will replace existing tags."
            >
              <TextArea 
                rows={3} 
                placeholder="tag1, tag2, tag3"
              />
            </Form.Item>
          )}
          
          {bulkActionType === 'delete' && (
            <Alert
              message="Warning"
              description="This action will permanently delete the selected videos. This cannot be undone."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          {['activate', 'deactivate', 'trending_on', 'trending_off'].includes(bulkActionType) && (
            <Alert
              message="Confirmation"
              description={`Are you sure you want to ${bulkActionType.replace('_', ' ')} ${selectedRowKeys.length} video${selectedRowKeys.length !== 1 ? 's' : ''}?`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button 
                onClick={() => {
                  setBulkActionModalVisible(false);
                  bulkActionForm.resetFields();
                  setNewCategoryModalVisible(false);
                  setNewCategoryName('');
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={bulkActionLoading}
                danger={bulkActionType === 'delete'}
              >
                {bulkActionType === 'delete' ? 'Delete Videos' : 'Apply Changes'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
      
      {/* Add New Category Modal */}
      <Modal
        title="Add New Category"
        open={newCategoryModalVisible}
        onCancel={() => {
          setNewCategoryModalVisible(false);
          setNewCategoryName('');
        }}
        onOk={handleAddNewCategory}
        confirmLoading={addingNewCategory}
        okText="Add Category"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item
            label="Category Name"
            required
            rules={[
              { required: true, message: 'Please enter a category name' },
              { min: 2, message: 'Category name must be at least 2 characters' },
              { max: 50, message: 'Category name must be less than 50 characters' }
            ]}
          >
            <Input
              placeholder="Enter category name (e.g., Comedy, Documentary, Tutorial)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onPressEnter={handleAddNewCategory}
              maxLength={50}
              showCount
            />
          </Form.Item>
          
          <Alert
            message="Note"
            description="This category will be added to the list and can be used for future bulk actions and uploads."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard; 
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch, 
  Spin, 
  message, 
  Tooltip, 
  Alert,
  Tabs,
  Row,
  Col,
  Card,
  Divider,
  Badge,
  List,
  Drawer,
  ColorPicker,
  Empty,
  Checkbox,
  Pagination
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  OrderedListOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TagOutlined,
  DragOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
  BarsOutlined,
  CaretRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

// Draggable item component for reordering
const SortableItem = ({ id, section, isActive, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: '#fff',
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '4px',
    border: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: isActive ? 1 : 0.5,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '4px' }}>
          <DragOutlined />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong>{section.title}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {section.sectionType === 'category' ? `Category: ${section.category}` : `Type: ${section.sectionType}`}
          </Text>
        </div>
      </div>
      <div>
        <Space>
          <Tag color={section.isActive ? 'success' : 'default'}>
            {section.isActive ? 'Active' : 'Inactive'}
          </Tag>
          <Tag color="blue">{section.layout}</Tag>
          <Badge count={section.videos?.length || 0} size="small" />
          {children}
        </Space>
      </div>
    </div>
  );
};

const HomePageManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSection, setEditingSection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewSection, setPreviewSection] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [videoDrawerVisible, setVideoDrawerVisible] = useState(false);
  const [selectedSectionForVideos, setSelectedSectionForVideos] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [customBgColor, setCustomBgColor] = useState('#ffffff');
  const [totalVideos, setTotalVideos] = useState(0);

  // Initialize DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Fetch sections data
  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/home-sections');
      setSections(response.data.data.sections || []);
    } catch (err) {
      console.error('Error fetching home sections:', err);
      setError('Failed to load home sections. Please try again.');
      message.error('Failed to load home sections');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await axios.get('/api/videos/categories');
      setCategories(response.data.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      message.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch videos for selection
  const fetchVideos = async (query = '') => {
    setVideosLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) {
        params.append('search', query);
      }
      params.append('limit', '50');
      
      const response = await axios.get(`/api/videos?${params.toString()}`);
      setVideos(response.data.data.videos || []);
      setTotalVideos(response.data.data.total);
      return response.data.data.videos || [];
    } catch (err) {
      console.error('Error fetching videos:', err);
      message.error('Failed to load videos');
      return [];
    } finally {
      setVideosLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchSections();
    fetchCategories();
    
    // Fetch initial videos for selection
    const loadInitialVideos = async () => {
      const videos = await fetchVideos();
      setVideos(videos);
    };
    loadInitialVideos();
  }, []);

  // Handle section type change in form
  const handleSectionTypeChange = (value) => {
    const isCategoryType = value === 'category';
    
    // If changing to category type, make category field required
    if (isCategoryType) {
      form.validateFields(['category']);
    }
  };

  // Open video drawer for a section
  const showVideoDrawer = async (section) => {
    setSelectedSectionForVideos(section);
    setVideoDrawerVisible(true);
    
    // Reset selected videos
    setSelectedVideos([]);
    
    // Fetch all videos
    const allVideos = await fetchVideos();
    
    // Filter out videos already in the section
    const sectionVideoIds = section.videos?.map(v => v._id) || [];
    const filteredVideos = allVideos.filter(v => !sectionVideoIds.includes(v._id));
    
    setAvailableVideos(filteredVideos);
  };

  // Handle adding videos to section
  const handleAddVideosToSection = async () => {
    if (!selectedSectionForVideos || selectedVideos.length === 0) {
      return;
    }
    
    try {
      await axios.post(`/api/home-sections/${selectedSectionForVideos._id}/add-videos`, {
        videos: selectedVideos
      });
      
      message.success('Videos added to section successfully');
      setVideoDrawerVisible(false);
      fetchSections(); // Refresh data
    } catch (err) {
      console.error('Error adding videos to section:', err);
      message.error('Failed to add videos to section');
    }
  };

  // Handle removing a video from section
  const handleRemoveVideoFromSection = async (sectionId, videoId) => {
    confirm({
      title: 'Are you sure you want to remove this video from the section?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.post(`/api/home-sections/${sectionId}/remove-videos`, {
            videos: [videoId]
          });
          
          message.success('Video removed from section');
          fetchSections(); // Refresh data
        } catch (err) {
          console.error('Error removing video from section:', err);
          message.error('Failed to remove video from section');
        }
      }
    });
  };

  // Handle reordering sections
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s._id === active.id);
      const newIndex = sections.findIndex(s => s._id === over.id);
      
      // Reorder sections locally
      const reorderedSections = [...sections];
      const [removed] = reorderedSections.splice(oldIndex, 1);
      reorderedSections.splice(newIndex, 0, removed);
      
      // Update state immediately for better UX
      setSections(reorderedSections);
      
      // Save order to backend
      try {
        await axios.post('/api/home-sections/reorder', {
          sectionIds: reorderedSections.map(s => s._id)
        });
        
        message.success('Sections reordered successfully');
      } catch (err) {
        console.error('Error reordering sections:', err);
        message.error('Failed to reorder sections');
        
        // Revert to original order on error
        fetchSections();
      }
    }
  };

  // Show modal to add/edit section
  const showModal = (section = null) => {
    setEditingSection(section);
    
    if (section) {
      // Set form values for editing
      form.setFieldsValue({
        title: section.title,
        description: section.description,
        sectionType: section.sectionType,
        category: section.category,
        layout: section.layout,
        maxItems: section.maxItems,
        isActive: section.isActive,
        backgroundColor: section.backgroundColor,
        customCSS: section.customCSS,
        filterTags: section.filterTags?.join(', '),
        prioritySource: section.prioritySource,
        minViews: section.minViews
      });
      
      if (section.backgroundColor) {
        setCustomBgColor(section.backgroundColor);
      }
    } else {
      // Reset form for new section
      form.resetFields();
      setCustomBgColor('#ffffff');
    }
    
    setModalVisible(true);
  };

  // Handle submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Process tags if provided as comma-separated string
      if (typeof values.filterTags === 'string') {
        values.filterTags = values.filterTags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag);
      }
      
      // Set background color if provided
      if (customBgColor !== '#ffffff') {
        values.backgroundColor = customBgColor;
      }
      
      if (editingSection) {
        // Update existing section
        await axios.patch(`/api/home-sections/${editingSection._id}`, values);
        message.success('Section updated successfully');
      } else {
        // Create new section
        await axios.post('/api/home-sections', values);
        message.success('Section created successfully');
      }
      
      setModalVisible(false);
      fetchSections(); // Refresh data
    } catch (err) {
      console.error('Error saving section:', err);
      message.error('Failed to save section');
    }
  };

  // Handle delete section
  const handleDelete = (sectionId) => {
    confirm({
      title: 'Are you sure you want to delete this section?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.delete(`/api/home-sections/${sectionId}`);
          message.success('Section deleted successfully');
          fetchSections(); // Refresh data
        } catch (err) {
          console.error('Error deleting section:', err);
          message.error('Failed to delete section');
        }
      }
    });
  };

  // Handle toggling section active state
  const handleToggleActive = async (section) => {
    try {
      await axios.patch(`/api/home-sections/${section._id}`, {
        isActive: !section.isActive
      });
      
      message.success(`Section ${section.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchSections(); // Refresh data
    } catch (err) {
      console.error('Error updating section status:', err);
      message.error('Failed to update section status');
    }
  };

  // Helper function to get layout Icon
  const getLayoutIcon = (layout) => {
    switch (layout) {
      case 'grid':
        return <AppstoreOutlined />;
      case 'list':
        return <BarsOutlined />;
      case 'carousel':
        return <CaretRightOutlined />;
      case 'featured':
        return <CheckCircleOutlined />;
      default:
        return <AppstoreOutlined />;
    }
  };

  return (
    <div className="homepage-manager">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Home Page Manager</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            Add Section
          </Button>
          <Button
            icon={<OrderedListOutlined />}
            onClick={() => setReorderMode(!reorderMode)}
            type={reorderMode ? 'primary' : 'default'}
          >
            {reorderMode ? 'Exit Reorder Mode' : 'Reorder Sections'}
          </Button>
        </Space>
      </div>
      
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        Customize the home page by creating, editing, and arranging content sections.
        Each section can display videos based on different criteria or manually curated selections.
      </Text>
      
      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
      )}
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {reorderMode ? (
            <Card title="Drag sections to reorder" style={{ marginBottom: 16 }}>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={sections.map(s => s._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section) => (
                    <SortableItem 
                      key={section._id} 
                      id={section._id} 
                      section={section}
                      isActive={section.isActive}
                    >
                      <Space>
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => {
                            setPreviewSection(section);
                            setPreviewVisible(true);
                          }}
                          size="small"
                        />
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => showModal(section)}
                          size="small"
                          type="primary"
                        />
                      </Space>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
            </Card>
          ) : (
            <Table
              dataSource={sections}
              rowKey="_id"
              pagination={false}
              loading={loading}
              style={{ marginBottom: 16 }}
              columns={[
                {
                  title: 'Order',
                  dataIndex: 'displayOrder',
                  key: 'displayOrder',
                  width: 80,
                  render: (order) => <Badge count={order + 1} style={{ backgroundColor: '#52c41a' }} />
                },
                {
                  title: 'Title',
                  dataIndex: 'title',
                  key: 'title',
                  render: (text, record) => (
                    <div>
                      <Text strong>{text}</Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {record.description?.substring(0, 40)}{record.description?.length > 40 ? '...' : ''}
                        </Text>
                      </div>
                    </div>
                  )
                },
                {
                  title: 'Type',
                  dataIndex: 'sectionType',
                  key: 'sectionType',
                  width: 120,
                  render: (type, record) => (
                    <Tag color="blue">
                      {type === 'category' ? record.category : type}
                    </Tag>
                  )
                },
                {
                  title: 'Layout',
                  dataIndex: 'layout',
                  key: 'layout',
                  width: 120,
                  render: (layout) => (
                    <Tag icon={getLayoutIcon(layout)}>
                      {layout}
                    </Tag>
                  )
                },
                {
                  title: 'Videos',
                  key: 'videos',
                  width: 100,
                  render: (_, record) => {
                    const count = record.videos?.length || 0;
                    const isCustom = record.sectionType === 'custom';
                    
                    return (
                      <Tooltip title={isCustom ? "Manage videos" : "Dynamic content"}>
                        <Button 
                          type={isCustom ? "primary" : "default"}
                          size="small" 
                          onClick={() => isCustom && showVideoDrawer(record)}
                          icon={<VideoCameraOutlined />}
                        >
                          {count}
                        </Button>
                      </Tooltip>
                    );
                  }
                },
                {
                  title: 'Status',
                  dataIndex: 'isActive',
                  key: 'isActive',
                  width: 100,
                  render: (isActive) => (
                    <Tag color={isActive ? 'success' : 'default'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Tag>
                  )
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  width: 200,
                  render: (_, record) => (
                    <Space size="small">
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setPreviewSection(record);
                          setPreviewVisible(true);
                        }}
                        size="small"
                      />
                      <Button
                        icon={record.isActive ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                        onClick={() => handleToggleActive(record)}
                        size="small"
                      />
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        type="primary"
                        size="small"
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record._id)}
                        type="primary"
                        danger
                        size="small"
                      />
                    </Space>
                  )
                }
              ]}
            />
          )}
        </>
      )}
      
      {/* Add/Edit Section Modal */}
      <Modal
        title={editingSection ? 'Edit Section' : 'Add New Section'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={800}
        okText={editingSection ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: '',
            description: '',
            sectionType: 'custom',
            layout: 'carousel',
            maxItems: 12,
            isActive: true,
            backgroundColor: '',
            customCSS: '',
            filterTags: '',
            minViews: 0
          }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Basic Information" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="Section Title"
                    rules={[{ required: true, message: 'Please enter a title' }]}
                  >
                    <Input placeholder="e.g., Featured Videos" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="sectionType"
                    label="Section Type"
                    rules={[{ required: true, message: 'Please select a type' }]}
                  >
                    <Select onChange={handleSectionTypeChange}>
                      <Option value="custom">Custom (Manual selection)</Option>
                      <Option value="category">Category</Option>
                      <Option value="trending">Trending</Option>
                      <Option value="newest">Newest</Option>
                      <Option value="featured">Featured</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={2} placeholder="Optional description for this section" />
              </Form.Item>
              
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.sectionType !== currentValues.sectionType}
              >
                {({ getFieldValue }) => 
                  getFieldValue('sectionType') === 'category' ? (
                    <Form.Item
                      name="category"
                      label="Category"
                      rules={[{ required: true, message: 'Please select a category' }]}
                    >
                      <Select loading={categoriesLoading}>
                        {categories.map(category => (
                          <Option key={category} value={category}>{category}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="layout"
                    label="Layout"
                    rules={[{ required: true, message: 'Please select a layout' }]}
                  >
                    <Select>
                      <Option value="carousel">Carousel</Option>
                      <Option value="grid">Grid</Option>
                      <Option value="list">List</Option>
                      <Option value="featured">Featured</Option>
                      <Option value="banner">Banner</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxItems"
                    label="Maximum Items"
                    rules={[{ required: true, message: 'Please enter maximum items' }]}
                  >
                    <InputNumber min={1} max={24} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="isActive"
                label="Active"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </TabPane>
            
            <TabPane tab="Advanced Options" key="2">
              <Form.Item
                label="Background Color"
              >
                <ColorPicker 
                  value={customBgColor}
                  onChange={(color) => setCustomBgColor(color.toHexString())}
                  showText
                />
              </Form.Item>
              
              <Form.Item
                name="customCSS"
                label="Custom CSS"
                tooltip="Add custom CSS for this section (advanced)"
              >
                <TextArea rows={3} placeholder=".section-header { font-weight: bold; }" />
              </Form.Item>
              
              <Form.Item
                name="filterTags"
                label="Filter Tags"
                tooltip="Comma-separated tags to filter videos (e.g., gaming, tutorial)"
              >
                <Input placeholder="tag1, tag2, tag3" prefix={<TagOutlined />} />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="prioritySource"
                    label="Priority Source"
                    tooltip="Prefer videos from this source (e.g., YouTube)"
                  >
                    <Input placeholder="e.g., YouTube" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="minViews"
                    label="Minimum Views"
                    tooltip="Only show videos with at least this many views"
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
      
      {/* Preview Modal */}
      <Modal
        title="Section Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewSection && (
          <div style={{ 
            padding: '24px', 
            backgroundColor: previewSection.backgroundColor || '#ffffff',
            borderRadius: '8px'
          }}>
            <div className="section-header">
              <Title level={3}>{previewSection.title}</Title>
              {previewSection.description && (
                <Text type="secondary">{previewSection.description}</Text>
              )}
            </div>
            
            <Divider />
            
            <div style={{ 
              display: previewSection.layout === 'list' ? 'flex' : 'grid',
              flexDirection: previewSection.layout === 'list' ? 'column' : undefined,
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {previewSection.videos && previewSection.videos.length > 0 ? (
                previewSection.videos.slice(0, 5).map((video) => (
                  <Card 
                    key={video._id}
                    hoverable
                    style={{ marginBottom: previewSection.layout === 'list' ? '12px' : 0 }}
                    cover={
                      <img 
                        alt={video.title} 
                        src={video.thumbnailUrl} 
                        style={{ height: '120px', objectFit: 'cover' }}
                      />
                    }
                  >
                    <Card.Meta 
                      title={<Text ellipsis>{video.title}</Text>}
                      description={
                        <div>
                          <Tag color="blue">{video.category}</Tag>
                          <Text type="secondary">{video.views} views</Text>
                        </div>
                      }
                    />
                  </Card>
                ))
              ) : (
                <Empty description="No videos in this section" />
              )}
              
              {previewSection.videos && previewSection.videos.length > 5 && (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', marginTop: '16px' }}>
                  <Text type="secondary">And {previewSection.videos.length - 5} more videos...</Text>
                </div>
              )}
            </div>
            
            <Divider />
            
            <div style={{ marginTop: '16px' }}>
              <Text strong>Section Properties:</Text>
              <ul>
                <li>Type: {previewSection.sectionType}</li>
                <li>Layout: {previewSection.layout}</li>
                <li>Max Items: {previewSection.maxItems}</li>
                <li>Status: {previewSection.isActive ? 'Active' : 'Inactive'}</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Video Selection Drawer */}
      <Drawer
        title="Manage Section Videos"
        placement="right"
        onClose={() => setVideoDrawerVisible(false)}
        open={videoDrawerVisible}
        width={640}
        extra={
          <Button 
            type="primary" 
            onClick={handleAddVideosToSection}
            disabled={selectedVideos.length === 0}
          >
            Add Selected ({selectedVideos.length})
          </Button>
        }
      >
        {selectedSectionForVideos && (
          <>
            <Card title="Current Videos" style={{ marginBottom: 16 }}>
              {selectedSectionForVideos.videos && selectedSectionForVideos.videos.length > 0 ? (
                <List
                  dataSource={selectedSectionForVideos.videos}
                  renderItem={(video) => (
                    <List.Item
                      actions={[
                        <Button 
                          icon={<DeleteOutlined />} 
                          danger
                          onClick={() => handleRemoveVideoFromSection(selectedSectionForVideos._id, video._id)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            style={{ width: 60, height: 40, objectFit: 'cover' }}
                          />
                        }
                        title={video.title}
                        description={
                          <Space>
                            <Tag color="blue">{video.category}</Tag>
                            <Text type="secondary">{video.sourceWebsite}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No videos added yet" />
              )}
            </Card>
            
            <Card 
              title="Available Videos" 
              extra={
                <Input.Search
                  placeholder="Search videos"
                  onSearch={async (value) => {
                    const results = await fetchVideos(value);
                    
                    // Filter out videos already in the section
                    const sectionVideoIds = selectedSectionForVideos.videos?.map(v => v._id) || [];
                    const filteredResults = results.filter(v => !sectionVideoIds.includes(v._id));
                    
                    setAvailableVideos(filteredResults);
                  }}
                  style={{ width: 250 }}
                  loading={videosLoading}
                />
              }
            >
              <List
                dataSource={availableVideos}
                loading={videosLoading}
                renderItem={(video) => (
                  <List.Item
                    actions={[
                      <Checkbox
                        checked={selectedVideos.includes(video._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVideos([...selectedVideos, video._id]);
                          } else {
                            setSelectedVideos(selectedVideos.filter(id => id !== video._id));
                          }
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          style={{ width: 60, height: 40, objectFit: 'cover' }}
                        />
                      }
                      title={video.title}
                      description={
                        <Space>
                          <Tag color="blue">{video.category}</Tag>
                          <Text type="secondary">{video.sourceWebsite}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                pagination={{
                  pageSize: 100,
                  size: 'small'
                }}
              />
            </Card>
          </>
        )}
      </Drawer>
      
      {/* Modify pagination component */}
      <Pagination 
        total={totalVideos} 
        pageSize={100}  // Set page size to 100
        showSizeChanger={false}  // Remove page size selector
        showQuickJumper={false}  // Optional: remove quick jumper
      />
    </div>
  );
};

export default HomePageManager; 
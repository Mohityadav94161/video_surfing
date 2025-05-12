import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Typography, 
  Divider, 
  Select, 
  Pagination, 
  Spin, 
  Empty, 
  Alert,
  Space,
  Tag,
  Card,
  Button,
  Tooltip,
  Input,
  Drawer,
  Badge
} from 'antd';
import {
  FilterOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import './Home.css'; // Create this file for additional styling

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    sort: '-createdAt',
    search: ''
  });
  const [visibleFilters, setVisibleFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Compute if any filters are applied
  const hasActiveFilters = filters.category || filters.tag || filters.search;

  // Fetch categories and tags on mount
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          axios.get('/api/videos/categories'),
          axios.get('/api/videos/tags'),
        ]);
        setCategories(categoriesRes.data.data.categories || []);
        setTags(tagsRes.data.data.tags || []);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  // Fetch videos when filters or pagination changes
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { category, tag, sort, search } = filters;
        const { current, pageSize } = pagination;
        
        let url = `/api/videos?page=${current}&limit=${pageSize}&sort=${sort}`;
        
        if (category) {
          url += `&category=${category}`;
        }
        
        if (tag) {
          url += `&tag=${tag}`;
        }
        
        if (search) {
          url += `&search=${search}`;
        }
        
        const res = await axios.get(url);
        
        setVideos(res.data.data.videos || []);
        setPagination({
          ...pagination,
          total: res.data.total || 0,
        });
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [filters, pagination.current, pagination.pageSize]);

  const handleCategoryChange = (value) => {
    setFilters({ ...filters, category: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleTagChange = (value) => {
    setFilters({ ...filters, tag: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleSortChange = (value) => {
    setFilters({ ...filters, sort: value });
  };

  const handleSearchChange = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      tag: '',
      sort: '-createdAt',
      search: ''
    });
    setPagination({ ...pagination, current: 1 });
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      'Education': 'blue',
      'Entertainment': 'purple',
      'Gaming': 'geekblue',
      'Music': 'magenta',
      'News': 'orange',
      'Sports': 'green',
      'Technology': 'cyan',
      'Travel': 'gold',
      'Other': 'default',
    };
    return categoryColors[category] || 'default';
  };

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-views', label: 'Most Views' },
    { value: 'title', label: 'Title (A-Z)' }
  ];

  return (
    <div className="home-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <Title level={1} className="hero-title">Discover Amazing Videos</Title>
          <Text className="hero-subtitle">Explore a curated collection of videos from across the web</Text>
          <Search
            placeholder="Search for videos..."
            allowClear
            enterButton={<Button type="primary" icon={<SearchOutlined />}>Search</Button>}
            size="large"
            className="hero-search"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            onSearch={handleSearchChange}
          />
        </div>
      </div>
      
      {/* Filters Bar */}
      <Card className="filters-card">
        <div className="filters-row">
          <div className="filters-left">
            <Button 
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setVisibleFilters(true)}
              className="filter-button"
            >
              Filters
              {hasActiveFilters && <Badge status="processing" className="filter-badge" />}
            </Button>
            
            {/* Sort Dropdown - Always visible */}
            <Select
              placeholder="Sort by"
              value={filters.sort}
              onChange={handleSortChange}
              className="sort-select"
              suffixIcon={<SortAscendingOutlined />}
              dropdownMatchSelectWidth={false}
            >
              {sortOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
          
          <div className="filters-right">
            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <Tooltip title="Grid View">
                <Button
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('grid')}
                />
              </Tooltip>
              <Tooltip title="List View">
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<BarsOutlined />}
                  onClick={() => setViewMode('list')}
                />
              </Tooltip>
            </div>
            
            {/* Reset Filters Button - Only visible when filters are applied */}
            {hasActiveFilters && (
              <Tooltip title="Clear all filters">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={clearAllFilters}
                  className="reset-button"
                >
                  Reset
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
        
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="active-filters">
            <Text type="secondary">Active filters:</Text>
            <Space wrap size={[0, 8]} className="filter-tags">
              {filters.category && (
                <Tag 
                  color={getCategoryColor(filters.category)}
                  closable 
                  onClose={() => handleCategoryChange('')}
                >
                  Category: {filters.category}
                </Tag>
              )}
              {filters.tag && (
                <Tag 
                  color="blue" 
                  closable 
                  onClose={() => handleTagChange('')}
                >
                  Tag: {filters.tag}
                </Tag>
              )}
              {filters.search && (
                <Tag 
                  color="purple" 
                  closable 
                  onClose={() => handleSearchChange('')}
                >
                  Search: {filters.search}
                </Tag>
              )}
            </Space>
          </div>
        )}
      </Card>
      
      {/* Filter Drawer for Mobile */}
      <Drawer
        title="Filter Videos"
        placement="right"
        onClose={() => setVisibleFilters(false)}
        open={visibleFilters}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={clearAllFilters} icon={<CloseCircleOutlined />}>
              Clear All
            </Button>
            <Button type="primary" onClick={() => setVisibleFilters(false)}>
              Apply
            </Button>
          </div>
        }
      >
        <div className="drawer-filters">
          <div className="filter-group">
            <Text strong>Category</Text>
            <Select
              placeholder="Select Category"
              style={{ width: '100%', marginTop: 8 }}
              onChange={handleCategoryChange}
              value={filters.category || undefined}
              allowClear
            >
              {categories.map((category) => (
                <Option key={category} value={category}>
                  <Tag color={getCategoryColor(category)} style={{ marginRight: 8 }}>
                    {category}
                  </Tag>
                </Option>
              ))}
            </Select>
          </div>
          
          <div className="filter-group">
            <Text strong>Tags</Text>
            <Select
              placeholder="Select Tag"
              style={{ width: '100%', marginTop: 8 }}
              onChange={handleTagChange}
              value={filters.tag || undefined}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {tags.map((tag) => (
                <Option key={tag.name} value={tag.name}>
                  {tag.name} ({tag.count})
                </Option>
              ))}
            </Select>
          </div>
          
          <div className="filter-group">
            <Text strong>Sort By</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              onChange={handleSortChange}
              value={filters.sort}
            >
              {sortOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Drawer>
      
      {/* Error Message */}
      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
      )}
      
      {/* Loading Spinner */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text className="loading-text">Loading videos...</Text>
        </div>
      ) : videos.length === 0 ? (
        <Empty 
          description="No videos found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="empty-container"
        />
      ) : (
        <>
          {/* Video Grid */}
          <div className={`videos-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
            {videos.map((video) => (
              <div 
                key={video._id} 
                className={`video-item ${viewMode === 'list' ? 'list-item' : 'grid-item'}`}
              >
                <VideoCard video={video} viewMode={viewMode} />
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="pagination-container">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePaginationChange}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={['12', '24', '36', '48']}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Home; 
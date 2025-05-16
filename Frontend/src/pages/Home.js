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
  ReloadOutlined,
  PlayCircleOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import { Link } from 'react-router-dom';
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
  const [homeSections, setHomeSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError, setSectionsError] = useState(null);

  // Compute if any filters are applied
  const hasActiveFilters = filters.category || filters.tag || filters.search;

  // Fetch home sections on mount
  useEffect(() => {
    const fetchHomeSections = async () => {
      setSectionsLoading(true);
      setSectionsError(null);
      
      try {
        const response = await axios.get('/api/home-sections/active');
        setHomeSections(response.data.data.sections || []);
      } catch (err) {
        console.error('Error fetching home sections:', err);
        setSectionsError('Failed to load personalized sections. Showing default content instead.');
      } finally {
        setSectionsLoading(false);
      }
    };
    
    fetchHomeSections();
  }, []);

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
    <div className="ph-homepage" style={{
      width: '100vw',
      minHeight: '100vh',
      overflowX: 'hidden',
      padding: '20px 0'
    }}>
      <div className="main-content">

        {/* Trending Videos
        <div className="video-section">
          <div className="section-header">
            <h2 className="section-title">
              <FireOutlined style={{ marginRight: 8, color: '#ff9000' }} />
              {homeSections[1]?.title}
            </h2>
            <Link to="/trending" className="see-all">
              See All <PlayCircleOutlined />
            </Link>
          </div>
          <div className="video-grid">
            {homeSections[1]?.videos.map((video, index) => (
              <div className="video-item" key={`trend-${index}`}>
                <div className="video-thumb">
                  <img src={video.thumbnail} alt="Thumbnail" />
                  <span className="video-duration">{video.duration}</span>
                </div>
                <div className="video-info">
                  <div className="video-title">{video.title}</div>
                  <div className="video-stats">
                    <PlayCircleOutlined style={{ fontSize: 12 }} />
                    {video.views}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Categories Section
        <div className="video-section">
          <div className="section-header">
            <h2 className="section-title">{homeSections[2]?.title}</h2>
            <Link to="/categories" className="see-all">
              All Categories
            </Link>
          </div>
          <div className="categories-grid">
            {homeSections[2]?.categories.map((category, index) => (
              <Link 
                to={`/category/${category.name.toLowerCase()}`} 
                className="category-item" 
                key={`cat-${index}`}
              >
                <img
                  className="category-thumb"
                  src={category.thumbnail}
                  alt={category.name}
                />
                <span className="category-name">{category.name}</span>
              </Link>
            ))}
          </div>
        </div> */}

        {/* Add this section above the video grids */}
        <div className="category-strip">
          <div className="category-items">
            {['Recommended', 'Trending', 'New', 'VR', '4K', 'HD', 'Live', 'Premium'].map((cat) => (
              <Link 
                to={`/category/${cat.toLowerCase()}`} 
                className="category-link"
                key={cat}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>


      
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
          {/* Main Video Grid */}
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

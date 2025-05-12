import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Typography, 
  Input, 
  Divider, 
  Select, 
  Pagination, 
  Spin, 
  Empty, 
  Alert,
  Card,
  Button
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import VideoCard from '../components/VideoCard';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const queryFromUrl = queryParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [filters, setFilters] = useState({
    category: queryParams.get('category') || '',
    sort: queryParams.get('sort') || '-createdAt',
  });
  const [categories, setCategories] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/videos/categories');
        setCategories(response.data.data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Search videos when query or filters change
  useEffect(() => {
    const fetchVideos = async () => {
      if (!searchQuery.trim()) {
        setVideos([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { category, sort } = filters;
        const { current, pageSize } = pagination;
        
        let url = `/api/videos?search=${encodeURIComponent(searchQuery)}&page=${current}&limit=${pageSize}&sort=${sort}`;
        
        if (category) {
          url += `&category=${category}`;
        }
        
        const res = await axios.get(url);
        
        setVideos(res.data.data.videos || []);
        setPagination({
          ...pagination,
          total: res.data.total || 0,
        });
      } catch (err) {
        console.error('Error searching videos:', err);
        setError('Failed to search videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchVideos();
      
      // Update URL with search parameters
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (filters.category) params.set('category', filters.category);
      if (filters.sort) params.set('sort', filters.sort);
      
      navigate(`/search?${params.toString()}`, { replace: true });
    }
  }, [searchQuery, filters, pagination.current, pagination.pageSize, navigate]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleCategoryChange = (value) => {
    setFilters({ ...filters, category: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleSortChange = (value) => {
    setFilters({ ...filters, sort: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  return (
    <div>
      <Title level={2}>Search Videos</Title>
      
      <Search
        placeholder="Search for videos..."
        allowClear
        enterButton={<Button type="primary" icon={<SearchOutlined />}>Search</Button>}
        size="large"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onSearch={handleSearch}
        style={{ marginBottom: 20 }}
      />
      
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12}>
          <Select
            placeholder="Filter by Category"
            style={{ width: '100%' }}
            onChange={handleCategoryChange}
            value={filters.category || undefined}
            allowClear
          >
            {categories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Col>
        
        <Col xs={24} sm={12}>
          <Select
            placeholder="Sort By"
            style={{ width: '100%' }}
            onChange={handleSortChange}
            value={filters.sort}
          >
            <Option value="-createdAt">Newest First</Option>
            <Option value="createdAt">Oldest First</Option>
            <Option value="-views">Most Views</Option>
            <Option value="title">Title (A-Z)</Option>
          </Select>
        </Col>
      </Row>
      
      <Divider />
      
      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <Empty 
            description={
              searchQuery 
                ? "No videos found matching your search criteria" 
                : "Enter a search term to find videos"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <Text>Found {pagination.total} video{pagination.total !== 1 ? 's' : ''}</Text>
          </div>
          
          <Row gutter={[16, 16]}>
            {videos.map((video) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={video._id}>
                <VideoCard video={video} />
              </Col>
            ))}
          </Row>
          
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
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

export default SearchPage; 
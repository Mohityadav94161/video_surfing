import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Card,
  Button
} from 'antd';
import axiosInstance from '../utils/axiosConfig';
import VideoCard from '../components/VideoCard';

const { Title, Text } = Typography;
const { Option } = Select;
const useQuery = () => new URLSearchParams(useLocation().search);

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();

  // Initialize state from URL
  const [searchQuery, setSearchQuery] = useState(query.get("q") || "");
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('none');
  const [exactMatches, setExactMatches] = useState(0);

  const [pagination, setPagination] = useState({
    current: parseInt(query.get("page")) || 1,
    pageSize: parseInt(query.get("limit")) || 12,
    total: 0,
  });

  const [filters, setFilters] = useState({
    category: query.get("category") || "",
    sort: query.get("sort") || "-createdAt",
    tag: query.get("tag") || "",
    videoId: query.get("videoId") || "",
    fields: query.get("fields") || "",
  });

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/videos/categories");
        setCategories(response.data.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Update searchQuery when URL query parameter changes
  useEffect(() => {
    const queryParam = query.get("q");
    if (queryParam && queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [location.search]);

  // Fetch videos on query/filter/pagination change
  useEffect(() => {
    const fetchVideos = async () => {
      if (!searchQuery.trim()) {
        setVideos([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { current, pageSize } = pagination;

        const res = await axiosInstance.get("/videos", {
          params: {
            search: searchQuery,
            category: filters.category,
            tag: filters.tag,
            sort: filters.sort,
            videoId: filters.videoId,
            fields: filters.fields,
            page: current,
            limit: pageSize,
          },
        });

        setVideos(res.data.data.videos || []);
        setSearchType(res.data.searchType || 'none');
        setExactMatches(res.data.exactMatches || 0);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total || 0,
        }));
      } catch (err) {
        console.error("Error searching videos:", err);
        setError("Failed to search videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();

    // Sync URL
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filters.category) params.set("category", filters.category);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.videoId) params.set("videoId", filters.videoId);
    if (filters.fields) params.set("fields", filters.fields);
    params.set("page", pagination.current);
    params.set("limit", pagination.pageSize);

    navigate(`/search?${params.toString()}`, { replace: true });
  }, [searchQuery, filters, pagination.current, pagination.pageSize]);

  // Handle filter changes
  const handleCategoryChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleSortChange = (value) => {
    setFilters((prev) => ({ ...prev, sort: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTagChange = (value) => {
    setFilters((prev) => ({ ...prev, tag: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <Title level={2}>Search Results for "{searchQuery}"</Title>

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
          {/* Search Results Header */}
          <div style={{ marginBottom: 16 }}>
            {searchType === 'exact' && (
              <Text>Found {pagination.total} video{pagination.total !== 1 ? 's' : ''} matching "{searchQuery}"</Text>
            )}
            {searchType === 'related' && (
              <div>
                <Alert
                  message="No exact matches found"
                  description={`Showing ${videos.length} related videos for "${searchQuery}"`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </div>
            )}
            {searchType === 'mixed' && (
              <div>
                <Text>Found {exactMatches} exact match{exactMatches !== 1 ? 'es' : ''} for "{searchQuery}"</Text>
                <br />
                <Text type="secondary">+ {videos.length - exactMatches} related videos</Text>
              </div>
            )}
            {searchType === 'suggestions' && (
              <div>
                <Alert
                  message="No matches found"
                  description={`No videos found for "${searchQuery}". Here are some popular videos you might like:`}
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </div>
            )}
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
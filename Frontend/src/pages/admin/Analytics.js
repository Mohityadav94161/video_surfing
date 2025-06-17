import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tabs, 
  Spin, 
  Alert, 
  Space, 
  DatePicker, 
  Button,
  Select,
  Tag,
  List,
  Avatar,
  Divider,
  Progress
} from 'antd';
import {
  AreaChartOutlined,
  GlobalOutlined,
  UserOutlined,
  ClockCircleOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  ApiOutlined,
  AimOutlined,
  ReloadOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import axios from '../../utils/axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trafficData, setTrafficData] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    topCountries: [],
    visitorsByDevice: [],
    visitorsByTime: [],
    recentVisitors: []
  });
  const [dateRange, setDateRange] = useState([null, null]);
  const [topPages, setTopPages] = useState([]);
  const [referrers, setReferrers] = useState([]);
  
  // Mock data for development (replace with actual API calls)
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get date range parameters if set
      let params = {};
      if (dateRange[0] && dateRange[1]) {
        params = {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        };
      }
      
      // Fetch real data from API endpoints
      const [trafficResponse, visitorsResponse, locationResponse, performanceResponse] = await Promise.all([
        axios.get('/analytics/traffic', { params }),
        axios.get('/analytics/visitors', { params }),
        axios.get('/analytics/location', { params }),
        axios.get('/analytics/performance', { params })
      ]);
      
      // Process traffic data
      setTrafficData({
        totalVisits: trafficResponse.data.data.totalVisits,
        uniqueVisitors: trafficResponse.data.data.uniqueVisitors,
        pageViews: trafficResponse.data.data.pageViews,
        avgSessionDuration: trafficResponse.data.data.avgSessionDuration,
        bounceRate: trafficResponse.data.data.bounceRate,
        visitorsByDevice: trafficResponse.data.data.visitorsByDevice,
        visitorsByTime: trafficResponse.data.data.visitorsByTime,
        topCountries: locationResponse.data.data.topCountries,
        recentVisitors: visitorsResponse.data.data.recentVisitors
      });
      
      // Set top pages and referrers
      setTopPages(trafficResponse.data.data.topPages || []);
      setReferrers(trafficResponse.data.data.referrers || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  // Format seconds to "mm:ss" format
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get device icon
  const getDeviceIcon = (device) => {
    switch (device) {
      case 'Desktop':
        return <LaptopOutlined />;
      case 'Mobile':
        return <MobileOutlined />;
      case 'Tablet':
        return <TabletOutlined />;
      default:
        return <LaptopOutlined />;
    }
  };
  
  // Render traffic overview cards
  const renderTrafficOverview = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8} xl={6}>
        <Card>
          <Statistic
            title="Total Visits"
            value={trafficData.totalVisits}
            prefix={<BarChartOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8} xl={6}>
        <Card>
          <Statistic
            title="Unique Visitors"
            value={trafficData.uniqueVisitors}
            prefix={<UserOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8} xl={6}>
        <Card>
          <Statistic
            title="Page Views"
            value={trafficData.pageViews}
            prefix={<AreaChartOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8} xl={6}>
        <Card>
          <Statistic
            title="Avg. Session Duration"
            value={formatDuration(trafficData.avgSessionDuration)}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
  
  // Location analytics columns
  const locationColumns = [
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      render: (country) => (
        <Space>
          <GlobalOutlined />
          <span>{country}</span>
        </Space>
      ),
    },
    {
      title: 'Visitors',
      dataIndex: 'visitors',
      key: 'visitors',
      sorter: (a, b) => a.visitors - b.visitors,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => `${percentage}%`,
      sorter: (a, b) => a.percentage - b.percentage,
    },
    {
      title: 'Distribution',
      dataIndex: 'percentage',
      key: 'distribution',
      render: (percentage) => <Progress percent={percentage} showInfo={false} strokeWidth={5} />,
    },
  ];
  
  // Recent visitors columns
  const visitorColumns = [
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
      render: (ip) => (
        <Space>
          <ApiOutlined />
          <Text copyable>{ip}</Text>
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => (
        <Space>
          <AimOutlined />
          <span>{location}</span>
        </Space>
      ),
    },
    {
      title: 'Browser/OS',
      key: 'system',
      render: (_, record) => (
        <span>
          {record.browser} / {record.os}
        </span>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => (
        <Space>
          <ClockCircleOutlined />
          <span>{timestamp}</span>
        </Space>
      ),
    },
    {
      title: 'Page',
      dataIndex: 'page',
      key: 'page',
    },
  ];
  
  // Top pages columns
  const pageColumns = [
    {
      title: 'Page',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Page Views',
      dataIndex: 'pageviews',
      key: 'pageviews',
      sorter: (a, b) => a.pageviews - b.pageviews,
    },
    {
      title: 'Avg. Time',
      dataIndex: 'avgTime',
      key: 'avgTime',
      render: (time) => `${time}s`,
      sorter: (a, b) => a.avgTime - b.avgTime,
    },
    {
      title: 'Bounce Rate',
      dataIndex: 'bounceRate',
      key: 'bounceRate',
      render: (rate) => `${rate}%`,
      sorter: (a, b) => a.bounceRate - b.bounceRate,
    },
  ];

  // Referrer columns
  const referrerColumns = [
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Visitors',
      dataIndex: 'visitors',
      key: 'visitors',
      sorter: (a, b) => a.visitors - b.visitors,
    },
    {
      title: 'Conversion Rate',
      dataIndex: 'conversion',
      key: 'conversion',
      render: (rate) => `${rate}%`,
    },
  ];
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}>Website Analytics</Title>
        <Space>
          <RangePicker 
            value={dateRange}
            onChange={setDateRange}
          />
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchAnalyticsData}
          >
            Refresh
          </Button>
        </Space>
      </div>
      
      {error && (
        <Alert 
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Tabs defaultActiveKey="1">
          <TabPane tab="Traffic Overview" key="1">
            {renderTrafficOverview()}
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card title="Traffic by Device" bordered={false}>
                  <List
                    dataSource={trafficData.visitorsByDevice}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={getDeviceIcon(item.device)}
                          title={item.device}
                          description={`${item.count} visitors (${item.percentage}%)`}
                        />
                        <Progress percent={item.percentage} showInfo={false} strokeWidth={5} />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Traffic by Time" bordered={false}>
                  <Table 
                    dataSource={trafficData.visitorsByTime}
                    columns={[
                      { 
                        title: 'Time Period',
                        dataIndex: 'hour',
                        key: 'hour'
                      },
                      {
                        title: 'Visitors',
                        dataIndex: 'visitors',
                        key: 'visitors'
                      },
                      {
                        title: 'Distribution',
                        dataIndex: 'visitors',
                        key: 'distribution',
                        render: (visitors) => {
                          const max = Math.max(...trafficData.visitorsByTime.map(t => t.visitors));
                          const percentage = (visitors / max) * 100;
                          return <Progress percent={percentage} showInfo={false} strokeWidth={5} />;
                        }
                      }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="Top Pages" bordered={false}>
                  <Table 
                    dataSource={topPages}
                    columns={pageColumns}
                    pagination={false}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="Traffic Sources" bordered={false}>
                  <Table 
                    dataSource={referrers}
                    columns={referrerColumns}
                    pagination={false}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab="Location Analytics" key="2">
            <Card title="Visitor Distribution by Country" bordered={false}>
              <Table 
                dataSource={trafficData.topCountries}
                columns={locationColumns}
                pagination={false}
              />
            </Card>
            
            <Divider orientation="left">Map Visualization</Divider>
            <Paragraph>
              A real implementation would include a world map visualization showing visitor distribution.
              This could be implemented using libraries like react-simple-maps or a more comprehensive
              solution like react-chartjs-2.
            </Paragraph>
          </TabPane>
          
          <TabPane tab="User Tracking" key="3">
            <Card title="Recent Visitors" bordered={false}>
              <Table 
                dataSource={trafficData.recentVisitors}
                columns={visitorColumns}
                pagination={{ pageSize: 10 }}
              />
            </Card>
            
            <Card title="Digital Footprints" style={{ marginTop: 16 }} bordered={false}>
              <Paragraph>
                This section would contain detailed user session data, including:
              </Paragraph>
              <ul>
                <li>User session recordings</li>
                <li>Click heatmaps</li>
                <li>Navigation paths</li>
                <li>Form interactions</li>
                <li>Error encounters</li>
              </ul>
              <Paragraph>
                In a complete implementation, you would integrate with services like Hotjar, Clarity, 
                or implement custom tracking using your backend.
              </Paragraph>
            </Card>
          </TabPane>
          
          <TabPane tab="Performance Insights" key="4">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Avg. Page Load Time"
                    value="1.24s"
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Server Response Time"
                    value="0.43s"
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Error Rate"
                    value="0.31%"
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            
            <Card title="Performance Metrics" style={{ marginTop: 16 }} bordered={false}>
              <Paragraph>
                This section would display detailed performance metrics such as:
              </Paragraph>
              <ul>
                <li>Core Web Vitals (LCP, FID, CLS)</li>
                <li>API response times</li>
                <li>Resource loading statistics</li>
                <li>JavaScript execution times</li>
                <li>Memory usage</li>
              </ul>
              <Paragraph>
                In a production environment, this would be connected to real monitoring systems.
              </Paragraph>
            </Card>
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default Analytics; 
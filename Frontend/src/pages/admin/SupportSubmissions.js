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
  Tabs,
  Drawer,
  Form,
  Badge,
  DatePicker,
  Divider
} from 'antd';
import { 
  MailOutlined, 
  TeamOutlined, 
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  SendOutlined,
  SyncOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const SupportSubmissions = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    resolvedSubmissions: 0,
    contactSubmissions: 0,
    partnershipSubmissions: 0,
    removalSubmissions: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [statusUpdateForm] = Form.useForm();
  const [error, setError] = useState(null);

  // Fetch submissions and stats data
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
        
        if (filters.type) {
          params.set('type', filters.type);
        }
        
        if (filters.status) {
          params.set('status', filters.status);
        }
        
        // Add pagination params
        params.set('page', pagination.current);
        params.set('limit', pagination.pageSize);
        
        // Get submissions with filters and pagination
        // console.log('Making request to:', `/support/submissions?${params.toString()}`);
        // console.log('Axios baseURL:', axiosInstance.defaults.baseURL);
        const submissionsResponse = await axiosInstance.get(`/support/submissions?${params.toString()}`);
        
        // Get stats data
        // console.log('Making request to:', '/support/stats');
        const statsResponse = await axiosInstance.get('/support/stats');
        
        // Process submissions data
        const submissionsData = submissionsResponse.data.data.submissions;
        const totalSubmissions = submissionsResponse.data.data.pagination.total || 0;
        
        // Process stats data
        const statsData = statsResponse.data.data.stats;
        
        // Update state
        setSubmissions(submissionsData);
        setStats(statsData);
        
        setPagination({
          ...pagination,
          total: totalSubmissions,
        });
        
      } catch (err) {
        console.error('Error fetching submissions data:', err);
        setError('Failed to load submissions data. Please try again.');
        message.error('Failed to load submissions data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, pagination.current, pagination.pageSize]);

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

  const handleTypeFilter = (value) => {
    setFilters({ ...filters, type: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleStatusFilter = (value) => {
    setFilters({ ...filters, status: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleRefresh = () => {
    setPagination({ ...pagination, current: 1 });
    setFilters({
      search: '',
      type: '',
      status: ''
    });
  };

  const handleViewDetails = (submission) => {
    setCurrentSubmission(submission);
    setDetailDrawerVisible(true);
    
    // Pre-fill the status update form
    statusUpdateForm.setFieldsValue({
      status: submission.status,
      adminNotes: submission.adminNotes || ''
    });
  };

  const handleDeleteSubmission = async (submissionId) => {
    try {
      await axiosInstance.delete(`/support/submissions/${submissionId}`);
      
      // Update the UI
      setSubmissions(prevSubmissions => prevSubmissions.filter(submission => submission._id !== submissionId));
      setStats(prev => ({ ...prev, totalSubmissions: prev.totalSubmissions - 1 }));
      
      message.success('Submission deleted successfully');
      
      // Close drawer if the deleted submission was being viewed
      if (currentSubmission && currentSubmission._id === submissionId) {
        setDetailDrawerVisible(false);
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      message.error('Failed to delete submission');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const values = await statusUpdateForm.validateFields();
      
      if (!currentSubmission) return;
      
      const response = await axiosInstance.patch(`/support/submissions/${currentSubmission._id}`, {
        status: values.status,
        adminNotes: values.adminNotes
      });
      
      if (response.data.status === 'success') {
        // Update the UI
        setSubmissions(prevSubmissions => 
          prevSubmissions.map(submission => 
            submission._id === currentSubmission._id 
              ? { ...submission, status: values.status, adminNotes: values.adminNotes } 
              : submission
          )
        );
        
        // Update the current submission in the drawer
        setCurrentSubmission({ ...currentSubmission, status: values.status, adminNotes: values.adminNotes });
        
        message.success('Submission status updated successfully');
      } else {
        message.error('Failed to update submission status');
      }
    } catch (err) {
      console.error('Error updating submission status:', err);
      message.error('Failed to update submission status');
    }
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Render status tag with appropriate color
  const renderStatusTag = (status) => {
    let color;
    let icon;
    
    switch (status) {
      case 'pending':
        color = 'gold';
        icon = <ClockCircleOutlined />;
        break;
      case 'in-progress':
        color = 'blue';
        icon = <FileSearchOutlined />;
        break;
      case 'resolved':
        color = 'green';
        icon = <CheckCircleOutlined />;
        break;
      case 'rejected':
        color = 'red';
        icon = <ExclamationCircleOutlined />;
        break;
      default:
        color = 'default';
        icon = <ClockCircleOutlined />;
    }
    
    return (
      <Tag color={color} icon={icon} style={{ textTransform: 'capitalize' }}>
        {status.replace('-', ' ')}
      </Tag>
    );
  };

  // Render type tag with appropriate color and icon
  const renderTypeTag = (type) => {
    let color;
    let icon;
    let text;
    
    switch (type) {
      case 'contact-us':
        color = 'purple';
        icon = <MailOutlined />;
        text = 'Contact';
        break;
      case 'partnership-program':
        color = 'blue';
        icon = <TeamOutlined />;
        text = 'Partnership';
        break;
      case 'content-removal':
        color = 'red';
        icon = <DeleteOutlined />;
        text = 'Content Removal';
        break;
      default:
        color = 'default';
        icon = <MessageOutlined />;
        text = type;
    }
    
    return (
      <Tag color={color} icon={icon}>
        {text}
      </Tag>
    );
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => renderTypeTag(type),
      width: 150,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#999' }}>{record.email}</small>
        </div>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatusTag(status),
      width: 130,
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this submission?"
              onConfirm={() => handleDeleteSubmission(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="danger"
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render the details drawer content
  const renderDrawerContent = () => {
    if (!currentSubmission) return null;
    
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Title level={4} style={{ margin: 0 }}>
              {renderTypeTag(currentSubmission.type)}
              <span style={{ marginLeft: '8px' }}>{currentSubmission.subject}</span>
            </Title>
            {renderStatusTag(currentSubmission.status)}
          </div>
          <div>
            <Text strong>From:</Text> {currentSubmission.name} ({currentSubmission.email})
          </div>
          <div>
            <Text strong>Submitted:</Text> {formatDate(currentSubmission.createdAt)}
          </div>
          {currentSubmission.username !== 'guest' && (
            <div>
              <Text strong>Username:</Text> {currentSubmission.username}
            </div>
          )}
        </div>

        <Divider />
        
        <Tabs defaultActiveKey="message">
          <TabPane tab="Message" key="message">
            <Card style={{ marginBottom: '16px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
                {currentSubmission.message}
              </pre>
            </Card>
          </TabPane>
          
          {currentSubmission.additionalData && Object.keys(currentSubmission.additionalData).length > 0 && (
            <TabPane tab="Additional Data" key="additionalData">
              <Card>
                {Object.entries(currentSubmission.additionalData).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '8px' }}>
                    <Text strong style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}:</Text>
                    <div style={{ marginLeft: '16px' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                      </pre>
                    </div>
                  </div>
                ))}
              </Card>
            </TabPane>
          )}
        </Tabs>
        
        <Divider />
        
        <Form
          form={statusUpdateForm}
          layout="vertical"
          initialValues={{
            status: currentSubmission.status,
            adminNotes: currentSubmission.adminNotes || ''
          }}
          onFinish={handleStatusUpdate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="in-progress">In Progress</Option>
                  <Option value="resolved">Resolved</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Status
                </Button>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="adminNotes"
            label="Admin Notes"
          >
            <TextArea rows={4} placeholder="Add private notes about this submission..." />
          </Form.Item>
        </Form>
      </div>
    );
  };

  return (
    <div className="admin-content">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>Support Submissions</Title>
        </Col>
        
        {/* Stats Cards */}
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Total Submissions"
              value={stats.totalSubmissions}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Pending"
              value={stats.pendingSubmissions}
              prefix={<Badge status="warning" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Resolved"
              value={stats.resolvedSubmissions}
              prefix={<Badge status="success" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Contact"
              value={stats.contactSubmissions}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Partnership"
              value={stats.partnershipSubmissions}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="Content Removal"
              value={stats.removalSubmissions}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
        
        {/* Filters */}
        <Col span={24}>
          <Card>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <Input.Search
                  placeholder="Search by name, email, or message"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onSearch={handleSearch}
                  allowClear
                />
              </Col>
              <Col xs={12} md={5}>
                <Select
                  placeholder="Filter by type"
                  style={{ width: '100%' }}
                  value={filters.type}
                  onChange={handleTypeFilter}
                  allowClear
                >
                  <Option value="contact-us">Contact</Option>
                  <Option value="partnership-program">Partnership</Option>
                  <Option value="content-removal">Content Removal</Option>
                </Select>
              </Col>
              <Col xs={12} md={5}>
                <Select
                  placeholder="Filter by status"
                  style={{ width: '100%' }}
                  value={filters.status}
                  onChange={handleStatusFilter}
                  allowClear
                >
                  <Option value="pending">Pending</Option>
                  <Option value="in-progress">In Progress</Option>
                  <Option value="resolved">Resolved</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </Col>
              <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  style={{ marginRight: '8px' }}
                >
                  Reset Filters
                </Button>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={() => setPagination({ ...pagination, current: 1 })}
                >
                  Apply Filters
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
        
        {/* Submissions Table */}
        <Col span={24}>
          <Card>
            {error ? (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                action={
                  <Button size="small" type="primary" onClick={handleRefresh}>
                    Retry
                  </Button>
                }
              />
            ) : (
              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={submissions}
                  rowKey="_id"
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Total ${total} submissions`,
                  }}
                  onChange={handleTableChange}
                />
              </Spin>
            )}
          </Card>
        </Col>
      </Row>
      
      {/* Submission Details Drawer */}
      <Drawer
        title="Submission Details"
        placement="right"
        width={600}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        extra={
          <Space>
            <Popconfirm
              title="Are you sure you want to delete this submission?"
              onConfirm={() => {
                if (currentSubmission) {
                  handleDeleteSubmission(currentSubmission._id);
                }
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        {renderDrawerContent()}
      </Drawer>
    </div>
  );
};

export default SupportSubmissions; 
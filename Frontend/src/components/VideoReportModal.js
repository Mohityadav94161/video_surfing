import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Alert,
  Typography,
  Space,
  Row,
  Col,
  message
} from 'antd';
import { 
  ExclamationCircleOutlined,
  SafetyOutlined 
} from '@ant-design/icons';
import axios from '../utils/axiosConfig';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const VideoReportModal = ({ visible, onCancel, video }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reportCategories = [
    { value: 'content-removal', label: 'Content Removal', description: 'Request removal of this video content' },
    { value: 'report', label: 'Report Content', description: 'Report inappropriate or harmful content' },
    { value: 'enquire', label: 'General Enquiry', description: 'Ask questions about this video or platform' },
    { value: 'inappropriate-content', label: 'Inappropriate Content', description: 'Adult content, violence, or disturbing material' },
    { value: 'copyright-violation', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted material' },
    { value: 'misleading-content', label: 'Misleading Content', description: 'False information or clickbait' },
    { value: 'spam', label: 'Spam', description: 'Repetitive or promotional content' },
    { value: 'malware-phishing', label: 'Malware/Phishing', description: 'Suspicious links or malicious content' },
    { value: 'privacy-violation', label: 'Privacy Violation', description: 'Personal information shared without consent' },
    { value: 'illegal-content', label: 'Illegal Content', description: 'Content that violates laws' },
    { value: 'other', label: 'Other', description: 'Other issues not listed above' }
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const reportData = {
        type: 'video-report',
        name: values.name,
        email: values.email,
        subject: `Video Report: ${values.category}`,
        message: values.message,
        additionalData: {
          videoId: video._id,
          videoTitle: video.title,
          videoUrl: video.originalUrl,
          reportCategory: values.category,
          videoThumbnail: video.thumbnailUrl,
          sourceWebsite: video.sourceWebsite,
          reportedAt: new Date().toISOString()
        }
      };

      await axios.post('/support/submissions', reportData);
      
      setSubmitted(true);
      message.success('Report submitted successfully. We will review it shortly.');
      
      // Reset form and close modal after a delay
      setTimeout(() => {
        form.resetFields();
        setSubmitted(false);
        onCancel();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      message.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setSubmitted(false);
    onCancel();
  };

  if (submitted) {
    return (
      <Modal
        title={
          <Space>
            <SafetyOutlined style={{ color: '#52c41a' }} />
            Report Submitted
          </Space>
        }
        open={visible}
        footer={null}
        onCancel={handleModalCancel}
        width={500}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Alert
            message="Thank you for your report"
            description="We take all reports seriously and will review this content within 24-48 hours. If immediate action is required, please contact us directly."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Text type="secondary">This window will close automatically...</Text>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          Report Video
        </Space>
      }
      open={visible}
      onCancel={handleModalCancel}
      footer={[
        <Button key="cancel" onClick={handleModalCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          danger
          onClick={() => form.submit()}
        >
          Submit Report
        </Button>
      ]}
      width={600}
      centered
      style={{ maxHeight: '90vh' }}
      bodyStyle={{ 
        maxHeight: 'calc(90vh - 140px)', 
        overflow: 'auto',
        padding: '24px'
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="Reporting Content"
          description="Help us maintain a safe platform by reporting inappropriate content. All reports are reviewed by our moderation team."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {video && (
          <div style={{ 
            
            padding: 12, 
            borderRadius: 6, 
            marginBottom: 16 
          }}>
            <Row gutter={12} align="middle">
              <Col xs={24} sm={6}>
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  style={{ 
                    width: '100%', 
                    maxWidth: 80, 
                    height: 60, 
                    objectFit: 'cover', 
                    borderRadius: 4 
                  }}
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                  }}
                />
              </Col>
              <Col xs={24} sm={18}>
                <Text strong style={{ display: 'block', fontSize: 14 }}>
                  {video.title}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Source: {video.sourceWebsite}
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Your Name"
              rules={[
                { required: true, message: 'Please enter your name' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input placeholder="Enter your full name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="your.email@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="category"
          label="Report Category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select 
            placeholder="Select the reason for reporting"
            showSearch
            optionFilterProp="children"
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            dropdownMatchSelectWidth={false}
            style={{ width: '100%' }}
          >
            {reportCategories.map(category => (
              <Option key={category.value} value={category.value}>
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>{category.label}</div>
                  <div style={{ 
                    fontSize: 12, 
                    color: '#666', 
                    lineHeight: '1.3',
                    whiteSpace: 'normal',
                    wordWrap: 'break-word'
                  }}>
                    {category.description}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="message"
          label="Additional Details"
          rules={[
            { required: true, message: 'Please provide details about the issue' },
            { min: 10, message: 'Please provide at least 10 characters' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Please describe the issue in detail. Include timestamps if relevant..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <div style={{ 
          background: '#fff7e6', 
          border: '1px solid #ffd591', 
          borderRadius: 6, 
          padding: 12, 
          marginBottom: 16 
        }}>
          <Text style={{ fontSize: 12, color: '#d46b08' }}>
            <strong>Note:</strong> False reports may result in account restrictions. 
            We do not host videos - we only link to external sources. 
            For copyright issues, please also contact the original hosting website.
          </Text>
        </div>
      </Form>
    </Modal>
  );
};

export default VideoReportModal; 
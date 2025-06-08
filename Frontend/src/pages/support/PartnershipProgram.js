import React, { useState } from 'react';
import { Typography, Card, Row, Col, Button, List, Divider, Tag, Form, Input, Select, message, Spin, Upload } from 'antd';
import { TeamOutlined, TrophyOutlined, DollarOutlined, RocketOutlined, CheckCircleOutlined, UploadOutlined, SendOutlined, LinkOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const benefits = [
  {
    title: 'Revenue Sharing',
    description: 'Earn up to 70% revenue share from your content views and engagement',
    icon: <DollarOutlined style={{ fontSize: '24px', color: '#FF1493' }} />
  },
  {
    title: 'Premium Placement',
    description: 'Your content gets featured prominently on our homepage and search results',
    icon: <TrophyOutlined style={{ fontSize: '24px', color: '#FF1493' }} />
  },
  {
    title: 'Content Protection',
    description: 'Advanced tools to protect your content from unauthorized distribution',
    icon: <CheckCircleOutlined style={{ fontSize: '24px', color: '#FF1493' }} />
  },
  {
    title: 'Growth Support',
    description: 'Dedicated account manager and analytics to help grow your audience',
    icon: <RocketOutlined style={{ fontSize: '24px', color: '#FF1493' }} />
  }
];

const requirements = [
  'Regular content uploads (minimum 2 videos per month)',
  'High-quality video content (minimum 720p resolution)',
  'Compliance with our content guidelines and policies',
  'Valid identification and documentation for age verification',
  'Exclusive or semi-exclusive content arrangement'
];

const contentTypes = [
  'Educational videos',
  'Entertainment videos',
  'Gaming content',
  'Tutorials',
  'Vlogs',
  'Reviews',
  'Short films',
  'Music videos',
  'Animation',
  'Other'
];

const PartnershipProgram = ({ username = 'guest' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Prepare submission data
      const submissionData = {
        type: 'partnership-program',
        name: values.name,
        email: values.email,
        subject: 'Partnership Program Application',
        message: values.message,
        additionalData: {
          contentType: values.contentType,
          socialMediaPresence: values.socialMediaPresence,
          portfolioLinks: values.portfolioLinks,
          monthlyContent: values.monthlyContent
        }
      };

      // Submit form data to API
      const response = await axios.post('/api/support/submissions', submissionData);

      if (response.data.status === 'success') {
        message.success('Your application has been submitted successfully!');
        setSubmitted(true);
        form.resetFields();
      } else {
        message.error('Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting partnership application:', err);
      message.error('An error occurred while submitting your application. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderApplicationForm = () => (
    <div>
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '40px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Partnership Application Form
      </Title>
      
      <Spin spinning={loading}>
        <Form layout="vertical" onFinish={onFinish} form={form} style={{ marginTop: '20px' }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label={<Text style={{ color: 'white' }}>Full Name</Text>}
                rules={[{ required: true, message: 'Please enter your name' }]}
                initialValue={username !== 'guest' ? username : ''}
              >
                <Input prefix={<UserOutlined />} placeholder="Your full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label={<Text style={{ color: 'white' }}>Email Address</Text>}
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Your email address" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="contentType"
            label={<Text style={{ color: 'white' }}>Content Type</Text>}
            rules={[{ required: true, message: 'Please select your content type' }]}
          >
            <Select placeholder="Select your content type">
              {contentTypes.map((type) => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="portfolioLinks"
            label={<Text style={{ color: 'white' }}>Portfolio Links</Text>}
            rules={[{ required: true, message: 'Please provide links to your existing content' }]}
            extra={<Text style={{ color: '#d1d5db' }}>Enter one URL per line</Text>}
          >
            <TextArea 
              rows={3}
              placeholder="https://example.com/your-content"
              prefix={<LinkOutlined />}
            />
          </Form.Item>
          
          <Form.Item
            name="socialMediaPresence"
            label={<Text style={{ color: 'white' }}>Social Media Presence</Text>}
            rules={[{ required: true, message: 'Please provide information about your social media presence' }]}
          >
            <TextArea 
              rows={3}
              placeholder="Describe your social media accounts and follower counts"
            />
          </Form.Item>
          
          <Form.Item
            name="monthlyContent"
            label={<Text style={{ color: 'white' }}>Monthly Content Production</Text>}
            rules={[{ required: true, message: 'Please select your monthly content production capacity' }]}
          >
            <Select placeholder="Select how many videos you can produce monthly">
              <Option value="1-2">1-2 videos per month</Option>
              <Option value="3-5">3-5 videos per month</Option>
              <Option value="6-10">6-10 videos per month</Option>
              <Option value="10+">More than 10 videos per month</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="message"
            label={<Text style={{ color: 'white' }}>Additional Information</Text>}
            rules={[{ required: true, message: 'Please provide additional details about your content' }]}
          >
            <TextArea 
              rows={4}
              placeholder="Tell us more about your content, your experience, and why you want to join our partnership program"
            />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              style={{ 
                backgroundColor: '#FF1493', 
                borderColor: '#FF1493',
                height: '48px',
                fontSize: '16px'
              }}
              loading={loading}
            >
              Submit Application
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );

  if (submitted) {
    return (
      <Card className="support-card">
        <Title level={3} className="support-title">
          <TeamOutlined style={{ marginRight: '12px' }} />
          Application Submitted!
        </Title>
        <Paragraph className="support-paragraph">
          Thank you for your interest in our Partnership Program. We have received your application and will review it carefully.
          Our team will contact you at the provided email address within 5 business days.
        </Paragraph>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button
            type="primary"
            size="large"
            style={{ 
              backgroundColor: '#FF1493', 
              borderColor: '#FF1493',
              height: '48px',
              width: '200px',
              fontSize: '16px'
            }}
            onClick={() => {
              setSubmitted(false);
              setShowApplicationForm(false);
            }}
          >
            Return to Program Info
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="support-card">
      <Title level={3} className="support-title">
        <TeamOutlined style={{ marginRight: '12px' }} />
        Partnership Program
      </Title>
      
      <Paragraph className="support-paragraph">
        Join our exclusive partnership program and take your content to the next level. 
        As a Video Surfing partner, you'll gain access to premium features, revenue sharing, 
        and a dedicated support team to help grow your audience.
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)' }} />
      
      <Title level={4} style={{ color: 'white', marginTop: '20px' }}>
        Partner Benefits
      </Title>
      
      <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
        {benefits.map((benefit, index) => (
          <Col xs={24} md={12} key={index}>
            <Card 
              style={{ 
                backgroundColor: '#1a1a1a', 
                borderRadius: '8px',
                height: '100%',
                border: '1px solid rgba(255, 20, 147, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ marginRight: '16px' }}>
                  {benefit.icon}
                </div>
                <div>
                  <Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                    {benefit.title}
                  </Title>
                  <Text style={{ color: '#d1d5db' }}>
                    {benefit.description}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '40px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Partnership Requirements
      </Title>
      
      <List
        style={{ marginTop: '20px' }}
        dataSource={requirements}
        renderItem={(item) => (
          <List.Item style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px 0' }}>
            <List.Item.Meta
              avatar={<CheckCircleOutlined style={{ color: '#FF1493', fontSize: '18px' }} />}
              title={<Text style={{ color: 'white' }}>{item}</Text>}
            />
          </List.Item>
        )}
      />
      
      {showApplicationForm ? (
        renderApplicationForm()
      ) : (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button
            type="primary"
            size="large"
            style={{ 
              backgroundColor: '#FF1493', 
              borderColor: '#FF1493',
              height: '48px',
              width: '200px',
              fontSize: '16px'
            }}
            onClick={() => setShowApplicationForm(true)}
          >
            Apply Now
          </Button>
          
          <Paragraph style={{ marginTop: '16px', color: '#d1d5db', fontSize: '14px' }}>
            Our team will review your application and respond within 5 business days.
          </Paragraph>
        </div>
      )}
    </Card>
  );
};

export default PartnershipProgram;
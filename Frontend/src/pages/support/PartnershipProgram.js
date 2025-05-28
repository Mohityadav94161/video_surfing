import React from 'react';
import { Typography, Card, Row, Col, Button, List, Divider, Tag } from 'antd';
import { TeamOutlined, TrophyOutlined, DollarOutlined, RocketOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

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

const PartnershipProgram = () => {
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
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '40px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        How to Apply
      </Title>
      
      <Paragraph className="support-paragraph" style={{ marginTop: '20px' }}>
        To apply for our partnership program, please send an email to <a href="mailto:partners@videosurfing.com" className="support-link">partners@videosurfing.com</a> with the following information:
      </Paragraph>
      
      <List
        style={{ marginTop: '20px', marginBottom: '30px' }}
        dataSource={[
          'Your name and contact information',
          'Links to your existing content or portfolio',
          'Brief description of the content you plan to create',
          'Your social media presence and follower count',
          'Any previous experience in content creation'
        ]}
        renderItem={(item, index) => (
          <List.Item style={{ borderBottom: 'none', padding: '4px 0' }}>
            <Text style={{ color: '#d1d5db' }}>{index + 1}. {item}</Text>
          </List.Item>
        )}
      />
      
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
          onClick={() => window.location.href = 'mailto:partners@videosurfing.com'}
        >
          Apply Now
        </Button>
        
        <Paragraph style={{ marginTop: '16px', color: '#d1d5db', fontSize: '14px' }}>
          Our team will review your application and respond within 5 business days.
        </Paragraph>
      </div>
    </Card>
  );
};

export default PartnershipProgram;
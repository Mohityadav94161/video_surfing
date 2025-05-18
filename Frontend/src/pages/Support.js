import React from 'react';
import { Typography, Card, Row, Col, Form, Input, Button, Divider, Space } from 'antd';
import { MailOutlined, PhoneOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const Support = () => {
  const onFinish = (values) => {
    console.log('Support form submitted:', values);
    // Here you would typically send the form data to your backend
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: '40px' }}>Support Center</Title>
      
      <Row gutter={[32, 32]}>
        <Col xs={24} md={8}>
          <Card 
            hoverable
            style={{ height: '100%' }}
            cover={<div style={{ 
              background: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)', 
              height: '120px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <MailOutlined style={{ fontSize: '48px', color: 'white' }} />
            </div>}
          >
            <Title level={4} style={{ textAlign: 'center' }}>Email Support</Title>
            <Paragraph style={{ textAlign: 'center' }}>
              For general inquiries and non-urgent issues
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', fontWeight: 'bold' }}>
              support@videosurfing.com
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
              Response time: 24-48 hours
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            hoverable
            style={{ height: '100%' }}
            cover={<div style={{ 
              background: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)', 
              height: '120px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <PhoneOutlined style={{ fontSize: '48px', color: 'white' }} />
            </div>}
          >
            <Title level={4} style={{ textAlign: 'center' }}>Phone Support</Title>
            <Paragraph style={{ textAlign: 'center' }}>
              For urgent issues requiring immediate assistance
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', fontWeight: 'bold' }}>
              +1 (800) 123-4567
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
              Available Mon-Fri, 9am-5pm EST
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            hoverable
            style={{ height: '100%' }}
            cover={<div style={{ 
              background: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)', 
              height: '120px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <QuestionCircleOutlined style={{ fontSize: '48px', color: 'white' }} />
            </div>}
          >
            <Title level={4} style={{ textAlign: 'center' }}>FAQ</Title>
            <Paragraph style={{ textAlign: 'center' }}>
              Find answers to commonly asked questions
            </Paragraph>
            <Paragraph style={{ textAlign: 'center' }}>
              <Button type="primary" href="/faq" style={{ backgroundColor: '#FF1493' }}>
                Visit FAQ
              </Button>
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
              Updated regularly with new information
            </Paragraph>
          </Card>
        </Col>
      </Row>
      
      <Divider style={{ margin: '60px 0 40px' }}>
        <Text strong>Contact Us</Text>
      </Divider>
      
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={3} style={{ marginBottom: '30px' }}>Send Us a Message</Title>
        <Form
          name="support_form"
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input placeholder="Your name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Your email" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter a subject' }]}
          >
            <Input placeholder="What is your inquiry about?" />
          </Form.Item>
          
          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter your message' }]}
          >
            <TextArea rows={6} placeholder="How can we help you?" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#FF1493' }}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Support;
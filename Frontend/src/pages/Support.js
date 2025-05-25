import React, { useState } from 'react';
import { Layout, Menu, Form, Input, Button, Typography, Row, Col, Card } from 'antd';
import {
  MailOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import './Support.css';
import { Color } from 'antd/es/color-picker';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Sider, Content } = Layout;

const sidebarItems = [
  'Contact us',
  'Partnership program',
  'Content removal/DMCA',
  'Content protection',
  'Terms of Service',
  'Privacy Policy',
  'EU DSA',
  '2257 statement',
  'CSAM policy',
  'Questionable content policy'
];

const Support = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const onFinish = (values) => {
    console.log('Form submitted:', values);
    // Implement actual form submission logic here
  };

  return (
    <Layout className="support-layout">
      {/* Sidebar Toggle Button */}
      <Button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
      </Button>
      
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} 
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <Sider
        width={280}
        className={`support-sidebar ${sidebarOpen ? 'open' : ''}`}
        collapsible={false}
        trigger={null}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={['Contact us']}
          className="sidebar-menu"
        >
          {sidebarItems.map((item, index) => (
            <Menu.Item key={item} className="sidebar-menu-item" onClick={closeSidebar}>
              {item}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      {/* Main Content */}
      <Content className="support-content">
        <Row justify="center">
          <Col xs={24} lg={20}>
            <Card className="support-card">
              <Title level={3} className="support-title">Contact us</Title>
              <Paragraph className="support-paragraph">
                Please review our <a href="#" className="support-link">DMCA page</a> if you want us to remove your content.
                Anything else, please use this form:
              </Paragraph>

              <Form layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="username"
                      label="Username"
                      initialValue="guest"
                    >
                      <Input prefix={<UserOutlined />} disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="Your email" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please enter a subject' }]}
                  initialValue="Enquiry"
                >
                  <Input placeholder="Subject" />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Message"
                  rules={[{ required: true, message: 'Please enter your message' }]}
                >
                  <TextArea rows={4} placeholder="Your message"/>
                </Form.Item>

                <Form.Item>
                  <Button
                    htmlType="submit"
                    className="submit-button"
                  >
                    Send message
                  </Button>
                </Form.Item>
              </Form>

              <Text className="support-paragraph">
                You can also contact us via <a href="mailto:admin@spankbang.com" className="support-link">admin@spankbang.com</a>
              </Text>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Support;

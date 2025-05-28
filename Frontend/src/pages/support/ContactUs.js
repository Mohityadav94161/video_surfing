import React from 'react';
import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
import { MailOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactUs = ({ username = 'guest' }) => {
  const onFinish = (values) => {
    console.log('Form submitted:', values);
    // Implement actual form submission logic here
  };

  return (
    <Card className="support-card">
      <Title level={3} className="support-title">Contact us</Title>
      <Paragraph className="support-paragraph">
        Please review our <a href="#" className="support-link" onClick={() => window.location.href = '/support?page=content-removal'}>DMCA page</a> if you want us to remove your content.
        Anything else, please use this form:
      </Paragraph>

      <Form layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="username"
              label="Username"
              initialValue={username}
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
        You can also contact us via <a href="mailto:support@videosurfing.com" className="support-link">support@videosurfing.com</a>
      </Text>
    </Card>
  );
};

export default ContactUs;
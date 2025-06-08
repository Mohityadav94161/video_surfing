import React, { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, Card, message, Spin } from 'antd';
import { MailOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactUs = ({ username = 'guest' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Prepare submission data
      const submissionData = {
        type: 'contact-us',
        name: values.username || username,
        email: values.email,
        subject: values.subject,
        message: values.message
      };

      // Submit form data to API
      const response = await axios.post('/api/support/submissions', submissionData);

      if (response.data.status === 'success') {
        message.success('Your message has been sent successfully!');
        setSubmitted(true);
        form.resetFields();
      } else {
        message.error('Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting contact form:', err);
      message.error('An error occurred while sending your message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="support-card">
        <Title level={3} className="support-title">Message Sent!</Title>
        <Paragraph className="support-paragraph">
          Thank you for contacting us. We have received your message and will respond as soon as possible.
        </Paragraph>
        <Button 
          type="primary" 
          onClick={() => setSubmitted(false)}
          className="submit-button"
        >
          <Text style={{color:'white'}}>Send Another Message</Text>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="support-card">
      <Title level={3} className="support-title">Contact us</Title>
      <Paragraph className="support-paragraph">
        Please review our <a href="#" className="support-link" onClick={() => window.location.href = '/support?page=content-removal'}>DMCA page</a> if you want us to remove your content.
        Anything else, please use this form:
      </Paragraph>

      <Spin spinning={loading}>
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="username"
                label="Username"
                initialValue={username}
              >
                <Input prefix={<UserOutlined />} disabled={username !== 'guest'} />
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
              loading={loading}
              icon={<SendOutlined />}
            >
              <Text style={{color:'white'}}>Send Message</Text>
            </Button>
          </Form.Item>
        </Form>
      </Spin>

      <Text className="support-paragraph">
        You can also contact us via <a href="mailto:support@videosurfing.com" className="support-link">support@videosurfing.com</a>
      </Text>
    </Card>
  );
};

export default ContactUs;
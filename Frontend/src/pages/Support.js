import React from 'react';
import { Typography, Input, List, Form, Button, Row, Col, Card } from 'antd';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const Support = () => {
  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "To reset your password, go to the login page and click on 'Forgot Password'. Follow the instructions to reset your password."
    },
    {
      question: "How can I contact support?",
      answer: "You can contact support by emailing us at support@example.com or calling us at (123) 456-7890."
    },
    // Add more FAQs as needed
  ];

  const onFinish = (values) => {
    console.log('Form submitted:', values);
    // Handle form submission logic here
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', color: 'white' }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: '40px' }}>Support Center</Title>
      
      <Input.Search
        placeholder="Search for help..."
        enterButton
        size="large"
        style={{ marginBottom: '40px' }}
      />

      <Title level={2}>Frequently Asked Questions</Title>
      <List
        itemLayout="horizontal"
        dataSource={faqs}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={<strong>{item.question}</strong>}
              description={item.answer}
            />
          </List.Item>
        )}
        style={{ marginBottom: '40px' }}
      />

      <Title level={2}>Contact Us</Title>
      <Card>
        <Form
          name="contact_form"
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
            <TextArea rows={4} placeholder="How can we help you?" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Support;

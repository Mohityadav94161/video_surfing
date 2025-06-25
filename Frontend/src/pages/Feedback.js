import React, { useState } from 'react';
import { Form, Input, Button, Rate, Typography, message, Card, Select } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import './FooterPages.css';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Feedback = () => {
  const [form] = Form.useForm();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const feedbackCategories = [
    'Website Experience',
    'Video Quality',
    'Feature Request',
    'Bug Report',
    'Content Suggestion',
    'Other'
  ];

  const onFinish = (values) => {
    if (!isAuthenticated) {
      message.error('You must be logged in to submit feedback');
      return;
    }

    setLoading(true);
    
    // Simulate submission
    setTimeout(() => {
      message.success('Thank you for your feedback! (This is a frontend-only demo)');
      form.resetFields();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="footer-page-container" style={{ maxWidth: '1900px', margin: '0 auto', padding: '40px 20px' }}>
      <Card 
        bordered={false}
        style={{ 
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          background: '#1f1f1f'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', color: '#FF1493', marginBottom: '30px' }}>
          We Value Your Feedback
        </Title>
        
        <Paragraph style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>
          Your feedback helps us improve XFansTube. Please share your thoughts, suggestions, or report any issues you've encountered.
        </Paragraph>

        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255, 20, 147, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>
            <Paragraph style={{ color: 'white' }}>
              Please <a href="/login" style={{ color: '#FF1493' }}>login</a> to submit your feedback.
            </Paragraph>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ rating: 3 }}
          >
            <Form.Item
              name="category"
              label={<span style={{ color: 'white' }}>Feedback Category</span>}
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select placeholder="Select a category">
                {feedbackCategories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="subject"
              label={<span style={{ color: 'white' }}>Subject</span>}
              rules={[{ required: true, message: 'Please enter a subject' }]}
            >
              <Input placeholder="Brief description of your feedback" />
            </Form.Item>
            
            <Form.Item
              name="message"
              label={<span style={{ color: 'white' }}>Your Feedback</span>}
              rules={[{ required: true, message: 'Please enter your feedback' }]}
            >
              <TextArea 
                placeholder="Please provide details about your experience, suggestion, or issue..." 
                rows={6} 
              />
            </Form.Item>
            
            <Form.Item
              name="rating"
              label={<span style={{ backgroundcolor: 'white' }}>Rate Your Experience</span>}
            >
              <Rate allowHalf defaultValue={3} />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                strong
                style={{ 
                  backgroundColor: '#FF1493', 
                  height: '40px',
                  border: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 20, 147, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Submit Feedback
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Feedback;
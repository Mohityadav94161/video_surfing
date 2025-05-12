import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  Alert, 
  Space,
  Checkbox 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  UserAddOutlined 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const { username, email, password } = values;
      const result = await register(username, email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2}>Create Account</Title>
          <Text type="secondary">
            Register to start exploring videos
          </Text>
        </div>
        
        {error && (
          <Alert 
            message={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: '16px' }} 
          />
        )}
        
        <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please enter a username' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
              size="large" 
              autoComplete="username"
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large" 
              autoComplete="email"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm Password" 
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>
          
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must accept the agreement')),
              },
            ]}
          >
            <Checkbox>
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </Checkbox>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
              icon={<UserAddOutlined />}
            >
              Register
            </Button>
          </Form.Item>
        </Form>
        
        <Divider plain>Or</Divider>
        
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="small">
            <Text>Already have an account?</Text>
            <Link to="/login">
              <Button type="link">Login Instead</Button>
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Register; 
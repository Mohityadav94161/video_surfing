import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  Alert, 
  Space
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const { email, password } = values;
      const result = await login(email, password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2}>Log In</Title>
          <Text type="secondary">
            Sign in to your account to continue
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
          name="login"
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
              size="large" 
              autoComplete="email"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
              icon={<LoginOutlined />}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
        
        <Divider plain>Or</Divider>
        
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="small">
            <Text>Don't have an account?</Text>
            <Link to="/register">
              <Button type="link">Register Now</Button>
            </Link>
          </Space>
        </div>
      </Card>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Text type="secondary">
          By logging in, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </div>
    </div>
  );
};

export default Login; 
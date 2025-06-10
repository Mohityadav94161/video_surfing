import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  Alert, 
  Space,
  Spin,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import Captcha from '../components/Captcha';
import axios from 'axios';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const { login, isAuthenticated, loading, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';
  
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);

  // Check if captcha is required
  const checkCaptchaRequired = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/captcha/check-required`);
      if (response.data.status === 'success') {
        setCaptchaRequired(response.data.data.captchaRequired);
      }
    } catch (err) {
      console.error('Error checking captcha requirement:', err);
      // Default to requiring captcha if there's an error
      setCaptchaRequired(true);
    }
  };

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !initializing) {
      navigate(from, { replace: true });
    } else if (!initializing) {
      checkCaptchaRequired();
    }
  }, [isAuthenticated, initializing, navigate, from]);

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setError(null);
    
    try {
      // If captcha is required but not verified, show captcha modal
      if (captchaRequired && !captchaVerified) {
        setCaptchaModalVisible(true);
        setFormLoading(false);
        return;
      }
      
      const { username, password } = values;
      const result = await login(username, password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed. Please try again.');
        // If login fails, reset captcha verification
        setCaptchaVerified(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle captcha required error
      if (err.response && err.response.status === 403 && 
          err.response.data && err.response.data.data && err.response.data.data.captchaRequired) {
        setCaptchaRequired(true);
        setCaptchaModalVisible(true);
      } else {
      setError('An unexpected error occurred. Please try again.');
      }
      
      // Reset captcha verification
      setCaptchaVerified(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCaptchaVerified = () => {
    setCaptchaVerified(true);
    setCaptchaModalVisible(false);
    
    // Retry form submission after captcha verification
    form.submit();
  };

  // Show loading spinner while authentication state is initializing
  if (initializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '100px' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

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
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please enter your username' }
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
              loading={formLoading || loading}
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

      {/* Captcha Modal */}
      <Modal
        title="Security Verification"
        open={captchaModalVisible}
        footer={null}
        closable={true}
        onCancel={() => setCaptchaModalVisible(false)}
        destroyOnClose={true}
      >
        <Captcha 
          onVerify={handleCaptchaVerified}
          onError={(errorMsg) => setError(errorMsg)}
        />
      </Modal>
    </div>
  );
};

export default Login; 
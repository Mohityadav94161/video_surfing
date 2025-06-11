import React, { useState, useEffect } from 'react';
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
  Spin,
  Tooltip,
  Progress,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined,
  UserAddOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import Captcha from '../components/Captcha';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

// Password strength calculator
const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) strength += 20; // Uppercase
  if (/[a-z]/.test(password)) strength += 15; // Lowercase
  if (/[0-9]/.test(password)) strength += 15; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) strength += 20; // Special characters
  
  return Math.min(100, strength);
};

// Get the color for the strength indicator
const getStrengthColor = (strength) => {
  if (strength < 30) return '#ff4d4f';
  if (strength < 60) return '#faad14';
  return '#52c41a';
};

// Get the text label for the strength
const getStrengthLabel = (strength) => {
  if (strength < 30) return 'Weak';
  if (strength < 60) return 'Moderate';
  if (strength < 80) return 'Strong';
  return 'Very Strong';
};

const Register = () => {
  const [form] = Form.useForm();
  const { register, isAuthenticated, loading, initializing } = useAuth();
  const navigate = useNavigate();
  
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
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
  
  // Update password strength when password changes
  useEffect(() => {
    const strength = calculatePasswordStrength(passwordValue);
    setPasswordStrength(strength);
  }, [passwordValue]);
  
  // Redirect if user is already authenticated and check captcha requirement
  useEffect(() => {
    if (isAuthenticated && !initializing) {
      navigate('/');
    } else if (!initializing) {
      checkCaptchaRequired();
    }
  }, [isAuthenticated, initializing, navigate]);

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
      // Using empty string for email since it's no longer required in the UI
      // but the auth context still expects it
      const result = await register(username, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
        // Reset captcha verification if registration fails
        setCaptchaVerified(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      
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
              { required: true, message: 'Please enter a username' }
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
            label={
              <span>
                Password&nbsp;
                <Tooltip title="Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              </span>
            }
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'Password must be at least 8 characters long' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  
                  const errors = [];
                  
                  if (value.length < 8) {
                    errors.push('Password must be at least 8 characters long');
                  }
                  
                  if (!/(?=.*[A-Z])/.test(value)) {
                    errors.push('Password must contain at least one uppercase letter');
                  }
                  
                  if (!/(?=.*[a-z])/.test(value)) {
                    errors.push('Password must contain at least one lowercase letter');
                  }
                  
                  if (!/(?=.*[0-9])/.test(value)) {
                    errors.push('Password must contain at least one number');
                  }
                  
                  if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value)) {
                    errors.push('Password must contain at least one special character');
                  }
                  
                  if (errors.length > 0) {
                    return Promise.reject(new Error(errors.join('. ')));
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
              size="large"
              autoComplete="new-password"
              onChange={(e) => setPasswordValue(e.target.value)}
            />
          </Form.Item>
          
          {passwordValue && (
            <div style={{ marginTop: -15, marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size={0}>
                <Progress 
                  percent={passwordStrength} 
                  size="small" 
                  showInfo={false}
                  strokeColor={getStrengthColor(passwordStrength)}
                  style={{ marginBottom: 4 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text 
                    type="secondary" 
                    style={{ fontSize: '12px' }}
                  >
                    Password Strength
                  </Text>
                  <Text 
                    style={{ 
                      fontSize: '12px', 
                      color: getStrengthColor(passwordStrength)
                    }}
                  >
                    {getStrengthLabel(passwordStrength)}
                  </Text>
                </div>
              </Space>
            </div>
          )}
          
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
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={formLoading || loading}
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
      
      <div style={{ marginTop: '16px' }}>
        <Paragraph type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
          <LockOutlined style={{ marginRight: '4px' }} />
          Your password is securely stored and never shared with third parties.
        </Paragraph>
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

export default Register; 
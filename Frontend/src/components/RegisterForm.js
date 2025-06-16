import React, { useState } from 'react';
import { Form, Input, Button, Alert, Progress, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register } = useAuth();

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;
    
    return strength;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return '#ff4d4f';
    if (passwordStrength <= 50) return '#faad14';
    if (passwordStrength <= 75) return '#1890ff';
    return '#52c41a';
  };

  const handleSubmit = async (values) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Register attempt with:', values.username);
      
      const result = await register(values.username, values.password);
      
      if (!result.success) {
        console.error('Registration failed:', result.message);
        setError(result.message || 'Registration failed. Please try again.');
      } else {
        console.log('Registration successful, token stored');
        // Call the success callback if provided
        if (onRegisterSuccess && typeof onRegisterSuccess === 'function') {
          onRegisterSuccess(result.user);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        name="register"
        onFinish={handleSubmit}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please enter a username' }]}
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
          rules={[{ required: true, message: 'Please enter a password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordChange}
          />
        </Form.Item>
        
        {password && (
          <div style={{ marginBottom: 16 }}>
            <Progress
              percent={passwordStrength}
              strokeColor={getStrengthColor()}
              showInfo={false}
              size="small"
            />
            <div style={{ textAlign: 'right', color: getStrengthColor() }}>
              {getStrengthLabel()}
            </div>
          </div>
        )}
        
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
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
            prefix={<SafetyOutlined />}
            placeholder="Confirm Password"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{
              backgroundColor: "#FF1493",
              color: "white",
              border: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(255, 20, 147, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Register
          </Button>
        </Form.Item>
      </Form>
      
      <Divider plain>Or</Divider>
      
      <div style={{ textAlign: 'center' }}>
        <Button
          type="link"
          onClick={() => {
            if (onSwitchToLogin && typeof onSwitchToLogin === 'function') {
              onSwitchToLogin();
            }
          }}
        >
          Already have an account? Login
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm; 
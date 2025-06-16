import React, { useState } from 'react';
import { Form, Input, Button, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (values) => {
    try {
      setError(null);
      setLoading(true);
      console.log('LoginForm: Login attempt with:', values.username);
      
      const result = await login(values.username, values.password);
      console.log('LoginForm: Login result:', result);
      
      if (!result.success) {
        console.error('LoginForm: Login failed:', result.message);
        setError(result.message || 'Login failed. Please try again.');
      } else {
        console.log('LoginForm: Login successful, calling success callback');
        // Call the success callback if provided
        if (onLoginSuccess && typeof onLoginSuccess === 'function') {
          onLoginSuccess(result.user);
        }
      }
    } catch (err) {
      console.error('LoginForm: Login error:', err);
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
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please enter your username' }]}
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
          rules={[{ required: true, message: 'Please enter your password' }]}
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
            Log in
          </Button>
        </Form.Item>
      </Form>
      
      <Divider plain>Or</Divider>
      
      <div style={{ textAlign: 'center' }}>
        <Button
          type="link"
          onClick={() => {
            if (onSwitchToRegister && typeof onSwitchToRegister === 'function') {
              onSwitchToRegister();
            }
          }}
        >
          Don't have an account? Register now
        </Button>
      </div>
    </div>
  );
};

export default LoginForm; 
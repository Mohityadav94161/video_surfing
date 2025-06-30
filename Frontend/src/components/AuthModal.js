import React from 'react';
import { Modal, Tabs } from 'antd';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthModal.css'; // Ensure this import is correct

const AuthModal = ({ visible, onClose, initialTab = 'login' }) => {
  // console.log('Modal props:', { visible, initialTab }); .// Debugging

  return (
    <Modal
      title="Welcome to VideoSurfing"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      style={{
        backgroundColor: '#1a1a1a !important',
      }}
      bodyStyle={{
        backgroundColor: '#1a1a1a !important',
      }}
      zIndex={1000}
      className="auth-modal"
    >
      <Tabs
        defaultActiveKey={initialTab}
        items={[
          {
            key: 'login',
            label: 'Login',
            children: <LoginForm />
          },
          {
            key: 'register',
            label: 'Register',
            children: <RegisterForm />
          }
        ]}
      />
    </Modal>
  );
};

export default AuthModal; 
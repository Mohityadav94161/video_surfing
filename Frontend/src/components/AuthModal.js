import React from 'react';
import { Modal, Tabs } from 'antd';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal = ({ visible, onClose, initialTab = 'login' }) => {
  console.log('Modal props:', { visible, initialTab }); // Debugging

  return (
    <Modal
      title="Welcome to VideoSurfing"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      style={{ top: 20 }}
      zIndex={1000}
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
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from './Modal';

const LoginModal = ({ visible, onClose }) => {
  return (
    <Modal 
      visible={visible} 
      onCancel={onClose}
      footer={null}
    >
      {/* Your login form */}
    </Modal>
  );
};

export default LoginModal; 
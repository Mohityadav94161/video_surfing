import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from './Modal';

const RegisterModal = ({ visible, onClose }) => {
  return (
    <Modal 
      visible={visible} 
      onCancel={onClose}
      footer={null}
    >
      {/* Your register form */}
    </Modal>
  );
};

export default RegisterModal; 
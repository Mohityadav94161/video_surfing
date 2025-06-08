import React from 'react';
import { Modal } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import Captcha from './Captcha';
import { useCaptcha } from '../contexts/CaptchaContext';

const GlobalCaptchaModal = () => {
  const { 
    captchaModalVisible, 
    setCaptchaModalVisible, 
    handleCaptchaVerified 
  } = useCaptcha();

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SafetyOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
          Security Verification Required
        </div>
      }
      open={captchaModalVisible}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      width={400}
    >
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <p>
          Please complete the security verification below to continue browsing.
          This helps us prevent automated access and protect our content.
        </p>
      </div>
      <Captcha 
        onVerify={handleCaptchaVerified}
        onError={(errorMsg) => console.error("Captcha error:", errorMsg)}
      />
    </Modal>
  );
};

export default GlobalCaptchaModal; 
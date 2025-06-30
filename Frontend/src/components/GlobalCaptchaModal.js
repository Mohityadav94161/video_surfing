import React, { useState, useEffect } from 'react';
import { Modal, Alert } from 'antd';
import { SafetyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Captcha from './Captcha';
import { useCaptcha } from '../contexts/CaptchaContext';

const GlobalCaptchaModal = () => {
  const { 
    captchaModalVisible, 
    setCaptchaModalVisible, 
    handleCaptchaVerified,
    isAutoTriggered,
    blockedRequestsCount
  } = useCaptcha();

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isAutoTriggered ? (
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />
          ) : (
            <SafetyOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
          )}
          {isAutoTriggered ? 'Please verify you are not a bot' : 'Please verify you are not a bot'}
        </div>
      }
      open={captchaModalVisible}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      width={450}
    >
      {/* {isAutoTriggered && (
        <Alert
          message=""
          description=""
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )} */}
      
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <p>
          {/* {isAutoTriggered 
            ? "Please complete the security verification to retr your action and continue using the platform."
            : "Please complete the security verification below to continue browsing. This helps us prevent automated access and protect our content."
          } */}
        </p>
        {isAutoTriggered && (
          <p style={{ fontSize: '12px', color: '#666' }}>
            Your original request will be automatically retried after verification.
            {blockedRequestsCount > 0 && ` (${blockedRequestsCount} request${blockedRequestsCount > 1 ? 's' : ''} pending)`}
          </p>
        )}
      </div>
      
      <Captcha 
        onVerify={handleCaptchaVerified}
        onError={(errorMsg) => console.error("Captcha error:", errorMsg)}
      />
    </Modal>
  );
};

export default GlobalCaptchaModal; 
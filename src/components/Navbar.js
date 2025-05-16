import React, { useState } from 'react';
import { Button } from 'antd';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const Navbar = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <>
      {/* Your navbar content */}
      <Button 
        onClick={() => {
          console.log('Login clicked');
          setShowLoginModal(true);
        }}
        style={{ backgroundColor: '#FF1493', borderColor: '#FF1493' }}
      >
        Login
      </Button>
      <Button 
        onClick={() => {
          console.log('Register clicked');
          setShowRegisterModal(true);
        }}
        style={{ backgroundColor: '#FF1493', borderColor: '#FF1493' }}
      >
        Register
      </Button>

      <LoginModal 
        visible={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      <RegisterModal 
        visible={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
      />
    </>
  );
};

export default Navbar; 
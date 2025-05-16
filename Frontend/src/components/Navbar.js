import React, { useState } from 'react';
import { Button } from 'antd';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [authVisible, setAuthVisible] = useState(false);
  const [authType, setAuthType] = useState('login');

  console.log('Modal visible:', authVisible); // Debugging

  return (
    <>
      <div className="navbar">
        {/* Other navbar items */}
        <Button 
          onClick={() => {
            console.log('Login clicked'); // Debugging
            setAuthType('login');
            setAuthVisible(true);
          }}
        >
          Login
        </Button>
        <Button 
          onClick={() => {
            console.log('Register clicked'); // Debugging
            setAuthType('register');
            setAuthVisible(true);
          }}
        >
          Register
        </Button>
      </div>
      
      <AuthModal 
        visible={authVisible} 
        onClose={() => {
          console.log('Closing modal'); // Debugging
          setAuthVisible(false);
        }}
        initialTab={authType}
      />
    </>
  );
};

export default Navbar; 
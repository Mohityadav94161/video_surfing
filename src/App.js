import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Remove these routes */}
        {/* <Route path="/login" element={<LoginModal />} /> */}
        {/* <Route path="/register" element={<RegisterModal />} /> */}
      </Routes>
    </Router>
  );
};

export default App; 
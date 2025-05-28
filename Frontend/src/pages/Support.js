import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Row, Col } from 'antd';
import {
  MailOutlined,
  MenuOutlined,
  CloseOutlined,
  TeamOutlined,
  DeleteOutlined,
  SafetyOutlined,
  FileTextOutlined,
  LockOutlined,
  GlobalOutlined,
  FileOutlined,
  WarningOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import './Support.css';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

// Support page components
import ContactUs from './support/ContactUs';
import PartnershipProgram from './support/PartnershipProgram';
import ContentRemoval from './support/ContentRemoval';
import ContentProtection from './support/ContentProtection';
import EuDsa from './support/EuDsa';
import Statement2257 from './support/Statement2257';
import CsamPolicy from './support/CsamPolicy';
import QuestionableContent from './support/QuestionableContent';

// We'll use the existing Terms and Privacy pages
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';

const { Sider, Content } = Layout;

const sidebarItems = [
  { key: 'contact-us', label: 'Contact us', icon: <MailOutlined /> },
  { key: 'partnership-program', label: 'Partnership program', icon: <TeamOutlined /> },
  { key: 'content-removal', label: 'Content removal/DMCA', icon: <DeleteOutlined /> },
  { key: 'content-protection', label: 'Content protection', icon: <SafetyOutlined /> },
  { key: 'terms-of-service', label: 'Terms of Service', icon: <FileTextOutlined /> },
  { key: 'privacy-policy', label: 'Privacy Policy', icon: <LockOutlined /> },
  { key: 'eu-dsa', label: 'EU DSA', icon: <GlobalOutlined /> },
  { key: '2257-statement', label: '2257 statement', icon: <FileOutlined /> },
  { key: 'csam-policy', label: 'CSAM policy', icon: <WarningOutlined /> },
  { key: 'questionable-content', label: 'Questionable content policy', icon: <ExclamationCircleOutlined /> }
];

const Support = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState('contact-us');
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse the page from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get('page');
    
    if (page && sidebarItems.some(item => item.key === page)) {
      setSelectedPage(page);
    } else if (!page) {
      // If no page parameter, default to contact-us but don't change URL
      setSelectedPage('contact-us');
    }
  }, [location.search]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleMenuSelect = (key) => {
    setSelectedPage(key);
    closeSidebar();
    
    // Update URL with the selected page
    navigate(`/support?page=${key}`, { replace: true });
  };

  // Render the selected page content
  const renderContent = () => {
    switch (selectedPage) {
      case 'contact-us':
        return <ContactUs username={user?.username || 'guest'} />;
      case 'partnership-program':
        return <PartnershipProgram />;
      case 'content-removal':
        return <ContentRemoval />;
      case 'content-protection':
        return <ContentProtection />;
      case 'terms-of-service':
        return <TermsOfService inSupportPage={true} />;
      case 'privacy-policy':
        return <PrivacyPolicy inSupportPage={true} />;
      case 'eu-dsa':
        return <EuDsa />;
      case '2257-statement':
        return <Statement2257 />;
      case 'csam-policy':
        return <CsamPolicy />;
      case 'questionable-content':
        return <QuestionableContent />;
      default:
        return <ContactUs username={user?.username || 'guest'} />;
    }
  };

  return (
    <Layout className="support-layout">
      {/* Sidebar Toggle Button */}
      <Button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
      </Button>
      
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} 
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <Sider
        width={280}
        className={`support-sidebar ${sidebarOpen ? 'open' : ''}`}
        collapsible={false}
        trigger={null}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedPage]}
          className="sidebar-menu"
        >
          {sidebarItems.map((item) => (
            <Menu.Item 
              key={item.key} 
              className="sidebar-menu-item" 
              onClick={() => handleMenuSelect(item.key)}
              icon={item.icon}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      {/* Main Content */}
      <Content className="support-content">
        <Row justify="center">
          <Col xs={24} lg={20}>
            {renderContent()}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Support;

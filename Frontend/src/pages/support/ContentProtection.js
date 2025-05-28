import React from 'react';
import { Typography, Card, Row, Col, Collapse, Divider, List, Button, Tag } from 'antd';
import { 
  SafetyOutlined, 
  LockOutlined, 
  EyeOutlined, 
  FileProtectOutlined, 
  RobotOutlined, 
  ToolOutlined,
  CheckCircleOutlined,
  RightOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const ContentProtection = () => {
  return (
    <Card className="support-card">
      <Title level={3} className="support-title">
        <SafetyOutlined style={{ marginRight: '12px' }} />
        Content Protection
      </Title>
      
      <Paragraph className="support-paragraph">
        At Video Surfing, we take content protection seriously. We've implemented multiple layers of security 
        to ensure that your content is protected from unauthorized use, distribution, and piracy.
      </Paragraph>
      
      <Row gutter={[24, 24]} style={{ marginTop: '30px' }}>
        <Col xs={24} md={8}>
          <Card 
            style={{ 
              backgroundColor: '#1a1a1a', 
              borderRadius: '8px',
              height: '100%',
              border: '1px solid rgba(255, 20, 147, 0.2)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <LockOutlined style={{ fontSize: '36px', color: '#FF1493' }} />
            </div>
            <Title level={4} style={{ color: 'white', textAlign: 'center' }}>
              DRM Protection
            </Title>
            <Paragraph style={{ color: '#d1d5db', textAlign: 'center' }}>
              Digital Rights Management technology to prevent unauthorized copying and distribution.
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            style={{ 
              backgroundColor: '#1a1a1a', 
              borderRadius: '8px',
              height: '100%',
              border: '1px solid rgba(255, 20, 147, 0.2)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <EyeOutlined style={{ fontSize: '36px', color: '#FF1493' }} />
            </div>
            <Title level={4} style={{ color: 'white', textAlign: 'center' }}>
              Watermarking
            </Title>
            <Paragraph style={{ color: '#d1d5db', textAlign: 'center' }}>
              Visible and invisible watermarking options to identify your content and deter piracy.
            </Paragraph>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            style={{ 
              backgroundColor: '#1a1a1a', 
              borderRadius: '8px',
              height: '100%',
              border: '1px solid rgba(255, 20, 147, 0.2)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <RobotOutlined style={{ fontSize: '36px', color: '#FF1493' }} />
            </div>
            <Title level={4} style={{ color: 'white', textAlign: 'center' }}>
              AI Monitoring
            </Title>
            <Paragraph style={{ color: '#d1d5db', textAlign: 'center' }}>
              Advanced AI systems that scan the web to detect unauthorized copies of your content.
            </Paragraph>
          </Card>
        </Col>
      </Row>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '40px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        <FileProtectOutlined style={{ marginRight: '12px' }} />
        Content Protection Features
      </Title>
      
      <Collapse 
        defaultActiveKey={['1']} 
        style={{ 
          marginTop: '20px', 
          background: '#1a1a1a', 
          borderRadius: '8px',
          border: 'none'
        }}
        expandIcon={({ isActive }) => (
          <RightOutlined rotate={isActive ? 90 : 0} style={{ color: '#FF1493' }} />
        )}
      >
        <Panel 
          header={<Text strong style={{ color: 'white' }}>Download Protection</Text>} 
          key="1"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            Our platform implements multiple techniques to prevent unauthorized downloading:
          </Paragraph>
          <List
            dataSource={[
              'Encrypted streaming protocols that make capturing video streams difficult',
              'Disabling of right-click and developer tools for casual download attempts',
              'Session-based authentication for video access',
              'Segmented video delivery that prevents complete file access'
            ]}
            renderItem={(item) => (
              <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: '#FF1493' }} />}
                  title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                />
              </List.Item>
            )}
          />
        </Panel>
        
        <Panel 
          header={<Text strong style={{ color: 'white' }}>Watermarking Options</Text>} 
          key="2"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            We offer several watermarking options to protect your content:
          </Paragraph>
          <List
            dataSource={[
              'Visible watermarks with customizable opacity, position, and size',
              'Invisible forensic watermarks that can identify the source of leaks',
              'User-specific watermarks that display viewer information',
              'Dynamic watermarks that change throughout the video'
            ]}
            renderItem={(item) => (
              <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: '#FF1493' }} />}
                  title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                />
              </List.Item>
            )}
          />
        </Panel>
        
        <Panel 
          header={<Text strong style={{ color: 'white' }}>Content ID System</Text>} 
          key="3"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            Our Content ID system automatically scans uploads to detect potential copyright infringement:
          </Paragraph>
          <List
            dataSource={[
              'Fingerprinting technology that creates unique digital signatures for your content',
              'Automatic scanning of new uploads against our database of protected content',
              'Immediate flagging and review of potential matches',
              'Options to block, monetize, or track infringing content'
            ]}
            renderItem={(item) => (
              <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: '#FF1493' }} />}
                  title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                />
              </List.Item>
            )}
          />
        </Panel>
        
        <Panel 
          header={<Text strong style={{ color: 'white' }}>Access Controls</Text>} 
          key="4"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            Control who can access your content with our comprehensive access control features:
          </Paragraph>
          <List
            dataSource={[
              'Geo-restriction options to limit content to specific countries or regions',
              'Domain locking to ensure content only plays on authorized websites',
              'IP address restrictions to limit access to specific networks',
              'Time-based access controls for limited viewing periods'
            ]}
            renderItem={(item) => (
              <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: '#FF1493' }} />}
                  title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                />
              </List.Item>
            )}
          />
        </Panel>
      </Collapse>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '40px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        <ToolOutlined style={{ marginRight: '12px' }} />
        Content Protection Tools for Creators
      </Title>
      
      <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
        <Col xs={24} md={12}>
          <Card 
            style={{ 
              backgroundColor: '#1a1a1a', 
              borderRadius: '8px',
              height: '100%',
              border: '1px solid rgba(255, 20, 147, 0.2)'
            }}
          >
            <Title level={5} style={{ color: 'white' }}>
              Standard Protection
              <Tag color="blue" style={{ marginLeft: '12px' }}>Free</Tag>
            </Title>
            <List
              dataSource={[
                'Basic watermarking',
                'Download prevention',
                'DMCA takedown support',
                'Content ID matching'
              ]}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined style={{ color: '#FF1493' }} />}
                    title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            style={{ 
              backgroundColor: '#1a1a1a', 
              borderRadius: '8px',
              height: '100%',
              border: '1px solid rgba(255, 20, 147, 0.2)'
            }}
          >
            <Title level={5} style={{ color: 'white' }}>
              Premium Protection
              <Tag color="#FF1493" style={{ marginLeft: '12px' }}>Premium</Tag>
            </Title>
            <List
              dataSource={[
                'Advanced forensic watermarking',
                'AI-powered piracy detection',
                'Real-time alerts for unauthorized use',
                'Legal assistance for infringement cases',
                'Custom access controls',
                'Priority takedown processing'
              ]}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined style={{ color: '#FF1493' }} />}
                    title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Button
          type="primary"
          size="large"
          style={{ 
            backgroundColor: '#FF1493', 
            borderColor: '#FF1493',
            height: '48px',
            width: '250px',
            fontSize: '16px'
          }}
          onClick={() => window.location.href = '/support?page=contact-us'}
        >
          Contact Us About Protection
        </Button>
        
        <Paragraph style={{ marginTop: '16px', color: '#d1d5db', fontSize: '14px' }}>
          For custom content protection solutions or to report piracy, please contact our team.
        </Paragraph>
      </div>
    </Card>
  );
};

export default ContentProtection;
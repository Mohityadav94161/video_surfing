import React from 'react';
import { Typography, Card, Divider, Alert, Button, List } from 'antd';
import { 
  WarningOutlined, 
  SafetyOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  RobotOutlined,
  TeamOutlined,
  FlagOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const CsamPolicy = () => {
  return (
    <Card className="support-card">
      <Title level={3} className="support-title">
        <WarningOutlined style={{ marginRight: '12px' }} />
        Child Sexual Abuse Material (CSAM) Policy
      </Title>
      
      <Alert
        message={<Text style={{color:'white'}}>Zero Tolerance Policy</Text>}
        description={<Text style={{color:'white'}}>XFansTube has a zero-tolerance policy for child sexual abuse material (CSAM). We are committed to preventing, detecting, and removing any such content from our platform and reporting it to the appropriate authorities.</Text>}
        type="error"
        showIcon
        icon={<ExclamationCircleOutlined style={{ color: '#FF1493' }} />}
        style={{ 
          marginBottom: '24px', 
          border: '1px solid rgba(255, 20, 147, 0.3)',
          background: 'rgba(255, 20, 147, 0.05)'
        }}
      />
      
      <Paragraph className="support-paragraph">
        XFansTube is committed to providing a safe platform for all users and takes a proactive approach to preventing the upload, distribution, or access of child sexual abuse material (CSAM). We work diligently to detect and remove any such content and cooperate fully with law enforcement agencies to report and investigate these serious crimes.
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        <SafetyOutlined style={{ marginRight: '12px' }} />
        Our Approach to CSAM Prevention
      </Title>
      
      <List
        style={{ marginTop: '20px' }}
        dataSource={[
          {
            title: 'Advanced Detection Technology',
            description: 'We employ industry-leading technology to scan all uploaded content against known CSAM databases and detect potentially new CSAM.',
            icon: <RobotOutlined style={{ fontSize: '24px', color: '#FF1493' }} />
          },
          {
            title: 'Human Review Team',
            description: 'Our specialized team of content reviewers is trained to identify potentially illegal content and take immediate action.',
            icon: <TeamOutlined style={{ fontSize: '24px', color: '#FF1493' }} />
          },
          {
            title: 'Collaboration with Authorities',
            description: 'We work closely with law enforcement agencies and report all instances of CSAM to the National Center for Missing & Exploited Children (NCMEC) and relevant authorities.',
            icon: <SafetyOutlined style={{ fontSize: '24px', color: '#FF1493' }} />
          },
          {
            title: 'User Reporting',
            description: 'We provide easy-to-use reporting tools for users to flag potentially illegal content for immediate review.',
            icon: <FlagOutlined style={{ fontSize: '24px', color: '#FF1493' }} />
          }
        ]}
        renderItem={(item) => (
          <List.Item style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px 0' }}>
            <List.Item.Meta
              avatar={item.icon}
              title={<Text strong style={{ color: 'white', fontSize: '16px' }}>{item.title}</Text>}
              description={<Text style={{ color: '#d1d5db' }}>{item.description}</Text>}
            />
          </List.Item>
        )}
      />
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        <ExclamationCircleOutlined style={{ marginRight: '12px' }} />
        Reporting CSAM
      </Title>
      
      <Paragraph className="support-paragraph">
        If you encounter content on XFansTube that you believe contains or depicts child sexual abuse material, please report it immediately using one of the following methods:
      </Paragraph>
      
      <List
        style={{ marginTop: '20px', marginBottom: '30px' }}
        dataSource={[
          'Use the "Report" button located on every video page',
          'Email our dedicated safety team at csam-report@videosurfing.com',
          'Contact the National Center for Missing & Exploited Children at www.cybertipline.org',
          'Contact your local law enforcement agency'
        ]}
        renderItem={(item) => (
          <List.Item style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px 0' }}>
            <List.Item.Meta
              avatar={<CheckCircleOutlined style={{ color: '#FF1493' }} />}
              title={<Text style={{ color: 'white' }}>{item}</Text>}
            />
          </List.Item>
        )}
      />
      
      <Alert
        message="Important"
        description="Do not download, share, or distribute any content you suspect may be CSAM, even with the intention of reporting it. This could potentially constitute a criminal offense. Instead, report the URL or location of the content using the methods described above."
        type="warning"
        showIcon
        icon={<WarningOutlined style={{ color: '#FF1493' }} />}
        style={{ 
          marginBottom: '30px', 
          border: '1px solid rgba(255, 20, 147, 0.3)',
          background: 'rgba(255, 20, 147, 0.05)'
        }}
      />
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Our Commitment
      </Title>
      
      <Paragraph className="support-paragraph">
        XFansTube is committed to:
      </Paragraph>
      
      <List
        style={{ marginTop: '20px' }}
        dataSource={[
          'Removing all CSAM from our platform immediately upon detection',
          'Preserving evidence for law enforcement investigations',
          'Reporting all instances of CSAM to the appropriate authorities',
          'Continuously improving our detection and prevention technologies',
          'Cooperating fully with law enforcement investigations',
          'Promoting awareness and education about online child safety'
        ]}
        renderItem={(item) => (
          <List.Item style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px 0' }}>
            <List.Item.Meta
              avatar={<CheckCircleOutlined style={{ color: '#FF1493' }} />}
              title={<Text style={{ color: 'white' }}>{item}</Text>}
            />
          </List.Item>
        )}
      />
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button
          type="primary"
          size="large"
          danger
          style={{ 
            backgroundColor: '#FF1493', 
            borderColor: '#FF1493',
            height: '48px',
            width: '250px',
            fontSize: '16px'
          }}
          onClick={() => window.location.href = 'https://www.missingkids.org/gethelpnow/cybertipline'}
          target="_blank"
        >
          Report to NCMEC CyberTipline
        </Button>
        
        <Paragraph style={{ marginTop: '16px', color: '#d1d5db', fontSize: '14px' }}>
          The National Center for Missing & Exploited Children (NCMEC) operates the CyberTipline, the centralized reporting system for suspected child sexual exploitation.
        </Paragraph>
      </div>
      
      <Paragraph className="support-paragraph" style={{ marginTop: '30px', fontStyle: 'italic' }}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </Paragraph>
    </Card>
  );
};

export default CsamPolicy;
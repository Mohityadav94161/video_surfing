import React from 'react';
import { Typography, Card, Collapse, Divider, List, Button, Alert } from 'antd';
import { 
  GlobalOutlined, 
  SafetyOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  RightOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const EuDsa = () => {
  return (
    <Card className="support-card">
      <Title level={3} className="support-title">
        <GlobalOutlined style={{ marginRight: '12px' }} />
        EU Digital Services Act (DSA) Information
      </Title>
      
      <Alert
        message="EU Digital Services Act Compliance"
        description="Video Surfing is committed to complying with the EU Digital Services Act (DSA) which aims to create a safer digital space where the fundamental rights of users are protected and to establish a level playing field for businesses."
        type="info"
        showIcon
        icon={<InfoCircleOutlined style={{ color: '#FF1493' }} />}
        style={{ 
          marginBottom: '24px', 
          border: '1px solid rgba(255, 20, 147, 0.3)',
          background: 'rgba(255, 20, 147, 0.05)'
        }}
      />
      
      <Paragraph className="support-paragraph">
        The Digital Services Act (DSA) is a European Union regulation that sets new standards for accountability of online platforms regarding illegal and harmful content. As a platform that serves EU users, Video Surfing is committed to meeting these standards and providing transparency about our content moderation practices.
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        <SafetyOutlined style={{ marginRight: '12px' }} />
        Our DSA Compliance Measures
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
          header={<Text strong style={{ color: 'white' }}>Content Moderation</Text>} 
          key="1"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            Our content moderation system combines automated tools and human review to ensure compliance with our policies and applicable laws:
          </Paragraph>
          <List
            dataSource={[
              'AI-powered content scanning to detect potentially illegal or policy-violating material',
              'Human review team available 24/7 to assess flagged content',
              'Clear appeals process for content removal decisions',
              'Regular transparency reports on content moderation actions'
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
          header={<Text strong style={{ color: 'white' }}>Notice and Action Mechanism</Text>} 
          key="2"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            In accordance with the DSA, we have implemented a clear notice and action mechanism:
          </Paragraph>
          <List
            dataSource={[
              'Easy-to-use reporting tools for flagging illegal content',
              'Acknowledgment of receipt for all notices',
              'Timely processing of valid notices (typically within 24-48 hours)',
              'Detailed explanations for any actions taken or not taken'
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
          header={<Text strong style={{ color: 'white' }}>Trusted Flaggers Program</Text>} 
          key="3"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            We work with trusted flaggers to help identify illegal content quickly:
          </Paragraph>
          <List
            dataSource={[
              'Partnerships with specialized organizations and experts',
              'Priority processing for notices from trusted flaggers',
              'Regular collaboration and feedback sessions',
              'Transparent criteria for trusted flagger status'
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
          header={<Text strong style={{ color: 'white' }}>Risk Assessment and Mitigation</Text>} 
          key="4"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            We regularly assess and mitigate systemic risks on our platform:
          </Paragraph>
          <List
            dataSource={[
              'Annual risk assessments to identify potential negative effects',
              'Mitigation measures for identified risks',
              'Independent audits of our risk assessment and mitigation processes',
              'Continuous improvement of our safety systems'
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
        <UserOutlined style={{ marginRight: '12px' }} />
        User Rights Under the DSA
      </Title>
      
      <Paragraph className="support-paragraph">
        The DSA provides several important rights for users of online platforms. As a Video Surfing user, you have the right to:
      </Paragraph>
      
      <List
        style={{ marginTop: '20px' }}
        dataSource={[
          'Submit notices about illegal content on our platform',
          'Receive clear information about any content moderation decisions affecting you',
          'Challenge content moderation decisions through our internal complaint system',
          'Access an out-of-court dispute settlement body if you disagree with our decision',
          'Understand how our recommendation systems work and influence what content you see',
          'Know why you are seeing specific advertisements'
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
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '40px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        <FileTextOutlined style={{ marginRight: '12px' }} />
        DSA Transparency Reports
      </Title>
      
      <Paragraph className="support-paragraph">
        In accordance with the DSA, we publish regular transparency reports that provide information about our content moderation activities, including:
      </Paragraph>
      
      <List
        style={{ marginTop: '20px', marginBottom: '30px' }}
        dataSource={[
          'Number of notices received and actions taken',
          'Average time needed to process notices',
          'Number of complaints received through the internal complaint-handling system',
          'Number of suspensions imposed',
          'Any use of automated means for content moderation',
          'Measures taken to address illegal content and misuse of our services'
        ]}
        renderItem={(item) => (
          <List.Item style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 0' }}>
            <List.Item.Meta
              avatar={<CheckCircleOutlined style={{ color: '#FF1493' }} />}
              title={<Text style={{ color: 'white' }}>{item}</Text>}
            />
          </List.Item>
        )}
      />
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
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
          Contact Our DSA Coordinator
        </Button>
        
        <Paragraph style={{ marginTop: '16px', color: '#d1d5db', fontSize: '14px' }}>
          For questions about our DSA compliance or to report illegal content, please contact our DSA coordinator at <a href="mailto:dsa@videosurfing.com" className="support-link">dsa@videosurfing.com</a>
        </Paragraph>
      </div>
    </Card>
  );
};

export default EuDsa;
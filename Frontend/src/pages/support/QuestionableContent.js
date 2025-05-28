import React from 'react';
import { Typography, Card, Divider, Alert, List, Collapse } from 'antd';
import { 
  ExclamationCircleOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  RightOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const QuestionableContent = () => {
  return (
    <Card className="support-card">
      <Title level={3} className="support-title">
        <ExclamationCircleOutlined style={{ marginRight: '12px' }} />
        Questionable Content Policy
      </Title>
      
      <Alert
        message={<Text style={{color:'white'}}>Content Standards</Text>}
        description={<Text style={{color:'white'}}>Video Surfing is committed to maintaining a platform that balances creative freedom with responsibility. This policy outlines our approach to content that may be questionable but does not necessarily violate our terms of service or applicable laws.</Text>}
        type="info"
        showIcon
        icon={<QuestionCircleOutlined style={{ color: '#FF1493' }} />}
        style={{ 
          marginBottom: '24px', 
          border: '1px solid rgba(255, 20, 147, 0.3)',
          background: 'rgba(255, 20, 147, 0.05)'
        }}
      />
      
      <Paragraph className="support-paragraph">
        At Video Surfing, we recognize that content standards can be subjective and vary across different cultures, contexts, and individuals. This policy aims to provide clear guidelines on how we approach content that may be considered questionable by some users while still respecting creative expression and diverse perspectives.
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Content Classification
      </Title>
      
      <Paragraph className="support-paragraph">
        We classify content into the following categories to help users make informed choices:
      </Paragraph>
      
      <List
        style={{ marginTop: '20px' }}
        dataSource={[
          {
            title: 'Allowed Content',
            description: 'Content that complies with our terms of service and community guidelines.',
            icon: <CheckCircleOutlined style={{ color: 'green' }} />
          },
          {
            title: 'Age-Restricted Content',
            description: 'Content that is allowed but only for adult audiences (18+) due to mature themes, language, or situations.',
            icon: <WarningOutlined style={{ color: 'orange' }} />
          },
          {
            title: 'Questionable Content',
            description: 'Content that pushes boundaries and may be offensive to some users but does not clearly violate our policies.',
            icon: <QuestionCircleOutlined style={{ color: '#FF1493' }} />
          },
          {
            title: 'Prohibited Content',
            description: 'Content that violates our terms of service, community guidelines, or applicable laws and will be removed.',
            icon: <CloseCircleOutlined style={{ color: 'red' }} />
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
        Questionable Content Guidelines
      </Title>
      
      <Paragraph className="support-paragraph">
        The following guidelines help us determine how to handle content that may be considered questionable:
      </Paragraph>
      
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
          header={<Text strong style={{ color: 'white' }}>Controversial Topics</Text>} 
          key="1"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            Content that addresses controversial social, political, or religious topics is generally allowed, provided it does not:
          </Paragraph>
          <List
            dataSource={[
              'Promote hatred or discrimination against protected groups',
              'Incite violence or illegal activities',
              'Contain harassment or bullying of individuals',
              'Spread harmful misinformation that could lead to significant harm'
            ]}
            renderItem={(item) => (
              <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={<CloseCircleOutlined style={{ color: 'red' }} />}
                  title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                />
              </List.Item>
            )}
          />
          <Paragraph style={{ color: '#d1d5db', marginTop: '16px' }}>
            Such content may be age-restricted or labeled with content warnings to help users make informed viewing decisions.
          </Paragraph>
        </Panel>
        
        <Panel 
          header={<Text strong style={{ color: 'white' }}>Mature Themes</Text>} 
          key="2"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            Content that contains mature themes such as:
          </Paragraph>
          <List
            dataSource={[
              'Strong language',
              'Non-explicit sexual references',
              'Moderate violence',
              'Drug or alcohol use',
              'Frightening or intense scenes'
            ]}
            renderItem={(item) => (
              <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={<WarningOutlined style={{ color: 'orange' }} />}
                  title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                />
              </List.Item>
            )}
          />
          <Paragraph style={{ color: '#d1d5db', marginTop: '16px' }}>
            This content is typically age-restricted and may require content warnings but is generally allowed on the platform.
          </Paragraph>
        </Panel>
        
        <Panel 
          header={<Text strong style={{ color: 'white' }}>Artistic Expression</Text>} 
          key="3"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            We recognize the importance of artistic expression and context. Content that might otherwise be questionable may be allowed if it has:
          </Paragraph>
          <List
            dataSource={[
              'Clear artistic, educational, documentary, or scientific purpose',
              'Appropriate context that explains the intent',
              'Historical or cultural significance',
              'Critical commentary or analysis'
            ]}
            renderItem={(item) => (
              <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: 'green' }} />}
                  title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                />
              </List.Item>
            )}
          />
          <Paragraph style={{ color: '#d1d5db', marginTop: '16px' }}>
            Such content may still be age-restricted or labeled with content warnings as appropriate.
          </Paragraph>
        </Panel>
        
        <Panel 
          header={<Text strong style={{ color: 'white' }}>Graphic or Disturbing Content</Text>} 
          key="4"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#1a1a1a' }}
        >
          <Paragraph style={{ color: '#d1d5db' }}>
            Content that contains graphic or disturbing elements such as:
          </Paragraph>
          <List
            dataSource={[
              'Graphic violence or injury',
              'Animal suffering',
              'Medical procedures',
              'Natural disasters or accidents'
            ]}
            renderItem={(item) => (
              <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={<QuestionCircleOutlined style={{ color: '#FF1493' }} />}
                  title={<Text style={{ color: '#d1d5db' }}>{item}</Text>}
                />
              </List.Item>
            )}
          />
          <Paragraph style={{ color: '#d1d5db', marginTop: '16px' }}>
            This content may be allowed if it has educational, documentary, or news value, but will typically be age-restricted, labeled with strong content warnings, and may be excluded from recommendations.
          </Paragraph>
        </Panel>
      </Collapse>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Content Moderation Approach
      </Title>
      
      <Paragraph className="support-paragraph">
        When we identify questionable content, we may take one or more of the following actions:
      </Paragraph>
      
      <List
        style={{ marginTop: '20px' }}
        dataSource={[
          'Apply age restrictions to limit access to adult users',
          'Add content warnings to inform users before they view the content',
          'Limit the content\'s visibility in search results and recommendations',
          'Disable comments or other interactive features if they lead to harmful discussions',
          'Provide context or educational information alongside the content',
          'In some cases, remove the content if it crosses the line into prohibited material'
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
      
      <Title level={4} style={{ color: 'white' }}>
        User Controls and Reporting
      </Title>
      
      <Paragraph className="support-paragraph">
        We empower users to control their experience and help us maintain community standards:
      </Paragraph>
      
      <List
        style={{ marginTop: '20px' }}
        dataSource={[
          'Content filtering options to limit exposure to certain types of content',
          'Easy-to-use reporting tools to flag potentially violating content',
          'Ability to block specific creators or content types',
          'Feedback mechanisms to help us improve our content policies'
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
        message="Report Questionable Content"
        description={
          <span>
            If you encounter content that you believe violates our policies or should be reviewed, 
            please use the report button on the content or contact us at{' '}
            <a href="mailto:content-review@videosurfing.com" className="support-link">
              content-review@videosurfing.com
            </a>
          </span>
        }
        type="info"
        showIcon
        icon={<ExclamationCircleOutlined style={{ color: '#FF1493' }} />}
        style={{ 
          marginTop: '30px',
          border: '1px solid rgba(255, 20, 147, 0.3)',
          background: 'rgba(255, 20, 147, 0.05)'
        }}
      />
      
      <Paragraph className="support-paragraph" style={{ marginTop: '30px', fontStyle: 'italic' }}>
        This policy is regularly reviewed and updated to reflect evolving community standards and legal requirements.
      </Paragraph>
      
      <Paragraph className="support-paragraph" style={{ fontStyle: 'italic' }}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </Paragraph>
    </Card>
  );
};

export default QuestionableContent;
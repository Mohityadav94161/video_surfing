import React from 'react';
import { Typography, Card, Divider, Alert } from 'antd';
import { FileOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Statement2257 = () => {
  return (
    <Card className="support-card">
      <Title level={3} className="support-title">
        <FileOutlined style={{ marginRight: '12px' }} />
        18 U.S.C. 2257 Statement
      </Title>
      
      <Alert
        message={<Text style={{color:'white'}}>Important Legal Notice</Text>}
        description={<Text style={{color:'white'}}>This page contains important information regarding compliance with 18 U.S.C. § 2257 and related regulations. Please read carefully.</Text>}
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
        In compliance with the Federal Labeling and Record-Keeping Law (also known as 18 U.S.C. 2257), all content uploaded to Video Surfing is subject to the following requirements and policies:
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Record-Keeping Requirements Statement
      </Title>
      
      <Paragraph className="support-paragraph">
        All models, actors, actresses and other persons that appear in any visual depiction of actual or simulated sexually explicit conduct appearing on or otherwise contained in this website were over the age of eighteen (18) years at the time the visual depiction was created.
      </Paragraph>
      
      <Paragraph className="support-paragraph">
        Video Surfing requires all content uploaders to verify that they maintain the records required by 18 U.S.C. 2257 for all uploaded content, and that these records contain individually identifiable information for all models or performers in their content. These records must include the legal name, date of birth, and any aliases used by the model or performer.
      </Paragraph>
      
      <Paragraph className="support-paragraph">
        The content uploader is the primary producer as defined in 18 U.S.C. 2257 and is responsible for maintaining all records required by federal law. Video Surfing, as a secondary producer, maintains copies of the compliance documentation provided by the content uploaders.
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Custodian of Records
      </Title>
      
      <Paragraph className="support-paragraph">
        The records required by 18 U.S.C. 2257 for materials contained on this website are kept by the individual content uploaders. Video Surfing maintains records of compliance documentation at:
      </Paragraph>
      
      <div style={{ 
        background: '#1a1a1a', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid rgba(255, 20, 147, 0.2)',
        marginTop: '20px',
        marginBottom: '30px'
      }}>
        <Text style={{ color: 'white', display: 'block' }}>
          <strong>Video Surfing, LLC</strong>
        </Text>
        <Text style={{ color: 'white', display: 'block' }}>
          Attn: Records Custodian
        </Text>
        <Text style={{ color: 'white', display: 'block' }}>
          123 Digital Avenue, Suite 500
        </Text>
        <Text style={{ color: 'white', display: 'block' }}>
          Los Angeles, CA 90001
        </Text>
        <Text style={{ color: 'white', display: 'block' }}>
          United States
        </Text>
      </div>
      
      <Paragraph className="support-paragraph">
        The name, title, and business address of the custodian of records for each individual content uploader is available upon request to authorized law enforcement agencies.
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Content Uploader Obligations
      </Title>
      
      <Paragraph className="support-paragraph">
        All content uploaders to Video Surfing must:
      </Paragraph>
      
      <ul style={{ color: '#d1d5db', marginBottom: '30px' }}>
        <li style={{ marginBottom: '10px' }}>
          Verify the age and identity of all performers in their content through examination of government-issued photo identification
        </li>
        <li style={{ marginBottom: '10px' }}>
          Maintain records of this verification as required by 18 U.S.C. 2257
        </li>
        <li style={{ marginBottom: '10px' }}>
          Provide Video Surfing with a signed statement confirming compliance with these requirements
        </li>
        <li style={{ marginBottom: '10px' }}>
          Include appropriate 2257 statements on all content
        </li>
        <li style={{ marginBottom: '10px' }}>
          Ensure all performers in their content are at least 18 years of age at the time of production
        </li>
      </ul>
      
      <Paragraph className="support-paragraph">
        Failure to comply with these requirements will result in immediate removal of content and may lead to permanent suspension from the platform and potential legal consequences.
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Exemptions
      </Title>
      
      <Paragraph className="support-paragraph">
        Content that does not contain visual depictions of actual or simulated sexually explicit conduct as defined in 18 U.S.C. 2256 may be exempt from the record-keeping requirements of 18 U.S.C. 2257. However, Video Surfing still requires age verification for all performers in any content uploaded to our platform, regardless of whether it contains sexually explicit conduct.
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Title level={4} style={{ color: 'white' }}>
        Reporting Violations
      </Title>
      
      <Paragraph className="support-paragraph">
        If you believe that any content on Video Surfing violates the requirements of 18 U.S.C. 2257 or involves individuals under the age of 18, please report it immediately using our content reporting tools or by contacting our support team at <a href="mailto:legal@videosurfing.com" className="support-link">legal@videosurfing.com</a>.
      </Paragraph>
      
      <Paragraph className="support-paragraph">
        We take these matters extremely seriously and will promptly investigate all reports. Content that violates these requirements will be immediately removed, and appropriate legal action will be taken.
      </Paragraph>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '30px 0' }} />
      
      <Paragraph className="support-paragraph" style={{ fontStyle: 'italic' }}>
        This statement is provided as required by 18 U.S.C. 2257 and related regulations. It should not be construed as legal advice. Content uploaders and users should consult with their own legal counsel regarding their obligations under these laws.
      </Paragraph>
      
      <Paragraph className="support-paragraph" style={{ marginTop: '20px', fontStyle: 'italic' }}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </Paragraph>
    </Card>
  );
};

export default Statement2257;
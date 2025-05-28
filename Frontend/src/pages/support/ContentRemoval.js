import React from 'react';
import { Typography, Card, Steps, Form, Input, Button, Divider, Alert, Upload, Select } from 'antd';
import { DeleteOutlined, UploadOutlined, InfoCircleOutlined, LinkOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ContentRemoval = () => {
  const onFinish = (values) => {
    console.log('Form submitted:', values);
    // Implement actual form submission logic here
  };

  return (
    <Card className="support-card">
      <Title level={3} className="support-title">
        <DeleteOutlined style={{ marginRight: '12px' }} />
        Content Removal / DMCA
      </Title>
      
      <Alert
        message="Important Notice"
        description="Video Surfing respects the intellectual property rights of others and expects its users to do the same. If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement, please follow the instructions below to file a DMCA notice."
        type="info"
        showIcon
        icon={<InfoCircleOutlined style={{ color: '#FF1493' }} />}
        style={{
          marginBottom: '24px',
          border: '1px solid rgba(255, 20, 147, 0.3)',
          background: 'rgba(255, 20, 147, 0.05)',
        }}
      />
      
      <Title level={4} style={{ color: 'white', marginTop: '30px' }}>
        DMCA Takedown Process
      </Title>
      
      <Steps
        direction="vertical"
        current={-1}
        style={{ marginTop: '20px', marginBottom: '30px' }}
        items={[
          {
            title: <Text strong style={{ color: 'white' }}>Identify the Infringing Content</Text>,
            description: <Text style={{ color: '#d1d5db' }}>Locate the specific URLs of the content you believe infringes your copyright.</Text>,
          },
          {
            title: <Text strong style={{ color: 'white' }}>Prepare Your DMCA Notice</Text>,
            description: <Text style={{ color: '#d1d5db' }}>Fill out the form below with all required information under the DMCA.</Text>,
          },
          {
            title: <Text strong style={{ color: 'white' }}>Submit Your Notice</Text>,
            description: <Text style={{ color: '#d1d5db' }}>Submit the form or send an email to dmca@videosurfing.com with your notice.</Text>,
          },
          {
            title: <Text strong style={{ color: 'white' }}>Verification and Processing</Text>,
            description: <Text style={{ color: '#d1d5db' }}>We'll review your request and take appropriate action within 1-2 business days.</Text>,
          },
        ]}
      />
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)' }} />
      
      <Title level={4} style={{ color: 'white', marginTop: '30px' }}>
        DMCA Takedown Request Form
      </Title>
      
      <Form layout="vertical" onFinish={onFinish} style={{ marginTop: '20px' }}>
        <Form.Item
          name="requestType"
          label={<Text style={{ color: 'white' }}>Request Type</Text>}
          rules={[{ required: true, message: 'Please select a request type' }]}
        >
          <Select placeholder="Select request type">
            <Option value="copyright">Copyright Infringement</Option>
            <Option value="trademark">Trademark Infringement</Option>
            <Option value="privacy">Privacy Violation</Option>
            <Option value="other">Other Intellectual Property Claim</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="fullName"
          label={<Text style={{ color: 'white' }}>Full Name</Text>}
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Your full legal name" />
        </Form.Item>
        
        <Form.Item
          name="email"
          label={<Text style={{ color: 'white' }}>Email Address</Text>}
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Your email address" />
        </Form.Item>
        
        <Form.Item
          name="contentUrls"
          label={<Text style={{ color: 'white' }}>URLs of Infringing Content</Text>}
          rules={[{ required: true, message: 'Please enter at least one URL' }]}
          extra={<Text style={{ color: '#d1d5db' }}>Enter one URL per line</Text>}
        >
          <TextArea 
            rows={4} 
            placeholder="https://videosurfing.com/video/..." 
            prefix={<LinkOutlined />}
          />
        </Form.Item>
        
        <Form.Item
          name="originalContent"
          label={<Text style={{ color: 'white' }}>Description of Original Content</Text>}
          rules={[{ required: true, message: 'Please describe your original content' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Describe your original content that has been infringed..." 
          />
        </Form.Item>
        
        <Form.Item
          name="originalUrls"
          label={<Text style={{ color: 'white' }}>URLs of Original Content (if available)</Text>}
        >
          <TextArea 
            rows={2} 
            placeholder="https://..." 
          />
        </Form.Item>
        
        <Form.Item
          name="declaration"
          label={<Text style={{ color: 'white' }}>Legal Declaration</Text>}
          rules={[{ required: true, message: 'You must agree to the declaration' }]}
        >
          <TextArea 
            rows={4} 
            defaultValue="I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law. I hereby state that the information in this notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."
            disabled
          />
        </Form.Item>
        
        <Form.Item
          name="electronicSignature"
          label={<Text style={{ color: 'white' }}>Electronic Signature</Text>}
          rules={[{ required: true, message: 'Please type your full name as electronic signature' }]}
          extra={<Text style={{ color: '#d1d5db' }}>Type your full legal name as your electronic signature</Text>}
        >
          <Input placeholder="Your full legal name" />
        </Form.Item>
        
        <Form.Item
          name="additionalDocuments"
          label={<Text style={{ color: 'white' }}>Supporting Documents (optional)</Text>}
          extra={<Text style={{ color: '#d1d5db' }}>Upload any documents that support your claim (max: 5MB)</Text>}
        >
          <Upload name="file" action="/upload.do" listType="text">
            <Button icon={<UploadOutlined />} style={{ backgroundColor: '#1f1f1f', color: 'white', borderColor: '#333' }}>
              Click to Upload
            </Button>
          </Upload>
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="submit-button"
            style={{ marginTop: '10px' }}
          >
            Submit DMCA Notice
          </Button>
        </Form.Item>
      </Form>
      
      <Divider style={{ borderColor: 'rgba(255, 20, 147, 0.2)', margin: '40px 0 20px' }} />
      
      <Title level={5} style={{ color: 'white' }}>
        Alternative Submission Method
      </Title>
      
      <Paragraph className="support-paragraph">
        You can also submit your DMCA notice via email to <a href="mailto:dmca@videosurfing.com" className="support-link">dmca@videosurfing.com</a>. 
        Please include all the information requested in the form above.
      </Paragraph>
      
      <Paragraph className="support-paragraph" style={{ marginTop: '20px' }}>
        <InfoCircleOutlined style={{ marginRight: '8px', color: '#FF1493' }} />
        Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material is infringing may be subject to liability.
      </Paragraph>
    </Card>
  );
};

export default ContentRemoval;
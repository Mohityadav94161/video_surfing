import React from 'react';
import { Typography, Card } from 'antd';
import './FooterPages.css';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy = ({ inSupportPage = false }) => {
  return (
    <div className={inSupportPage ? '' : 'footer-page-container'} style={{ maxWidth: inSupportPage ? '100%' : '1900px', margin: inSupportPage ? '0' : '0 auto', padding: inSupportPage ? '0' : '40px 20px' }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: '20px', color:'white' }}>Privacy Policy</Title>
      <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: '40px', color: 'white'}}>
        Last Updated: June 1, 2024
      </Paragraph>
      
      <Card style={{ marginBottom: '30px', color: 'white' }}>
        <Title level={3} style={{color: 'white'}}>1. Introduction</Title>
        <Paragraph style={{color: 'white'}}>
          At Video Surfing, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          This privacy policy applies to all users of our platform, including visitors, registered users, content creators, and administrators.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>2. Information We Collect</Title>
        <Paragraph style={{color: 'white'}}>
          We collect several types of information from and about users of our platform, including:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li><Text strong style={{color: 'white'}}>Personal Identifiers:</Text> Such as name, email address, username, and password when you register for an account.</li>
            <li><Text strong style={{color: 'white'}}>Usage Data:</Text> Information about how you use our website, including your browsing history, search queries, videos watched, and interactions with content.</li>
            <li><Text strong style={{color: 'white'}}>Device Information:</Text> Information about the device you use to access our platform, including IP address, browser type, operating system, and device identifiers.</li>
            <li><Text strong style={{color: 'white'}}>Content Data:</Text> If you upload videos or other content, we collect and store that content along with associated metadata.</li>
            <li><Text strong style={{color: 'white'}}>Communications:</Text> If you contact us directly, we may receive additional information about you, such as your name, email address, the contents of your message, and any other information you choose to provide.</li>
          </ul>
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px', color:'white' }}>
        <Title level={3} style={{color: 'white'}}>3. How We Use Your Information</Title>
        <Paragraph style={{color: 'white'}}>
          We use the information we collect for various purposes, including:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li>To provide, maintain, and improve our platform;</li>
            <li>To create and manage your account;</li>
            <li>To personalize your experience and deliver content relevant to your interests;</li>
            <li>To process and respond to your inquiries and requests;</li>
            <li>To send you technical notices, updates, security alerts, and support messages;</li>
            <li>To monitor and analyze trends, usage, and activities in connection with our platform;</li>
            <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities;</li>
            <li>To comply with legal obligations and enforce our terms of service.</li>
          </ul>
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>4. Cookies and Similar Technologies</Title>
        <Paragraph style={{color: 'white'}}>
          We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          We use the following types of cookies:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li><Text strong style={{color: 'white'}}>Essential Cookies:</Text> These cookies are necessary for the website to function properly and cannot be switched off in our systems.</li>
            <li><Text strong style={{color: 'white'}}>Performance Cookies:</Text> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
            <li><Text strong style={{color: 'white'}}>Functional Cookies:</Text> These cookies enable the website to provide enhanced functionality and personalization.</li>
            <li><Text strong style={{color: 'white'}}>Targeting Cookies:</Text> These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.</li>
          </ul>
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>5. Data Sharing and Disclosure</Title>
        <Paragraph style={{color: 'white'}}>
          We may share your information with third parties in the following circumstances:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li><Text strong style={{color: 'white'}}>Service Providers:</Text> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf.</li>
            <li><Text strong style={{color: 'white'}}>Business Transfers:</Text> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
            <li><Text strong style={{color: 'white'}}>Legal Requirements:</Text> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
            <li><Text strong style={{color: 'white'}}>Protection of Rights:</Text> We may disclose your information to protect the rights, property, or safety of Video Surfing, our users, or others.</li>
          </ul>
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>6. Data Security</Title>
        <Paragraph style={{color: 'white'}}>
          We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our platform is at your own risk.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>7. Data Retention</Title>
        <Paragraph style={{color: 'white'}}>
          We will only retain your personal information for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data, and whether we can achieve those purposes through other means, and the applicable legal requirements.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px'}}>
        <Title level={3} style={{color: 'white'}}>8. Your Data Protection Rights</Title>
        <Paragraph style={{color: 'white'}}>
          Depending on your location, you may have the following data protection rights:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li>The right to access, update, or delete the information we have on you;</li>
            <li>The right of rectification - the right to have your information corrected if it is inaccurate or incomplete;</li>
            <li>The right to object to our processing of your personal data;</li>
            <li>The right of restriction - the right to request that we restrict the processing of your personal information;</li>
            <li>The right to data portability - the right to be provided with a copy of your personal data in a structured, machine-readable format;</li>
            <li>The right to withdraw consent at any time, where we rely on your consent to process your personal information.</li>
          </ul>
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          To exercise any of these rights, please contact us using the contact information provided below.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px', color:'white' }}>
        <Title level={3} style={{color: 'white'}}>9. Children's Privacy</Title>
        <Paragraph style={{color: 'white'}}>
          Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px',color: 'white' }}>
        <Title level={3} style={{color: 'white'}}>10. Changes to This Privacy Policy</Title>
        <Paragraph style={{color: 'white'}}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </Paragraph>
      </Card>
      
      <Card>
        <Title level={3} style={{color: 'white'}}>11. Contact Us</Title>
        <Paragraph style={{color: 'white'}}>
          If you have any questions about this Privacy Policy, please contact us:
        </Paragraph>
        <Paragraph strong style={{color: 'white'}}>
          Email: privacy@videosurfing.com<br />
          Phone: +1 (800) 123-4567<br />
          Address: 123 Video Lane, Stream City, VS 12345
        </Paragraph>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
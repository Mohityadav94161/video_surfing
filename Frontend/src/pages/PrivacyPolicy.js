import React from 'react';
import { Typography, Card, Divider, Space } from 'antd';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: '20px' }}>Privacy Policy</Title>
      <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: '40px' }}>
        Last Updated: June 1, 2024
      </Paragraph>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3}>1. Introduction</Title>
        <Paragraph>
          At Video Surfing, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
        </Paragraph>
        <Paragraph>
          This privacy policy applies to all users of our platform, including visitors, registered users, content creators, and administrators.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3}>2. Information We Collect</Title>
        <Paragraph>
          We collect several types of information from and about users of our platform, including:
        </Paragraph>
        <Paragraph>
          <ul>
            <li><Text strong>Personal Identifiers:</Text> Such as name, email address, username, and password when you register for an account.</li>
            <li><Text strong>Usage Data:</Text> Information about how you use our website, including your browsing history, search queries, videos watched, and interactions with content.</li>
            <li><Text strong>Device Information:</Text> Information about the device you use to access our platform, including IP address, browser type, operating system, and device identifiers.</li>
            <li><Text strong>Content Data:</Text> If you upload videos or other content, we collect and store that content along with associated metadata.</li>
            <li><Text strong>Communications:</Text> If you contact us directly, we may receive additional information about you, such as your name, email address, the contents of your message, and any other information you choose to provide.</li>
          </ul>
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3}>3. How We Use Your Information</Title>
        <Paragraph>
          We use the information we collect for various purposes, including:
        </Paragraph>
        <Paragraph>
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
        <Title level={3}>4. Cookies and Similar Technologies</Title>
        <Paragraph>
          We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.
        </Paragraph>
        <Paragraph>
          We use the following types of cookies:
        </Paragraph>
        <Paragraph>
          <ul>
            <li><Text strong>Essential Cookies:</Text> These cookies are necessary for the website to function properly and cannot be switched off in our systems.</li>
            <li><Text strong>Performance Cookies:</Text> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
            <li><Text strong>Functional Cookies:</Text> These cookies enable the website to provide enhanced functionality and personalization.</li>
            <li><Text strong>Targeting Cookies:</Text> These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.</li>
          </ul>
        </Paragraph>
        <Paragraph>
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3}>5. Data Sharing and Disclosure</Title>
        <Paragraph>
          We may share your information with third parties in the following circumstances:
        </Paragraph>
        <Paragraph>
          <ul>
            <li><Text strong>Service Providers:</Text> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf.</li>
            <li><Text strong>Business Transfers:</Text> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
            <li><Text strong>Legal Requirements:</Text> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
            <li><Text strong>Protection of Rights:</Text> We may disclose your information to protect the rights, property, or safety of Video Surfing, our users, or others.</li>
          </ul>
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3}>6. Data Security</Title>
        <Paragraph>
          We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our platform is at your own risk.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3}>7. Data Retention</Title>
        <Paragraph>
          We will only retain your personal information for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
        </Paragraph>
        <Paragraph>
          To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data, and whether we can achieve those purposes through other means, and the applicable legal requirements.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3}>8. Your Data Protection Rights</Title>
        <Paragraph>
          Depending on your location, you may have the following data protection rights:
        </Paragraph>
        <Paragraph>
          <ul>
            <li>The right to access, update, or delete the information we have on you;</li>
            <li>The right of rectification - the right to have your information corrected if it is inaccurate or incomplete;</li>
            <li>The right to object to our processing of your personal data;</li>
            <li>The right of restriction - the right to request that we restrict the processing of your personal information;</li>
            <li>The right to data portability - the right to be provided with a copy of your personal data in a structured, machine-readable format;</li>
            <li>The right to withdraw consent at any time, where we rely on your consent to process your personal information.</li>
          </ul>
        </Paragraph>
        <Paragraph>
          To exercise any of these rights, please contact us using the contact information provided below.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3}>9. Children's Privacy</Title>
        <Paragraph>
          Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3}>10. Changes to This Privacy Policy</Title>
        <Paragraph>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
        </Paragraph>
        <Paragraph>
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </Paragraph>
      </Card>
      
      <Card>
        <Title level={3}>11. Contact Us</Title>
        <Paragraph>
          If you have any questions about this Privacy Policy, please contact us:
        </Paragraph>
        <Paragraph strong>
          Email: privacy@videosurfing.com<br />
          Phone: +1 (800) 123-4567<br />
          Address: 123 Video Lane, Stream City, VS 12345
        </Paragraph>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
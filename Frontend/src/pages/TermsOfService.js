import React from 'react';
import { Typography, Card } from 'antd';
import './FooterPages.css';

const { Title, Paragraph, Text } = Typography;

const TermsOfService = ({ inSupportPage = false }) => {
  return (
    <div className={inSupportPage ? '' : 'footer-page-container'} style={{ maxWidth: inSupportPage ? '100%' : '1900px', margin: inSupportPage ? '0' : '0 auto', padding: inSupportPage ? '0' : '40px 20px' }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: '20px', color:'white' }}>Terms of Service</Title>
      <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: '40px', color:'white' }}>
        Last Updated: June 1, 2024
      </Paragraph>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>1. Acceptance of Terms</Title>
        <Paragraph style={{color: 'white'}}>
          By accessing or using Video Surfing, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>2. Use License</Title>
        <Paragraph style={{color: 'white'}}>
          Permission is granted to temporarily download one copy of the materials on Video Surfing for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose or for any public display;</li>
            <li>Attempt to reverse engineer any software contained on Video Surfing;</li>
            <li>Remove any copyright or other proprietary notations from the materials; or</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by Video Surfing at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>3. User Accounts</Title>
        <Paragraph style={{color: 'white'}}>
          To access certain features of the platform, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information, including your password, and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account or password.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          You are solely responsible for all content that you upload, post, email, transmit, or otherwise make available via your account. We reserve the right to terminate accounts that violate these Terms of Service or for any other reason at our sole discretion.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>4. User Content</Title>
        <Paragraph style={{color: 'white'}}>
          By uploading or sharing content on our platform, you grant Video Surfing a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your content in any existing or future media. You also grant Video Surfing the right to sub-license these rights and the right to bring an action for infringement of these rights.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          Your content must not be illegal or unlawful, must not infringe any third party's legal rights, and must not be capable of giving rise to legal action whether against you or Video Surfing or a third party.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>5. Prohibited Uses</Title>
        <Paragraph style={{color: 'white'}}>
          You may use our platform only for lawful purposes and in accordance with these Terms of Service. You agree not to use our platform:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li>In any way that violates any applicable federal, state, local, or international law or regulation;</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation;</li>
            <li>To impersonate or attempt to impersonate Video Surfing, a Video Surfing employee, another user, or any other person or entity;</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the platform, or which may harm Video Surfing or users of the platform or expose them to liability.</li>
          </ul>
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>6. Disclaimer</Title>
        <Paragraph style={{color: 'white'}}>
          The materials on Video Surfing are provided on an 'as is' basis. Video Surfing makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          Further, Video Surfing does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>7. Limitations</Title>
        <Paragraph style={{color: 'white'}}>
          In no event shall Video Surfing or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Video Surfing, even if Video Surfing or a Video Surfing authorized representative has been notified orally or in writing of the possibility of such damage.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>8. Revisions and Errata</Title>
        <Paragraph style={{color: 'white'}}>
          The materials appearing on Video Surfing could include technical, typographical, or photographic errors. Video Surfing does not warrant that any of the materials on its website are accurate, complete or current. Video Surfing may make changes to the materials contained on its website at any time without notice. Video Surfing does not, however, make any commitment to update the materials.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>9. Governing Law</Title>
        <Paragraph style={{color: 'white'}}>
          These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>10. Changes to Terms</Title>
        <Paragraph style={{color: 'white'}}>
          Video Surfing reserves the right, at its sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          By continuing to access or use our platform after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the platform.
        </Paragraph>
      </Card>
      
      <Card>
        <Title level={3} style={{color: 'white'}}>11. Contact Information</Title>
        <Paragraph style={{color: 'white'}}>
          If you have any questions about these Terms, please contact us at:
        </Paragraph>
        <Paragraph strong style={{color: 'white'}}>
          Email: legal@videosurfing.com<br />
          Phone: +1 (800) 123-4567<br />
          Address: 123 Video Lane, Stream City, VS 12345
        </Paragraph>
      </Card>
    </div>
  );
};

export default TermsOfService;
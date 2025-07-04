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
          By accessing or using XFansTube, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>2. Use License</Title>
        <Paragraph style={{color: 'white'}}>
          Permission is granted to temporarily download one copy of the materials on XFansTube for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose or for any public display;</li>
            <li>Attempt to reverse engineer any software contained on XFansTube;</li>
            <li>Remove any copyright or other proprietary notations from the materials; or</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by XFansTube at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
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
          By uploading or sharing content on our platform, you grant XFansTube a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your content in any existing or future media. You also grant XFansTube the right to sub-license these rights and the right to bring an action for infringement of these rights.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          Your content must not be illegal or unlawful, must not infringe any third party's legal rights, and must not be capable of giving rise to legal action whether against you or XFansTube or a third party.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>5. Content Hosting and Third-Party Liability Disclaimer</Title>
        <Paragraph style={{color: 'white'}}>
          <Text strong style={{color: 'white'}}>Content Aggregation Service:</Text> Our platform operates as a content aggregation and indexing service. We do not host, store, upload, or control any video content displayed on our platform. All video content is hosted on third-party websites and platforms.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <Text strong style={{color: 'white'}}>User-Submitted Links:</Text> Video links, thumbnails, and metadata are submitted by users. We act solely as an intermediary platform that indexes and organizes these user-submitted links to external content.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <Text strong style={{color: 'white'}}>No Content Ownership or Control:</Text> We do not own, control, or have any editorial control over the content hosted on third-party websites. We are not responsible for:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li>The accuracy, legality, or appropriateness of content on external websites;</li>
            <li>Copyright infringement or intellectual property violations by third-party content;</li>
            <li>The availability or functionality of external websites or their content;</li>
            <li>Any damages or harm caused by accessing or viewing third-party content;</li>
            <li>The privacy practices or security of external websites.</li>
          </ul>
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <Text strong style={{color: 'white'}}>DMCA Safe Harbor:</Text> We comply with the Digital Millennium Copyright Act (DMCA) and maintain a policy for terminating accounts of repeat infringers. If you believe content linked on our platform infringes your copyright, please submit a DMCA takedown notice.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <Text strong style={{color: 'white'}}>Age-Restricted Content:</Text> Some content may not be suitable for minors. We implement age verification measures, but users are ultimately responsible for ensuring they meet legal age requirements for accessing certain content.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <Text strong style={{color: 'white'}}>Content Removal:</Text> We reserve the right to remove links to content that violates our terms or applicable laws. However, we are under no obligation to monitor or review content and do not guarantee the removal of any specific content.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <Text strong style={{color: 'white'}}>External Website Risks:</Text> When you click on video links, you will be redirected to external websites that are not under our control. These websites may contain malware, inappropriate content, or engage in practices that violate your privacy. Access external content at your own risk.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>6. Prohibited Uses</Title>
        <Paragraph style={{color: 'white'}}>
          You may use our platform only for lawful purposes and in accordance with these Terms of Service. You agree not to use our platform:
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          <ul>
            <li>In any way that violates any applicable federal, state, local, or international law or regulation;</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation;</li>
            <li>To impersonate or attempt to impersonate XFansTube, a XFansTube employee, another user, or any other person or entity;</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the platform, or which may harm XFansTube or users of the platform or expose them to liability.</li>
          </ul>
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>7. Disclaimer</Title>
        <Paragraph style={{color: 'white'}}>
          The materials on XFansTube are provided on an 'as is' basis. XFansTube makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          Further, XFansTube does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>8. Limitations</Title>
        <Paragraph style={{color: 'white'}}>
          In no event shall XFansTube or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on XFansTube, even if XFansTube or a XFansTube authorized representative has been notified orally or in writing of the possibility of such damage.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>9. Revisions and Errata</Title>
        <Paragraph style={{color: 'white'}}>
          The materials appearing on XFansTube could include technical, typographical, or photographic errors. XFansTube does not warrant that any of the materials on its website are accurate, complete or current. XFansTube may make changes to the materials contained on its website at any time without notice. XFansTube does not, however, make any commitment to update the materials.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>10. Governing Law</Title>
        <Paragraph style={{color: 'white'}}>
          These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </Paragraph>
      </Card>
      
      <Card style={{ marginBottom: '30px' }}>
        <Title level={3} style={{color: 'white'}}>11. Changes to Terms</Title>
        <Paragraph style={{color: 'white'}}>
          XFansTube reserves the right, at its sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </Paragraph>
        <Paragraph style={{color: 'white'}}>
          By continuing to access or use our platform after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the platform.
        </Paragraph>
      </Card>
      
      <Card>
        <Title level={3} style={{color: 'white'}}>12. Contact Information</Title>
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
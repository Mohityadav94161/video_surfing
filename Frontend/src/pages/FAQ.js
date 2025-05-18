import React, { useState } from 'react';
import { Typography, Collapse, Input, Button, Card, Divider, Tag, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const FAQ = () => {
  const [searchText, setSearchText] = useState('');
  
  const faqCategories = [
    {
      category: 'Account',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'To create an account, click on the "Register" button in the top right corner of the page. Fill in your username, email address, and password, then click "Register". You will receive a confirmation email to verify your account.'
        },
        {
          question: 'I forgot my password. How can I reset it?',
          answer: 'Click on the "Login" button, then click on "Forgot Password" below the login form. Enter your email address, and we will send you instructions to reset your password.'
        },
        {
          question: 'How do I change my profile information?',
          answer: 'After logging in, click on your profile icon in the top right corner and select "Profile Settings". From there, you can update your profile information, change your password, and manage your account settings.'
        },
        {
          question: 'Can I delete my account?',
          answer: 'Yes, you can delete your account by going to your profile settings and selecting the "Delete Account" option. Please note that this action is permanent and all your data will be removed from our system.'
        }
      ]
    },
    {
      category: 'Videos',
      questions: [
        {
          question: 'What video formats are supported?',
          answer: 'We support most common video formats including MP4, AVI, MOV, WMV, and FLV. For the best quality and compatibility, we recommend using MP4 format with H.264 encoding.'
        },
        {
          question: 'Is there a limit to how many videos I can upload?',
          answer: 'Free accounts can upload up to 10 videos per month with a maximum size of 500MB per video. Premium accounts have higher limits with up to 100 videos per month and 2GB per video.'
        },
        {
          question: 'How long does it take for my uploaded video to be available?',
          answer: 'After uploading, videos typically take 5-10 minutes to process depending on the file size and current server load. You will receive a notification when your video is ready to view.'
        },
        {
          question: 'Can I edit my videos after uploading?',
          answer: 'Yes, you can edit the title, description, tags, and thumbnail of your videos at any time. However, to replace the video content itself, you would need to delete the current video and upload a new one.'
        }
      ]
    },
    {
      category: 'Collections',
      questions: [
        {
          question: 'What are collections?',
          answer: 'Collections are a way to organize videos into groups based on themes, topics, or any criteria you choose. Think of them as playlists that help you categorize and easily find related videos.'
        },
        {
          question: 'How do I create a collection?',
          answer: 'To create a collection, go to the "Collections" tab in your profile, click on "Create New Collection", give it a name and description, and optionally set it as public or private. You can then add videos to your collection.'
        },
        {
          question: 'Can I share my collections with others?',
          answer: 'Yes, public collections can be shared with anyone using the share link. Private collections are only visible to you. You can change the privacy settings of your collections at any time.'
        },
        {
          question: 'Is there a limit to how many collections I can create?',
          answer: 'Free accounts can create up to 5 collections. Premium accounts can create unlimited collections.'
        }
      ]
    },
    {
      category: 'Playback',
      questions: [
        {
          question: 'Why is my video buffering?',
          answer: 'Buffering can occur due to slow internet connection, high video quality, or server load. Try lowering the video quality in the player settings, check your internet connection, or try watching at a less busy time.'
        },
        {
          question: 'Can I download videos to watch offline?',
          answer: 'Premium users can download videos for offline viewing on our mobile app. Free users can only stream videos online.'
        },
        {
          question: 'How do I change the video quality?',
          answer: 'Click on the settings icon (gear) in the video player, select "Quality", and choose your preferred resolution. The player will automatically select the best quality based on your internet connection by default.'
        },
        {
          question: 'Does Video Surfing support 4K playback?',
          answer: 'Yes, we support 4K (2160p) video playback on compatible devices with sufficient internet bandwidth. You can select the quality in the video player settings.'
        }
      ]
    },
    {
      category: 'Billing',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept major credit cards (Visa, MasterCard, American Express), PayPal, and in some regions, we support Apple Pay and Google Pay.'
        },
        {
          question: 'How do I upgrade to a premium account?',
          answer: 'Go to your account settings and click on "Upgrade to Premium". Select your preferred subscription plan (monthly or annual), enter your payment information, and confirm your purchase.'
        },
        {
          question: 'Can I get a refund if I\'m not satisfied?',
          answer: 'We offer a 7-day money-back guarantee for new premium subscriptions. Contact our support team within 7 days of your purchase to request a refund.'
        },
        {
          question: 'How do I cancel my premium subscription?',
          answer: 'To cancel your subscription, go to your account settings, select "Subscription", and click on "Cancel Subscription". Your premium features will remain active until the end of your current billing period.'
        }
      ]
    }
  ];
  
  const filteredFAQs = searchText
    ? faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.question.toLowerCase().includes(searchText.toLowerCase()) || 
               q.answer.toLowerCase().includes(searchText.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqCategories;
  
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: '20px' }}>Frequently Asked Questions</Title>
      <Paragraph style={{ textAlign: 'center', marginBottom: '40px' }}>
        Find answers to the most common questions about Video Surfing
      </Paragraph>
      
      <Card style={{ marginBottom: '40px' }}>
        <Input
          size="large"
          placeholder="Search for questions or keywords..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <Text strong style={{ marginRight: '10px' }}>Popular topics:</Text>
          {faqCategories.map(category => (
            <Tag 
              key={category.category} 
              color="#FF1493"
              style={{ cursor: 'pointer' }}
              onClick={() => setSearchText(category.category)}
            >
              {category.category}
            </Tag>
          ))}
          {searchText && (
            <Button type="link" onClick={() => setSearchText('')} style={{ padding: '0 10px' }}>
              Clear search
            </Button>
          )}
        </div>
      </Card>
      
      {filteredFAQs.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Title level={4}>No results found</Title>
            <Paragraph>
              We couldn't find any FAQs matching your search. Try different keywords or browse the categories.
            </Paragraph>
            <Button type="primary" onClick={() => setSearchText('')} style={{ backgroundColor: '#FF1493' }}>
              View all FAQs
            </Button>
          </div>
        </Card>
      ) : (
        filteredFAQs.map((category, index) => (
          category.questions.length > 0 && (
            <div key={category.category} style={{ marginBottom: '30px' }}>
              <Divider orientation="left">
                <Space>
                  <Text strong style={{ fontSize: '18px' }}>{category.category}</Text>
                  <Tag color="#FF1493">{category.questions.length}</Tag>
                </Space>
              </Divider>
              
              <Collapse 
                defaultActiveKey={searchText ? category.questions.map((_, i) => i.toString()) : []}
                expandIconPosition="end"
              >
                {category.questions.map((faq, i) => (
                  <Panel 
                    header={<Text strong>{faq.question}</Text>} 
                    key={i}
                  >
                    <Paragraph>{faq.answer}</Paragraph>
                  </Panel>
                ))}
              </Collapse>
            </div>
          )
        ))
      )}
      
      <Card style={{ marginTop: '40px', textAlign: 'center' }}>
        <Title level={4}>Still have questions?</Title>
        <Paragraph>
          If you couldn't find the answer you were looking for, please contact our support team.
        </Paragraph>
        <Button type="primary" href="/support" style={{ backgroundColor: '#FF1493' }}>
          Contact Support
        </Button>
      </Card>
    </div>
  );
};

export default FAQ;
import React from 'react';
import { Result, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { HomeFilled } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Link to="/">
            <Button type="primary" icon={<HomeFilled />}>
              Back to Home
            </Button>
          </Link>
        }
      />
      <div style={{ margin: '0 auto', maxWidth: '500px' }}>
        <Paragraph>
          <Text strong>
            The page you're looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </Text>
        </Paragraph>
        <Paragraph>
          Please check the URL in the address bar or try navigating to our homepage.
        </Paragraph>
      </div>
    </div>
  );
};

export default NotFound; 
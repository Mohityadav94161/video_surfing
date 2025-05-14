import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const TestComponent = () => {
  return (
    <Card>
      <Title level={2}>Test Component</Title>
      <Text>If you can see this, routing is working correctly!</Text>
    </Card>
  );
};

export default TestComponent; 
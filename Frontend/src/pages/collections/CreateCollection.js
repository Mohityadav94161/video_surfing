import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Form, 
  Input, 
  Button, 
  Card, 
  Alert, 
  Space, 
  Divider 
} from 'antd';
import { 
  FolderAddOutlined, 
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useCollections } from '../../contexts/CollectionContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CreateCollection = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { createCollection } = useCollections();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createCollection(values.name, values.description);
      
      if (result.success) {
        navigate('/collections');
      } else {
        setError(result.message || 'Failed to create collection. Please try again.');
      }
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/collections')}
        style={{ padding: 0, marginBottom: 16 }}
      >
        Back to Collections
      </Button>
      
      <Title level={2}>Create New Collection</Title>
      <Paragraph type="secondary">
        Create a collection to organize your favorite videos in one place.
      </Paragraph>

      <Divider />
      
      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }} 
        />
      )}
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Collection Name"
            rules={[
              { required: true, message: 'Please enter a name for your collection' },
              { max: 50, message: 'Collection name cannot exceed 50 characters' }
            ]}
          >
            <Input 
              placeholder="My Favorite Videos" 
              maxLength={50}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description (Optional)"
            rules={[
              { max: 200, message: 'Description cannot exceed 200 characters' }
            ]}
          >
            <TextArea 
              placeholder="Add a description for your collection" 
              rows={4}
              maxLength={200}
              showCount
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<FolderAddOutlined />}
                loading={loading}
              >
                Create Collection
              </Button>
              <Button onClick={() => navigate('/collections')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCollection; 
import React, { useState } from 'react';
import { 
  Button, 
  Dropdown, 
  Menu, 
  Modal, 
  Form, 
  Input, 
  message, 
  Divider,
  List,
  Typography,
  Spin,
  Empty
} from 'antd';
import { PlusOutlined, FolderAddOutlined, SaveOutlined } from '@ant-design/icons';
import { useCollections } from '../contexts/CollectionContext';
import { useAuth } from '../contexts/AuthContext';

const { Text } = Typography;

const AddToCollection = ({ video, compact = false }) => {
  const [form] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { 
    collections, 
    loading, 
    createCollection, 
    addVideoToCollection,
    fetchUserCollections
  } = useCollections();

  // Ensure we have the latest collections when opening menu
  const handleMenuVisibleChange = (visible) => {
    if (visible && isAuthenticated) {
      fetchUserCollections();
    }
    setMenuVisible(visible);
  };

  // Add to an existing collection
  const handleAddToCollection = async (collectionId) => {
    const videoId = video._id;
    const result = await addVideoToCollection(collectionId, videoId);
    
    if (result.success) {
      setMenuVisible(false);
    }
  };

  // Create a new collection and add video to it
  const handleCreateCollection = async (values) => {
    const result = await createCollection(values.name, values.description);
    
    if (result.success) {
      // Add video to the newly created collection
      await addVideoToCollection(result.collection._id, video._id);
      setCreateModalVisible(false);
      form.resetFields();
    }
  };

  // Function to render the dropdown menu
  const getDropdownMenu = () => {
    if (!isAuthenticated) {
      return [
        {
          key: 'login',
          disabled: true,
          label: <Text type="secondary">Please login to use collections</Text>
        }
      ];
    }

    const menuItems = [];
    
    if (loading) {
      menuItems.push({
        key: 'loading',
        disabled: true,
        label: (
          <>
            <Spin size="small" /> Loading collections...
          </>
        )
      });
    } else if (collections.length === 0) {
      menuItems.push({
        key: 'empty',
        disabled: true,
        label: (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="No collections found" 
            style={{ margin: '8px 0' }}
          />
        )
      });
    } else {
      collections.forEach(collection => {
        menuItems.push({
          key: collection._id,
          label: (
            <>
              <SaveOutlined /> {collection.name}
              <Text type="secondary" style={{ marginLeft: 8 }}>
                ({(collection.videos || []).length} videos)
              </Text>
            </>
          ),
          onClick: () => handleAddToCollection(collection._id)
        });
      });
    }
    
    // Add divider
    menuItems.push({
      type: 'divider'
    });
    
    // Add create new option
    menuItems.push({
      key: 'create-new',
      label: (
        <>
          <PlusOutlined /> Create new collection
        </>
      ),
      onClick: () => {
        setMenuVisible(false);
        setCreateModalVisible(true);
      }
    });
    
    return menuItems;
  };

  // If compact mode (for cards), render just the icon
  if (compact) {
    return (
      <>
        <Dropdown 
          menu={{
            items: getDropdownMenu(),
            style: { maxHeight: '300px', overflow: 'auto' }
          }} 
          trigger={['click']}
          onVisibleChange={handleMenuVisibleChange}
          open={menuVisible}
        >
          <FolderAddOutlined onClick={e => e.preventDefault()} />
        </Dropdown>

        <Modal
          title="Create New Collection"
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateCollection}
          >
            <Form.Item
              name="name"
              label="Collection Name"
              rules={[{ required: true, message: 'Please enter a collection name' }]}
            >
              <Input placeholder="Enter collection name" maxLength={50} />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Description (Optional)"
            >
              <Input.TextArea 
                placeholder="Enter collection description" 
                maxLength={200}
                rows={3}
              />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Create and Add Video
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }

  // Full button for normal view
  return (
    <>
      <Dropdown 
        menu={{
          items: getDropdownMenu(),
          style: { maxHeight: '300px', overflow: 'auto' }
        }} 
        trigger={['click']}
        onVisibleChange={handleMenuVisibleChange}
        open={menuVisible}
      >
        <Button 
          icon={<FolderAddOutlined />} 
          onClick={(e) => e.preventDefault()}
          style={{ marginRight: 8 }}
        >
          Add to Collection
        </Button>
      </Dropdown>

      <Modal
        title="Create New Collection"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCollection}
        >
          <Form.Item
            name="name"
            label="Collection Name"
            rules={[{ required: true, message: 'Please enter a collection name' }]}
          >
            <Input placeholder="Enter collection name" maxLength={50} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <Input.TextArea 
              placeholder="Enter collection description" 
              maxLength={200}
              rows={3}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create and Add Video
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddToCollection; 
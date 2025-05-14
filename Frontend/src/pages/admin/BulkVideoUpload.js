import React, { useState } from 'react';
import { 
  Typography, 
  Input, 
  Button, 
  Card, 
  Modal, 
  message, 
  Form,
  Spin,
  List,
  Checkbox,
  Space,
  Divider,
  Row,
  Col,
  Alert,
  Progress,
  Tag,
  Collapse,
  Tooltip,
  Tabs,
  Switch
} from 'antd';
import { 
  LinkOutlined, 
  CheckOutlined, 
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SettingOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  FileOutlined,
  LinkOutlined as LinkIcon,
  FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const BulkVideoUpload = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [customSelectors, setCustomSelectors] = useState([
    { type: 'css', selector: 'video' },
    { type: 'css', selector: 'iframe[src*="youtube"], iframe[src*="vimeo"]' }
  ]);
  const [newSelector, setNewSelector] = useState({ type: 'css', selector: '' });
  const [fileExtensions, setFileExtensions] = useState([
    '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'
  ]);
  const [newExtension, setNewExtension] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState({
    scanScriptTags: true,
    scanIframeAttributes: true,
    scanDataAttributes: true,
    followExternalLinks: false,
    scanOnlyMainContent: false,
    minVideoDuration: 0,
    maxScanDepth: 1
  });

  // Function to add a custom selector
  const addCustomSelector = () => {
    if (newSelector.selector.trim() === '') {
      message.warning('Please enter a valid selector');
      return;
    }
    
    setCustomSelectors([...customSelectors, { ...newSelector }]);
    setNewSelector({ type: 'css', selector: '' });
  };

  // Function to remove a custom selector
  const removeCustomSelector = (index) => {
    const updatedSelectors = [...customSelectors];
    updatedSelectors.splice(index, 1);
    setCustomSelectors(updatedSelectors);
  };

  // Function to add a new file extension
  const addFileExtension = () => {
    if (newExtension.trim() === '') {
      message.warning('Please enter a valid file extension');
      return;
    }
    
    // Make sure it starts with a dot
    const extension = newExtension.trim().startsWith('.') 
      ? newExtension.trim() 
      : `.${newExtension.trim()}`;
    
    if (fileExtensions.includes(extension)) {
      message.warning('This extension already exists');
      return;
    }
    
    setFileExtensions([...fileExtensions, extension]);
    setNewExtension('');
  };

  // Function to remove a file extension
  const removeFileExtension = (extension) => {
    // Don't allow removing all extensions
    if (fileExtensions.length <= 1) {
      message.warning('At least one file extension must remain');
      return;
    }
    
    setFileExtensions(fileExtensions.filter(ext => ext !== extension));
  };

  // Handle advanced option changes
  const handleAdvancedOptionChange = (option, value) => {
    setAdvancedOptions({
      ...advancedOptions,
      [option]: value
    });
  };

  // Function to extract videos from a URL
  const extractVideos = async () => {
    const url = form.getFieldValue('url');
    
    if (!url) {
      message.error('Please enter a website URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the API to extract videos from the URL with custom selectors
      const response = await axios.post('/api/videos/extract-from-page', { 
        url,
        customSelectors,
        fileExtensions,
        options: advancedOptions
      });
      const extractedVideos = response.data.data.videos;
      
      if (extractedVideos.length === 0) {
        message.warning('No videos found on the provided page');
        setLoading(false);
        return;
      }
      
      // Initialize videos with selected state
      const videosWithSelection = extractedVideos.map(video => ({
        ...video,
        selected: true
      }));
      
      setVideos(videosWithSelection);
      setSelectedVideos(videosWithSelection.map(v => v.url));
      setModalVisible(true);
      
    } catch (err) {
      console.error('Error extracting videos:', err);
      const errorMessage = err.response?.data?.message || 'Failed to extract videos from the provided URL';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection of a single video
  const toggleVideoSelection = (url) => {
    setVideos(prevVideos => 
      prevVideos.map(video => 
        video.url === url ? { ...video, selected: !video.selected } : video
      )
    );
    
    setSelectedVideos(prevSelected => {
      if (prevSelected.includes(url)) {
        return prevSelected.filter(u => u !== url);
      } else {
        return [...prevSelected, url];
      }
    });
  };
  
  // Select all videos
  const selectAllVideos = () => {
    setVideos(prevVideos => 
      prevVideos.map(video => ({ ...video, selected: true }))
    );
    setSelectedVideos(videos.map(v => v.url));
  };
  
  // Deselect all videos
  const deselectAllVideos = () => {
    setVideos(prevVideos => 
      prevVideos.map(video => ({ ...video, selected: false }))
    );
    setSelectedVideos([]);
  };

  // Upload selected videos
  const uploadSelectedVideos = async () => {
    if (selectedVideos.length === 0) {
      message.warning('Please select at least one video to upload');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const selectedVideoObjects = videos.filter(video => video.selected);
      const totalVideos = selectedVideoObjects.length;
      let uploaded = 0;
      
      for (const video of selectedVideoObjects) {
        try {
          await axios.post('/api/videos', {
            originalUrl: video.url,
            title: video.title,
            description: video.description || '',
            thumbnailUrl: video.thumbnailUrl,
            category: video.category || 'Other',
            tags: video.tags || [],
            sourceWebsite: video.sourceWebsite || new URL(video.url).hostname
          });
          
          uploaded++;
          setUploadProgress(Math.floor((uploaded / totalVideos) * 100));
          
        } catch (err) {
          console.error(`Error uploading video ${video.url}:`, err);
          // Continue with other videos even if one fails
        }
      }
      
      message.success(`Successfully uploaded ${uploaded} out of ${totalVideos} videos`);
      setModalVisible(false);
      form.resetFields();
      
    } catch (err) {
      console.error('Error during bulk upload:', err);
      message.error('An error occurred during bulk upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Title level={2}>Bulk Video Upload</Title>
      <Text type="secondary">
        Extract and upload multiple videos from a webpage. Simply enter the URL of a page containing videos.
      </Text>
      
      <Divider />
      
      <Card title="Website URL" style={{ marginBottom: 20 }}>
        <Form layout="vertical" form={form}>
          <Form.Item 
            name="url" 
            label="Enter webpage URL" 
            rules={[{ required: true, message: 'Please enter a webpage URL' }]}
            extra="Paste the URL of a page containing videos you want to extract"
          >
            <Input 
              prefix={<LinkOutlined />} 
              placeholder="https://example.com/videos-page" 
              size="large"
            />
          </Form.Item>
          
          <Collapse
            ghost
            style={{ marginBottom: 16 }}
          >
            <Panel 
              header={
                <Space>
                  <SettingOutlined />
                  <Text strong>Advanced Options</Text>
                </Space>
              } 
              key="1"
            >
              <Tabs defaultActiveKey="1">
                <TabPane tab="CSS Selectors" key="1">
                  <div style={{ marginBottom: 16 }}>
                    <Text>Define how videos are detected on the page by adding custom CSS selectors:</Text>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <List
                      size="small"
                      bordered
                      dataSource={customSelectors}
                      renderItem={(selector, index) => (
                        <List.Item
                          actions={[
                            <Button 
                              icon={<DeleteOutlined />} 
                              size="small" 
                              danger
                              onClick={() => removeCustomSelector(index)}
                              disabled={index < 2} // Don't allow removing the default selectors
                            />
                          ]}
                        >
                          <Space>
                            <Tag color="blue">{selector.type}</Tag>
                            <Text code>{selector.selector}</Text>
                          </Space>
                        </List.Item>
                      )}
                      footer={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Input 
                            placeholder="Enter CSS selector (e.g., .video-container video)"
                            value={newSelector.selector}
                            onChange={(e) => setNewSelector({...newSelector, selector: e.target.value})}
                            style={{ flex: 1 }}
                          />
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={addCustomSelector}
                          >
                            Add
                          </Button>
                        </div>
                      }
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        Examples: <Text code>.custom-player</Text>, <Text code>div[data-video]</Text>, <Text code>iframe[src*="player"]</Text>
                      </Text>
                    </div>
                  </div>
                </TabPane>
                
                <TabPane tab="File Extensions" key="2">
                  <div style={{ marginBottom: 16 }}>
                    <Text>
                      Specify which file extensions should be considered as video files when scanning links:
                    </Text>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {fileExtensions.map(ext => (
                        <Tag 
                          key={ext} 
                          closable 
                          onClose={() => removeFileExtension(ext)}
                          color="blue"
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          <FileOutlined style={{ marginRight: 4 }} /> {ext}
                        </Tag>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Input 
                        placeholder="Enter file extension (e.g., .mp4)"
                        value={newExtension}
                        onChange={(e) => setNewExtension(e.target.value)}
                        style={{ flex: 1 }}
                        prefix={<FileOutlined />}
                      />
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={addFileExtension}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        Add any video file extensions that should be detected in links on the page.
                      </Text>
                    </div>
                  </div>
                </TabPane>
                
                <TabPane tab="Additional Options" key="3">
                  <div style={{ marginBottom: 16 }}>
                    <Text>Configure how the video extraction process behaves:</Text>
                  </div>
                  
                  <List
                    size="small"
                    bordered
                    itemLayout="horizontal"
                    split
                    dataSource={[
                      {
                        name: 'scanScriptTags',
                        label: 'Scan script tags for video data',
                        description: 'Look for video information embedded in JavaScript or JSON within script tags',
                        value: advancedOptions.scanScriptTags
                      },
                      {
                        name: 'scanDataAttributes',
                        label: 'Scan data attributes',
                        description: 'Look for video URLs in HTML5 data attributes like data-video-url',
                        value: advancedOptions.scanDataAttributes
                      },
                      {
                        name: 'scanIframeAttributes',
                        label: 'Scan iframe attributes',
                        description: 'Extract information from iframe properties beyond just the src attribute',
                        value: advancedOptions.scanIframeAttributes
                      },
                      {
                        name: 'followExternalLinks',
                        label: 'Follow external links',
                        description: 'Follow links to external pages that might contain videos (may increase extraction time)',
                        value: advancedOptions.followExternalLinks
                      },
                      {
                        name: 'scanOnlyMainContent',
                        label: 'Scan only main content',
                        description: 'Try to detect and scan only the main content area, skipping navigation, footers, etc.',
                        value: advancedOptions.scanOnlyMainContent
                      }
                    ]}
                    renderItem={item => (
                      <List.Item 
                        actions={[
                          <Switch 
                            checked={item.value} 
                            onChange={(checked) => handleAdvancedOptionChange(item.name, checked)}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          title={item.label}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                  
                  <div style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Maximum scan depth"
                          tooltip="How many levels of nested elements to scan for videos (higher values may be slower)"
                        >
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            value={advancedOptions.maxScanDepth}
                            onChange={(e) => handleAdvancedOptionChange('maxScanDepth', parseInt(e.target.value) || 1)}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Minimum video duration (seconds)"
                          tooltip="Filter out videos shorter than this duration (0 = no filter)"
                        >
                          <Input
                            type="number"
                            min={0}
                            value={advancedOptions.minVideoDuration}
                            onChange={(e) => handleAdvancedOptionChange('minVideoDuration', parseInt(e.target.value) || 0)}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </TabPane>
              </Tabs>
            </Panel>
          </Collapse>
          
          <Button 
            type="primary" 
            onClick={extractVideos} 
            loading={loading}
            icon={<PlayCircleOutlined />}
          >
            Extract Videos
          </Button>
        </Form>
      </Card>
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}
      
      {/* Modal for video selection and upload */}
      <Modal
        title="Videos Found"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="upload" 
            type="primary" 
            onClick={uploadSelectedVideos}
            loading={uploading}
            disabled={selectedVideos.length === 0}
          >
            Upload Selected ({selectedVideos.length})
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button onClick={selectAllVideos} icon={<CheckCircleOutlined />}>
              Select All
            </Button>
            <Button onClick={deselectAllVideos} icon={<CloseCircleOutlined />}>
              Deselect All
            </Button>
            <Text type="secondary">
              {selectedVideos.length} of {videos.length} videos selected
            </Text>
          </Space>
        </div>
        
        {uploading && (
          <div style={{ marginBottom: 16 }}>
            <Progress percent={uploadProgress} status="active" />
            <Text>Uploading videos...</Text>
          </div>
        )}
        
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={videos}
          renderItem={video => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: 180, 
                    overflow: 'hidden', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    position: 'relative'
                  }}>
                    <img 
                      alt={video.title} 
                      src={video.thumbnailUrl || process.env.REACT_APP_DEFAULT_THUMBNAIL} 
                      style={{ width: '100%' }}
                    />
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <VideoCameraOutlined /> View
                    </a>
                  </div>
                }
                actions={[
                  <Checkbox 
                    checked={video.selected}
                    onChange={() => toggleVideoSelection(video.url)}
                  >
                    Select
                  </Checkbox>
                ]}
                style={{ 
                  opacity: video.selected ? 1 : 0.6,
                  border: video.selected ? '2px solid #1890ff' : 'none'
                }}
              >
                <Card.Meta
                  title={video.title}
                  description={
                    <div>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {video.description || 'No description available'}
                      </Paragraph>
                      <Space direction="vertical" size={1} style={{ width: '100%' }}>
                        <Text type="secondary">Source: {video.sourceWebsite || new URL(video.url).hostname}</Text>
                        <Tooltip title={video.url}>
                          <Text type="secondary" ellipsis style={{ width: '100%', cursor: 'pointer' }}>
                            URL: {video.url}
                          </Text>
                        </Tooltip>
                        {video.foundBy && (
                          <Tag color="blue" style={{ marginTop: 4 }}>
                            <FilterOutlined /> {video.foundBy}
                          </Tag>
                        )}
                      </Space>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default BulkVideoUpload; 
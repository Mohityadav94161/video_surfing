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
  Switch,
  Radio,
  Badge,
  Select,
  Statistic
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
  DeleteOutlined,
  FileOutlined,
  LinkOutlined as LinkIcon,
  FilterOutlined,
  ChromeOutlined,
  FirefoxOutlined,
  IeOutlined,
  AppleOutlined,
  MobileOutlined,
  EyeOutlined,
  TagsOutlined
} from '@ant-design/icons';
import axios, { longRunningAxios } from '../../utils/axiosConfig';
import { useBackgroundTask } from '../../contexts/BackgroundTaskContext';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Option } = Select;

const BulkVideoUpload = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [extractionStats, setExtractionStats] = useState(null);
  const [extractionProgress, setExtractionProgress] = useState(null);
  const [lastExtractedVideos, setLastExtractedVideos] = useState(null);
  const { startVideoExtraction } = useBackgroundTask();
  const { user, token, loading: authLoading } = useAuth();
  const [bulkActionForm] = Form.useForm();
  const [bulkUploadForm] = Form.useForm();
  
  // Bulk upload options
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkTags, setBulkTags] = useState('');
  const [showBulkOptions, setShowBulkOptions] = useState(false);
  const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingNewCategory, setAddingNewCategory] = useState(false);

  // Categories for bulk upload
  const [categories, setCategories] = useState([
    'Education',
    'Entertainment', 
    'Gaming',
    'Music',
    'News',
    'Sports',
    'Technology',
    'Travel',
    'Other'
  ]);

  // Check for extraction results from background task on component mount
  React.useEffect(() => {
    console.log('BulkVideoUpload component mounted, checking for extraction results...');
    const extractionResults = sessionStorage.getItem('extractionResults');
    console.log('Extraction results from sessionStorage:', extractionResults ? 'Found' : 'Not found');
    
    if (extractionResults) {
      try {
        const results = JSON.parse(extractionResults);
        
        // Validate results structure
        if (!results.videos || !Array.isArray(results.videos)) {
          console.warn('Invalid extraction results structure:', results);
          sessionStorage.removeItem('extractionResults');
          return;
        }
        
        // Set extraction stats
        setExtractionStats({
          url: results.url || 'Background extraction',
          pageTitle: results.pageTitle || 'Unknown Page',
          domain: results.domain || 'Unknown Domain',
          isAdultContent: results.isAdultContent || false,
          count: results.videos.length,
          extractionMethods: results.extractionMethods || [],
          pagination: results.pagination || null,

        });
        
        // Initialize videos with selected state
        const videosWithSelection = results.videos.map(video => ({
          ...video,
          selected: true
        }));
        
        setVideos(videosWithSelection);
        setSelectedVideos(videosWithSelection.map(v => v.url));
        
        // Store for later viewing
        setLastExtractedVideos({
          videos: videosWithSelection,
          stats: {
            url: results.url || 'Background extraction',
            pageTitle: results.pageTitle || 'Unknown Page',
            domain: results.domain || 'Unknown Domain',
            isAdultContent: results.isAdultContent || false,
            count: results.videos.length,
            extractionMethods: results.extractionMethods || [],
            pagination: results.pagination || null,
          }
        });
        
        // Clear the stored results immediately
        sessionStorage.removeItem('extractionResults');
        
        // Show success message and open modal
        message.success({
          content: `Loaded ${results.videos.length} videos from background extraction. Select videos to upload.`,
          duration: 4
        });
        
        // Open modal after a short delay to ensure state is updated
        setTimeout(() => {
          setModalVisible(true);
        }, 100);
        
      } catch (err) {
        console.error('Error loading extraction results:', err);
        sessionStorage.removeItem('extractionResults');
        message.error('Failed to load extraction results. Please try extracting again.');
      }
    }
  }, []);
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
    maxScanDepth: 1,
    browser: 'chrome',
    maxPages: 1,          // Number of pages to scan for pagination
    maxVideos: 500,       // Maximum number of videos to extract
    enableAdultOptimizations: true,  // Enable adult site specific optimizations
    extractStreamingUrls: true,      // Extract HLS/DASH streaming URLs
    triggerLazyLoading: true,        // Try to trigger lazy loading
    clickLoadMore: true              // Try to click "Load More" buttons
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

  // Get confidence color based on score
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.5) return 'orange';
    return 'red';
  };

  // Get quality badge color based on quality
  const getQualityColor = (quality) => {
    if (quality === '4K') return '#f50';
    if (quality === '1080p') return '#87d068';
    if (quality === '720p') return '#108ee9';
    if (quality === '480p') return '#2db7f5';
    return '#d3d3d3';
  };

  // Function to extract videos from a URL (now with background processing option)
  const extractVideos = async (runInBackground = false) => {
    const url = form.getFieldValue('url');
    
    if (!url) {
      message.error('Please enter a website URL');
      return;
    }
    
    // Prepare extraction options
    const options = {
        customSelectors: customSelectors.map(s => s.selector),
        fileExtensions,
        scanScriptTags: advancedOptions.scanScriptTags,
        scanIframeAttributes: advancedOptions.scanIframeAttributes,
        scanDataAttributes: advancedOptions.scanDataAttributes,
        followExternalLinks: advancedOptions.followExternalLinks,
        scanOnlyMainContent: advancedOptions.scanOnlyMainContent,
        minVideoDuration: advancedOptions.minVideoDuration,
        maxScanDepth: advancedOptions.maxScanDepth,
        browser: advancedOptions.browser,
        maxPages: advancedOptions.maxPages,
      maxVideos: advancedOptions.maxVideos,
      enableAdultOptimizations: advancedOptions.enableAdultOptimizations,
      extractStreamingUrls: advancedOptions.extractStreamingUrls,
      triggerLazyLoading: advancedOptions.triggerLazyLoading,
      clickLoadMore: advancedOptions.clickLoadMore
    };

    if (runInBackground) {
      // Start background extraction
      const result = await startVideoExtraction(url, options);
      if (result.success) {
        message.success('Video extraction started in background. You can navigate to other pages while it processes.');
        form.resetFields();
      }
      return;
    }
    
    // Run extraction in foreground (existing behavior)
    setLoading(true);
    setError(null);
    setExtractionStats(null);
    setExtractionProgress('Initializing video extraction...');
    
    try {
      // Show progress updates
      const progressMessages = [
        'Connecting to website...',
        'Loading page content...',
        'Scanning for videos...',
        'Processing video metadata...',
        'Finalizing results...'
      ];
      
      let messageIndex = 0;
      const progressInterval = setInterval(() => {
        if (messageIndex < progressMessages.length - 1) {
          setExtractionProgress(progressMessages[messageIndex]);
          messageIndex++;
        }
      }, 10000); // Update every 10 seconds
      
      // Call the API to extract videos from the URL with all options using long-running axios
      const response = await longRunningAxios.post('/videos/extract-from-page', { 
        url,
        ...options
      });
      
      clearInterval(progressInterval);
      
      // Extract video array and stats from response
      const { videos: extractedVideos, count, extractionMethods, pageTitle, domain, isAdultContent, pagination } = response.data.data;
      
      // Set extraction stats
      setExtractionStats({
        url,
        pageTitle,
        domain,
        isAdultContent,
        count,
        extractionMethods,
        pagination
      });
      
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
      
      // Store for later viewing
      setLastExtractedVideos({
        videos: videosWithSelection,
        stats: {
          url,
          pageTitle,
          domain,
          isAdultContent,
          count,
          extractionMethods,
          pagination
        }
      });
      
      setVideos(videosWithSelection);
      setSelectedVideos(videosWithSelection.map(v => v.url));
      setModalVisible(true);
      
    } catch (err) {
      console.error('Error extracting videos:', err);
      
      let errorMessage = 'Failed to extract videos from the provided URL';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'The video extraction process is taking longer than expected. The server may still be processing your request. Please try again in a few minutes.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      const errorDetails = err.response?.data?.details || {};
      
      setError(`${errorMessage}${errorDetails.url ? ` - URL: ${errorDetails.url}` : ''}`);
      message.error(errorMessage);
    } finally {
      setLoading(false);
      setExtractionProgress(null);
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

  // Test authentication
  const testAuthentication = async () => {
    try {
      console.log('Testing authentication...');
      console.log('Current axios headers:', axios.defaults.headers.common);
      const response = await axios.get('/auth/me');
      console.log('Auth test successful:', response.data);
      message.success('Authentication test successful!');
    } catch (error) {
      console.error('Auth test failed:', error);
      message.error(`Authentication test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // View last extracted videos
  const viewLastExtractedVideos = () => {
    if (!lastExtractedVideos) {
      message.warning('No previously extracted videos found');
      return;
    }
    
    setVideos(lastExtractedVideos.videos);
    setSelectedVideos(lastExtractedVideos.videos.filter(v => v.selected).map(v => v.url));
    setExtractionStats(lastExtractedVideos.stats);
    setModalVisible(true);
    
    message.info(`Showing ${lastExtractedVideos.videos.length} previously extracted videos`);
  };

  // Clear bulk options
  const clearBulkOptions = () => {
    setBulkCategory('');
    setBulkTags('');
    setShowBulkOptions(false);
    setNewCategoryModalVisible(false);
    setNewCategoryName('');
  };

  // Add new category
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      message.warning('Please enter a category name');
      return;
    }
    
    const trimmedName = newCategoryName.trim();
    
    // Check if category already exists
    if (categories.includes(trimmedName)) {
      message.warning('This category already exists');
      return;
    }
    
    setAddingNewCategory(true);
    
    try {
      // Add to categories array
      setCategories(prevCategories => [...prevCategories, trimmedName]);
      
      // Set the new category as selected
      setBulkCategory(trimmedName);
      
      // Close modal and reset
      setNewCategoryModalVisible(false);
      setNewCategoryName('');
      
      message.success(`Category "${trimmedName}" added successfully`);
      
    } catch (err) {
      console.error('Error adding category:', err);
      message.error('Failed to add category. Please try again.');
    } finally {
      setAddingNewCategory(false);
    }
  };

  // Upload selected videos
  const uploadSelectedVideos = async () => {
    if (selectedVideos.length === 0) {
      message.warning('Please select at least one video to upload');
      return;
    }
    
    // Check authentication
    if (!user) {
      message.error('You must be logged in to upload videos. Please log in and try again.');
      console.log('Authentication check failed:', { user: !!user, token: !!token });
      return;
    }
    
    console.log('User authenticated:', { userId: user.id, username: user.username, role: user.role, hasToken: !!token });
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const selectedVideoObjects = videos.filter(video => video.selected);
      const totalVideos = selectedVideoObjects.length;
      let uploaded = 0;
      let failed = 0;
      const failedVideos = [];
      
      console.log(`Starting upload of ${totalVideos} videos...`);
      
      for (const video of selectedVideoObjects) {
        try {
          console.log(`Uploading video: ${video.title} from ${video.url}`);
          
          const uploadData = {
            originalUrl: video.url,
            title: video.title,
            description: video.description || '',
            thumbnailUrl: video.thumbnailUrl,
            category: bulkCategory || video.category || 'Other',
            tags: bulkTags ? bulkTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : (video.tags || []),
            sourceWebsite: video.sourceWebsite || new URL(video.url).hostname,
            duration: video.metadata?.duration || video.duration || null,
            // Don't send videoId - let backend generate it automatically
            // videoId: video.videoId || null,
            quality: video.quality
          };
          
          console.log('Upload data:', uploadData);
          
          const response = await axios.post('/videos', uploadData);
          console.log(`Successfully uploaded: ${video.title}`, response.data);
          
          uploaded++;
          setUploadProgress(Math.floor((uploaded / totalVideos) * 100));
          
        } catch (err) {
          console.error(`Error uploading video ${video.title} (${video.url}):`, err);
          console.error('Error details:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message
          });
          
          failed++;
          failedVideos.push({
            title: video.title,
            url: video.url,
            error: err.response?.data?.message || err.message
          });
          
          // Continue with other videos even if one fails
        }
      }
      
      console.log(`Upload completed. Uploaded: ${uploaded}, Failed: ${failed}`);
      
      if (uploaded > 0) {
        if (failed === 0) {
          message.success(`Successfully uploaded all ${uploaded} videos!`);
        } else {
          message.warning(`Uploaded ${uploaded} videos successfully, but ${failed} failed. Check console for details.`);
          
          // Log failed videos for debugging
          if (failedVideos.length > 0) {
            console.error('Failed video uploads:', failedVideos);
          }
        }
             } else {
         message.error(`Failed to upload any videos. Please check your authentication and try again.`);
         
         // Show first few error messages
         if (failedVideos.length > 0) {
           const firstError = failedVideos[0].error;
           console.error('First upload error:', firstError);
           
           // Show more detailed error in a modal or notification
           Modal.error({
             title: 'Upload Failed',
             content: (
               <div>
                 <p>Failed to upload videos. Common issues:</p>
                 <ul>
                   <li>Authentication expired - please refresh and log in again</li>
                   <li>Network connection issues</li>
                   <li>Server error</li>
                 </ul>
                 <p><strong>Error details:</strong> {firstError}</p>
               </div>
             ),
           });
         }
       }
      
      // Reset selection and close modal
      setSelectedVideos([]);
      setModalVisible(false);
      bulkActionForm.resetFields();
      clearBulkOptions();
      
    } catch (err) {
      console.error('Error during bulk upload:', err);
      message.error(`An error occurred during bulk upload: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      <Title level={2}>Bulk Video Upload</Title>
      <Text type="secondary">
        Extract and upload multiple videos from a webpage. Simply enter the URL of a page containing videos.
      </Text>
      
      {/* Authentication Status (for debugging) */}
      <div style={{ marginTop: 8, marginBottom: 8, padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        {user ? (
          <Text type="success" style={{ fontSize: '12px' }}>
            ✓ Logged in as: {user.username} ({user.role}) | Token: {token ? '✓' : '✗'}
          </Text>
        ) : (
          <Text type="danger" style={{ fontSize: '12px' }}>
            ⚠ Not logged in - Please log in to upload videos | Token: {token ? '✓' : '✗'}
          </Text>
        )}
        <br />
                          <Text style={{ fontSize: '10px', color: '#666' }}>
           Debug: user={!!user}, token={!!token}, authLoading={authLoading}
         </Text>
         <div style={{ marginTop: '8px' }}>
           <Button size="small" onClick={testAuthentication}>
             Test Authentication
           </Button>
         </div>
       </div>
      
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
                      },
                      {
                        name: 'enableAdultOptimizations',
                        label: 'Enable adult site optimizations',
                        description: 'Use specialized patterns and methods for extracting videos from adult websites',
                        value: advancedOptions.enableAdultOptimizations
                      },
                      {
                        name: 'extractStreamingUrls',
                        label: 'Extract streaming URLs',
                        description: 'Look for HLS (.m3u8) and DASH (.mpd) streaming manifests commonly used by video sites',
                        value: advancedOptions.extractStreamingUrls
                      },
                      {
                        name: 'triggerLazyLoading',
                        label: 'Trigger lazy loading',
                        description: 'Scroll and interact with the page to trigger lazy-loaded content',
                        value: advancedOptions.triggerLazyLoading
                      },
                      {
                        name: 'clickLoadMore',
                        label: 'Click load more buttons',
                        description: 'Automatically click "Load More" or "Show More" buttons to reveal additional content',
                        value: advancedOptions.clickLoadMore
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
                    
                    <Form.Item
                      label="Browser Emulation"
                      tooltip="Mimic a specific browser to improve video extraction capabilities"
                    >
                      <Select
                        value={advancedOptions.browser}
                        onChange={(value) => handleAdvancedOptionChange('browser', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value="chrome">
                          <Space>
                            <ChromeOutlined />
                            Chrome
                          </Space>
                        </Option>
                        <Option value="firefox">
                          <Space>
                            Firefox
                          </Space>
                        </Option>
                        <Option value="edge">
                          <Space>
                            <IeOutlined />
                            Edge
                          </Space>
                        </Option>
                        <Option value="safari">
                          <Space>
                            <AppleOutlined />
                            Safari
                          </Space>
                        </Option>
                        <Option value="mobile">
                          <Space>
                            <MobileOutlined />
                            Mobile Browser
                          </Space>
                        </Option>
                      </Select>
                    </Form.Item>
                    
                    <Divider orientation="left">Pagination Options</Divider>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Maximum Pages to Scan"
                          tooltip="Number of pages to scan when the website has pagination (1 = current page only)"
                        >
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={advancedOptions.maxPages}
                            onChange={(e) => handleAdvancedOptionChange('maxPages', parseInt(e.target.value) || 1)}
                            addonAfter="pages"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Maximum Videos to Extract"
                          tooltip="Limit the total number of videos that will be extracted"
                        >
                          <Input
                            type="number"
                            min={10}
                            max={1000}
                            value={advancedOptions.maxVideos}
                            onChange={(e) => handleAdvancedOptionChange('maxVideos', parseInt(e.target.value) || 500)}
                            addonAfter="videos"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </TabPane>
              </Tabs>
            </Panel>
          </Collapse>
          
          <Space wrap>
          <Button 
            type="primary" 
              onClick={() => extractVideos(false)} 
            loading={loading}
            icon={<PlayCircleOutlined />}
            size="large"
          >
              {loading ? 'Extracting...' : 'Extract Videos'}
          </Button>
            <Button 
              onClick={() => extractVideos(true)} 
              disabled={loading}
              icon={<VideoCameraOutlined />}
              size="large"
            >
              Extract in Background
            </Button>
            {lastExtractedVideos && (
              <Button 
                onClick={viewLastExtractedVideos}
                icon={<EyeOutlined />}
                size="large"
                type="default"
              >
                View Last Extracted ({lastExtractedVideos.videos.length})
              </Button>
            )}
          </Space>
          
          {extractionProgress && (
            <div style={{ marginTop: 16 }}>
              <Progress percent={undefined} status="active" />
              <Text type="secondary">{extractionProgress}</Text>
            </div>
          )}
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
      
      {extractionStats && (
        <Card title="Extraction Statistics" style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="Page Title" value={extractionStats.pageTitle || 'Unknown'} />
            </Col>
            <Col span={8}>
              <Statistic title="Domain" value={extractionStats.domain || 'Unknown'} />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Videos Found" 
                value={extractionStats.count} 
                suffix={extractionStats.isAdultContent ? <Tag color="red">Adult Content</Tag> : null}
              />
            </Col>

          </Row>
          {extractionStats.pagination && (
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic 
                  title="Pages Scanned" 
                  value={extractionStats.pagination.pagesScanned || 1} 
                  suffix={`of ${extractionStats.pagination.totalPages || 1}`}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Pagination"
                  value={extractionStats.pagination.pagesScanned > 1 ? "Multiple pages" : "Single page"}
                  valueStyle={{
                    color: extractionStats.pagination.pagesScanned > 1 ? '#52c41a' : '#1890ff'
                  }}
                />
              </Col>
            </Row>
          )}
          <Divider orientation="left">Extraction Methods</Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(extractionStats.extractionMethods || []).map((method, index) => (
              <Tag key={index} color="blue">{method}</Tag>
            ))}
          </div>
        </Card>
      )}
      
      {/* Modal for video selection and upload */}
      <Modal
        title="Videos Found"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          clearBulkOptions();
        }}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => {
            setModalVisible(false);
            clearBulkOptions();
          }}>
            Cancel
          </Button>,
          <Button 
            key="upload" 
            type="primary" 
            onClick={uploadSelectedVideos}
            loading={uploading}
            disabled={selectedVideos.length === 0}
            icon={bulkCategory || bulkTags ? <TagsOutlined /> : undefined}
          >
            Upload Selected ({selectedVideos.length})
            {bulkCategory || bulkTags ? ' with Bulk Options' : ''}
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
            {extractionStats?.pagination && extractionStats.pagination.pagesScanned > 1 && (
              <Tag color="green">
                Videos from {extractionStats.pagination.pagesScanned} pages
              </Tag>
            )}
          </Space>
        </div>
        
        {/* Bulk Upload Options */}
        {selectedVideos.length > 0 && (
          <Card 
            title="Bulk Upload Options" 
            size="small" 
            style={{ marginBottom: 16 }}
            extra={
              <Button 
                type="link" 
                size="small"
                onClick={() => setShowBulkOptions(!showBulkOptions)}
              >
                {showBulkOptions ? 'Hide' : 'Show'} Options
              </Button>
            }
          >
            {showBulkOptions && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Category for all videos">
                    <Select
                      placeholder="Select category (optional)"
                      value={bulkCategory}
                      onChange={(value) => {
                        if (value === 'add_new') {
                          setNewCategoryModalVisible(true);
                        } else {
                          setBulkCategory(value);
                        }
                      }}
                      allowClear
                      style={{ width: '100%' }}
                      dropdownRender={(menu) => (
                        <div>
                          {menu}
                          <Divider style={{ margin: '8px 0' }} />
                          <div
                            style={{
                              padding: '8px',
                              cursor: 'pointer',
                              color: '#1890ff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onClick={() => setNewCategoryModalVisible(true)}
                          >
                            <PlusOutlined />
                            Add New Category
                          </div>
                        </div>
                      )}
                    >
                      {categories.map(category => (
                        <Option key={category} value={category}>
                          {category}
                        </Option>
                      ))}
                    </Select>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Leave empty to use extracted category
                    </Text>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Tags for all videos">
                    <Input
                      placeholder="tag1, tag2, tag3 (optional)"
                      value={bulkTags}
                      onChange={(e) => setBulkTags(e.target.value)}
                      allowClear
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Comma-separated. Leave empty to use extracted tags
                    </Text>
                  </Form.Item>
                </Col>
              </Row>
            )}
            {!showBulkOptions && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <Text type="secondary">
                  {bulkCategory && `Category: ${bulkCategory}`}
                  {bulkCategory && bulkTags && ' | '}
                  {bulkTags && `Tags: ${bulkTags}`}
                  {!bulkCategory && !bulkTags && 'Click "Show Options" to set category and tags for all videos'}
                </Text>
                {(bulkCategory || bulkTags) && (
                  <div style={{ marginTop: '4px' }}>
                    <Tag color="blue" size="small">
                      Will be applied to {selectedVideos.length} selected video{selectedVideos.length !== 1 ? 's' : ''}
                    </Tag>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
        
        {uploading && (
          <div style={{ marginBottom: 16 }}>
            <Progress percent={uploadProgress} status="active" />
            <Text>Uploading videos...</Text>
          </div>
        )}
        
        <List
          grid={{ gutter: 12, xs: 2, sm: 3, md: 4, lg: 5, xl: 6, xxl: 8 }}
          dataSource={videos}
          renderItem={video => (
            <List.Item>
              <Card
                hoverable
                size="small"
                cover={
                  <div style={{ 
                    height: 120, 
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
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/200x120?text=No+Thumbnail';
                      }}
                    />
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span className="logo-text"><span>XFans</span><span style={{color:'#fff'}}>Tube</span></span> View
                    </a>
                    {video.quality && video.quality !== 'unknown' && (
                      <div style={{ 
                          position: 'absolute',
                        top: 4,
                        right: 4,
                        background: getQualityColor(video.quality),
                        color: 'white',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}>
                        {video.quality}
                      </div>
                    )}
                    {video.metadata?.duration && (
                      <div style={{ 
                        position: 'absolute',
                        bottom: 4,
                        left: 4,
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        fontSize: '9px'
                      }}>
                        {video.metadata.duration}
                      </div>
                    )}
                  </div>
                }
                actions={[
                  <Checkbox 
                    checked={video.selected}
                    onChange={() => toggleVideoSelection(video.url)}
                    size="small"
                  />
                ]}
                style={{ 
                  opacity: video.selected ? 1 : 0.7,
                  border: video.selected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  borderRadius: '6px'
                }}
              >
                <Card.Meta
                  title={
                    <Tooltip title={video.title}>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '500',
                        lineHeight: '1.2',
                        height: '28px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {video.title}
                      </div>
                        </Tooltip>
                  }
                  description={
                    <div style={{ fontSize: '10px' }}>
                      <div style={{ 
                        color: '#666',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {video.sourceWebsite || new URL(video.url).hostname}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {video.foundBy && (
                          <Tag size="small" color="blue" style={{ fontSize: '8px', margin: 0, padding: '0 4px' }}>
                            {video.foundBy.split(':')[0]}
                            </Tag>
                          )}
                          {video.confidence && (
                          <Tag 
                            size="small" 
                            color={getConfidenceColor(video.confidence)} 
                            style={{ fontSize: '8px', margin: 0, padding: '0 4px' }}
                          >
                            {Math.round(video.confidence * 100)}%
                              </Tag>
                          )}
                        {video.metadata?.views && (
                          <Tag size="small" style={{ fontSize: '8px', margin: 0, padding: '0 4px' }}>
                            {video.metadata.views}
                              </Tag>
                          )}
                        </div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Modal>
      
      {/* Add New Category Modal */}
      <Modal
        title="Add New Category"
        open={newCategoryModalVisible}
        onCancel={() => {
          setNewCategoryModalVisible(false);
          setNewCategoryName('');
        }}
        onOk={handleAddNewCategory}
        confirmLoading={addingNewCategory}
        okText="Add Category"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item
            label="Category Name"
            required
            rules={[
              { required: true, message: 'Please enter a category name' },
              { min: 2, message: 'Category name must be at least 2 characters' },
              { max: 50, message: 'Category name must be less than 50 characters' }
            ]}
          >
            <Input
              placeholder="Enter category name (e.g., Comedy, Documentary, Tutorial)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onPressEnter={handleAddNewCategory}
              maxLength={50}
              showCount
            />
          </Form.Item>
          
          <Alert
            message="Note"
            description="This category will be added to the list and can be used for future uploads."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default BulkVideoUpload; 
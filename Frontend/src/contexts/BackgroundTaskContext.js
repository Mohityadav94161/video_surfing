import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { notification } from 'antd';
import { VideoCameraOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { longRunningAxios } from '../utils/axiosConfig';

const BackgroundTaskContext = createContext();

export const useBackgroundTask = () => {
  const context = useContext(BackgroundTaskContext);
  if (!context) {
    throw new Error('useBackgroundTask must be used within a BackgroundTaskProvider');
  }
  return context;
};

export const BackgroundTaskProvider = ({ children }) => {
  const [activeTasks, setActiveTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const taskIdRef = useRef(0);

  // Generate unique task ID
  const generateTaskId = useCallback(() => {
    taskIdRef.current += 1;
    return `task_${taskIdRef.current}_${Date.now()}`;
  }, []);

  // Start a new background video extraction task
  const startVideoExtraction = useCallback(async (url, options = {}) => {
    const taskId = generateTaskId();
    const task = {
      id: taskId,
      type: 'video_extraction',
      url,
      options,
      startTime: new Date(),
      status: 'running',
      progress: 'Initializing video extraction...'
    };

    // Add to active tasks
    setActiveTasks(prev => [...prev, task]);

    // Show initial notification
    const notificationKey = `extraction_${taskId}`;
    notification.info({
      key: notificationKey,
      message: 'Video Extraction Started',
      description: `Extracting videos from: ${new URL(url).hostname}`,
      icon: <VideoCameraOutlined style={{ color: '#1890ff' }} />,
      duration: 3,
      placement: 'bottomRight'
    });

    try {
      // Start the extraction process
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
          setActiveTasks(prev => prev.map(t => 
            t.id === taskId 
              ? { ...t, progress: progressMessages[messageIndex] }
              : t
          ));
          messageIndex++;
        }
      }, 10000);

      // Make the API call
      const response = await longRunningAxios.post('/videos/extract-from-page', {
        url,
        ...options
      });

      clearInterval(progressInterval);

      // Update task as completed
      const completedTask = {
        ...task,
        status: 'completed',
        endTime: new Date(),
        result: response.data.data,
        videosFound: response.data.data.videos.length
      };

      // Move from active to completed
      setActiveTasks(prev => prev.filter(t => t.id !== taskId));
      setCompletedTasks(prev => [completedTask, ...prev.slice(0, 9)]); // Keep only last 10

      // Store results for the bulk upload page
      sessionStorage.setItem('extractionResults', JSON.stringify(response.data.data));
      
      // Show success notification
      notification.success({
        key: notificationKey,
        message: 'Video Extraction Complete',
        description: (
          <div>
            <div>Found {response.data.data.videos.length} videos from {new URL(url).hostname}</div>
            <div style={{ marginTop: 8 }}>
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Notification clicked, navigating to bulk upload...');
                  // Navigate to bulk upload page
                  window.location.href = '/admin/bulk-upload';
                }}
                style={{ 
                  color: '#1890ff', 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  fontWeight: 'bold'
                }}
              >
                🎬 Click to view and upload videos →
              </a>
            </div>
          </div>
        ),
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 12,
        placement: 'bottomRight',
        onClick: () => {
          console.log('Notification body clicked, navigating to bulk upload...');
          // Also make the entire notification clickable
          window.location.href = '/admin/bulk-upload';
        },
        style: { 
          cursor: 'pointer',
          border: '2px solid #52c41a',
          backgroundColor: '#f6ffed'
        }
      });

      return { success: true, taskId, result: response.data.data };

    } catch (error) {
      // Update task as failed
      const failedTask = {
        ...task,
        status: 'failed',
        endTime: new Date(),
        error: error.message
      };

      // Move from active to completed (failed)
      setActiveTasks(prev => prev.filter(t => t.id !== taskId));
      setCompletedTasks(prev => [failedTask, ...prev.slice(0, 9)]);

      // Show error notification
      let errorMessage = 'Failed to extract videos from the provided URL';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'The extraction process timed out. The server may still be processing your request.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      notification.error({
        key: notificationKey,
        message: 'Video Extraction Failed',
        description: errorMessage,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 6,
        placement: 'bottomRight'
      });

      return { success: false, taskId, error: errorMessage };
    }
  }, [generateTaskId]);

  // Get task status
  const getTaskStatus = useCallback((taskId) => {
    const activeTask = activeTasks.find(t => t.id === taskId);
    if (activeTask) return activeTask;
    
    const completedTask = completedTasks.find(t => t.id === taskId);
    return completedTask || null;
  }, [activeTasks, completedTasks]);

  // Cancel a running task
  const cancelTask = useCallback((taskId) => {
    setActiveTasks(prev => prev.filter(t => t.id !== taskId));
    
    notification.warning({
      message: 'Task Cancelled',
      description: 'Video extraction task has been cancelled',
      duration: 3,
      placement: 'bottomRight'
    });
  }, []);

  // Clear completed tasks
  const clearCompletedTasks = useCallback(() => {
    setCompletedTasks([]);
  }, []);

  // Get active task count
  const getActiveTaskCount = useCallback(() => {
    return activeTasks.length;
  }, [activeTasks]);

  // Get task summary for display
  const getTaskSummary = useCallback(() => {
    const running = activeTasks.length;
    const completed = completedTasks.filter(t => t.status === 'completed').length;
    const failed = completedTasks.filter(t => t.status === 'failed').length;
    
    return { running, completed, failed, total: running + completed + failed };
  }, [activeTasks, completedTasks]);

  const value = {
    activeTasks,
    completedTasks,
    startVideoExtraction,
    getTaskStatus,
    cancelTask,
    clearCompletedTasks,
    getActiveTaskCount,
    getTaskSummary
  };

  return (
    <BackgroundTaskContext.Provider value={value}>
      {children}
    </BackgroundTaskContext.Provider>
  );
};

export default BackgroundTaskContext; 
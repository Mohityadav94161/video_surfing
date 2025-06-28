import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Button, Drawer, List, Progress, Typography, Space, Tag } from 'antd';
import { 
  LoadingOutlined, 
  VideoCameraOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useBackgroundTask } from '../contexts/BackgroundTaskContext';

const { Text, Title } = Typography;

const BackgroundTaskIndicator = () => {
  const { activeTasks, completedTasks, getTaskSummary, cancelTask } = useBackgroundTask();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [lastResultData, setLastResultData] = useState(null);

  // Check for completed tasks that haven't been viewed yet
  useEffect(() => {
    const recentCompletedTask = completedTasks.find(task => 
      task.status === 'completed' && 
      task.endTime && 
      (new Date() - task.endTime) < 60000 // Within last minute
    );
    
    if (recentCompletedTask && !lastResultData) {
      setLastResultData({
        taskId: recentCompletedTask.id,
        result: recentCompletedTask.result
      });
    }
  }, [completedTasks, lastResultData]);

  const taskSummary = getTaskSummary();
  const hasActiveTasks = activeTasks.length > 0;
  const hasAnyTasks = taskSummary.total > 0;

  if (!hasAnyTasks) return null;

  const formatDuration = (startTime, endTime) => {
    const duration = (endTime - startTime) / 1000;
    if (duration < 60) return `${Math.round(duration)}s`;
    return `${Math.round(duration / 60)}m ${Math.round(duration % 60)}s`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <LoadingOutlined spin style={{ color: '#1890ff' }} />;
      case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <VideoCameraOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return '#1890ff';
      case 'completed': return '#52c41a';
      case 'failed': return '#ff4d4f';
      default: return '#666';
    }
  };

  return (
    <>
      {/* Floating Indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          cursor: 'pointer'
        }}
        onClick={() => setDrawerVisible(true)}
      >
        <Badge count={hasActiveTasks ? activeTasks.length : 0} offset={[-5, 5]}>
          <Tooltip 
            title={
              hasActiveTasks 
                ? `${activeTasks.length} extraction${activeTasks.length > 1 ? 's' : ''} running`
                : `${taskSummary.completed} completed, ${taskSummary.failed} failed`
            }
          >
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={hasActiveTasks ? <LoadingOutlined spin /> : <VideoCameraOutlined />}
              style={{
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                background: hasActiveTasks ? '#1890ff' : '#52c41a'
              }}
            />
          </Tooltip>
        </Badge>
      </div>

      {/* Task Details Drawer */}
      <Drawer
        title={
          <Space>
            <VideoCameraOutlined />
            Video Extraction Tasks
          </Space>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
        extra={
          <Space>
            <Tag color="blue">{taskSummary.running} Running</Tag>
            <Tag color="green">{taskSummary.completed} Completed</Tag>
            <Tag color="red">{taskSummary.failed} Failed</Tag>
          </Space>
        }
      >
        {/* Show extraction results if available */}
        {lastResultData && lastResultData.result && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
            <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
              <CheckCircleOutlined /> Extraction Complete
            </Title>
            <Text>Found {lastResultData.result.videos?.length || 0} videos ready to upload</Text>
            <div style={{ marginTop: 8 }}>
              <Button 
                type="primary" 
                size="small" 
                icon={<EyeOutlined />}
                onClick={() => {
                  // Store results in sessionStorage for the page to pick up
                  sessionStorage.setItem('extractionResults', JSON.stringify(lastResultData.result));
                  // Navigate to bulk upload page
                  window.location.href = '/admin/bulk-upload';
                  setLastResultData(null);
                  setDrawerVisible(false);
                }}
              >
                View & Upload Videos
              </Button>
              <Button 
                size="small" 
                style={{ marginLeft: 8 }}
                onClick={() => setLastResultData(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>
              <LoadingOutlined spin style={{ color: '#1890ff' }} /> Running Tasks
            </Title>
            <List
              size="small"
              dataSource={activeTasks}
              renderItem={task => (
                <List.Item
                  actions={[
                    <Button 
                      size="small" 
                      danger 
                      icon={<CloseOutlined />}
                      onClick={() => cancelTask(task.id)}
                    >
                      Cancel
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={getStatusIcon(task.status)}
                    title={
                      <Tooltip title={task.url}>
                        <Text ellipsis style={{ maxWidth: 200 }}>
                          {new URL(task.url).hostname}
                        </Text>
                      </Tooltip>
                    }
                    description={
                      <div>
                        <div>{task.progress}</div>
                        <Progress 
                          percent={undefined} 
                          status="active" 
                          size="small" 
                          style={{ marginTop: 4 }}
                        />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Started {formatDuration(new Date(), task.startTime)} ago
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <Title level={5}>Recent Tasks</Title>
            <List
              size="small"
              dataSource={completedTasks.slice(0, 5)}
              renderItem={task => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getStatusIcon(task.status)}
                    title={
                      <Space>
                        <Tooltip title={task.url}>
                          <Text ellipsis style={{ maxWidth: 180 }}>
                            {new URL(task.url).hostname}
                          </Text>
                        </Tooltip>
                        {task.status === 'completed' && (
                          <Tag color="green" size="small">
                            {task.videosFound} videos
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        {task.status === 'completed' && (
                          <Text type="secondary">
                            Completed in {formatDuration(task.startTime, task.endTime)}
                          </Text>
                        )}
                        {task.status === 'failed' && (
                          <Text type="danger" style={{ fontSize: '11px' }}>
                            {task.error}
                          </Text>
                        )}
                        <div>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {task.endTime.toLocaleTimeString()}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {/* Empty State */}
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <VideoCameraOutlined style={{ fontSize: 48, color: '#ccc' }} />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">No extraction tasks yet</Text>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default BackgroundTaskIndicator; 
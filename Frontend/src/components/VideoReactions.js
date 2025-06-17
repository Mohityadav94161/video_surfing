import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  Tooltip, 
  Typography,
  message
} from 'antd';
import { 
  LikeOutlined, 
  LikeFilled, 
  DislikeOutlined, 
  DislikeFilled 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';
import './VideoReactions.css';

const { Text } = Typography;

const VideoReactions = ({ videoId }) => {
  const { isAuthenticated, user } = useAuth();
  const [reactions, setReactions] = useState({
    likes: 0,
    dislikes: 0,
    currentUserReaction: null
  });
  const [loading, setLoading] = useState(false);

  // Fetch reactions on load and when videoId changes
  useEffect(() => {
    const fetchReactions = async () => {
      if (!videoId) return;
      
      try {
        const response = await axios.get(`/videos/${videoId}/reactions`);
        setReactions(response.data.data);
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };

    fetchReactions();
  }, [videoId]);

  const handleReaction = async (type) => {
    if (!isAuthenticated) {
      message.info('Please log in to react to videos');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`/videos/${videoId}/reactions`, {
        type
      });
      
      setReactions(response.data.data);
    } catch (error) {
      console.error('Error updating reaction:', error);
      message.error('Failed to update reaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-reactions">
      <Tooltip title={isAuthenticated ? 'Like' : 'Log in to like'}>
        <Button
          type="text"
          icon={reactions.currentUserReaction === 'like' ? <LikeFilled style={{color:'white'}} /> : <LikeOutlined style={{color:'white'}}/>}
          onClick={() => handleReaction('like')}
          loading={loading}
          disabled={!isAuthenticated}
          className={`reaction-button like-button ${reactions.currentUserReaction === 'like' ? 'active' : ''}`}
        >
          <Text className={`reaction-count ${reactions.currentUserReaction === 'like' ? 'like-count' : ''}`}>
            {reactions.likes}
          </Text>
        </Button>
      </Tooltip>
      
      <Tooltip title={isAuthenticated ? 'Dislike' : 'Log in to dislike'}>
        <Button
          type="text"
          icon={reactions.currentUserReaction === 'dislike' ? <DislikeFilled style={{color:'white'}}/> : <DislikeOutlined style={{color:'white'}}/>}
          onClick={() => handleReaction('dislike')}
          loading={loading}
          disabled={!isAuthenticated}
          className={`reaction-button dislike-button ${reactions.currentUserReaction === 'dislike' ? 'active' : ''}`}
        >
          <Text className={`reaction-count ${reactions.currentUserReaction === 'dislike' ? 'dislike-count' : ''}`}>
            {reactions.dislikes}
          </Text>
        </Button>
      </Tooltip>
    </div>
  );
};

export default VideoReactions; 
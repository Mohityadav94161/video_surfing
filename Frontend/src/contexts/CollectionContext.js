import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axiosConfig'; // Use configured axios with correct baseURL
import { message } from 'antd';
import { useAuth } from './AuthContext';

// Use mock data only if the API is not available
const USE_MOCK_DATA = false;

// Mock data for fallback only
const MOCK_COLLECTIONS = [
  {
    id: '507f1f77bcf86cd799439011', // Valid ObjectId format for testing
    name: 'Favorites',
    description: 'My favorite videos',
    videos: [
      {
        id: '507f1f77bcf86cd799439012',
        title: 'Introduction to React',
        description: 'Learn the basics of React',
        thumbnailUrl: 'https://via.placeholder.com/640x360?text=React+Tutorial',
        category: 'Education'
      }
    ]
  },
  {
    id: '507f1f77bcf86cd799439013',
    name: 'Watch Later',
    description: 'Videos to watch later',
    videos: []
  }
];

const CollectionContext = createContext();

export const useCollections = () => useContext(CollectionContext);

export const CollectionProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user collections when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserCollections();
    } else {
      setCollections([]);
    }
  }, [isAuthenticated, user]);

  // Fetch all collections for the user
  const fetchUserCollections = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setCollections(MOCK_COLLECTIONS);
      } else {
        const response = await axios.get('/api/collections');
        const collectionsData = response.data.data.collections;
        setCollections(collectionsData);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      
      if (err.response?.status === 404 || err.message.includes('Network Error')) {
        console.log('API not available, using mock collection data');
        setCollections(MOCK_COLLECTIONS);
        message.warning('Using sample collection data for demonstration');
      } else {
        setError('Failed to load your collections');
        message.error('Could not load collections');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create a new collection
  const createCollection = async (name, description = '') => {
    if (!isAuthenticated) {
      message.error('You must be logged in to create collections');
      return { success: false };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create a new mock collection
        const newCollection = {
          id: `507f1f77bcf86cd7994390${Math.floor(Math.random() * 100)}`,
          name,
          description,
          videos: []
        };
        
        setCollections(prev => [...prev, newCollection]);
        message.success('Collection created successfully');
        return { success: true, collection: newCollection };
      } else {
        const response = await axios.post('/api/collections', { name, description });
        const newCollection = response.data.data.collection;
        
        setCollections(prev => [...prev, newCollection]);
        message.success('Collection created successfully');
        return { success: true, collection: newCollection };
      }
    } catch (err) {
      console.error('Error creating collection:', err);
      
      if (err.response?.status === 404 || err.message.includes('Network Error')) {
        // Fallback to mock if API isn't available
        const newCollection = {
          id: `507f1f77bcf86cd7994390${Math.floor(Math.random() * 100)}`,
          name,
          description,
          videos: []
        };
        
        setCollections(prev => [...prev, newCollection]);
        message.success('Collection created successfully (demo mode)');
        return { success: true, collection: newCollection };
      } else {
        const errorMsg = err.response?.data?.message || 'Failed to create collection';
        setError(errorMsg);
        message.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } finally {
      setLoading(false);
    }
  };

  // Add video to collection
  const addVideoToCollection = async (collectionId, videoId) => {
    if (!isAuthenticated) {
      message.error('You must be logged in to add videos to collections');
      return { success: false };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create a mock video object
        const mockVideo = {
          id: videoId,
          title: `Video ${videoId}`,
          description: 'Mock video description',
          thumbnailUrl: `https://via.placeholder.com/640x360?text=Video+${videoId}`,
          category: 'Other'
        };
        
        // Update the collection in state
        setCollections(prev => 
          prev.map(collection => 
            collection.id === collectionId || collection._id === collectionId
              ? { 
                  ...collection, 
                  videos: [...(collection.videos || []), mockVideo] 
                }
              : collection
          )
        );
        
        message.success('Video added to collection successfully');
        return { success: true };
      } else {
        const response = await axios.post(`/api/collections/${collectionId}/videos`, { videoId });
        
        // Get the updated collection from the response
        const updatedCollection = response.data.data.collection;
        
        // Update the collection in state
        setCollections(prev => 
          prev.map(collection => 
            (collection.id === collectionId || collection._id === collectionId)
              ? updatedCollection
              : collection
          )
        );
        
        message.success('Video added to collection successfully');
        return { success: true };
      }
    } catch (err) {
      console.error('Error adding video to collection:', err);
      
      if (err.response?.status === 400 && err.response.data.message.includes('Invalid')) {
        message.error('Invalid ID format. Please report this error.');
        return { success: false, message: err.response.data.message };
      }
      
      if (err.response?.status === 404 || err.message.includes('Network Error')) {
        // Add a mock video even if the API call failed (demo mode)
        const mockVideo = {
          id: videoId,
          title: `Video ${videoId}`,
          description: 'Mock video description',
          thumbnailUrl: `https://via.placeholder.com/640x360?text=Video+${videoId}`,
          category: 'Other'
        };
        
        setCollections(prev => 
          prev.map(collection => 
            (collection.id === collectionId || collection._id === collectionId)
              ? { 
                  ...collection, 
                  videos: [...(collection.videos || []), mockVideo] 
                }
              : collection
          )
        );
        
        message.success('Video added to collection successfully (demo mode)');
        return { success: true };
      } else {
        const errorMsg = err.response?.data?.message || 'Failed to add video to collection';
        setError(errorMsg);
        message.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove video from collection
  const removeVideoFromCollection = async (collectionId, videoId) => {
    if (!isAuthenticated) return { success: false };
    
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update the collection in state
        setCollections(prev => 
          prev.map(collection => 
            (collection.id === collectionId || collection._id === collectionId)
              ? { 
                  ...collection, 
                  videos: (collection.videos || []).filter(video => 
                    video.id !== videoId && video._id !== videoId
                  ) 
                }
              : collection
          )
        );
        
        message.success('Video removed from collection');
        return { success: true };
      } else {
        await axios.delete(`/api/collections/${collectionId}/videos/${videoId}`);
        
        // Update the collection in state
        setCollections(prev => 
          prev.map(collection => 
            (collection.id === collectionId || collection._id === collectionId)
              ? { 
                  ...collection, 
                  videos: (collection.videos || []).filter(video => 
                    video.id !== videoId && video._id !== videoId
                  ) 
                }
              : collection
          )
        );
        
        message.success('Video removed from collection');
        return { success: true };
      }
    } catch (err) {
      console.error('Error removing video from collection:', err);
      
      if (err.response?.status === 400 && err.response.data.message.includes('Invalid')) {
        message.error('Invalid ID format. Please report this error.');
        return { success: false, message: err.response.data.message };
      }
      
      if (err.response?.status === 404 || err.message.includes('Network Error')) {
        // Remove the video anyway even if the API call failed (demo mode)
        setCollections(prev => 
          prev.map(collection => 
            (collection.id === collectionId || collection._id === collectionId)
              ? { 
                  ...collection, 
                  videos: (collection.videos || []).filter(video => 
                    video.id !== videoId && video._id !== videoId
                  ) 
                }
              : collection
          )
        );
        
        message.success('Video removed from collection (demo mode)');
        return { success: true };
      } else {
        const errorMsg = err.response?.data?.message || 'Failed to remove video from collection';
        setError(errorMsg);
        message.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete collection
  const deleteCollection = async (collectionId) => {
    if (!isAuthenticated) return { success: false };
    
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove the collection from state
        setCollections(prev => prev.filter(collection => 
          collection.id !== collectionId && collection._id !== collectionId
        ));
        
        message.success('Collection deleted successfully');
        return { success: true };
      } else {
        await axios.delete(`/api/collections/${collectionId}`);
        
        // Remove the collection from state
        setCollections(prev => prev.filter(collection => 
          collection.id !== collectionId && collection._id !== collectionId
        ));
        
        message.success('Collection deleted successfully');
        return { success: true };
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      
      if (err.response?.status === 400 && err.response.data.message.includes('Invalid')) {
        message.error('Invalid ID format. Please report this error.');
        return { success: false, message: err.response.data.message };
      }
      
      if (err.response?.status === 404 || err.message.includes('Network Error')) {
        // Delete the collection anyway even if the API call failed (demo mode)
        setCollections(prev => prev.filter(collection => 
          collection.id !== collectionId && collection._id !== collectionId
        ));
        
        message.success('Collection deleted successfully (demo mode)');
        return { success: true };
      } else {
        const errorMsg = err.response?.data?.message || 'Failed to delete collection';
        setError(errorMsg);
        message.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    collections,
    loading,
    error,
    fetchUserCollections,
    createCollection,
    addVideoToCollection,
    removeVideoFromCollection,
    deleteCollection
  };

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}; 
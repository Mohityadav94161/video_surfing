import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';

// Auth context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CollectionProvider } from './contexts/CollectionContext';

// Pages
import Home from './pages/Home';
import Video from './pages/Video';
import Search from './pages/Search';
import UploadVideo from './pages/UploadVideo';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AddVideo from './pages/admin/AddVideo';
import BulkVideoUpload from './pages/admin/BulkVideoUpload';
import HomePageManager from './pages/admin/HomePageManager';
import Analytics from './pages/admin/Analytics';
import TestComponent from './pages/admin/TestComponent';
import NotFound from './pages/NotFound';
import MyCollections from './pages/collections/MyCollections';
import CollectionDetail from './pages/collections/CollectionDetail';
import CreateCollection from './pages/collections/CreateCollection';

// Footer Pages
import Support from './pages/Support';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FAQ from './pages/FAQ';
import Feedback from './pages/Feedback';

// Components
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading, initializing } = useAuth();
  
  // Show nothing while initializing to prevent flashing of login page
  if (initializing) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FF1493',
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
        <CollectionProvider>
          <Router>
            <Routes>
              {/* Public routes with MainLayout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="video/:id" element={<Video />} />
                <Route path="search" element={<Search />} />
                
                {/* Footer pages */}
                <Route path="support" element={<Support />} />
                <Route path="terms-of-service" element={<TermsOfService />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="feedback" element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                } />
                
                {/* Upload video (protected) */}
                <Route 
                  path="upload-video" 
                  element={
                    <ProtectedRoute>
                      <UploadVideo />
                    </ProtectedRoute>
                  } 
                />
                
                {/* User profile (protected) */}
                <Route 
                  path="profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* User collection routes (protected) */}
                <Route path="collections">
                  <Route 
                    index 
                    element={
                      <ProtectedRoute>
                        <MyCollections />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="create" 
                    element={
                      <ProtectedRoute>
                        <CreateCollection />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path=":id" 
                    element={
                      <ProtectedRoute>
                        <CollectionDetail />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
              </Route>

              {/* Admin routes with AdminLayout */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="add-video" element={<AddVideo />} />
                <Route path="bulk-upload" element={<BulkVideoUpload />} />
                <Route path="home-manager" element={<HomePageManager />} />
                <Route path="analytics" element={<Analytics />} />
                {/*<Route path="test" element={<TestComponent />} />*/}
              </Route>

              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </CollectionProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App; 
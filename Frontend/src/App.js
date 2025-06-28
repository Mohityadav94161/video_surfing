import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ConfigProvider, theme, message } from 'antd';

// Auth context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CollectionProvider } from './contexts/CollectionContext';
import { CaptchaProvider, useCaptcha } from './contexts/CaptchaContext';
import { BackgroundTaskProvider } from './contexts/BackgroundTaskContext';

// Auth and API contexts

// Pages
import Home from './pages/Home';
import Video from './pages/Video';
import Search from './pages/Search';
import UploadVideo from './pages/UploadVideo';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AddVideo from './pages/admin/AddVideo';
import BulkVideoUpload from './pages/admin/BulkVideoUpload';
import Analytics from './pages/admin/Analytics';
import SupportSubmissions from './pages/admin/SupportSubmissions';
import TestComponent from './pages/admin/TestComponent';
import NotFound from './pages/NotFound';
import MyCollections from './pages/collections/MyCollections';
import CollectionDetail from './pages/collections/CollectionDetail';
import CreateCollection from './pages/collections/CreateCollection';
import TrendingPage from './pages/TrendingPage';

// Footer Pages
import Support from './pages/Support';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FAQ from './pages/FAQ';
import Feedback from './pages/Feedback';

// Components
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import EditVideo from './pages/admin/EditVideo';
import GlobalCaptchaModal from './components/GlobalCaptchaModal';

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading, initializing } = useAuth();
  const navigate = useNavigate();
  
  // Show nothing while initializing to prevent flashing of login page
  if (initializing) {
    return null;
  }
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/" replace />;
  }
  
  if (adminOnly && (!user || user.role !== 'admin')) {
    console.log('Admin access required but user is not admin, redirecting to home');
    message.error('You do not have admin privileges.');
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// CaptchaContextConnector: Simple wrapper for captcha events
const CaptchaContextConnector = ({ children }) => {
  const captchaContext = useCaptcha();
  
  useEffect(() => {
    // Dispatch custom event when captcha is verified to retry blocked requests
    if (captchaContext.captchaVerified) {
      document.dispatchEvent(new Event('captchaVerified'));
    }
  }, [captchaContext.captchaVerified]);
  
  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FF1493',
          borderRadius: 6,
        },
        algorithm: theme.darkAlgorithm,
      }}
    >
      <AuthProvider>
        <CollectionProvider>
          <CaptchaProvider>
            <BackgroundTaskProvider>
              <CaptchaContextConnector>
          <Router>
                {/* Global captcha modal that can appear on any page */}
                <GlobalCaptchaModal />
                
            <Routes>
              {/* Public routes with MainLayout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="video/:id" element={<Video />} />
                <Route path="search" element={<Search />} />
                <Route path="trending" element={<TrendingPage />} />
                
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
                <Route path="analytics" element={<Analytics />} />
                    <Route path="support-submissions" element={<SupportSubmissions />} />
                <Route path="edit-video/:id" element={<EditVideo/>}/>
                {/*<Route path="test" element={<TestComponent />} />*/}
              </Route>

              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
              </CaptchaContextConnector>
            </BackgroundTaskProvider>
          </CaptchaProvider>
        </CollectionProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App; 
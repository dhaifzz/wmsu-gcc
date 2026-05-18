import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import HomePage from './public/HomePage';
import CounselingDetails from './public/services/CounselingDetails';
import AssessmentDetails from './public/services/AssessmentDetails';
import ShiftingDetails from './public/services/ShiftingDetails';
import AboutUs from './public/AboutUs';
import OurTeam from './public/OurTeam';
import Schedules from './public/schedules';
import { ToastProvider } from './components/modal-notification/toast';
import HighSchoolDashboard from './users/clients/student/high-school/dashboard';
import CollegeDashboard from './users/clients/student/college/dashboard';
import FacultyDashboard from './users/clients/faculty/faculty';
import OutsideClientDashboard from './users/clients/outsideClient/outsideClient';
import DirectorDashboard from './users/management/director/director';
import StaffDashboard from './users/management/staff/staff';
import SuperAdminDashboard from './users/management/superadmin/superadmin';
import PrivacyPolicy from './public/legal/PrivacyPolicy';
import TermsOfService from './public/legal/TermsOfService';
import BlogPage from './public/blog';

import { useAuth } from './auth/AuthContext';
import SplashScreen from './components/loader/SplashScreen';

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    // Store on window so HomePage.tsx can access it directly
    (window as { deferredPwaPrompt?: Event }).deferredPwaPrompt = e;
    window.dispatchEvent(new Event('pwa-prompt-ready'));
  });
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RecoveryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      // Clear the hash so it doesn't interfere after redirect
      navigate('/reset-password', { replace: true });
    }
  }, [navigate]);

  return null;
}

function AppContent() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('hasShownSplash'));

  // PWA install prompt logic moved to HomePage.tsx

  useEffect(() => {
    if (!showSplash) return;

    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('hasShownSplash', 'true');
    }, 2000); // Show for at least 2 seconds

    return () => clearTimeout(timer);
  }, [showSplash]);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/team" element={<OurTeam />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/blog" element={<BlogPage />} />

      {/* Service Details Routes */}
      <Route path="/services/counseling" element={<CounselingDetails />} />
      <Route path="/services/assessment" element={<AssessmentDetails />} />
      <Route path="/services/shifting" element={<ShiftingDetails />} />
      <Route path="/schedules" element={<Schedules />} />

      {/* Protected Client Routes */}
      <Route path="/student/high-school" element={
        <ProtectedRoute allowedRoles={['High School Student']}>
          <HighSchoolDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/college" element={
        <ProtectedRoute allowedRoles={['College Student']}>
          <CollegeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['Faculty']}>
          <FacultyDashboard />
        </ProtectedRoute>
      } />
      <Route path="/outsideClient" element={
        <ProtectedRoute allowedRoles={['Outsider']}>
          <OutsideClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['Staff', 'SuperAdmin']}>
          <StaffDashboard />
        </ProtectedRoute>
      } />
      <Route path="/director" element={
        <ProtectedRoute allowedRoles={['Director', 'SuperAdmin']}>
        <DirectorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/superadmin" element={
        <ProtectedRoute allowedRoles={['SuperAdmin', 'Super Admin', 'Admin']}>
        <SuperAdminDashboard />
        </ProtectedRoute>
      } />

      {/* Legacy /student route redirects to login */}
      <Route path="/student" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <RecoveryRedirect />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <ToastProvider />
    </Router>
  );
}

export default App;

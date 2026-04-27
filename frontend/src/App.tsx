import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import HomePage from './public/HomePage';
import CounselingDetails from './public/services/CounselingDetails';
import AssessmentDetails from './public/services/AssessmentDetails';
import ShiftingDetails from './public/services/ShiftingDetails';
import AboutUs from './public/AboutUs';
import OurTeam from './public/OurTeam';
import HighSchoolDashboard from './users/clients/student/high-school/dashboard';
import CollegeDashboard from './users/clients/student/college/dashboard';
import FacultyDashboard from './users/clients/faculty/faculty';
import OutsideClientDashboard from './users/clients/outsideClient/outsideClient';
import DirectorDashboard from './users/management/director/director';
import StaffDashboard from './users/management/staff/staff';
import { ToastProvider } from './components/modal-notification/toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/team" element={<OurTeam />} />

          {/* Service Details Routes */}
          <Route path="/services/counseling" element={<CounselingDetails />} />
          <Route path="/services/assessment" element={<AssessmentDetails />} />
          <Route path="/services/shifting" element={<ShiftingDetails />} />

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

          {/* Protected Management Routes */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/director" element={
            <ProtectedRoute allowedRoles={['Director']}>
              <DirectorDashboard />
            </ProtectedRoute>
          } />

          {/* Legacy /student route redirects to login */}
          <Route path="/student" element={<Navigate to="/login" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <ToastProvider />
    </Router>
  );
}

export default App;

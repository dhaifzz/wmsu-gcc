import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import HomePage from './public/HomePage';
import CounselingDetails from './public/services/CounselingDetails';
import AssessmentDetails from './public/services/AssessmentDetails';
import ShiftingDetails from './public/services/ShiftingDetails';
import AboutUs from './public/AboutUs';
import OurTeam from './public/OurTeam';
import StudentDashboard from './users/clients/student/student';
import FacultyDashboard from './users/clients/faculty/faculty';
import OutsideClientDashboard from './users/clients/outsideClient/outsideClient';
import ManagementDashboard from './users/management/ManagementDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/team" element={<OurTeam />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/outsideClient" element={<OutsideClientDashboard />} />
        <Route path="/staff" element={<ManagementDashboard />} />

        {/* Service Details Routes */}
        <Route path="/services/counseling" element={<CounselingDetails />} />
        <Route path="/services/assessment" element={<AssessmentDetails />} />
        <Route path="/services/shifting" element={<ShiftingDetails />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

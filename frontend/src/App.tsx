import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Register from './auth/Register';
import HomePage from './public/HomePage';
import CounselingDetails from './public/services/CounselingDetails';
import AssessmentDetails from './public/services/AssessmentDetails';
import ShiftingDetails from './public/services/ShiftingDetails';
import AboutUs from './public/AboutUs';
import OurTeam from './public/OurTeam';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/team" element={<OurTeam />} />
        
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

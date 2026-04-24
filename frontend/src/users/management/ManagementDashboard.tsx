import { useState } from 'react';
import { 
  Clock, 
  LayoutDashboard,
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  User,
  Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserSidebar from '../../components/UserSidebar';
import UserNavbar from '../../components/UserNavbar';
import Profile from '../Profile';
import Settings from '../Settings';
import StaffDashboard from './staff/staff';
import CounselingAppointments from './Appointment/CounselingAppointments';
import AssessmentAppointments from './Appointment/AssessmentAppointments';
import ShiftingAppointments from './Appointment/ShiftingAppointments';
import History from './History'; // Historical records module

const ManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role] = useState<'staff' | 'director' | 'admin'>('staff');

  const staff = {
    name: "Elena Rodriguez",
    role: role === 'staff' ? "Guidance Staff" : role === 'director' ? "Center Director" : "System Administrator",
    email: "elena.rodriguez@wmsu.edu.ph",
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'counseling', label: 'Counseling', icon: MessageCircle },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
    { id: 'shifting', label: 'Shifting', icon: RefreshCw },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans text-slate-900">
      <UserSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={staff.name}
        userType={staff.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        links={navLinks}
      />

      <main className="flex-1 relative h-screen overflow-y-auto">
        <UserNavbar 
          userName={staff.name}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && role === 'staff' && (
              <StaffDashboard key="staff-dashboard" />
            )}

            {activeTab === 'counseling' && (
              <CounselingAppointments key="counseling-list" />
            )}

            {activeTab === 'assessment' && (
              <AssessmentAppointments key="assessment-list" />
            )}

            {activeTab === 'shifting' && (
              <ShiftingAppointments key="shifting-list" />
            )}

            {activeTab === 'history' && (
              <History key="history-list" />
            )}

            {activeTab === 'profile' && (
              <Profile key="profile" user={{ ...staff, type: 'staff' } as any} />
            )}

            {activeTab === 'settings' && (
              <Settings key="settings" />
            )}

            {/* Fallback for other tabs */}
            {!['dashboard', 'counseling', 'assessment', 'shifting', 'profile', 'settings'].includes(activeTab) && (
              <motion.div
                key="coming-soon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center min-h-[400px] text-slate-400 font-medium italic"
              >
                Module "{activeTab}" is currently under development.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ManagementDashboard;

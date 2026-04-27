import { useState } from 'react';
import { 
  BarChart3, 
  MessageCircle, 
  ClipboardCheck, 
  RefreshCw, 
  Clock, 
  User, 
  LayoutDashboard,
  Users,
  FileEdit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ManagementSidebar from '../../../components/ManagementSidebar';
import ManagementNavbar from '../../../components/ManagementNavbar';
import Profile from '../../Profile';
import Analytics from '../Analytics';
import CounselingAppointments from '../Appointment/CounselingAppointments';
import AssessmentAppointments from '../Appointment/AssessmentAppointments';
import ShiftingAppointments from '../Appointment/ShiftingAppointments';
import History from '../History';
import CMS from './SuperCMS';
import UserManagement from './SuperAccountManagement';
import Overview from './SuperDashboard';
import { useAuth } from '../../../auth/AuthProvider';
import { ThemeProvider } from '../../../contexts/ThemeContext';

const SuperAdminDashboard = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const superAdmin = {
    name: authUser ? `${authUser.firstName} ${authUser.lastName}` : "Super Admin",
    role: "System Super Admin",
    email: authUser?.email || "",
  };

  const navLinks = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'accounts', label: 'User Accounts', icon: Users },
    { id: 'cms', label: 'Content (CMS)', icon: FileEdit },
    { id: 'counseling', label: 'Counseling', icon: MessageCircle },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
    { id: 'shifting', label: 'Shifting', icon: RefreshCw },
    { id: 'history', label: 'System History', icon: Clock },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans text-slate-900">
      <ManagementSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={superAdmin.name}
        userType={superAdmin.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        links={navLinks}
        colorScheme="teal"
      />

      <main className="flex-1 relative h-screen overflow-y-auto">
        <ManagementNavbar 
          userName={superAdmin.name}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <ThemeProvider scheme="teal">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <Overview 
                key="overview" 
                userName={superAdmin.name} 
                onNavigate={(tab) => setActiveTab(tab)} 
              />
            )}

            {activeTab === 'analytics' && (
              <Analytics key="analytics" role="admin" />
            )}

            {activeTab === 'counseling' && (
              <CounselingAppointments key="counseling-list" role="director" />
            )}

            {activeTab === 'assessment' && (
              <AssessmentAppointments key="assessment-list" role="director" />
            )}

            {activeTab === 'shifting' && (
              <ShiftingAppointments key="shifting-list" role="director" />
            )}

            {activeTab === 'cms' && (
              <CMS key="cms-module" />
            )}

            {activeTab === 'accounts' && (
              <UserManagement key="accounts-module" />
            )}

            {activeTab === 'history' && (
              <History key="history-list" />
            )}

            {activeTab === 'profile' && (
              <Profile key="profile" user={{ ...superAdmin, type: 'director' } as any} />
            )}

            {/* Fallback for other tabs */}
            {!['overview', 'analytics', 'counseling', 'assessment', 'shifting', 'cms', 'accounts', 'history', 'profile'].includes(activeTab) && (
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
          </ThemeProvider>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

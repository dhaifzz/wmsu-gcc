import { useState } from 'react';
import { 
  Clock, 
  LayoutDashboard,
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ManagementSidebar from '../../../components/ManagementSidebar';
import ManagementNavbar from '../../../components/ManagementNavbar';
import ManagementProfile from '../../ManagementProfile';
import StaffOverview from './StaffOverview';

import CounselingAppointments from '../Appointment/CounselingAppointments';
import AssessmentAppointments from '../Appointment/AssessmentAppointments';
import ShiftingAppointments from '../Appointment/ShiftingAppointments';
import History from '../History'; 
import BlogPosting from '../blog-posting';
import { useAuth } from '../../../auth/AuthContext';

const StaffDashboardLayout = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role] = useState<'staff' | 'director' | 'admin'>('staff');

  const staff = {
    name: authUser ? `${authUser.firstName} ${authUser.lastName}` : "Staff Member",
    role: role === 'staff' ? "Guidance Staff" : role === 'director' ? "Center Director" : "System Administrator",
    email: authUser?.email || "",
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'counseling', label: 'Counseling', icon: MessageCircle },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
    { id: 'shifting', label: 'Shifting', icon: RefreshCw },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'blog', label: 'Blog', icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans text-slate-900">
      <ManagementSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={staff.name}
        userType={staff.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        links={navLinks}
      />

      <main className="flex-1 relative h-screen overflow-y-auto">
        <ManagementNavbar 
          userName={staff.name}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && role === 'staff' && (
              <StaffOverview key="staff-dashboard" />
            )}

            {activeTab === 'counseling' && (
              <CounselingAppointments key="counseling-list" role={role} />
            )}

            {activeTab === 'assessment' && (
              <AssessmentAppointments key="assessment-list" role={role} />
            )}

            {activeTab === 'shifting' && (
              <ShiftingAppointments key="shifting-list" role={role} />
            )}

            {activeTab === 'history' && (
              <History key="history-list" />
            )}

            {activeTab === 'blog' && (
              <BlogPosting key="blog-posting" role="staff" />
            )}


            {activeTab === 'profile' && (
              <ManagementProfile key="profile" user={{ ...staff, type: 'staff' } as any} />
            )}

            {/* Fallback for other tabs */}
            {!['dashboard', 'counseling', 'assessment', 'shifting', 'history', 'blog', 'profile'].includes(activeTab) && (
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

export default StaffDashboardLayout;

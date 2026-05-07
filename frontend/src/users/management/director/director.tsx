import { useState } from 'react';
import {
  Clock,
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  User,
  BarChart3,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ManagementSidebar from '../../../components/ManagementSidebar';
import ManagementNavbar from '../../../components/ManagementNavbar';
import ManagementProfile from '../../ManagementProfile';
import Analytics from '../Analytics';
import CounselingAppointments from '../Appointment/CounselingAppointments';
import AssessmentAppointments from '../Appointment/AssessmentAppointments';
import ShiftingAppointments from '../Appointment/ShiftingAppointments';
import History from '../History';
import OfficeSchedule from './OfficeSchedule';
import { useAuth } from '../../../auth/AuthContext';

const DirectorDashboard = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const director = {
    ...authUser,
    name: authUser ? `${authUser.firstName} ${authUser.lastName}` : "Director",
    role: authUser?.role || "Center Director",
    email: authUser?.email || "",
    department: authUser?.department || "",
    studentId: authUser?.employeeId || authUser?.schoolId || "",
    educationLevel: authUser?.educationLevel || "Staff",
  };

  const navLinks = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'counseling', label: 'Counseling', icon: MessageCircle },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
    { id: 'shifting', label: 'Shifting', icon: RefreshCw },
    { id: 'office-schedule', label: 'Office Schedule', icon: Building2 },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans text-slate-900">
      <ManagementSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={director.name}
        userType={director.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        links={navLinks}
      />

      <main className="flex-1 relative h-screen overflow-y-auto">
        <ManagementNavbar
          userName={director.name}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <Analytics key="analytics" />
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

            {activeTab === 'office-schedule' && (
              <OfficeSchedule key="office-mgmt" />
            )}

            {activeTab === 'history' && (
              <History key="history-list" />
            )}

            {activeTab === 'profile' && (
              <ManagementProfile key="profile" user={{ ...director, type: 'director' } as any} />
            )}

            {/* Fallback for other tabs */}
            {!['analytics', 'counseling', 'assessment', 'shifting', 'history', 'office-schedule', 'profile'].includes(activeTab) && (
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

export default DirectorDashboard;

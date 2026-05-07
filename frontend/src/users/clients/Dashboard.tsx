import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  LogOut, 
  Bell,
  Search,
  GraduationCap,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import { appointmentApi } from '../../lib/api';
import { Menu, X } from 'lucide-react';

const Dashboard = () => {
  const { user: authUser, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingCount, setPendingCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!accessToken) return;
      try {
        const res = await appointmentApi.getAppointmentHistory(accessToken);
        if (res.ok && res.data.history) {
          const pending = res.data.history.filter(item => 
            item.status.toLowerCase().includes('pending')
          ).length;
          setPendingCount(pending);
        }
      } catch (err) {
        console.error("Failed to fetch pending count", err);
      }
    };
    fetchPendingCount();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-200 flex flex-col p-6 overflow-y-auto z-[101] transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-emerald-600/30">G</div>
            <span className="font-black text-xl tracking-tighter">GCC Portal</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Main Menu</p>
          <button 
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg font-bold transition-all ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`} 
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg font-bold transition-all ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`} 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
          >
            <User size={20} /> My Profile
          </button>
        </nav>

        {/* User Card */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
              <User size={24} />
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="scroll-container">
                <motion.p 
                  animate={{ x: [0, -50, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="font-black text-sm whitespace-nowrap inline-block"
                >
                  {authUser ? `${authUser.firstName} ${authUser.lastName}` : 'User'}
                </motion.p>
              </div>
              <div className="scroll-container mt-0.5">
                <motion.p 
                  animate={{ x: [0, -30, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="text-xs text-slate-500 whitespace-nowrap inline-block"
                >
                  {authUser?.educationLevel || 'Student'}
                </motion.p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 lg:px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl lg:text-2xl font-black tracking-tight leading-tight">Good day, {authUser?.firstName || 'User'}!</h2>
              <p className="text-slate-500 text-xs lg:text-sm font-medium">Here's what's happening with your portal.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search services..." 
                className="bg-slate-100 border-none rounded-lg py-3 pl-12 pr-6 text-sm font-bold w-64 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-screen-2xl mx-auto w-full">
          {/* Stats / Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar size={24} />
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Appointments</p>
              <p className="text-xl font-black">{pendingCount} Pending</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Wait Time</p>
              <p className="text-xl font-black">Fast Track</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Status</p>
              <div className="scroll-container">
                <motion.p 
                  animate={{ x: [0, -40, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  className="text-xl font-black whitespace-nowrap inline-block"
                >
                  {authUser?.educationLevel || 'Student'}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-emerald-900 rounded-2xl p-6 lg:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest mb-4 lg:mb-6 inline-block border border-emerald-500/30">Notice</span>
                <h3 className="text-2xl lg:text-3xl font-black mb-4 leading-tight">Need urgent assistance?</h3>
                <p className="text-emerald-100 text-sm lg:text-base font-medium mb-6 lg:mb-8 leading-relaxed">
                  Our office is open Mon-Fri, 8AM - 5PM. You can visit us at the 2nd Floor, Executive Building for walk-in inquiries.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-emerald-400" size={18} />
                    <span className="text-sm font-bold">WMSU Main Campus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-emerald-400" size={18} />
                    <span className="text-sm font-bold">8:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 lg:p-8 border border-white/10">
                  <p className="text-emerald-300 text-xs font-black uppercase mb-4 tracking-widest">System Update</p>
                  <p className="font-bold text-base lg:text-lg leading-relaxed">
                    The GCC Portal is now optimized for all student types including High School, College, Returnees, and Transferees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

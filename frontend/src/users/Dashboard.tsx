import { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageCircle, 
  ClipboardCheck, 
  RefreshCw, 
  User, 
  LogOut, 
  Settings, 
  Bell,
  Search,
  ChevronRight,
  GraduationCap,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type UserRole = 'college' | 'highschool' | 'returnee' | 'transferee';

interface UserProfile {
  name: string;
  type: UserRole;
  educationLevel: string;
  email: string;
  avatar?: string;
}

const Dashboard = () => {
  const [activeUser, setActiveUser] = useState<UserProfile>({
    name: "Juan Luna",
    type: "college",
    educationLevel: "College Student",
    email: "juan.luna@wmsu.edu.ph"
  });

  const [activeTab, setActiveTab] = useState('overview');

  const services = [
    { 
      id: 'counseling', 
      name: 'Counseling', 
      icon: MessageCircle, 
      color: 'bg-blue-500',
      allowed: ['college', 'highschool', 'returnee', 'transferee'],
      desc: 'Professional one-on-one psychological support and guidance.'
    },
    { 
      id: 'assessment', 
      name: 'Assessment', 
      icon: ClipboardCheck, 
      color: 'bg-emerald-500',
      allowed: ['college', 'highschool', 'returnee', 'transferee'],
      desc: 'Standardized testing for mental health and personality.'
    },
    { 
      id: 'shifting', 
      name: 'Shifting', 
      icon: RefreshCw, 
      color: 'bg-rose-500',
      allowed: ['college', 'returnee', 'transferee'], // High School excluded
      desc: 'Assistance for students changing their courses or departments.'
    }
  ];

  const filteredServices = services.filter(s => s.allowed.includes(activeUser.type));

  const UserSelector = () => (
    <div className="mb-8 p-4 bg-slate-900 rounded-3xl text-white shadow-2xl">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Mock User Switcher (Debug)</p>
      <div className="grid grid-cols-2 gap-2">
        {(['college', 'highschool', 'returnee', 'transferee'] as UserRole[]).map(role => (
          <button
            key={role}
            onClick={() => setActiveUser({
              ...activeUser,
              type: role,
              educationLevel: role === 'college' ? 'College Student' : role === 'highschool' ? 'High School Student' : role === 'returnee' ? 'Returning Student' : 'Transfer Student'
            })}
            className={`py-2 px-3 rounded-xl text-[10px] font-bold capitalize transition-all ${activeUser.type === role ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col p-6 overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-600/30">G</div>
          <span className="font-black text-xl tracking-tighter">GCC Portal</span>
        </div>

        <UserSelector />

        {/* Nav Links */}
        <nav className="space-y-2 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Main Menu</p>
          <button className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setActiveTab('profile')}>
            <User size={20} /> My Profile
          </button>
          <button className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> Settings
          </button>
        </nav>

        {/* User Card */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500">
              <User size={24} />
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="scroll-container">
                <motion.p 
                  animate={{ x: [0, -50, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="font-black text-sm whitespace-nowrap inline-block"
                >
                  {activeUser.name}
                </motion.p>
              </div>
              <div className="scroll-container mt-0.5">
                <motion.p 
                  animate={{ x: [0, -30, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="text-xs text-slate-500 whitespace-nowrap inline-block"
                >
                  {activeUser.educationLevel}
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
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-10 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Good day, {activeUser.name.split(' ')[0]}!</h2>
            <p className="text-slate-500 text-sm font-medium">Here's what's happening with your portal today.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search services..." 
                className="bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold w-64 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-10 max-w-6xl">
          {/* Stats / Info Row */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Calendar size={24} />
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Appointments</p>
              <p className="text-xl font-black">0 Pending</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Wait Time</p>
              <p className="text-xl font-black">Fast Track</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Status</p>
              <div className="scroll-container">
                <motion.p 
                  animate={{ x: [0, -40, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  className="text-xl font-black whitespace-nowrap inline-block"
                >
                  {activeUser.educationLevel}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-1">Available Services</h3>
                <p className="text-slate-500 text-sm font-medium">Services tailored for your student type.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode='popLayout'>
                {filteredServices.map((service) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                  >
                    <div className={`w-14 h-14 ${service.color} text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-${service.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                      <service.icon size={28} />
                    </div>
                    <h4 className="text-xl font-black mb-3">{service.name}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                      {service.desc}
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                      Book Now <ChevronRight size={16} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Disabled/Excluded Section for HS */}
              {activeUser.type === 'highschool' && (
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-60">
                   <div className="w-14 h-14 bg-slate-200 text-slate-400 rounded-3xl flex items-center justify-center mb-4">
                    <RefreshCw size={28} />
                  </div>
                  <h4 className="text-lg font-black text-slate-400">Shifting Restricted</h4>
                  <p className="text-slate-400 text-xs font-bold px-4 mt-2">
                    Shifting services are only available for College students.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-emerald-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block border border-emerald-500/30">Notice</span>
                <h3 className="text-3xl font-black mb-4 leading-tight">Need urgent assistance?</h3>
                <p className="text-emerald-100 font-medium mb-8 leading-relaxed">
                  Our office is open Mon-Fri, 8AM - 5PM. You can visit us at the 2nd Floor, Executive Building for walk-in inquiries.
                </p>
                <div className="flex gap-6">
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
                <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10">
                  <p className="text-emerald-300 text-xs font-black uppercase mb-4 tracking-widest">System Update</p>
                  <p className="font-bold text-lg leading-relaxed">
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

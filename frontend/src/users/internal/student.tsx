// HIGH SCHOOL & COLLEGE
import { useState } from 'react';
import {
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  ChevronRight,
  Calendar,
  Clock,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserSidebar from '../../components/UserSidebar';
import UserNavbar from '../../components/UserNavbar';
import Profile from '../Profile';
import Settings from '../Settings';
import MarqueeText from '../../components/MarqueeText';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [user, setUser] = useState({
    name: "Juan Luna",
    type: "college",
    educationLevel: "College Student",
    email: "juan.luna@wmsu.edu.ph",
    studentId: "2021-00456",
    college: "College of Science and Mathematics",
    course: "BS in Computer Science",
    joinedDate: "August 2021",
    gradeLevel: "12",
    track: "Academic",
    school: "WMSU Integrated Laboratory School"
  });

  const services = [
    {
      id: 'counseling',
      name: 'Counseling',
      icon: MessageCircle,
      color: 'bg-blue-500',
      allowed: ['college', 'highschool'],
      desc: 'Professional one-on-one psychological support and guidance.'
    },
    {
      id: 'assessment',
      name: 'Assessment',
      icon: ClipboardCheck,
      color: 'bg-emerald-500',
      allowed: ['college', 'highschool'],
      desc: 'Standardized testing for mental health and personality.'
    },
    {
      id: 'shifting',
      name: 'Shifting',
      icon: RefreshCw,
      color: 'bg-rose-500',
      allowed: ['college'],
      desc: 'Assistance for students changing their courses or departments.',
      notAllowedMessage: 'Shifting services are only available for College students.'
    }
  ];

  const toggleUserType = () => {
    const nextType = user.type === 'college' ? 'highschool' : 'college';
    setUser({
      ...user,
      type: nextType,
      educationLevel: nextType === 'college' ? 'College Student' : 'High School Student'
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      <UserSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={user.name}
        userType={user.educationLevel}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 relative">
        <button
          onClick={toggleUserType}
          className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-6 py-3 rounded-full font-black text-xs shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border border-white/10"
        >
          <RefreshCw size={14} className={user.type === 'college' ? '' : 'rotate-180'} />
          Switch to {user.type === 'college' ? 'High School' : 'College'} View
        </button>

        <UserNavbar
          userName={user.name}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="p-6 lg:p-10 max-w-6xl">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Welcome Section */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Student Portal</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight">{user.educationLevel} Dashboard</h3>
                </div>

                {/* Stats Row */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                      <Calendar size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Appointments</p>
                    <p className="text-xl font-black">0 Pending</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                      <Clock size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Wait Time</p>
                    <p className="text-xl font-black">Fast Track</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <GraduationCap size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Status</p>
                    <MarqueeText 
                      text={user.educationLevel} 
                      className="text-xl font-black" 
                    />
                  </div>
                </div>

                {/* Services Section */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight mb-1">Available Services</h3>
                      <p className="text-slate-500 text-sm font-medium">Click on a service to start your application.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => {
                      const isAllowed = service.allowed.includes(user.type);
                      return (
                        <motion.div
                          key={service.id}
                          layout
                          className={`p-8 rounded-[2.5rem] border transition-all flex flex-col ${isAllowed
                              ? 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 group cursor-pointer'
                              : 'bg-slate-50 border-dashed border-slate-200 opacity-60 grayscale'
                            }`}
                        >
                          <div className={`w-14 h-14 ${isAllowed ? service.color : 'bg-slate-200'} text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg transition-transform ${isAllowed ? 'group-hover:scale-110' : ''}`}>
                            <service.icon size={28} className={isAllowed ? 'text-white' : 'text-slate-400'} />
                          </div>
                          <h4 className={`text-xl font-black mb-3 ${isAllowed ? 'text-slate-900' : 'text-slate-400'}`}>{service.name}</h4>
                          <p className={`text-sm leading-relaxed mb-6 font-medium ${isAllowed ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isAllowed ? service.desc : (service.notAllowedMessage || 'This service is not available for your student level.')}
                          </p>

                          {isAllowed ? (
                            <div className="mt-auto flex items-center gap-2 text-emerald-600 font-black text-sm">
                              Book Now <ChevronRight size={16} />
                            </div>
                          ) : (
                            <div className="mt-auto text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Not Available
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Banner */}
                <div className="bg-emerald-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <h3 className="text-3xl font-black mb-4 leading-tight">Need Support?</h3>
                      <p className="text-emerald-100 font-medium mb-8 leading-relaxed">
                        The Guidance and Counseling Center is open Monday to Friday, 8:00 AM to 5:00 PM to serve you.
                      </p>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-emerald-400" size={18} />
                          <span className="text-sm font-bold">WMSU Executive Building</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10">
                      <p className="text-emerald-300 text-xs font-black uppercase mb-4 tracking-widest">Office Hours</p>
                      <p className="font-bold text-lg leading-relaxed">
                        Visit us at the 2nd Floor for personal consultations and assessments.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && <Profile key="profile" user={user} />}
            {activeTab === 'settings' && <Settings key="settings" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

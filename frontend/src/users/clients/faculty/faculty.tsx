import { useState } from 'react';
import {
  MessageCircle,
  ChevronRight,
  Calendar,
  Briefcase,
  MapPin,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserSidebar from '../../../components/UserSidebar';
import UserNavbar from '../../../components/UserNavbar';
import Profile from '../../Profile';
import Settings from '../../Settings';
import MarqueeText from '../../../components/MarqueeText';
import Counseling from '../Counseling';

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeService, setActiveService] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [user] = useState({
    name: "Prof. Maria Santos",
    type: "faculty",
    educationLevel: "Faculty Member",
    email: "maria.santos@wmsu.edu.ph",
    studentId: "EMP-2015-089",
    department: "College of Science and Mathematics",
    status: "Permanent",
    joinedDate: "June 2015"
  });

  const services = [
    {
      id: 'counseling',
      name: 'Faculty Consultation',
      icon: MessageCircle,
      color: 'bg-blue-500',
      allowed: ['faculty'],
      desc: 'Professional counseling and support services for faculty members.'
    }
  ];

  const filteredServices = services;

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
        <UserNavbar
          userName={user.name}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && !activeService && (
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
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Faculty Portal</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight">Welcome back, {user.name.split('. ')[1]}</h3>
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
                      <Building size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Department</p>
                    <MarqueeText
                      text={user.department}
                      className="text-xl font-black"
                    />
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <Briefcase size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Employment</p>
                    <p className="text-xl font-black">{user.status}</p>
                  </div>
                </div>

                {/* Services Section */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight mb-1">Faculty Services</h3>
                      <p className="text-slate-500 text-sm font-medium">Access specialized support and referral tools.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                      <motion.div
                        key={service.id}
                        layout
                        onClick={() => setActiveService(service.id)}
                        className="p-8 rounded-[2.5rem] border bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 group cursor-pointer transition-all flex flex-col"
                      >
                        <div className={`w-14 h-14 ${service.color} text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                          <service.icon size={28} className="text-white" />
                        </div>
                        <h4 className="text-xl font-black mb-3 text-slate-900">{service.name}</h4>
                        <p className="text-sm leading-relaxed mb-6 font-medium text-slate-500">
                          {service.desc}
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-emerald-600 font-black text-sm">
                          Book Now <ChevronRight size={16} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Info Banner */}
                <div className="bg-emerald-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <h3 className="text-3xl font-black mb-4 leading-tight">Faculty Wellness</h3>
                      <p className="text-emerald-100 font-medium mb-8 leading-relaxed">
                        Your well-being matters. The GCC provides confidential consultations and professional support tailored for WMSU faculty members.
                      </p>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-emerald-400" size={18} />
                          <span className="text-sm font-bold">Main Executive Bldg</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10">
                      <p className="text-emerald-300 text-xs font-black uppercase mb-4 tracking-widest">Support Hours</p>
                      <p className="font-bold text-lg leading-relaxed">
                        Dedicated hours for faculty consultations are available. Please book in advance.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'overview' && activeService === 'counseling' && (
              <Counseling key="counseling" onBack={() => setActiveService(null)} />
            )}

            {activeTab === 'profile' && <Profile key="profile" user={user} />}
            {activeTab === 'settings' && <Settings key="settings" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;

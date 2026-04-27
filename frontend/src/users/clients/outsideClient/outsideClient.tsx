import { useState } from 'react';
import {
  MessageCircle,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ClientNavbar from '../../../components/ClientNavbar';
import Profile from '../../Profile';
import Counseling from '../Counseling';
import { useAuth } from '../../../auth/AuthProvider';

const OutsideClientDashboard = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeService, setActiveService] = useState<string | null>(null);

  // Map authUser to the structure expected by the dashboard and Profile component
  const user = {
    name: authUser ? `${authUser.firstName} ${authUser.lastName}` : "User",
    type: "outside",
    educationLevel: "Outside Client",
    email: authUser?.email || "",
    studentId: "N/A - Guest",
    department: "None (External)",
    status: "Active",
    joinedDate: "N/A"
  };

  const services = [
    {
      id: 'counseling',
      name: 'General Counseling',
      icon: MessageCircle,
      color: 'bg-blue-500',
      allowed: ['outside'],
      desc: 'Professional counseling support for alumni and external community members.'
    }
  ];

  const filteredServices = services;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      <ClientNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 relative">

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
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Client Portal</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight">Good day, {user.name.split(', ')[1]}!</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Here's what's happening with your portal today.</p>
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
                    <p className="text-xl font-black">Standard</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <UserIcon size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Account Type</p>
                    <p className="text-xl font-black">{user.educationLevel}</p>
                  </div>
                </div>

                {/* Services Section */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight mb-1">Available Services</h3>
                      <p className="text-slate-500 text-sm font-medium">Professional services for alumni and external clients.</p>
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

                {/* Banner */}
                <div className="bg-emerald-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <h3 className="text-3xl font-black mb-4 leading-tight">External Consultation</h3>
                      <p className="text-emerald-100 font-medium mb-8 leading-relaxed">
                        We offer professional psychological services to the public, including alumni and community members.
                      </p>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-emerald-400" size={18} />
                          <span className="text-sm font-bold">WMSU Executive Bldg</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10">
                      <p className="text-emerald-300 text-xs font-black uppercase mb-4 tracking-widest">Office Hours</p>
                      <p className="font-bold text-lg leading-relaxed">
                        Consultations for outside clients are by appointment only. Please use the booking system above.
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
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default OutsideClientDashboard;

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  ClipboardCheck,
  ChevronRight,
  Calendar,
  Clock,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ClientNavbar from '../../../../components/ClientNavbar';
import ClientProfile from '../../../ClientProfile';
import MarqueeText from '../../../../components/MarqueeText';
import Counseling from '../../Counseling';
import Loader from '../../../../components/loader/Loader';
import Assessment from '../../Assessment';
import { useAuth } from '../../../../auth/AuthContext';
import { appointmentApi } from '../../../../lib/api';

const HighSchoolDashboard = () => {
  const { user: authUser, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeService, setActiveService] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

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

  useEffect(() => {
    // Simulate real data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Map authUser to the structure expected by the dashboard and Profile component
  const user = {
    name: authUser ? `${authUser.firstName} ${authUser.lastName}` : "User",
    type: "highschool",
    educationLevel: authUser?.educationLevel || "High School Student",
    email: authUser?.email || "",
    studentId: authUser?.id?.substring(0, 8).toUpperCase() || "N/A",
    gradeLevel: authUser?.gradeLevel?.toString() || "N/A",
    track: "Academic", // This would ideally come from the DB as well
    school: authUser?.school || "WMSU High School",
    joinedDate: "N/A"
  };

  const services = [
    {
      id: 'counseling',
      name: 'Counseling',
      icon: MessageCircle,
      color: 'bg-blue-500',
      desc: 'Professional one-on-one psychological support and guidance.'
    },
    {
      id: 'assessment',
      name: 'Assessment',
      icon: ClipboardCheck,
      color: 'bg-emerald-500',
      desc: 'Standardized testing for mental health and personality.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      <ClientNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 relative">
        <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto">
          {isLoading ? (
            <Loader />
          ) : (
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
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Student Portal</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight">Good day, {user.name.split(' ')[0]}!</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Here's what's happening with your portal today.</p>
                </div>

                {/* Stats Row */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                      <Calendar size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Appointments</p>
                    <p className="text-xl font-black">{pendingCount} Pending</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Clock size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Wait Time</p>
                    <p className="text-xl font-black">Fast Track</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
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
                    {services.map((service) => (
                      <motion.div
                        key={service.id}
                        layout
                        onClick={() => setActiveService(service.id)}
                        className="p-8 rounded-lg border bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 group cursor-pointer transition-all flex flex-col"
                      >
                        <div className={`w-14 h-14 ${service.color} text-white rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
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
                <div className="bg-emerald-900 rounded-lg p-10 text-white relative overflow-hidden">
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
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/10">
                      <p className="text-emerald-300 text-xs font-black uppercase mb-4 tracking-widest">Office Hours</p>
                      <p className="font-bold text-lg leading-relaxed">
                        Visit us at the 2nd Floor for personal consultations and assessments.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'overview' && activeService === 'counseling' && (
              <Counseling key="counseling" onBack={() => setActiveService(null)} />
            )}

            {activeTab === 'overview' && activeService === 'assessment' && (
              <Assessment key="assessment" onBack={() => setActiveService(null)} />
            )}

            {activeTab === 'profile' && <ClientProfile key="profile" user={user} />}
          </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

export default HighSchoolDashboard;

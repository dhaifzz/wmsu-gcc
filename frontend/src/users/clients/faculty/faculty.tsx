import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Calendar,
  Briefcase,
  MapPin,
  Building,
  ArrowRight,
  ClipboardCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ClientNavbar from '../../../components/ClientNavbar';
import ClientProfile from '../../ClientProfile';
import MarqueeText from '../../../components/MarqueeText';
import Counseling from '../Counseling';
import Loader from '../../../components/loader/Loader';
import { useAuth } from '../../../auth/AuthContext';
import { cmsApi } from '../../../lib/api';
import assessmentImg from '../../../assets/img/assessment-img.png';
import counselingImg from '../../../assets/img/counseling-img.png';
import shiftingImg from '../../../assets/img/shifting-img.png';

const FacultyDashboard = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeService, setActiveService] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cmsFeatures, setCmsFeatures] = useState<any[]>([]);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const result = await cmsApi.getContent('home');
        if (result.ok && result.data?.support?.features) {
          setCmsFeatures(result.data.support.features);
        }
      } catch (err) {
        console.error("Failed to fetch CMS content", err);
      }
    };
    fetchCms();
  }, []);

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
    type: "faculty",
    educationLevel: "Faculty Member",
    email: authUser?.email || "",
    studentId: authUser?.id?.substring(0, 8).toUpperCase() || "N/A",
    department: authUser?.department || "WMSU Faculty",
    status: "Permanent",
    joinedDate: "N/A",
    city: authUser?.city || "N/A",
    barangay: authUser?.barangay || "N/A",
    street: authUser?.street || "N/A"
  };



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
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Faculty Portal</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight">Good day, {user.name.includes('. ') ? user.name.split('. ')[1]?.split(' ')[0] : user.name.split(' ')[0]}!</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Here's what's happening with your portal today.</p>
                </div>

                {/* Stats Row */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                      <Calendar size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Appointments</p>
                    <p className="text-xl font-black">0 Pending</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Building size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Department</p>
                    <MarqueeText
                      text={user.department}
                      className="text-xl font-black"
                    />
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
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
                    {cmsFeatures.length > 0 ? cmsFeatures.map((feature: any, index: number) => {
                      const serviceId = index === 0 ? 'counseling' : index === 1 ? 'assessment' : 'shifting';
                      // Faculty can ONLY access counseling
                      const isDisabled = serviceId !== 'counseling';
                      const imageSource = feature.image || (index === 0 ? counselingImg : index === 1 ? assessmentImg : shiftingImg);

                      const theme = index === 0 ? {
                        iconBg: 'bg-blue-500',
                        iconColor: 'text-white',
                        titleHover: 'group-hover:text-slate-900',
                        actionText: 'Book Appointment',
                        actionColor: 'text-slate-700',
                        circleBg: 'bg-blue-50',
                        circleHover: 'group-hover:bg-blue-100',
                        borderHover: 'hover:border-blue-200'
                      } : index === 1 ? {
                        iconBg: 'bg-emerald-500',
                        iconColor: 'text-white',
                        titleHover: 'group-hover:text-slate-900',
                        actionText: 'Book Appointment',
                        actionColor: 'text-slate-700',
                        circleBg: 'bg-emerald-50',
                        circleHover: 'group-hover:bg-emerald-100',
                        borderHover: 'hover:border-emerald-200'
                      } : {
                        iconBg: 'bg-rose-500',
                        iconColor: 'text-white',
                        titleHover: 'group-hover:text-slate-900',
                        actionText: 'Apply for Shifting',
                        actionColor: 'text-slate-700',
                        circleBg: 'bg-rose-50',
                        circleHover: 'group-hover:bg-rose-100',
                        borderHover: 'hover:border-rose-200'
                      };

                      return (
                        <div
                          key={index}
                          onClick={() => !isDisabled && setActiveService(serviceId)}
                          className={`rounded-xl border overflow-hidden bg-white shadow-sm transition-all flex flex-col ${isDisabled ? 'border-slate-200 opacity-80 cursor-not-allowed' : `border-slate-100 hover:shadow-xl ${theme.borderHover} hover:-translate-y-1 cursor-pointer group`}`}
                        >
                          {/* Image Banner */}
                          <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                             <img src={imageSource} alt={feature.title} className={`w-full h-full object-cover transition-transform duration-700 ${isDisabled ? 'grayscale opacity-70' : 'group-hover:scale-110'}`} />
                          </div>
                          
                          {/* Content */}
                          <div className="p-6 flex-1 flex flex-col">
                             <div className="flex items-center gap-3 mb-3">
                               <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${isDisabled ? 'bg-slate-100 text-slate-400' : `${theme.iconBg} ${theme.iconColor}`}`}>
                                  {index === 0 ? <MessageCircle size={20} /> : index === 1 ? <ClipboardCheck size={20} /> : <RefreshCw size={20} />}
                               </div>
                               <h4 className={`text-xl font-black ${isDisabled ? 'text-slate-500' : `text-slate-900 ${theme.titleHover} transition-colors`}`}>{feature.title}</h4>
                             </div>
                             <p className={`text-sm font-medium leading-relaxed mb-6 line-clamp-3 ${isDisabled ? 'text-slate-400' : 'text-slate-500'}`}>
                                {feature.description}
                             </p>
                             
                             {isDisabled ? (
                                <div className="mt-auto pt-4 border-t border-slate-100">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-lg px-3 py-2 inline-block">
                                    Unavailable for you
                                  </p>
                                </div>
                             ) : (
                                <div className={`mt-auto pt-4 border-t border-slate-50 flex items-center justify-between font-black text-sm ${theme.actionColor}`}>
                                   <span>{theme.actionText}</span>
                                   <div className={`w-8 h-8 rounded-full ${theme.circleBg} flex items-center justify-center ${theme.circleHover} transition-colors`}>
                                     <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                   </div>
                                </div>
                             )}
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="col-span-3 text-center text-slate-500">Loading services...</div>
                    )}
                  </div>
                </div>

                {/* Info Banner */}
                <div className="bg-emerald-900 rounded-lg p-10 text-white relative overflow-hidden">
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
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/10">
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

            {activeTab === 'profile' && <ClientProfile key="profile" user={user} />}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;

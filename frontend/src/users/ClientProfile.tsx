import { motion } from 'framer-motion';
import {
  User as UserIcon,
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  LogOut,
  GraduationCap,
  Mail,
  Award
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { showAlert } from '../components/modal-notification/sweetalert';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  user: {
    name: string;
    type: string;
    role?: string;
    email: string;
    educationLevel: string;
    studentId: string;
    college?: string;
    course?: string;
    school?: string;
    gradeLevel?: string;
    track?: string;
    department?: string;
    status?: string;
    sex?: string;
    [key: string]: any;
  };
}

const ClientProfile = ({ user }: ProfileProps) => {
  const theme = useTheme();
  const { user: authUser, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    const result = await showAlert.confirm('Logout', 'Are you sure you want to sign out?', 'Logout', 'Stay');
    if (result.isConfirmed) {
      await signOut();
      navigate('/');
    }
  };

  // Merge the prop user with the real authUser data for accurate display
  const displayUser = {
    ...user,
    name: authUser ? `${authUser.firstName} ${authUser.lastName}` : user.name,
    email: authUser?.email || user.email,
    educationLevel: authUser?.educationLevel || user.educationLevel,
    studentId: authUser?.schoolId?.toString() || authUser?.lrn?.toString() || authUser?.employeeId?.toString() || authUser?.id?.substring(0, 8).toUpperCase() || user.studentId,
    college: authUser?.collegeName || user.college,
    course: authUser?.courseName || user.course,
    school: authUser?.school || user.school,
    gradeLevel: authUser?.gradeLevel?.toString() || user.gradeLevel,
    track: authUser?.track || user.track,
    department: authUser?.department || user.department,
    status: authUser?.occupation || user.status,
    contactNumber: authUser?.contactNumber || "N/A",
    sex: authUser?.sex || user.sex || "Prefer not to say"
  };

  // Determine avatar styling based on sex
  const getAvatarStyles = () => {
    const sex = displayUser.sex.toLowerCase();
    if (sex === 'male') return 'bg-blue-100 text-blue-500';
    if (sex === 'female') return 'bg-pink-100 text-pink-500';
    return 'bg-slate-200 text-slate-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-r ${theme.bg600} to-${theme.bg900.replace('bg-', '')} opacity-10`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 flex-1 w-full">
            <div className="relative group">
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ${getAvatarStyles()}`}>
                <UserIcon className="w-12 h-12 md:w-16 md:h-16" />
              </div>
            </div>
            
            <div className="text-center md:text-left w-full">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-3 truncate max-w-full text-slate-900">{displayUser.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                <span className={`px-3 md:px-4 py-1.5 ${theme.bg100} ${theme.text700} rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border ${theme.border200}`}>
                  {displayUser.educationLevel}
                </span>
                <span className="px-3 md:px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border border-slate-200">
                  ID: {displayUser.studentId}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="group flex items-center gap-3 px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100 shrink-0 self-center md:self-auto active:scale-95"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <GraduationCap className={theme.text600} size={24} />
                {displayUser.type === 'faculty' ? 'Professional Status' : displayUser.type === 'outside' ? 'Client Profile' : 'Academic Profile'}
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {displayUser.type === 'college' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Affiliation</p>
                    <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">College / Department</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.college}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Major Program</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.course}</p>
                  </div>
                </>
              )}

              {displayUser.type === 'highschool' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Educational Center</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.school || "WMSU Integrated Laboratory School"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year Level</p>
                    <p className="text-lg font-bold text-slate-700 uppercase tracking-tight">Grade {displayUser.gradeLevel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization / Track</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.track}</p>
                  </div>
                </>
              )}

              {displayUser.type === 'faculty' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">University</p>
                    <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employment</p>
                    <p className="text-lg font-bold text-slate-700 uppercase tracking-tight">{displayUser.status || "Permanent Faculty"}</p>
                  </div>
                </>
              )}

              {displayUser.type === 'outside' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Type</p>
                    <p className="text-lg font-bold text-slate-700">External Client</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupation</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.status || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.contactNumber}</p>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Contact</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                   <p className="text-base font-bold text-slate-700 break-all">{displayUser.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`${theme.bg900} rounded-lg p-8 text-white shadow-xl relative overflow-hidden group border border-current/10`}>
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl opacity-40"></div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-30"></div>

            <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
              <Award className="text-emerald-400" size={20} />
              Recent Activity
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/item">
                <div className={`w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400`}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Consultations</p>
                  <p className="font-bold text-sm">0 Sessions Completed</p>
                </div>
              </div>

              {displayUser.type !== 'faculty' && (
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/item">
                  <div className={`w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400`}>
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Assessments</p>
                    <p className="font-bold text-sm">1 Active Progress</p>
                  </div>
                </div>
              )}

              {displayUser.type === 'college' && (
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/item">
                  <div className={`w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400`}>
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Shifting Request</p>
                    <p className="font-bold text-sm">No Active Request</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-10 pt-6 border-t border-white/5 flex justify-center">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">WMSU GCC Portal</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientProfile;

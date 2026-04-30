import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Camera,
  Edit2,
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
    [key: string]: any;
  };
}

const ClientProfile = ({ user }: ProfileProps) => {
  const theme = useTheme();
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    const result = await showAlert.confirm('Logout', 'Are you sure you want to sign out?', 'Logout', 'Stay');
    if (result.isConfirmed) {
      await signOut();
    }
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
              <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500 border-4 border-white shadow-xl overflow-hidden">
                <UserIcon className="w-12 h-12 md:w-16 md:h-16" />
              </div>
              <button className={`absolute bottom-0 right-0 p-2 md:p-3 ${theme.bg600} text-white rounded-xl shadow-lg hover:scale-110 transition-all border-2 md:border-4 border-white`}>
                <Camera size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
            
            <div className="text-center md:text-left w-full">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-3 truncate max-w-full text-slate-900">{user.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                <span className={`px-3 md:px-4 py-1.5 ${theme.bg100} ${theme.text700} rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border ${theme.border200}`}>
                  {user.educationLevel}
                </span>
                <span className="px-3 md:px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border border-slate-200">
                  ID: {user.studentId}
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
                {user.type === 'faculty' ? 'Professional Status' : 'Academic Profile'}
              </h3>
              <button className={`flex items-center gap-2 ${theme.text600} font-black text-[10px] uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 hover:bg-white hover:shadow-md transition-all`}>
                <Edit2 size={16} /> Edit Profile
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {user.type === 'college' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Affiliation</p>
                    <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">College / Department</p>
                    <p className="text-lg font-bold text-slate-700">{user.college}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Major Program</p>
                    <p className="text-lg font-bold text-slate-700">{user.course}</p>
                  </div>
                </>
              )}

              {user.type === 'highschool' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Educational Center</p>
                    <p className="text-lg font-bold text-slate-700">{user.school || "WMSU Integrated Laboratory School"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year Level</p>
                    <p className="text-lg font-bold text-slate-700 uppercase tracking-tight">Grade {user.gradeLevel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</p>
                    <p className="text-lg font-bold text-slate-700">{user.track}</p>
                  </div>
                </>
              )}

              {user.type === 'faculty' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">University</p>
                    <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                    <p className="text-lg font-bold text-slate-700">{user.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employment</p>
                    <p className="text-lg font-bold text-slate-700 uppercase tracking-tight">{user.status || "Permanent Faculty"}</p>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Contact</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                   <p className="text-base font-bold text-slate-700 break-all">{user.email}</p>
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

              {user.type !== 'faculty' && (
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

              {user.type === 'college' && (
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

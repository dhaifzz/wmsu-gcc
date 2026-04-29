import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Camera,
  Edit2,
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { showAlert } from '../components/modal-notification/sweetalert';

interface ProfileProps {
  user: any;
}

const Profile = ({ user }: ProfileProps) => {
  const theme = useTheme();
  const { signOut } = useAuth();
  
  // Define roles that should see the logout button in the profile page
  const clientRoles = ['high school student', 'college student', 'faculty', 'outsider', 'highschool', 'college', 'student', 'outsider', 'outside'];
  const userRole = (user.role || '').toLowerCase();
  const userType = (user.type || '').toLowerCase();
  const showLogout = clientRoles.includes(userRole) || clientRoles.includes(userType);

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
        <div className={`absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-r from-${theme.bg600.replace('bg-', '')} to-${theme.bg900.replace('bg-', '')} opacity-10`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 flex-1 w-full">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 border-4 border-white shadow-xl overflow-hidden">
                <UserIcon className="w-12 h-12 md:w-16 md:h-16" />
              </div>
              <button className={`absolute bottom-0 right-0 p-2 md:p-3 ${theme.bg600} text-white rounded-lg shadow-lg hover:scale-110 transition-all border-2 md:border-4 border-white`}>
                <Camera size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
            
            <div className="text-center md:text-left w-full">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2 truncate max-w-full">{user.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mb-6 md:mb-0">
                <span className={`px-3 md:px-4 py-1 md:py-1.5 ${theme.bg100} ${theme.text700} rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest`}>{user.educationLevel}</span>
                <span className="px-3 md:px-4 py-1 md:py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">ID: {user.studentId}</span>
              </div>

              {/* Logout Button for Mobile/Tablet */}
              {showLogout && (
                <div className="lg:hidden mt-6 flex justify-center md:justify-start">
                  <button 
                    onClick={handleLogout}
                    className="group flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-black text-xs hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95 w-full md:w-auto"
                  >
                    <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Logout Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button for Desktop */}
        {showLogout && (
          <div className="hidden lg:block absolute top-6 right-6 z-20">
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-md hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
            >
              <LogOut size={17} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Logout Account</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl md:text-2xl font-black tracking-tight">{user.type === 'faculty' ? 'Professional Information' : 'Academic Information'}</h3>
              <button className={`flex items-center gap-2 ${theme.text600} font-bold text-sm hover:underline w-fit`}>
                <Edit2 size={16} /> Edit Info
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {user.type === 'college' && (
                <>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">School</p>
                    <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">College/Department</p>
                    <p className="text-lg font-bold text-slate-700">{user.college}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Course</p>
                    <p className="text-lg font-bold text-slate-700">{user.course}</p>
                  </div>
                </>
              )}

              {user.type === 'highschool' && (
                <>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">School</p>
                    <p className="text-lg font-bold text-slate-700">{user.school || "WMSU Integrated Laboratory School"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Year Level</p>
                    <p className="text-lg font-bold text-slate-700">Grade {user.gradeLevel}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Academic Track</p>
                    <p className="text-lg font-bold text-slate-700">{user.track}</p>
                  </div>
                </>
              )}

              {user.type === 'faculty' && (
                <>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Affiliated School</p>
                    <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Department/College</p>
                    <p className="text-lg font-bold text-slate-700">{user.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Employment Status</p>
                    <p className="text-lg font-bold text-slate-700">{user.status || "Permanent"}</p>
                  </div>
                </>
              )}

              <div>
                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Official Email</p>
                <p className="text-base md:text-lg font-bold text-slate-700 break-all">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`${theme.bg900} rounded-lg p-8 text-white shadow-xl relative overflow-hidden group`}>
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl opacity-40"></div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl opacity-30"></div>

            <h3 className="text-xl font-black mb-6 relative z-10">Activity Summary</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center ${theme.text400}`}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className={`text-[10px] font-black ${theme.text400}/60 uppercase tracking-widest`}>Consultations</p>
                  <p className="font-bold">0 Completed</p>
                </div>
              </div>

              {user.type !== 'faculty' && (
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center ${theme.text400}`}>
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black ${theme.text400}/60 uppercase tracking-widest`}>Assessments</p>
                    <p className="font-bold">1 In Progress</p>
                  </div>
                </div>
              )}

              {user.type === 'college' && (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className={`w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center ${theme.text400}`}>
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black ${theme.text400}/60 uppercase tracking-widest`}>Shifting Status</p>
                    <p className="font-bold">None Active</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;

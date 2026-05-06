import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Edit2,
  Briefcase,
  Calendar,
  Shield,
  Mail,
  UserCheck
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { analyticsApi } from '../lib/api';

interface ProfileProps {
  user: {
    name: string;
    role?: string;
    email: string;
    department?: string;
    studentId?: string; // This is employeeId for management
    educationLevel?: string;
    [key: string]: any;
  };
}

const ManagementProfile = ({ user }: ProfileProps) => {
  const theme = useTheme();
  const { accessToken, user: authUser } = useAuth();
  const [stats, setStats] = useState<{ totalManaged: number; responseRate: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!accessToken) return;
      try {
        const res = await analyticsApi.getMyStats(accessToken);
        if (res.ok) setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch profile stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [accessToken]);

  // Determine avatar styling based on sex
  const getAvatarStyles = () => {
    const sex = (authUser?.sex || '').toLowerCase();
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
        <div className={`absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-r ${theme.bg600} to-slate-900 opacity-10`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 flex-1 w-full">
            <div className="relative group">
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ${getAvatarStyles()}`}>
                <UserIcon className="w-12 h-12 md:w-16 md:h-16" />
              </div>
            </div>
            
            <div className="text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h2 className="text-2xl md:text-4xl font-black tracking-tight truncate max-w-full text-slate-900">{user.name}</h2>
                <span className={`px-3 md:px-4 py-1 rounded-full ${theme.bg100} ${theme.text700} text-[10px] md:text-xs font-black uppercase tracking-widest border ${theme.border200} w-fit mx-auto md:mx-0`}>
                  {user.role}
                </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                   <Shield size={14} className={theme.text600} />
                   <span className="text-xs font-bold uppercase tracking-wider">{user.educationLevel || 'Staff'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                   <UserCheck size={14} className={theme.text600} />
                   <span className="text-xs font-bold uppercase tracking-wider">ID: {user.studentId || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Briefcase className={theme.text600} size={24} />
                Professional Profile
              </h3>
              <button className={`flex items-center gap-2 ${theme.text600} font-black text-[10px] uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 hover:bg-white hover:shadow-md transition-all`}>
                <Edit2 size={14} /> Edit Details
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Affiliation</p>
                <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                <p className="text-xs font-medium text-slate-400">Main Campus, Zamboanga City</p>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Department</p>
                <p className="text-lg font-bold text-slate-700">{user.department || "Guidance & Counseling Center"}</p>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Official Email</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                   <p className="text-base md:text-lg font-bold text-slate-700 break-all">{user.email}</p>
                </div>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Account Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-lg font-bold text-slate-700">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-lg p-8 text-white shadow-xl relative overflow-hidden group border border-slate-800">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl"></div>

            <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
              <Calendar className="text-emerald-400" size={20} />
              Service Overview
            </h3>
            
            <div className="space-y-8 relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default group/item">
                <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] mb-2">Total Managed</p>
                <div className="flex items-end justify-between">
                   {statsLoading ? (
                     <div className="h-9 w-16 bg-white/10 rounded-lg animate-pulse"></div>
                   ) : (
                     <p className="text-3xl font-black">{stats?.totalManaged ?? 0}</p>
                   )}
                   <span className="text-[10px] font-bold text-white/30 uppercase group-hover/item:text-white/60 transition-colors">Appointments</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default group/item">
                <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] mb-2">Performance</p>
                <div className="flex items-end justify-between">
                   {statsLoading ? (
                     <div className="h-9 w-16 bg-white/10 rounded-lg animate-pulse"></div>
                   ) : (
                     <p className="text-3xl font-black">{stats?.responseRate ?? 0}%</p>
                   )}
                   <span className="text-[10px] font-bold text-white/30 uppercase group-hover/item:text-white/60 transition-colors">Approval Rate</span>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5">
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center italic">Administrative Access Verified</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManagementProfile;



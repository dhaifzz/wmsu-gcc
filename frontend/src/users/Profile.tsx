import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Camera, 
  Edit2, 
  MessageCircle, 
  ClipboardCheck, 
  RefreshCw, 
} from 'lucide-react';

interface ProfileProps {
  user: any;
}

const Profile = ({ user }: ProfileProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-600 to-emerald-900 opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 bg-slate-200 rounded-[2.5rem] flex items-center justify-center text-slate-500 border-4 border-white shadow-xl overflow-hidden">
              <UserIcon size={64} />
            </div>
            <button className="absolute bottom-0 right-0 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all border-4 border-white">
              <Camera size={18} />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight mb-2">{user.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">{user.educationLevel}</span>
              <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest">ID: {user.studentId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tight">{user.type === 'faculty' ? 'Professional Information' : 'Academic Information'}</h3>
              <button className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline">
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
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Official Email</p>
                <p className="text-lg font-bold text-slate-700">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-emerald-900 rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl opacity-40"></div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl opacity-30"></div>

            <h3 className="text-xl font-black mb-6 relative z-10">Activity Summary</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-300">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Consultations</p>
                  <p className="font-bold">0 Completed</p>
                </div>
              </div>

              {user.type !== 'faculty' && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-300">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Assessments</p>
                    <p className="font-bold">1 In Progress</p>
                  </div>
                </div>
              )}

              {user.type === 'college' && (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-300">
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Shifting Status</p>
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

import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Filter,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const StaffDashboard = () => {
  const appointments = [
    { id: 1, student: "Juan Luna", level: "College", type: "Counseling", time: "09:00 AM", date: "May 24, 2024", status: "Pending" },
    { id: 2, student: "Maria Clara", level: "High School", type: "Assessment", time: "10:30 AM", date: "May 24, 2024", status: "Approved" },
    { id: 3, student: "Jose Rizal", level: "College", type: "Shifting", time: "02:00 PM", date: "May 24, 2024", status: "Pending" },
    { id: 4, student: "Andres Bonifacio", level: "College", type: "Counseling", time: "04:00 PM", date: "May 25, 2024", status: "Pending" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      {/* Stats Row */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: "Today's Bookings", val: "12", trend: "+3", icon: Calendar, color: "emerald" },
          { label: "Pending Review", val: "45", trend: "+8", icon: Clock, color: "blue" },
          { label: "Total Students", val: "2,450", trend: "+12", icon: Users, color: "purple" },
          { label: "Completed Tests", val: "89", trend: "+5", icon: CheckCircle2, color: "rose" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end gap-2">
              <h4 className="text-3xl font-black">{stat.val}</h4>
              <span className="text-[10px] font-black text-emerald-500 mb-1 flex items-center gap-1">
                <TrendingUp size={12} /> {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">Recent Appointments</h3>
            <button className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-emerald-900">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Student Name</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Level</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Service Type</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Schedule</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((app) => (
                  <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors text-slate-700">
                    <td className="px-8 py-6 font-bold text-sm">{app.student}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        app.level === 'College' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {app.level}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        app.type === 'Counseling' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        app.type === 'Assessment' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {app.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-sm">{app.time}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{app.date}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="font-bold text-xs">{app.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                          <CheckCircle2 size={16} />
                        </button>
                        <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Info / Notifications */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-emerald-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20 border border-emerald-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-black mb-6 relative z-10">Shift Schedule</h3>
            <div className="space-y-6 relative z-10">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">Current Shift</p>
                <p className="font-bold text-sm">Morning Rotation</p>
                <p className="text-xs text-white/60">08:00 AM - 12:00 PM</p>
              </div>
              <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-950/40">
                Request Swap
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Quick Filters</h3>
              <Filter size={16} className="text-slate-300" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['All Status', 'Pending', 'High School', 'College', 'Today', 'Emergency'].map(tag => (
                <button key={tag} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StaffDashboard;

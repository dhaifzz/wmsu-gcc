import { useState, useEffect } from 'react';
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
import { useAuth } from '../../../auth/AuthContext';
import { analyticsApi, type AnalyticsDashboardResponse } from '../../../lib/api';
import Loader from '../../../components/loader/Loader';

const StaffDashboard = () => {
  const { accessToken } = useAuth();
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!accessToken) return;
      try {
        const res = await analyticsApi.getAnalyticsDashboardData(accessToken);
        if (res.ok) {
          setDashboardData(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch staff dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [accessToken]);

  const appointments = dashboardData?.pendingAppointmentsList || [];

  if (loading) {
    return <Loader type="dashboard" />;
  }

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
          { label: "Today's Bookings", val: dashboardData?.stats.todaysBookings || 0, trend: "Live", icon: Calendar, color: "emerald" },
          { label: "Pending Review", val: dashboardData?.stats.pendingCount || 0, trend: "Live", icon: Clock, color: "blue" },
          { label: "Total Students", val: (dashboardData?.rolesDistribution?.find(r => r.role === 'College Students')?.count || 0) + (dashboardData?.rolesDistribution?.find(r => r.role === 'High School Students')?.count || 0), trend: "Live", icon: Users, color: "purple" },
          { label: "Completed Tests", val: dashboardData?.stats.completedTests || 0, trend: "Live", icon: CheckCircle2, color: "rose" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg flex items-center justify-center mb-6`}>
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
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
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
          <div className="bg-emerald-900 rounded-lg p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20 border border-emerald-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-black mb-8 relative z-10">User Distribution</h3>
            <div className="space-y-6 relative z-10">
              {(dashboardData?.rolesDistribution || []).map((role, idx) => {
                const colors = ['bg-emerald-400', 'bg-blue-400', 'bg-amber-400', 'bg-purple-400'];
                return (
                <div key={role.role} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-emerald-200">{role.role}</span>
                    <span>{role.count}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${role.percent}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full ${colors[idx % colors.length]} rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]`}
                    ></motion.div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Quick Filters</h3>
              <Filter size={16} className="text-slate-300" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['All Status', 'Pending', 'High School', 'College', 'Faculty', 'Outside Client', 'Today'].map(tag => (
                <button key={tag} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all">
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

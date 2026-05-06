import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  ArrowUpRight, 
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  BookOpen,
  Award,
  Medal,
  Database,
  Server,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import { analyticsApi, type AnalyticsDashboardResponse } from '../../lib/api';

const Analytics = ({ role = 'staff' }: { role?: 'staff' | 'director' | 'admin' }) => {
  const theme = useTheme();
  const { accessToken } = useAuth();
  const [data, setData] = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;
      try {
        const result = await analyticsApi.getAnalyticsDashboardData(accessToken);
        if (result.ok) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken]);

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>;
  }

  const currentData: AnalyticsDashboardResponse = data || {
    stats: {
      totalAppointments: 0,
      todaysBookings: 0,
      approvalRate: '0.0',
      avgReviewTime: '0 Hours',
      pendingCount: 0,
      completedTests: 0,
      totalUsers: 0,
      activeStaff: 0
    },
    distribution: [],
    topCourses: [],
    topStaff: [],
    rolesDistribution: [],
    systemActivity: []
  };

  const stats = [
    { label: "Total Appointments", value: currentData.stats.totalAppointments.toString(), trend: "", icon: BarChart3, color: "blue" },
    { label: "Approval Rate", value: `${currentData.stats.approvalRate}%`, trend: "", icon: CheckCircle2, color: "teal" },
    { label: "Avg. Review Time", value: currentData.stats.avgReviewTime, trend: "", icon: TrendingUp, color: "purple" },
    { label: "Pending Reviews", value: currentData.stats.pendingCount.toString(), trend: "", icon: Activity, color: "amber" }
  ];

  const distribution = currentData.distribution.map((item, idx) => {
    const colors = ["bg-blue-500", theme.bg600, "bg-rose-500", "bg-amber-500"];
    return { ...item, color: colors[idx % colors.length] };
  });

  const rolesDistribution = currentData.rolesDistribution.map((item, idx) => {
    const colors = ["bg-blue-500", "bg-purple-500", theme.bg600, "bg-amber-500"];
    return { ...item, color: colors[idx % colors.length] };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Center Analytics</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Real-time performance metrics and distribution data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">Export Data</button>
          <button className={`px-4 py-2 ${theme.bg600} text-white rounded-lg text-xs font-black uppercase tracking-widest ${theme.hoverBg700} transition-all shadow-lg ${theme.shadow200}`}>Generate Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-lg border border-slate-200 shadow-sm group ${theme.hoverBg50} hover:${theme.border200} transition-all`}>
            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex items-baseline justify-between">
              <h4 className="text-2xl font-black text-slate-900">{stat.value}</h4>
              <span className={`text-[10px] font-black ${theme.text500} flex items-center gap-1`}>
                {stat.trend && <><ArrowUpRight size={12} /> {stat.trend}</>}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-lg p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
              <PieChartIcon className={theme.text500} size={24} />
              Service Distribution
            </h3>
            <select className={`bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 ${theme.focusRing}`}>
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>

          <div className="space-y-10">
            {distribution.map((item) => (
              <div key={item.label} className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                  <span className="text-sm font-black text-slate-900">{item.percent}%</span>
                </div>
                <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${item.color} rounded-full shadow-lg shadow-${item.color.split('-')[1]}-200/50`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center ${theme.text600} shadow-sm border border-slate-100 shrink-0`}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 mb-1">Performance Insight</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {distribution.length > 0
                    ? <>The top service this period is <strong>{distribution[0]?.label}</strong> at <strong>{distribution[0]?.percent}%</strong> of all appointments. Overall approval rate stands at <strong>{currentData.stats.approvalRate}%</strong>.</>
                    : 'No appointment data available yet for this period.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-4 ${theme.bg900} rounded-lg p-8 text-white relative overflow-hidden shadow-xl`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl"></div>
          <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
            <BookOpen className={theme.text400} size={24} />
            Top 5 Courses to Shift
          </h3>
          <div className="space-y-6 relative z-10">
            {currentData.topCourses.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className={`text-center py-2 px-3 bg-white/10 rounded-lg border border-white/10 h-fit min-w-[50px] flex items-center justify-center ${theme.hoverBg600} transition-colors`}>
                  <span className={`text-lg font-black leading-none ${theme.text400} group-hover:text-white`}>#{idx + 1}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-bold leading-tight line-clamp-1">{item.course}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text400}`}>{item.count} Requests</span>
                    <span className={`text-[9px] font-black ${theme.text400}`}>{item.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className={`w-full mt-10 py-4 bg-white ${theme.text700} rounded-lg font-black text-xs uppercase tracking-widest ${theme.hoverBg50} transition-all`}>
            View Full Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
            <Award className={theme.text500} size={24} />
            Top 5 Performing Staff
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Based on appointments reviewed</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {currentData.topStaff.length > 0 ? currentData.topStaff.map((staff, idx) => (
            <div key={idx} className={`bg-slate-50 rounded-lg p-5 border border-slate-100 flex flex-col items-center text-center relative group ${theme.hoverBg50} hover:${theme.border200} transition-colors`}>
              <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black text-xs bg-slate-100 text-slate-600 border-slate-200`}>
                #{idx + 1}
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-3 group-hover:scale-110 transition-transform">
                <Medal size={24} className={idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 leading-tight mb-1">{staff.name}</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">{staff.role}</p>
              <div className="mt-auto w-full pt-3 border-t border-slate-200/50 group-hover:border-emerald-200/50">
                <p className={`text-[10px] font-black ${theme.text600} uppercase tracking-widest`}>{staff.count} Reviewed</p>
              </div>
            </div>
          )) : <div className="col-span-5 text-center text-slate-400 font-bold py-8">No staff performance data yet.</div>}
        </div>
      </div>

      {role === 'admin' && (
        <div className="pt-8 mt-12 space-y-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <ShieldCheck className={theme.text600} size={32} />
                System Administration
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Platform-wide statistics, user roles, and system health.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Users", value: currentData.stats.totalUsers?.toString() ?? '0', trend: "", icon: Users, color: "blue" },
              { label: "Active Staff", value: currentData.stats.activeStaff?.toString() ?? '0', trend: "", icon: UserCheck, color: "teal" },
              { label: "Today's Bookings", value: currentData.stats.todaysBookings.toString(), trend: "", icon: Database, color: "amber" },
              { label: "Completed Tests", value: currentData.stats.completedTests.toString(), trend: "", icon: Server, color: "purple" }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-white p-6 rounded-lg border border-slate-200 shadow-sm group ${theme.hoverBg50} hover:${theme.border200} transition-all`}>
                <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-2xl font-black text-slate-900">{stat.value}</h4>
                  <span className={`text-[10px] font-black ${stat.trend.startsWith('-') || stat.trend === 'Stable' ? theme.text500 : theme.text500} flex items-center gap-1`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <Users className={theme.text500} size={24} />
                  System Roles Distribution
                </h3>
              </div>
              <div className="space-y-6">
                {rolesDistribution.map((item) => (
                  <div key={item.role} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm font-bold text-slate-700">{item.role}</span>
                      <span className="text-sm font-black text-slate-900">{item.count}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full ${item.color} rounded-full shadow-sm`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${theme.bg900} rounded-lg p-8 text-white relative overflow-hidden shadow-xl`}>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
              <h3 className="text-xl font-black tracking-tight mb-8 relative z-10 flex items-center gap-3">
                <Activity className={theme.text400} size={24} />
                Recent System Activity
              </h3>
              <div className="space-y-6 relative z-10">
                {currentData.systemActivity.map((log, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      <div className={`w-2 h-2 rounded-full ${log.type === 'system' ? 'bg-amber-400' : log.type === 'user' ? theme.bg600.replace('600', '400') : 'bg-purple-400'}`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight mb-1">{log.action}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${theme.text400}`}>{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className={`w-full mt-8 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all`}>
                View All Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;

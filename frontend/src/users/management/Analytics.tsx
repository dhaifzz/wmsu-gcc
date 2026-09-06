import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  UserCheck,
  X,
  Search,
  Download,
  RefreshCw,
  FileText,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import { analyticsApi, type AnalyticsDashboardResponse, type AuditLogItem } from '../../lib/api';
import Loader from '../../components/loader/Loader';

const Analytics = ({ role = 'staff' }: { role?: 'staff' | 'director' | 'admin' }) => {
  const theme = useTheme();
  const { accessToken } = useAuth();
  const [data, setData] = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Audit Logs modal states
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategory, setAuditCategory] = useState<string>('All');

  useEffect(() => {
    if (showAuditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAuditModal]);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;
      try {
        const [result, auditRes] = await Promise.all([
          analyticsApi.getAnalyticsDashboardData(accessToken),
          analyticsApi.getAuditLogs(accessToken)
        ]);
        if (result.ok) {
          setData(result.data);
        }
        if (auditRes.ok && auditRes.data?.auditLogs) {
          setAuditLogs(auditRes.data.auditLogs);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken]);

  const fetchAuditLogs = async () => {
    if (!accessToken) return;
    setLoadingAudit(true);
    try {
      const res = await analyticsApi.getAuditLogs(accessToken);
      if (res.ok) {
        setAuditLogs(res.data.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    fetchAuditLogs();
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesCategory = auditCategory === 'All' || log.category.toLowerCase() === auditCategory.toLowerCase();
    const query = auditSearch.toLowerCase();
    const matchesSearch =
      !query ||
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.category.toLowerCase().includes(query) ||
      log.dateFormatted.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const exportAuditLogsCSV = () => {
    if (filteredAuditLogs.length === 0) return;
    const headers = ['ID', 'Action', 'Details', 'Category', 'Type', 'Date', 'Time Ago'];
    const rows = filteredAuditLogs.map(l => [
      `"${l.id}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.type}"`,
      `"${l.dateFormatted}"`,
      `"${l.relativeTime}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Loader type="dashboard" />;
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Center Analytics</h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Real-time performance metrics and distribution data.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button onClick={handleOpenAuditModal} className="px-3.5 sm:px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">View Logs</button>
            <button className={`px-3.5 sm:px-4 py-2 ${theme.bg600} text-white rounded-lg text-xs font-black uppercase tracking-widest ${theme.hoverBg700} transition-all shadow-lg ${theme.shadow200}`}>Generate Report</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className={`bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-sm group ${theme.hoverBg50} hover:${theme.border200} transition-all`}>
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

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 bg-white rounded-lg p-5 sm:p-6 lg:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-10">
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

          <div className={`lg:col-span-4 ${theme.bg900} rounded-lg p-5 sm:p-6 lg:p-8 text-white relative overflow-hidden shadow-xl`}>
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

        <div className="bg-white rounded-lg p-5 sm:p-6 lg:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
              <Award className={theme.text500} size={24} />
              Top 5 Performing Staff
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Based on appointments reviewed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            )) : <div className="col-span-full text-center text-slate-400 font-bold py-8">No staff performance data yet.</div>}
          </div>
        </div>

        {role === 'admin' && (
          <div className="pt-8 mt-12 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                  <ShieldCheck className={theme.text600} size={32} />
                  System Administration
                </h2>
                <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Platform-wide statistics, user roles, and system health.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: "Total Users", value: currentData.stats.totalUsers?.toString() ?? '0', trend: "", icon: Users, color: "blue" },
                { label: "Active Staff", value: currentData.stats.activeStaff?.toString() ?? '0', trend: "", icon: UserCheck, color: "teal" },
                { label: "Today's Bookings", value: currentData.stats.todaysBookings.toString(), trend: "", icon: Database, color: "amber" },
                { label: "Completed Tests", value: currentData.stats.completedTests.toString(), trend: "", icon: Server, color: "purple" }
              ].map((stat, idx) => (
                <div key={idx} className={`bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-sm group ${theme.hoverBg50} hover:${theme.border200} transition-all`}>
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

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="bg-white rounded-lg p-5 sm:p-6 lg:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
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

              <div className={`${theme.bg900} rounded-lg p-5 sm:p-6 lg:p-8 text-white relative overflow-hidden shadow-xl`}>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
                <h3 className="text-xl font-black tracking-tight mb-8 relative z-10 flex items-center gap-3">
                  <Activity className={theme.text400} size={24} />
                  Recent System Activity
                </h3>
                <div className="space-y-5 relative z-10">
                  {(auditLogs.length > 0
                    ? auditLogs.slice(0, 4).map(l => ({ action: l.action, details: l.details, time: l.relativeTime, type: l.type }))
                    : currentData.systemActivity.map(s => ({ action: s.action, details: '', time: s.time, type: s.type }))
                  ).map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 group">
                      <div className="mt-1">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${log.type === 'appointment' ? 'bg-teal-400' :
                            log.type === 'user' ? 'bg-blue-400' :
                              log.type === 'blog' ? 'bg-purple-400' :
                                'bg-amber-400'
                          }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-snug truncate">{log.action}</p>
                        {log.details ? (
                          <p className="text-xs text-slate-300/80 font-medium truncate mt-0.5">{log.details}</p>
                        ) : null}
                        <p className={`text-[10px] font-black uppercase tracking-widest ${theme.text400} mt-1`}>{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleOpenAuditModal}
                  className="relative z-10 w-full mt-8 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-white/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  View All Audit Logs
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Audit Logs Modal ────────────────────────────────────────── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showAuditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-hidden"
              onMouseDown={(e) => e.target === e.currentTarget && setShowAuditModal(false)}
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-xl ${theme.bg600} text-white flex items-center justify-center shadow-md shadow-slate-200/50 shrink-0`}>
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">System Audit Logs</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-teal-50 text-teal-700 border border-teal-100">
                        {auditLogs.length} Records
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5">Real-time system events, appointments, and account activities.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="p-2 hover:bg-slate-200/60 rounded-xl transition-all text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Controls Bar */}
              <div className="px-4 sm:px-8 py-3 sm:py-4 border-b border-slate-100 bg-white flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between shrink-0">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs by action, user, or date..."
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-10 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all"
                  />
                  {auditSearch && (
                    <button
                      onClick={() => setAuditSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Category Pills & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 justify-between lg:justify-end">
                  <div className="flex flex-wrap gap-1.5 items-center overflow-x-auto py-0.5 custom-scrollbar">
                    {['All', 'User Activity', 'Appointments', 'Reviews', 'CMS & Blog'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setAuditCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer whitespace-nowrap ${auditCategory === cat
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-white'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={fetchAuditLogs}
                      disabled={loadingAudit}
                      title="Refresh logs"
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw size={16} className={loadingAudit ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={exportAuditLogsCSV}
                      disabled={filteredAuditLogs.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Download size={16} /> Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Logs Content List (Scrollable Area) */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-3 custom-scrollbar min-h-0">
                {loadingAudit ? (
                  <div className="py-20 text-center flex flex-col items-center gap-3 text-slate-400">
                    <RefreshCw size={32} className="animate-spin text-teal-600" />
                    <p className="text-sm font-bold">Loading audit logs...</p>
                  </div>
                ) : filteredAuditLogs.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <ShieldAlert size={40} className="text-slate-300" />
                    <div>
                      <p className="text-base font-black text-slate-700">No matching audit logs found</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">Try adjusting your search query or selected category filter.</p>
                    </div>
                  </div>
                ) : (
                  filteredAuditLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-teal-200 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black shadow-xs ${log.type === 'user'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : log.type === 'appointment'
                                ? 'bg-teal-50 text-teal-600 border border-teal-100'
                                : log.type === 'blog'
                                  ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                  : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}
                        >
                          {log.type === 'user' ? (
                            <Users size={18} />
                          ) : log.type === 'appointment' ? (
                            <Calendar size={18} />
                          ) : log.type === 'blog' ? (
                            <FileText size={18} />
                          ) : (
                            <Activity size={18} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-sm">{log.action}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              {log.category}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-500 mt-1">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 inline-block">
                          {log.relativeTime}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 mt-0.5">{log.dateFormatted}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-bold shrink-0">
                <span className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                  Showing {filteredAuditLogs.length} of {auditLogs.length} entries
                </span>
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
};

export default Analytics;

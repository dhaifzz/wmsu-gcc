import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  XCircle,
  Search,
  X,
  RefreshCw,
  Download,
  ArrowRight,
  ShieldAlert,
  MessageCircle,
  ClipboardCheck,
  Sparkles,
  Newspaper,
  FileText,
  Heart,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../auth/AuthContext';
import { analyticsApi, type AnalyticsDashboardResponse } from '../../../lib/api';
import { blogApi, type BlogPost } from '../../../lib/blogApi';
import Loader from '../../../components/loader/Loader';

const StaffDashboard = () => {
  const { accessToken } = useAuth();
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardResponse | null>(null);
  const [myPosts, setMyPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Recent Appointments
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!accessToken) return;
    try {
      setRefreshing(true);
      const [res, postsRes] = await Promise.all([
        analyticsApi.getAnalyticsDashboardData(accessToken),
        blogApi.getMyPosts(accessToken)
      ]);
      if (res.ok) {
        setDashboardData(res.data);
      }
      if (postsRes.ok && postsRes.data?.posts) {
        setMyPosts(postsRes.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch staff dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const appointments = dashboardData?.pendingAppointmentsList || [];

  // Filtered appointments for Modal view
  const filteredModalAppointments = appointments.filter(app => {
    const query = modalSearch.toLowerCase();
    const matchesSearch = 
      app.student.toLowerCase().includes(query) ||
      app.level.toLowerCase().includes(query) ||
      app.type.toLowerCase().includes(query) ||
      app.date.toLowerCase().includes(query) ||
      app.time.toLowerCase().includes(query) ||
      app.status.toLowerCase().includes(query);

    let matchesCategory = true;
    if (modalCategory === 'Pending') matchesCategory = app.status.toLowerCase() === 'pending';
    else if (modalCategory === 'Approved') matchesCategory = app.status.toLowerCase() === 'approved';
    else if (modalCategory === 'Counseling') matchesCategory = app.type.toLowerCase() === 'counseling';
    else if (modalCategory === 'Assessment') matchesCategory = app.type.toLowerCase() === 'assessment';
    else if (modalCategory === 'Shifting') matchesCategory = app.type.toLowerCase() === 'shifting';
    else if (modalCategory === 'College') matchesCategory = app.level.toLowerCase() === 'college';
    else if (modalCategory === 'High School') matchesCategory = app.level.toLowerCase().includes('school') || app.level.toLowerCase().includes('high');

    return matchesSearch && matchesCategory;
  });

  // CSV Exporter for Appointments
  const exportAppointmentsCSV = () => {
    if (filteredModalAppointments.length === 0) return;
    const headers = ['ID', 'Student Name', 'Level', 'Service Type', 'Date', 'Time', 'Status'];
    const rows = filteredModalAppointments.map(a => [
      a.id,
      `"${a.student.replace(/"/g, '""')}"`,
      a.level,
      a.type,
      a.date,
      a.time,
      a.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recent_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Today's Bookings", val: dashboardData?.stats.todaysBookings || 0, trend: "Live", icon: Calendar, color: "emerald" },
          { label: "Pending Review", val: dashboardData?.stats.pendingCount || 0, trend: "Live", icon: Clock, color: "blue" },
          { label: "Total Students", val: (dashboardData?.rolesDistribution?.find(r => r.role === 'College Students')?.count || 0) + (dashboardData?.rolesDistribution?.find(r => r.role === 'High School Students')?.count || 0), trend: "Live", icon: Users, color: "purple" },
          { label: "Completed Tests", val: dashboardData?.stats.completedTests || 0, trend: "Live", icon: CheckCircle2, color: "rose" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl flex items-center justify-center mb-6 shadow-xs`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end gap-2">
              <h4 className="text-3xl font-black text-slate-900">{stat.val}</h4>
              <span className="text-[10px] font-black text-emerald-500 mb-1 flex items-center gap-1">
                <TrendingUp size={12} /> {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Recent Appointments Section */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col h-fit">
          <div>
            {/* Card Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-black shadow-xs shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900">Recent Appointments</h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">Latest student bookings and schedule requests</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowAppointmentsModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all cursor-pointer shadow-xs active:scale-95 self-start sm:self-auto"
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Table / Empty State Body */}
            {appointments.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-900">
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-widest text-emerald-100">Student Name</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-widest text-emerald-100">Level</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-widest text-emerald-100">Service Type</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-widest text-emerald-100">Schedule</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-widest text-emerald-100">Status</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-widest text-emerald-100 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.slice(0, 5).map((app) => (
                      <tr key={app.id} className="group hover:bg-slate-50/80 transition-colors text-slate-700">
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-200/50 shrink-0">
                              {app.student.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-black text-sm text-slate-900">{app.student}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            app.level === 'College' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {app.level}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${
                            app.type === 'Counseling' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            app.type === 'Assessment' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-purple-50 text-purple-700 border-purple-100'
                          }`}>
                            {app.type === 'Counseling' && <MessageCircle size={12} />}
                            {app.type === 'Assessment' && <ClipboardCheck size={12} />}
                            {app.type}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                          <p className="font-black text-xs text-slate-800">{app.time}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{app.date}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${app.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                            <span className="font-black text-xs text-slate-700">{app.status}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              title="Approve appointment"
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button 
                              title="Decline appointment"
                              className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-xs"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 px-6 text-center flex flex-col items-center justify-center bg-slate-50/40">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 border border-emerald-100 shadow-xs">
                  <Calendar size={24} className="opacity-80" />
                </div>
                <h4 className="text-sm font-black text-slate-800">No Recent Appointments</h4>
                <p className="text-xs font-medium text-slate-400 max-w-sm mt-0.5">
                  Student booking requests will automatically appear here once scheduled.
                </p>
              </div>
            )}
          </div>

          {/* Footer banner */}
          <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-slate-500">
            <span>Showing {Math.min(appointments.length, 5)} of {appointments.length} total entries</span>
            <button 
              onClick={() => setShowAppointmentsModal(true)}
              className="text-emerald-700 hover:text-emerald-800 font-black text-[11px] uppercase tracking-wider hover:underline"
            >
              Open Full Modal &rarr;
            </button>
          </div>
        </div>

        {/* Sidebar Info / Notifications */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-emerald-900 rounded-2xl p-5 sm:p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20 border border-emerald-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-black mb-6 sm:mb-8 relative z-10 flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-400" />
              User Distribution
            </h3>
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

          {/* Staff Blog Posts Analytics */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-black shadow-xs shrink-0">
                <Newspaper size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base tracking-tight">Blog Analytics</h3>
                <p className="text-xs text-slate-500 font-bold">Your post engagement & activity</p>
              </div>
            </div>

            {/* 2x2 Metric Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/80">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <FileText size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Posts</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{myPosts.length}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {myPosts.filter(p => p.status === 'approved').length} Live • {myPosts.filter(p => p.status === 'pending').length} Pending
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/80">
                <div className="flex items-center gap-2 text-rose-500 mb-1">
                  <Heart size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reactions</span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {myPosts.reduce((acc, p) => acc + (p.totalReactions || 0), 0)}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Total student likes</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/80">
                <div className="flex items-center gap-2 text-indigo-500 mb-1">
                  <MessageSquare size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Comments</span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {myPosts.reduce((acc, p) => acc + (p.commentCount || 0), 0)}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Student feedback</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/80">
                <div className="flex items-center gap-2 text-amber-500 mb-1">
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Approval</span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {myPosts.length > 0 ? `${Math.round((myPosts.filter(p => p.status === 'approved').length / myPosts.length) * 100)}%` : '0%'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Publication rate</p>
              </div>
            </div>

            {/* Latest Post Highlight */}
            {myPosts[0] ? (
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Latest Post</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    myPosts[0].status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    myPosts[0].status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-rose-100 text-rose-800 border-rose-200'
                  }`}>
                    {myPosts[0].status}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed">
                  "{myPosts[0].content}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pt-1">
                  <span className="capitalize text-emerald-600">🏷️ {myPosts[0].category || 'General'}</span>
                  <span>❤️ {myPosts[0].totalReactions || 0} • 💬 {myPosts[0].commentCount || 0}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-xs font-bold">
                No blog posts published yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Appointments Modal (Audit Logs Style) ────────────────────────── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showAppointmentsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-hidden"
              onMouseDown={(e) => e.target === e.currentTarget && setShowAppointmentsModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden my-auto"
                onClick={(e) => e.stopPropagation()}
              >
              {/* Modal Header */}
              <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Recent Appointments</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {appointments.length} Records
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5">Real-time log of student bookings, counseling requests, and evaluations.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAppointmentsModal(false)}
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
                    placeholder="Search by student name, service type, level, date, or status..."
                    value={modalSearch}
                    onChange={e => setModalSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-10 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  />
                  {modalSearch && (
                    <button
                      onClick={() => setModalSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Category Pills & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 justify-between lg:justify-end">
                  <div className="flex flex-wrap gap-1.5 items-center overflow-x-auto py-0.5 custom-scrollbar">
                    {['All', 'Pending', 'Approved', 'Counseling', 'Assessment', 'Shifting', 'College', 'High School'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setModalCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer whitespace-nowrap ${
                          modalCategory === cat
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={fetchDashboard}
                      disabled={refreshing}
                      title="Refresh records"
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={exportAppointmentsCSV}
                      disabled={filteredModalAppointments.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Download size={16} /> Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Logs Content List (Scrollable Area) */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-3 custom-scrollbar min-h-0">
                {filteredModalAppointments.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <ShieldAlert size={40} className="text-slate-300" />
                    <div>
                      <p className="text-base font-black text-slate-700">No matching appointments found</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">Try adjusting your search query or selected category filter.</p>
                    </div>
                  </div>
                ) : (
                  filteredModalAppointments.map(app => (
                    <div
                      key={app.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-black text-sm border border-emerald-200/50 shadow-xs">
                          {app.student.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-slate-900">{app.student}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              app.level === 'College' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {app.level}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${
                              app.type === 'Counseling' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                              app.type === 'Assessment' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              'bg-purple-50 text-purple-700 border-purple-100'
                            }`}>
                              {app.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-1">
                            <span>📅 {app.date}</span>
                            <span>⏰ {app.time}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl border border-slate-100 shadow-xs">
                          <div className={`w-2 h-2 rounded-full ${app.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                          <span className="font-black text-xs text-slate-700">{app.status}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            title="Approve"
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            title="Decline"
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-xs cursor-pointer"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-slate-500">
                  Showing <span className="font-black text-slate-700">{filteredModalAppointments.length}</span> of {appointments.length} records
                </span>
                <button
                  onClick={() => setShowAppointmentsModal(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer"
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
    </motion.div>
  );
};

export default StaffDashboard;

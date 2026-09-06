import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import { showAlert } from '../../../components/modal-notification/sweetalert';
import toast from 'react-hot-toast';

import { useAuth } from '../../../auth/AuthContext';
import { analyticsApi, appointmentApi, type AnalyticsDashboardResponse } from '../../../lib/api';

interface OverviewProps {
  userName: string;
  onNavigate: (tab: string) => void;
}

import { BookingPanel } from './components/BookingPanel';
import { StatsSummary } from './components/StatsSummary';
import { ApprovalQueue, type PendingItem } from './components/ApprovalQueue';

// ── Main Overview ──────────────────────────────────────────────────────────────
const Overview = ({ userName, onNavigate }: OverviewProps) => {
  const { accessToken: token } = useAuth();
  const [view, setView] = useState<'main' | 'book'>('main');

  // ── Analytics data state ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboardResponse | null>(null);
  const [queue, setQueue] = useState<PendingItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await analyticsApi.getAnalyticsDashboardData(token);
      if (res.ok && res.data) {
        setAnalyticsData(res.data);
        setQueue(res.data.pendingAppointmentsList ?? []);
      } else {
        toast.error('Failed to load dashboard data.');
      }
    } catch {
      toast.error('An error occurred while loading dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Resolve API endpoint for approve/decline by type ──────────────────────
  const evaluateAppointment = async (id: string, type: string, action: 'approve' | 'decline') => {
    if (!token) return false;
    const payload = { action };
    const lowerType = type.toLowerCase();
    let res;
    if (lowerType.includes('shifting')) {
      res = await appointmentApi.directorEvaluateShiftingAppointment(id, payload, token);
    } else if (lowerType.includes('assessment')) {
      res = await appointmentApi.directorEvaluateAssessmentAppointment(id, payload, token);
    } else {
      res = await appointmentApi.directorEvaluateCounselingAppointment(id, payload, token);
    }
    return res.ok;
  };

  const handleApprove = async (item: PendingItem) => {
    const result = await showAlert.confirm(
      'Approve Appointment',
      `Approve the ${item.type} appointment for ${item.student}?`,
      'Approve',
      'Cancel'
    );
    if (result.isConfirmed) {
      const ok = await evaluateAppointment(item.id, item.type, 'approve');
      if (ok) {
        setQueue(q => q.filter(a => a.id !== item.id));
        toast.success('Appointment approved!');
      } else {
        toast.error('Failed to approve appointment.');
      }
    }
  };

  const handleDecline = async (item: PendingItem) => {
    const result = await showAlert.confirm(
      'Decline Appointment',
      `Decline the ${item.type} appointment for ${item.student}?`,
      'Decline',
      'Cancel'
    );
    if (result.isConfirmed) {
      const ok = await evaluateAppointment(item.id, item.type, 'decline');
      if (ok) {
        setQueue(q => q.filter(a => a.id !== item.id));
        toast.error('Appointment declined.');
      } else {
        toast.error('Failed to decline appointment.');
      }
    }
  };

  if (view === 'book') {
    return <BookingPanel onBack={() => setView('main')} />;
  }

  return (
    <motion.div
      key="main-overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Admin Control Center</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">Welcome back, {userName.split(' ')[0]}!</h3>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Manage appointments and oversee system activity.</p>
        </div>
        <button
          onClick={() => setView('book')}
          className="flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl transition-all shadow-lg shadow-teal-200 shrink-0 self-start sm:self-auto text-xs sm:text-sm"
        >
          <Plus size={18} />
          Book Appointment
        </button>
      </div>

      {/* Stats */}
      <StatsSummary loading={loading} stats={analyticsData?.stats} pendingCount={queue.length} />

      {/* Approval Queue */}
      <ApprovalQueue queue={queue} loading={loading} onApprove={handleApprove} onDecline={handleDecline} />

      {/* Quick module nav */}
      <div>
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <LayoutGrid size={20} className="text-slate-400" />
          <h4 className="text-lg sm:text-xl font-black text-slate-800">All Appointment Modules</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { id: 'counseling', label: 'Counseling', icon: MessageCircle, color: 'bg-blue-500' },
            { id: 'assessment', label: 'Assessment', icon: ClipboardCheck, color: 'bg-teal-500' },
            { id: 'shifting', label: 'Shifting', icon: RefreshCw, color: 'bg-rose-500' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className="p-5 sm:p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 group cursor-pointer transition-all flex items-center gap-4 text-left"
            >
              <div className={`w-12 h-12 ${s.color} text-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                <s.icon size={22} />
              </div>
              <div>
                <p className="font-black text-slate-900">{s.label} Appointments</p>
                <p className="text-xs text-slate-400 font-bold">View all & manage</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 ml-auto group-hover:text-teal-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;

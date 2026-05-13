import { Calendar, Users, AlertCircle, Loader2 } from 'lucide-react';
import type { AnalyticsDashboardResponse } from '../../../../lib/api';

interface StatsSummaryProps {
  loading: boolean;
  stats?: AnalyticsDashboardResponse['stats'];
  pendingCount: number;
}

export const StatsSummary = ({ loading, stats, pendingCount }: StatsSummaryProps) => {
  const totalAppointments = stats?.totalAppointments ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Total Appointments */}
      <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4">
          <Calendar size={24} />
        </div>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Appointments</p>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-bold">Loading…</span>
          </div>
        ) : (
          <p className="text-2xl font-black">{totalAppointments.toLocaleString()}</p>
        )}
      </div>

      {/* Pending Approval */}
      <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Pending Approval</p>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-bold">Loading…</span>
          </div>
        ) : (
          <p className="text-2xl font-black">{pendingCount}</p>
        )}
      </div>

      {/* Active Users */}
      <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
          <Users size={24} />
        </div>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Registered Users</p>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-bold">Loading…</span>
          </div>
        ) : (
          <p className="text-2xl font-black">{totalUsers.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

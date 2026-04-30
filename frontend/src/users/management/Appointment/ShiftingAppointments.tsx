import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Search, Filter, Calendar as CalendarIcon, MoreHorizontal, ArrowRight, ClipboardCheck, CheckCircle2, X, Edit2 } from 'lucide-react';
import ShiftingEvaluationModal from '../../../components/management-modals/ShiftingEvaluationModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { appointmentApi } from '../../../lib/api';
import type { ShiftingAppointmentItem } from '../../../lib/api';
import { useAuth } from '../../../auth/AuthContext';

const ShiftingAppointments = ({ role = 'staff' }: { role?: 'staff' | 'director' | 'admin' }) => {
  const { accessToken } = useAuth();
  const theme = useTheme();
  const [appointments, setAppointments] = useState<ShiftingAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<ShiftingAppointmentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [submissionPeriod, setSubmissionPeriod] = useState({
    start: today,
    end: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    isEditing: false
  });

  const getStatus = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(submissionPeriod.start);
    const end = new Date(submissionPeriod.end);
    
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' };
    if (now > end) return { label: 'Closed', color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' };
    return { label: 'Active', color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' };
  };

  const status = getStatus();

  const fetchAppointments = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await appointmentApi.getShiftingManagementAppointments(accessToken);
      if (res.ok) {
        setAppointments(res.data.appointments);
      } else {
        console.error('Error fetching shifting management appointments:', res.error);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [accessToken]);

  const handleEvaluate = (app: ShiftingAppointmentItem) => {
    setSelectedAppointment(app);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <RefreshCw className="text-rose-500" size={28} />
            {role === 'director' ? 'Shifting Approvals' : 'Shifting Applications'}
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {role === 'director' 
              ? 'Provide final director-level approval for student shifting applications.' 
              : 'Evaluate and process student course shifting requirements.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {role === 'director' && (
            <div className="flex items-center gap-2 mr-2">
              <button className={`px-4 py-2.5 ${theme.bg50} ${theme.hoverBg600} ${theme.text600} hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${theme.border200} ${theme.hoverBorder600} flex items-center gap-2 shadow-sm`}>
                <CheckCircle2 size={14} />
                Accept All
              </button>
              <button className="px-4 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-rose-200 hover:border-rose-600 flex items-center gap-2 shadow-sm">
                <X size={14} />
                Decline All
              </button>
            </div>
          )}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by student or course..."
              className="bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50" title="Filter">
            <Filter size={18} />
          </button>
        </div>
      </div>
      
      {/* Submission Period Management */}
      <div className={`p-6 rounded-lg border ${submissionPeriod.isEditing ? 'bg-white border-slate-200' : `${status.bg} border-transparent`} transition-all duration-500 min-h-[140px] flex items-center`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${status.color} rounded-lg flex items-center justify-center text-white shadow-lg`}>
              <CalendarIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-black text-slate-800">Submission Period</h4>
                <span className={`px-3 py-1 ${status.bg} ${status.text} rounded-full text-[10px] font-black uppercase tracking-widest border border-current/20 animate-pulse`}>
                  {status.label}
                </span>
              </div>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                {submissionPeriod.isEditing 
                  ? 'Set the start and end dates for student shifting applications.' 
                  : `Applications are accepted from ${new Date(submissionPeriod.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to ${new Date(submissionPeriod.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {submissionPeriod.isEditing ? (
              <div className="flex flex-col sm:flex-row items-end gap-3 animate-in fade-in slide-in-from-right-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Date</label>
                  <input 
                    type="date" 
                    min={today}
                    value={submissionPeriod.start}
                    onChange={(e) => setSubmissionPeriod({ ...submissionPeriod, start: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Date</label>
                  <input 
                    type="date" 
                    min={submissionPeriod.start}
                    value={submissionPeriod.end}
                    onChange={(e) => setSubmissionPeriod({ ...submissionPeriod, end: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setSubmissionPeriod({ ...submissionPeriod, isEditing: false })}
                  className={`px-6 py-2.5 ${theme.bg600} text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg ${theme.hoverBg700} transition-all h-[42px]`}
                >
                  Save Period
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setSubmissionPeriod({ ...submissionPeriod, isEditing: true })}
                className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Edit2 size={14} />
                Manage Period
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={theme.bg900}>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Student Info</th>
                {role === 'director' ? (
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Evaluated By</th>
                ) : (
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Current Course</th>
                )}
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Transition</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Schedule</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-8 text-center text-slate-500 font-bold text-sm">
                    Loading applications...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-8 text-center text-slate-500 font-bold text-sm">
                    No applications found.
                  </td>
                </tr>
              ) : appointments.map((app) => (
                <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-sm text-slate-900">{app.student}</p>
                    <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{app.studentId}</p>
                  </td>
                  {role === 'director' ? (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <div className={`w-7 h-7 ${theme.bg50} rounded-lg flex items-center justify-center ${theme.text600} border ${theme.border200}`}>
                           <ClipboardCheck size={12} />
                         </div>
                         <p className="text-xs font-bold text-slate-700">{app.evaluatedBy || 'Pending'}</p>
                      </div>
                    </td>
                  ) : (
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit bg-indigo-50 text-indigo-600 border-indigo-100">
                          {app.level}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 ml-1">
                          {app.course}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{app.currentCourse}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase border border-rose-100">{app.targetCourse}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CalendarIcon size={14} className="text-slate-400" />
                      <p className="text-sm font-bold">{app.time}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium ml-6">{app.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'Approved' ? theme.bg600 : 'bg-amber-500'}`}></div>
                      <span className="font-bold text-xs text-slate-700">{app.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEvaluate(app)}
                        className={`px-4 py-2 ${theme.bg600} text-white rounded-lg text-[10px] font-black uppercase tracking-widest ${theme.hoverBg700} transition-all flex items-center gap-2`}
                      >
                        <ClipboardCheck size={14} />
                        {role === 'director' ? 'Final Review' : 'Review'}
                      </button>
                      {role !== 'director' && (
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-lg border border-slate-100">
                          <MoreHorizontal size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ShiftingEvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
        role={role}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchAppointments();
        }}
      />
    </motion.div>
  );
};

export default ShiftingAppointments;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, Search, Filter, Calendar as CalendarIcon, MoreHorizontal,
  ArrowRight, Clock, ClipboardCheck, CheckCircle2, X, Settings2,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import ShiftingEvaluationModal from '../../../components/management-modals/ShiftingEvaluationModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { appointmentApi } from '../../../lib/api';
import type { ShiftingAppointmentItem } from '../../../lib/api';
import { useAuth } from '../../../auth/AuthContext';

const ShiftingAppointments = ({ role = 'staff' }: { role?: 'staff' | 'director' | 'admin' }) => {
  const { accessToken } = useAuth();
  const theme = useTheme();
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getTodayStr();

  // Appointments
  const [appointments, setAppointments] = useState<ShiftingAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<ShiftingAppointmentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Saved config (displayed on the summary card)
  const [submissionPeriod, setSubmissionPeriod] = useState({
    start:    today,
    end:      (() => {
                const d = new Date();
                d.setDate(d.getDate() + 30);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              })(),
    examDate: (() => {
                const d = new Date();
                d.setDate(d.getDate() + 35);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              })(),
    examTime: '09:00',
  });

  // Config modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configStep, setConfigStep]   = useState(0);
  const [draft, setDraft]             = useState({ ...submissionPeriod });
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving]   = useState(false);
  const [configError, setConfigError]     = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  // ── Overlap validation ────────────────────────────────────────────────
  const getOverlapError = (): string | null => {
    if (!draft.start || !draft.end || !draft.examDate) return null;
    const endDate  = new Date(draft.end);
    const examDate = new Date(draft.examDate);
    endDate.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    if (examDate <= endDate) {
      return 'The exam date must be after the submission period end date. Please adjust your dates to avoid overlap.';
    }
    const startDate = new Date(draft.start);
    startDate.setHours(0, 0, 0, 0);
    if (examDate >= startDate && examDate <= endDate) {
      return 'The exam date falls within the submission period. Please choose a date after the submission window.';
    }
    return null;
  };
  const overlapError = getOverlapError();

  // ── Fetch config on mount ────────────────────────────────────────────────
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setConfigLoading(true);
        const res = await appointmentApi.getShiftingConfig();
        if (res.ok && res.data) {
          const loaded = {
            start:    res.data.startDate || today,
            end:      res.data.endDate   || submissionPeriod.end,
            examDate: res.data.examDate  || submissionPeriod.examDate,
            examTime: res.data.examTime  || '09:00',
          };
          setSubmissionPeriod(loaded);
          setDraft(loaded);
        }
      } catch (err) {
        console.error('Failed to load shifting config:', err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save config ──────────────────────────────────────────────────────────
  const handleSaveConfig = async () => {
    if (!accessToken) return;
    if (overlapError) {
      setConfigError(overlapError);
      return;
    }
    try {
      setConfigSaving(true);
      setConfigError(null);
      const res = await appointmentApi.updateShiftingConfig({
        startDate: draft.start,
        endDate:   draft.end,
        examDate:  draft.examDate,
        examTime:  draft.examTime,
      }, accessToken);
      if (res.ok) {
        setSubmissionPeriod({ ...draft });
        setConfigSuccess('Configuration saved successfully.');
        setIsConfigModalOpen(false);
        setTimeout(() => setConfigSuccess(null), 3000);
      } else {
        setConfigError(res.error || 'Failed to save configuration.');
      }
    } catch (err) {
      console.error('Error saving config:', err);
      setConfigError('An unexpected error occurred.');
    } finally {
      setConfigSaving(false);
    }
  };

  const openConfigModal = () => {
    setDraft({ ...submissionPeriod });
    setConfigStep(0);
    setConfigError(null);
    setIsConfigModalOpen(true);
  };

  // ── Status badge ─────────────────────────────────────────────────────────
  const getStatus = () => {
    const now   = new Date(); now.setHours(0, 0, 0, 0);
    const start = new Date(submissionPeriod.start);
    const end   = new Date(submissionPeriod.end);
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-500',    text: 'text-blue-600',    bg: 'bg-blue-50'    };
    if (now > end)   return { label: 'Closed',   color: 'bg-rose-500',    text: 'text-rose-600',    bg: 'bg-rose-50'    };
    return               { label: 'Active',    color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' };
  };
  const status = getStatus();

  // ── Fetch appointments ───────────────────────────────────────────────────
  const fetchAppointments = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await appointmentApi.getShiftingManagementAppointments(accessToken);
      if (res.ok) setAppointments(res.data.appointments);
      else console.error('Error fetching shifting appointments:', res.error);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    let mounted = true;

    const loadAppointments = async () => {
      try {
        setLoading(true);
        const res = await appointmentApi.getShiftingManagementAppointments(accessToken);
        if (!mounted) return;
        if (res.ok) setAppointments(res.data.appointments);
        else console.error('Error fetching shifting appointments:', res.error);
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to fetch:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadAppointments();
    return () => { mounted = false; };
  }, [accessToken]);

  const handleEvaluate = (app: ShiftingAppointmentItem) => {
    setSelectedAppointment(app);
    setIsModalOpen(true);
  };

  // ── Stepper steps ────────────────────────────────────────────────────────
  const STEPS = [
    { label: 'Submission Period', icon: <CalendarIcon size={15} /> },
    { label: 'Date of Exam',      icon: <ClipboardCheck size={15} /> },
    { label: 'Time of Exam',      icon: <Clock size={15} /> },
  ];

  // ────────────────────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      {/* Header */}
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
          {role === 'director' && appointments.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <button className={`px-4 py-2.5 ${theme.bg50} ${theme.hoverBg600} ${theme.text600} hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${theme.border200} ${theme.hoverBorder600} flex items-center gap-2 shadow-sm`}>
                <CheckCircle2 size={14} /> Accept All
              </button>
              <button className="px-4 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-rose-200 hover:border-rose-600 flex items-center gap-2 shadow-sm">
                <X size={14} /> Decline All
              </button>
            </div>
          )}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search by student or course..." className="bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-rose-500 transition-all outline-none" />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50" title="Filter">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Config Summary Card */}
      <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-5 transition-all duration-500 ${configLoading ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 ${status.color} rounded-xl flex items-center justify-center text-white shadow`}>
              <CalendarIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-black text-slate-800 text-sm">Submission Window</p>
                <span className={`px-2 py-0.5 ${status.bg} ${status.text} rounded-full text-[10px] font-black uppercase tracking-widest`}>{status.label}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(submissionPeriod.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {' '}&mdash;{' '}
                {new Date(submissionPeriod.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="hidden sm:flex gap-3 ml-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <ClipboardCheck size={13} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">
                  {new Date(submissionPeriod.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <Clock size={13} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">{submissionPeriod.examTime}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {configSuccess && <span className="text-xs font-bold text-emerald-600">{configSuccess}</span>}
            {configError   && <span className="text-xs font-bold text-rose-600">{configError}</span>}
            {role === 'director' && (
              <button
                onClick={openConfigModal}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm text-slate-700"
              >
                <Settings2 size={14} className="text-rose-600" /> Configure
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stepper Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <div>
                <h4 className="text-xl font-black text-slate-900">Configure Shifting Schedule</h4>
                <p className="text-xs text-slate-500 mt-0.5">Set the values you need — all steps are optional.</p>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* Step Pills */}
            <div className="flex items-center gap-1 px-8 pb-6">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <button
                    onClick={() => setConfigStep(i)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      configStep === i ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {step.icon} {step.label}
                  </button>
                  {i < STEPS.length - 1 && <ChevronRight size={13} className="text-slate-300 shrink-0" />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="px-8 pb-8 min-h-[140px]">
              {configStep === 0 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Submission Period</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">Start Date</label>
                      <input type="date" min={today} max={draft.end} value={draft.start}
                        onChange={e => setDraft(d => ({ ...d, start: e.target.value }))}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">End Date</label>
                      <input type="date" min={draft.start} max={draft.examDate} value={draft.end}
                        onChange={e => setDraft(d => ({ ...d, end: e.target.value }))}
                        className={`bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 transition-all ${overlapError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-rose-500'}`} />
                    </div>
                  </div>
                  {overlapError && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <X size={14} className="text-rose-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] font-bold text-rose-600">{overlapError}</p>
                    </div>
                  )}
                </div>
              )}
              {configStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date of Exam</p>
                  <div className="flex flex-col gap-1.5 max-w-xs">
                    <label className="text-[10px] font-black uppercase text-slate-400">Exam Date</label>
                    <input type="date" min={draft.end ? (() => {
                      const d = new Date(new Date(draft.end).getTime() + 86400000);
                      const year = d.getFullYear();
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    })() : today} value={draft.examDate}
                      onChange={e => setDraft(d => ({ ...d, examDate: e.target.value }))}
                      className={`bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 transition-all ${overlapError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-rose-500'}`} />
                  </div>
                  {overlapError && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <X size={14} className="text-rose-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] font-bold text-rose-600">{overlapError}</p>
                    </div>
                  )}
                </div>
              )}
              {configStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time of Exam</p>
                  <div className="flex flex-col gap-1.5 max-w-xs">
                    <label className="text-[10px] font-black uppercase text-slate-400">Exam Time</label>
                    <input type="time" value={draft.examTime}
                      onChange={e => setDraft(d => ({ ...d, examTime: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-all w-48" />
                  </div>
                </div>
              )}
              {configError && <p className="mt-4 text-xs font-bold text-rose-600">{configError}</p>}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setConfigStep(s => Math.max(0, s - 1))}
                disabled={configStep === 0}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <div className="flex items-center gap-3">
                {configStep < 2 && (
                  <button
                    onClick={() => setConfigStep(s => s + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                )}
                <button
                  onClick={handleSaveConfig}
                  disabled={configSaving || !!overlapError}
                  className={`px-6 py-2.5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 ${overlapError ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-rose-600 shadow-rose-600/20 hover:bg-rose-700'}`}
                >
                  {configSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Appointments Table */}
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
                <tr><td colSpan={6} className="px-8 py-8 text-center text-slate-500 font-bold text-sm">Loading applications...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-8 text-center text-slate-500 font-bold text-sm">No applications found.</td></tr>
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
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit bg-indigo-50 text-indigo-600 border-indigo-100">{app.level}</span>
                        <span className="text-[10px] font-bold text-slate-500 ml-1">{app.course}</span>
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
        onSuccess={() => { setIsModalOpen(false); fetchAppointments(); }}
      />
    </motion.div>
  );
};

export default ShiftingAppointments;

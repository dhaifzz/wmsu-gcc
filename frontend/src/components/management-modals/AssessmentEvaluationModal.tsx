import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, CalendarClock, AlertCircle,
  User, BookOpen, Clock, Calendar, ClipboardCheck, FileText
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { appointmentApi } from '../../lib/api';
import { showToast } from '../modal-notification/toast';
import { useDirectorPresence } from '../../hooks/useDirectorPresence';

interface AssessmentEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  role?: 'staff' | 'director' | 'admin';
  onSuccess?: () => void;
}

const AssessmentEvaluationModal = ({ isOpen, onClose, appointment, role = 'staff', onSuccess }: AssessmentEvaluationModalProps) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [forwardToDirector, setForwardToDirector] = useState(false);
  const [reschedMode, setReschedMode] = useState<boolean>(false);
  const [reschedType, setReschedType] = useState<'staff_picked' | 'user_picked'>('staff_picked');
  const [newDate, setNewDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const { isDirectorOnline } = useDirectorPresence(role);

  const isEmerald = role === 'staff' || role === 'director';
  const theme = {
    bg900: isEmerald ? 'bg-emerald-900' : 'bg-teal-900',
    grad: isEmerald ? 'from-emerald-800/40 to-emerald-900' : 'from-teal-800/40 to-teal-900',
    blur1: isEmerald ? 'bg-emerald-400/10' : 'bg-teal-400/10',
    blur2: isEmerald ? 'bg-emerald-500/10' : 'bg-teal-500/10',
    iconText: isEmerald ? 'text-emerald-500' : 'text-teal-500',
    subText: isEmerald ? 'text-emerald-400/80' : 'text-teal-400/80',
    badgeBg: isEmerald ? 'bg-emerald-50' : 'bg-teal-50',
    badgeText: isEmerald ? 'text-emerald-600' : 'text-teal-600',
    badgeBorder: isEmerald ? 'border-emerald-100' : 'border-teal-100',
    badgeLabel: isEmerald ? 'text-emerald-400' : 'text-teal-400',
    boxBg: isEmerald ? 'bg-emerald-50' : 'bg-teal-50',
    boxBorder: isEmerald ? 'border-emerald-100/50' : 'border-teal-100/50',
    boxTitle: isEmerald ? 'text-emerald-600' : 'text-teal-600',
    boxText: isEmerald ? 'text-emerald-900' : 'text-teal-900',
    btnBg: isEmerald ? 'bg-emerald-50' : 'bg-teal-50',
    btnHoverBg: isEmerald ? 'hover:bg-emerald-600' : 'hover:bg-teal-600',
    btnBorder: isEmerald ? 'border-emerald-100' : 'border-teal-100',
    btnHoverBorder: isEmerald ? 'hover:border-emerald-600' : 'hover:border-teal-600',
    btnHoverShadow: isEmerald ? 'hover:shadow-emerald-200' : 'hover:shadow-teal-200',
    btnIconHoverBg: isEmerald ? 'group-hover:bg-emerald-500' : 'group-hover:bg-teal-500',
    btnText: isEmerald ? 'text-emerald-700' : 'text-teal-700',
    toggleBg: isEmerald ? 'bg-emerald-500' : 'bg-teal-500',
    text600: isEmerald ? 'text-emerald-600' : 'text-teal-600'
  };

  // If director is online, force forwarding to director
  const effectiveForwardToDirector = isDirectorOnline ? true : forwardToDirector;

  if (!appointment) return null;

  const handleEvaluate = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await appointmentApi.evaluateAssessmentAppointment(
        appointment.id,
        { action: 'evaluate', forwardToDirector: effectiveForwardToDirector },
        accessToken
      );
      if (res.ok) {
        showToast.success('Evaluation completed.');
        if (onSuccess) onSuccess();
      } else {
        showToast.error(res.error || 'Failed to evaluate.');
      }
    } catch (error) {
      showToast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!accessToken) return;
    if (reschedType === 'staff_picked' && (!newDate || !newTimeSlot)) {
      showToast.error('Please select new date and time.');
      return;
    }
    setLoading(true);
    try {
      const res = await appointmentApi.evaluateAssessmentAppointment(
        appointment.id,
        { action: 'reschedule', reschedType, newDate, newTimeSlot },
        accessToken
      );
      if (res.ok) {
        showToast.success('Reschedule requested.');
        if (onSuccess) onSuccess();
      } else {
        showToast.error(res.error || 'Failed to reschedule.');
      }
    } catch (error) {
      showToast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectorEvaluate = async (action: 'approve' | 'decline') => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await appointmentApi.directorEvaluateAssessmentAppointment(
        appointment.id,
        { action },
        accessToken
      );
      if (res.ok) {
        showToast.success(`Appointment ${action}d successfully.`);
        if (onSuccess) onSuccess();
      } else {
        showToast.error(res.error || `Failed to ${action}.`);
      }
    } catch (error) {
      showToast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };
  if (!appointment) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-950/20 overflow-hidden h-auto max-h-[90dvh] flex flex-col"
          >
            {/* Header - Sticky */}
            <div className={`relative h-32 ${theme.bg900} overflow-hidden shrink-0`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.grad}`}></div>
              <div className={`absolute -right-20 -top-20 w-64 h-64 ${theme.blur1} rounded-full blur-3xl`}></div>
              <div className={`absolute -left-10 -bottom-10 w-40 h-40 ${theme.blur2} rounded-full blur-2xl`}></div>

              <div className="relative z-10 px-6 sm:px-8 h-full flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 ${theme.iconText}`}>
                    <ClipboardCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Assessment Session</h2>
                    <p className={`${theme.subText} text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-1`}>ID: {appointment.studentId}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 sm:p-3 bg-rose-500/40 hover:bg-rose-500 rounded-2xl text-rose-400 hover:text-white transition-all border border-rose-500/20"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar flex-1">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Requestor Details</h3>
                  <div className="bg-slate-50 rounded-[2rem] p-4 sm:p-5 space-y-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Full Name</p>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{appointment.student}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                        <BookOpen size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Level / Dept</p>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{appointment.level} {appointment.course || appointment.department || ''}</p>
                      </div>
                    </div>
                    {appointment.evaluatedBy && (
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                        <div className={`w-8 h-8 ${theme.badgeBg} rounded-xl flex items-center justify-center ${theme.badgeText} shadow-sm border ${theme.badgeBorder}`}>
                          <ClipboardCheck size={14} />
                        </div>
                        <div>
                          <p className={`text-[9px] font-black uppercase ${theme.badgeLabel} tracking-widest`}>Processing Staff</p>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{appointment.evaluatedBy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Schedule Info</h3>
                  <div className="bg-slate-50 rounded-[2rem] p-4 sm:p-5 space-y-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Date</p>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{appointment.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Time Slot</p>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{appointment.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Specific Info */}
              <div className={`${theme.boxBg} rounded-[2rem] p-5 sm:p-6 border ${theme.boxBorder}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 bg-white rounded-xl flex items-center justify-center ${theme.iconText} shadow-sm`}>
                    <FileText size={14} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme.boxTitle}`}>Assigned Test</span>
                </div>
                <div className={`px-2 font-bold ${theme.boxText}`}>{appointment.test}</div>
              </div>

              {/* Action Buttons */}
              {!reschedMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                    {role === 'director' ? (
                      <>
                        <button
                          onClick={() => handleDirectorEvaluate('approve')}
                          disabled={loading}
                          className={`group flex sm:flex-col items-center gap-3 p-4 sm:p-6 ${theme.btnBg} ${theme.btnHoverBg} rounded-[1.5rem] sm:rounded-[2rem] border ${theme.btnBorder} ${theme.btnHoverBorder} transition-all shadow-sm ${theme.btnHoverShadow} disabled:opacity-50`}
                        >
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-white ${theme.btnIconHoverBg} rounded-2xl flex items-center justify-center ${theme.badgeText} group-hover:text-white transition-all shadow-sm shrink-0`}>
                            <CheckCircle2 size={24} />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${theme.btnText} group-hover:text-white`}>Accept</span>
                        </button>

                        <button
                          onClick={() => handleDirectorEvaluate('decline')}
                          disabled={loading}
                          className="group flex sm:flex-col items-center gap-3 p-4 sm:p-6 bg-rose-50 hover:bg-rose-500 rounded-[1.5rem] sm:rounded-[2rem] border border-rose-100 hover:border-rose-500 transition-all shadow-sm hover:shadow-rose-200 disabled:opacity-50"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white group-hover:bg-rose-400 rounded-2xl flex items-center justify-center text-rose-600 group-hover:text-white transition-all shadow-sm shrink-0">
                            <X size={24} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 group-hover:text-white">Decline</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleEvaluate}
                          disabled={loading}
                          className={`group flex sm:flex-col items-center gap-3 p-4 sm:p-6 ${theme.btnBg} ${theme.btnHoverBg} rounded-[1.5rem] sm:rounded-[2rem] border ${theme.btnBorder} ${theme.btnHoverBorder} transition-all shadow-sm ${theme.btnHoverShadow} disabled:opacity-50`}
                        >
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-white ${theme.btnIconHoverBg} rounded-2xl flex items-center justify-center ${theme.badgeText} group-hover:text-white transition-all shadow-sm shrink-0`}>
                            <CheckCircle2 size={24} />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${theme.btnText} group-hover:text-white`}>Evaluate</span>
                        </button>

                        <button
                          onClick={() => setReschedMode(true)}
                          disabled={loading}
                          className="group flex sm:flex-col items-center gap-3 p-4 sm:p-6 bg-amber-50 hover:bg-amber-500 rounded-[1.5rem] sm:rounded-[2rem] border border-amber-100 hover:border-amber-500 transition-all shadow-sm hover:shadow-amber-200 disabled:opacity-50"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white group-hover:bg-amber-400 rounded-2xl flex items-center justify-center text-amber-600 group-hover:text-white transition-all shadow-sm shrink-0">
                            <CalendarClock size={24} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 group-hover:text-white">Reschedule</span>
                        </button>
                      </>
                    )}
                  </div>
                  {role !== 'director' && (
                    <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDirectorOnline ? 'bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900">Forward to Director</p>
                        <p className="text-[10px] text-slate-500 font-medium">Require director approval before notifying the student</p>
                        {isDirectorOnline && (
                          <p className={`text-[10px] ${theme.text600} font-bold mt-1`}>Director is currently online. Approval is required.</p>
                        )}
                      </div>
                      <button
                        onClick={() => !isDirectorOnline && setForwardToDirector(!forwardToDirector)}
                        disabled={isDirectorOnline}
                        className={`w-12 h-6 rounded-full transition-colors relative ${effectiveForwardToDirector ? theme.toggleBg : 'bg-slate-300'} ${isDirectorOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${effectiveForwardToDirector ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">Reschedule Options</h3>
                    <button onClick={() => setReschedMode(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Back</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setReschedType('staff_picked')}
                      className={`p-3 rounded-xl border text-left transition-all ${reschedType === 'staff_picked' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      <p className="text-xs font-bold">Staff Picks Time</p>
                    </button>
                    <button
                      onClick={() => setReschedType('user_picked')}
                      className={`p-3 rounded-xl border text-left transition-all ${reschedType === 'user_picked' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      <p className="text-xs font-bold">Student Picks Time</p>
                    </button>
                  </div>

                  {reschedType === 'staff_picked' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">New Date</label>
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">New Time Slot</label>
                        <select
                          value={newTimeSlot}
                          onChange={(e) => setNewTimeSlot(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                          <option value="">Select Time</option>
                          <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                          <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                          <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                          <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                          <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                          <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleReschedule}
                    disabled={loading}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    Confirm Reschedule
                  </button>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <AlertCircle size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  Carefully review the requestor's information before taking an action. Approved requests will automatically notify the student.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default AssessmentEvaluationModal;


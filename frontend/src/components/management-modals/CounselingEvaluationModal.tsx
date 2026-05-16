import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, CalendarClock, AlertCircle,
  User, BookOpen, Clock, Calendar, MessageCircle, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { appointmentApi } from '../../lib/api';
import { showToast } from '../modal-notification/toast';
import { useDirectorPresence } from '../../hooks/useDirectorPresence';

interface CounselingEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  role?: 'staff' | 'director' | 'admin';
}

const CounselingEvaluationModal = ({ isOpen, onClose, appointment, role = 'staff' }: CounselingEvaluationModalProps) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [forwardToDirector, setForwardToDirector] = useState(false);
  const [reschedMode, setReschedMode] = useState<boolean>(false);
  const [reschedType, setReschedType] = useState<'staff_picked' | 'user_picked'>('user_picked');
  const [newDate, setNewDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const { isDirectorOnline } = useDirectorPresence(role);

  // If director is online, force forwarding to director
  const effectiveForwardToDirector = isDirectorOnline ? true : forwardToDirector;

  if (!appointment) return null;

  const handleEvaluate = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await appointmentApi.evaluateCounselingAppointment(
        appointment.id,
        { action: 'evaluate', forwardToDirector: effectiveForwardToDirector },
        accessToken
      );
      if (res.ok) {
        showToast.success('Evaluation completed.');
        onClose();
      } else {
        showToast.error(res.data.error || 'Failed to evaluate appointment.');
      }
    } catch (err) {
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
      const res = await appointmentApi.evaluateCounselingAppointment(
        appointment.id,
        { action: 'reschedule', reschedType, newDate, newTimeSlot },
        accessToken
      );
      if (res.ok) {
        showToast.success('Reschedule requested.');
        onClose();
      } else {
        showToast.error(res.data.error || 'Failed to reschedule.');
      }
    } catch (err) {
      showToast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectorEvaluate = async (action: 'approve' | 'decline') => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await appointmentApi.directorEvaluateCounselingAppointment(
        appointment.id,
        { action },
        accessToken
      );
      if (res.ok) {
        showToast.success(`Appointment ${action}d successfully.`);
        onClose();
      } else {
        showToast.error(res.data.error || 'Action failed.');
      }
    } catch (err) {
      showToast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="relative h-32 bg-teal-900 overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-800/40 to-teal-900"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl"></div>

              <div className="relative z-10 px-6 sm:px-8 h-full flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-blue-500">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Counseling Request</h2>
                    <p className="text-teal-400/80 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-1">ID: {appointment.studentId}</p>
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
                        <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                          <ClipboardCheck size={14} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-teal-400 tracking-widest">Processing Staff</p>
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

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                {role === 'director' ? (
                  <>
                    <button onClick={() => handleDirectorEvaluate('approve')} disabled={loading} className="group flex sm:flex-col items-center gap-3 p-4 sm:p-6 bg-teal-50 hover:bg-teal-600 rounded-[1.5rem] sm:rounded-[2rem] border border-teal-100 hover:border-teal-600 transition-all shadow-sm hover:shadow-teal-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white group-hover:bg-teal-500 rounded-2xl flex items-center justify-center text-teal-600 group-hover:text-white transition-all shadow-sm shrink-0">
                        <CheckCircle2 size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 group-hover:text-white">Accept</span>
                    </button>
                    <button onClick={() => handleDirectorEvaluate('decline')} disabled={loading} className="group flex sm:flex-col items-center gap-3 p-4 sm:p-6 bg-rose-50 hover:bg-rose-500 rounded-[1.5rem] sm:rounded-[2rem] border border-rose-100 hover:border-rose-500 transition-all shadow-sm hover:shadow-rose-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white group-hover:bg-rose-400 rounded-2xl flex items-center justify-center text-rose-600 group-hover:text-white transition-all shadow-sm shrink-0">
                        <X size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 group-hover:text-white">Decline</span>
                    </button>
                  </>
                ) : (
                  <>
                    {!reschedMode ? (
                      <>
                        <div className="flex flex-col gap-2">
                          <button onClick={handleEvaluate} disabled={loading} className="group flex sm:flex-col items-center gap-3 p-4 sm:p-6 bg-teal-50 hover:bg-teal-600 rounded-[1.5rem] sm:rounded-[2rem] border border-teal-100 hover:border-teal-600 transition-all shadow-sm hover:shadow-teal-200">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white group-hover:bg-teal-500 rounded-2xl flex items-center justify-center text-teal-600 group-hover:text-white transition-all shadow-sm shrink-0">
                              <CheckCircle2 size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 group-hover:text-white">Evaluate</span>
                          </button>
                          <label className={`flex items-center gap-2 mt-2 pl-2 ${isDirectorOnline ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input 
                              type="checkbox" 
                              checked={effectiveForwardToDirector} 
                              onChange={(e) => !isDirectorOnline && setForwardToDirector(e.target.checked)} 
                              disabled={isDirectorOnline}
                              className="rounded text-teal-600 disabled:opacity-50" 
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700">Forward to Director</span>
                              {isDirectorOnline && (
                                <span className="text-[10px] text-teal-600 font-bold">Director is currently online. Approval is required.</span>
                              )}
                            </div>
                          </label>
                        </div>
                        <button onClick={() => setReschedMode(true)} disabled={loading} className="group flex sm:flex-col items-center gap-3 p-4 sm:p-6 bg-amber-50 hover:bg-amber-500 rounded-[1.5rem] sm:rounded-[2rem] border border-amber-100 hover:border-amber-500 transition-all shadow-sm hover:shadow-amber-200">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white group-hover:bg-amber-400 rounded-2xl flex items-center justify-center text-amber-600 group-hover:text-white transition-all shadow-sm shrink-0">
                            <CalendarClock size={24} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 group-hover:text-white">Reschedule</span>
                        </button>
                      </>
                    ) : (
                      <div className="col-span-1 sm:col-span-2 bg-amber-50 rounded-[2rem] p-5 border border-amber-100">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-xs font-black uppercase text-amber-700 tracking-widest">Reschedule Options</h4>
                          <button onClick={() => setReschedMode(false)} className="text-amber-500 hover:text-amber-700"><X size={16}/></button>
                        </div>
                        <div className="space-y-4">
                          <select 
                            value={reschedType} 
                            onChange={(e) => setReschedType(e.target.value as 'staff_picked' | 'user_picked')}
                            className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-bold focus:ring-amber-500 outline-none"
                          >
                            <option value="user_picked">Let Student Pick New Time</option>
                            <option value="staff_picked">Staff Picks New Time</option>
                          </select>

                          {reschedType === 'staff_picked' && (
                            <div className="grid grid-cols-2 gap-4">
                              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-bold focus:ring-amber-500 outline-none" />
                              <select value={newTimeSlot} onChange={(e) => setNewTimeSlot(e.target.value)} className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-bold focus:ring-amber-500 outline-none">
                                <option value="">Select Time</option>
                                <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                                <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                                <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                                <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                              </select>
                            </div>
                          )}

                          <button onClick={handleReschedule} disabled={loading} className="w-full p-3 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">
                            Confirm Reschedule
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

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

export default CounselingEvaluationModal;


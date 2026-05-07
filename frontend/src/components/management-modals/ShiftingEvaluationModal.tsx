import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, AlertCircle,
  User, BookOpen, Clock, Calendar, RefreshCw, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { appointmentApi } from '../../lib/api';
import { showToast } from '../modal-notification/toast';

interface ShiftingEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  role?: 'staff' | 'director' | 'admin';
  onSuccess?: () => void;
}

const ShiftingEvaluationModal = ({ isOpen, onClose, appointment, role = 'staff', onSuccess }: ShiftingEvaluationModalProps) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [forwardToDirector, setForwardToDirector] = useState(true);

  if (!appointment) return null;

  const handleEvaluate = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await appointmentApi.evaluateShiftingAppointment(
        appointment.id,
        { action: 'evaluate', forwardToDirector },
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

  const handleDirectorEvaluate = async (action: 'approve' | 'decline') => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await appointmentApi.directorEvaluateShiftingAppointment(
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

  const requiredDocs = [
    { name: "2x2 Picture (with name tag)", value: appointment?.documents?.picture || 'Not uploaded', status: appointment?.documents?.picture ? "Uploaded" : "Missing" },
    { name: "All Downloadable Grades", value: appointment?.documents?.grades || 'Not uploaded', status: appointment?.documents?.grades ? "Uploaded" : "Missing" },
    { name: "Latest COR", value: appointment?.documents?.latestCor || 'Not uploaded', status: appointment?.documents?.latestCor ? "Uploaded" : "Missing" },
    { name: "College Entrance Test Result", value: appointment?.documents?.entranceResult || 'Not uploaded', status: appointment?.documents?.entranceResult ? "Uploaded" : "Missing" }
  ];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70"
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
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-rose-500">
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Shifting Application</h2>
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

              {/* Shifting Details Card */}
              <div className="bg-rose-50 rounded-[2rem] p-5 sm:p-6 border border-rose-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                    <RefreshCw size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Transition Info</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 px-2">
                  <div>
                    <p className="text-[9px] font-black uppercase text-rose-400 mb-1">Current Course</p>
                    <p className="font-bold text-rose-900">{appointment.currentCourse}</p>
                  </div>
                  <div className="hidden sm:block h-8 w-px bg-rose-200"></div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-rose-400 mb-1">Target Course</p>
                    <p className="font-bold text-rose-900">{appointment.targetCourse}</p>
                  </div>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="space-y-4">
                <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Required Documents Check</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {requiredDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 ${doc.status === 'Uploaded' ? 'bg-teal-500' : 'bg-rose-400'}`}>
                          {doc.status === 'Uploaded' ? <CheckCircle2 size={12} /> : <X size={12} />}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-[11px] font-bold text-slate-600 truncate">{doc.name}</span>
                          <span className="text-[10px] font-medium text-slate-400 truncate mt-0.5" title={doc.value}>{doc.value}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 ${doc.status === 'Uploaded' ? 'text-teal-600 bg-teal-50 border-teal-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {role === 'director' ? (
                    <>
                      <button
                        onClick={() => handleDirectorEvaluate('approve')}
                        disabled={loading}
                        className="group flex sm:flex-col items-center gap-3 p-4 sm:p-6 bg-teal-50 hover:bg-teal-600 rounded-[1.5rem] sm:rounded-[2rem] border border-teal-100 hover:border-teal-600 transition-all shadow-sm hover:shadow-teal-200 disabled:opacity-50"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white group-hover:bg-teal-500 rounded-2xl flex items-center justify-center text-teal-600 group-hover:text-white transition-all shadow-sm shrink-0">
                          <CheckCircle2 size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 group-hover:text-white">Accept</span>
                      </button>

                      <button
                        onClick={() => handleDirectorEvaluate('decline')}
                        disabled={loading}
                        className="group flex sm:flex-col items-center gap-3 p-4 sm:p-6 bg-rose-50 hover:bg-rose-600 rounded-[1.5rem] sm:rounded-[2rem] border border-rose-100 hover:border-rose-600 transition-all shadow-sm hover:shadow-rose-200 disabled:opacity-50"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white group-hover:bg-rose-500 rounded-2xl flex items-center justify-center text-rose-600 group-hover:text-white transition-all shadow-sm shrink-0">
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
                        className="group flex sm:flex-col items-center gap-3 p-4 sm:p-6 bg-teal-50 hover:bg-teal-600 rounded-[1.5rem] sm:rounded-[2rem] border border-teal-100 hover:border-teal-600 transition-all shadow-sm hover:shadow-teal-200 disabled:opacity-50"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white group-hover:bg-teal-500 rounded-2xl flex items-center justify-center text-teal-600 group-hover:text-white transition-all shadow-sm shrink-0">
                          <CheckCircle2 size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 group-hover:text-white">Evaluate</span>
                      </button>

                      <div className="flex flex-col justify-center items-center gap-3 p-4 sm:p-6 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100">
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-900">Forward to Director</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">Require final approval</p>
                        </div>
                        <button
                          onClick={() => setForwardToDirector(!forwardToDirector)}
                          disabled={loading}
                          className={`w-14 h-7 rounded-full transition-colors relative mt-2 ${forwardToDirector ? 'bg-teal-500' : 'bg-slate-300'} disabled:opacity-50`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${forwardToDirector ? 'left-8' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
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

export default ShiftingEvaluationModal;


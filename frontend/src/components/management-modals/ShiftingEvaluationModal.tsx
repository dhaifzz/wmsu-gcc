import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, AlertCircle,
  User, BookOpen, Clock, Calendar, RefreshCw, ClipboardCheck, FileText,
  Eye, Download
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { appointmentApi } from '../../lib/api';
import { showToast } from '../modal-notification/toast';
import { useDirectorPresence } from '../../hooks/useDirectorPresence';

interface ShiftingEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  role?: 'staff' | 'director' | 'admin';
  onSuccess?: () => void;
}

const PreviewModal = ({ isOpen, onClose, url, title }: { isOpen: boolean; onClose: () => void; url: string; title: string }) => {
  if (!isOpen) return null;

  const isPDF = url.toLowerCase().includes('.pdf');

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white shrink-0">
            <div>
              <h3 className="text-xl font-black text-slate-900">{title}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Document Preview</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-slate-100 hover:bg-rose-500 rounded-2xl text-slate-400 hover:text-white transition-all group"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 bg-slate-50 overflow-hidden relative">
            {isPDF ? (
              <iframe
                src={`${url}#toolbar=0`}
                className="w-full h-full border-none"
                title={title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={url}
                  alt={title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600?text=Failed+to+load+image';
                  }}
                />
              </div>
            )}
          </div>
          <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-end shrink-0">
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
            >
              <Download size={14} /> Download Original
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const ShiftingEvaluationModal = ({ isOpen, onClose, appointment, role = 'staff', onSuccess }: ShiftingEvaluationModalProps) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [forwardToDirector, setForwardToDirector] = useState(false);
  const [previewData, setPreviewData] = useState<{ url: string; title: string } | null>(null);
  const { isDirectorOnline } = useDirectorPresence(role);

  const isEmerald = role === 'staff' || role === 'director';
  const theme = {
    bg900: isEmerald ? 'bg-emerald-900' : 'bg-teal-900',
    grad: isEmerald ? 'from-emerald-800/40 to-emerald-900' : 'from-teal-800/40 to-teal-900',
    blur1: isEmerald ? 'bg-emerald-400/10' : 'bg-teal-400/10',
    blur2: isEmerald ? 'bg-emerald-500/10' : 'bg-teal-500/10',
    iconText: isEmerald ? 'text-emerald-500' : 'text-teal-500', // originally rose-500
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
    text600: isEmerald ? 'text-emerald-600' : 'text-teal-600',
    border200: isEmerald ? 'hover:border-emerald-200' : 'hover:border-teal-200',
    btnHoverBgAlt: isEmerald ? 'hover:bg-emerald-500' : 'hover:bg-teal-500',
    btnHoverBorderAlt: isEmerald ? 'hover:border-emerald-500' : 'hover:border-teal-500',
  };

  // If director is online, force forwarding to director
  const effectiveForwardToDirector = isDirectorOnline ? true : forwardToDirector;

  if (!appointment) return null;

  const getDocUrlAsync = async (path: string) => {
    if (!path || !accessToken) return '';
    try {
      const res = await appointmentApi.getShiftingDocumentSignedUrl(path, accessToken);
      if (res.ok && res.data?.signedUrl) {
        return res.data.signedUrl;
      }
    } catch (e) {
      console.error('Failed to get signed URL:', e);
    }
    return '';
  };

  const handlePreview = async (path: string, label: string) => {
    const url = await getDocUrlAsync(path);
    if (url) {
      setPreviewData({ url, title: label });
    } else {
      showToast.error('Failed to load document preview.');
    }
  };

  const handleDownload = async (path: string, label: string) => {
    const url = await getDocUrlAsync(path);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${appointment.student}_${label.replace(/\s+/g, '_')}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      showToast.error('Failed to download document.');
    }
  };

  const handleEvaluate = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await appointmentApi.evaluateShiftingAppointment(
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
    { label: "2x2 Picture", name: "2x2 Picture (with name tag)", value: appointment?.documents?.picture || '', status: appointment?.documents?.picture ? "Uploaded" : "Missing" },
    { label: "Grades", name: "All Downloadable Grades", value: appointment?.documents?.grades || '', status: appointment?.documents?.grades ? "Uploaded" : "Missing" },
    { label: "Latest COR", name: "Latest COR", value: appointment?.documents?.latestCor || '', status: appointment?.documents?.latestCor ? "Uploaded" : "Missing" },
    { label: "Entrance Result", name: "College Entrance Test Result", value: appointment?.documents?.entranceResult || '', status: appointment?.documents?.entranceResult ? "Uploaded" : "Missing" }
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
            <div className={`relative h-32 ${theme.bg900} overflow-hidden shrink-0`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.grad}`}></div>
              <div className={`absolute -right-20 -top-20 w-64 h-64 ${theme.blur1} rounded-full blur-3xl`}></div>
              <div className={`absolute -left-10 -bottom-10 w-40 h-40 ${theme.blur2} rounded-full blur-2xl`}></div>

              <div className="relative z-10 px-6 sm:px-8 h-full flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 ${theme.iconText}`}>
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Shifting Application</h2>
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

              {/* Shifting Details Card */}
              <div className="bg-rose-50 rounded-[2rem] p-5 sm:p-6 border border-rose-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                    <RefreshCw size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Transition Info</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 px-2">
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
                {appointment.reason && (
                  <div className="mt-6 pt-4 border-t border-rose-200/50">
                    <p className="text-[9px] font-black uppercase text-rose-400 mb-1">Reason for Shifting</p>
                    <p className="text-xs font-bold text-rose-900 leading-relaxed italic">"{appointment.reason}"</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Required Documents Check</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {requiredDocs.map((doc, idx) => (
                    <div key={idx} className={`group relative flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 ${theme.border200} transition-all duration-300`}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors ${doc.status === 'Uploaded' ? `${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}` : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          <FileText size={18} />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-[11px] font-bold text-slate-600 truncate">{doc.label}</span>
                          <span className="text-[10px] font-medium text-slate-400 truncate mt-0.5" title={doc.value || 'Not uploaded'}>
                            {doc.value || 'Missing file'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {doc.status === 'Uploaded' && (
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handlePreview(doc.value, doc.label)}
                              className={`p-2 bg-white ${theme.btnHoverBgAlt} text-slate-400 hover:text-white rounded-lg border border-slate-200 ${theme.btnHoverBorderAlt} transition-all shadow-sm`}
                              title="Preview"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleDownload(doc.value, doc.label)}
                              className="p-2 bg-white hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-200 hover:border-slate-900 transition-all shadow-sm"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        )}
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border transition-colors ${doc.status === 'Uploaded' ? `${theme.badgeText} ${theme.badgeBg} ${theme.badgeBorder}` : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                          {doc.status}
                        </span>
                      </div>
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
                        className={`group flex sm:flex-col items-center gap-3 p-4 sm:p-6 ${theme.btnBg} ${theme.btnHoverBg} rounded-[1.5rem] sm:rounded-[2rem] border ${theme.btnBorder} ${theme.btnHoverBorder} transition-all shadow-sm ${theme.btnHoverShadow} disabled:opacity-50`}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-white ${theme.btnIconHoverBg} rounded-2xl flex items-center justify-center ${theme.badgeText} group-hover:text-white transition-all shadow-sm shrink-0`}>
                          <CheckCircle2 size={24} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme.btnText} group-hover:text-white`}>Evaluate</span>
                      </button>

                      <div className={`flex flex-col justify-center items-center gap-3 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border ${isDirectorOnline ? 'bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-900">Forward to Director</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">Require final approval</p>
                          {isDirectorOnline && (
                            <p className={`text-[10px] ${theme.text600} font-bold mt-1`}>Director is currently online. Approval is required.</p>
                          )}
                        </div>
                        <button
                          onClick={() => !isDirectorOnline && setForwardToDirector(!forwardToDirector)}
                          disabled={loading || isDirectorOnline}
                          className={`w-14 h-7 rounded-full transition-colors relative mt-2 ${effectiveForwardToDirector ? theme.toggleBg : 'bg-slate-300'} disabled:opacity-50 ${isDirectorOnline ? 'cursor-not-allowed' : ''}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${effectiveForwardToDirector ? 'left-8' : 'left-1'}`}></div>
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
          <PreviewModal
            isOpen={!!previewData}
            onClose={() => setPreviewData(null)}
            url={previewData?.url || ''}
            title={previewData?.title || ''}
          />
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ShiftingEvaluationModal;


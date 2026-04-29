import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Upload,
  User,
  Mail,
  Phone,
  BookOpen,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import MarqueeText from '../../components/MarqueeText';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../components/modal-notification/toast';
import { appointmentApi } from '../../lib/api';

type DocumentIconName = 'ImageIcon' | 'FileText' | 'ClipboardCheck' | 'Clock' | 'User' | 'AlertCircle';

const ICON_MAP: Record<DocumentIconName, React.ComponentType<{ size?: number; className?: string }>> = {
  ImageIcon: ImageIcon,
  FileText: FileText,
  ClipboardCheck: ClipboardCheck,
  Clock: Clock,
  User: User,
  AlertCircle: AlertCircle
};

interface DashboardUser {
  name: string;
  email?: string;
  studentId?: string;
  college?: string;
  course?: string;
}

interface ShiftingProps {
  onBack: () => void;
  user: DashboardUser;
}

const timeSlots = ['08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM'];

const toDateKey = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const toTitleCase = (value?: string | null) =>
  (value || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const Shifting = ({ onBack, user }: ShiftingProps) => {
  const { user: authUser, accessToken } = useAuth();
  const [formData, setFormData] = useState({
    targetCourse: '',
    reason: ''
  });
  const [examDate, setExamDate] = useState(toDateKey(new Date()));
  const [examTimeSlot, setExamTimeSlot] = useState('');
  const [docStep, setDocStep] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState<{ submittedAt: string; scheduledAt: string } | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File | null>>({
    bookingReceipt: null,
    picture: null,
    grades: null,
    latestCor: null,
    entranceResult: null
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
  }, []);

  const header = { title: "Shifting Examination", subtitle: "Helping you find the right academic path for your future career." };
  const profileInfo = { title: "Student Information", subtitle: "Profile details are pre-filled to reduce repeat typing." };
  const academic = { title: "Academic Guidelines", subtitle: "Complete your shifting details and upload all required files." };
  const courses = [
    "BS Computer Science", "BS Information Technology", "BS Nursing", "BS Psychology",
    "BS Civil Engineering", "BS Mechanical Engineering", "BS Education", "BS Criminology",
    "BS Accountancy", "BS Business Administration", "BS Biology", "BS Social Work"
  ];
  const documents = [
    { key: "bookingReceipt", label: "Booking Receipt", note: "Digital or printed copy of your appointment confirmation.", iconName: "ClipboardCheck", accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "picture", label: "2x2 Picture", note: "Formal 2x2 colored picture with name tag (Selfies are not allowed).", iconName: "ImageIcon", accept: ".jpg,.jpeg,.png" },
    { key: "grades", label: "Downloadable Grades", note: "A complete copy of all your previous semester's grades.", iconName: "FileText", accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "latestCor", label: "Latest COR", note: "Your most recent Certificate of Registration (COR).", iconName: "FileText", accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "entranceResult", label: "Entrance Test Result", note: "Original or certified copy of your college entrance test result.", iconName: "ClipboardCheck", accept: ".pdf,.jpg,.jpeg,.png" }
  ];
  const profileData = useMemo(() => {
    const firstName = toTitleCase(authUser?.firstName);
    const lastName = toTitleCase(authUser?.lastName);
    const middleInitial = authUser?.middleName?.trim() ? `${authUser.middleName.trim().charAt(0).toUpperCase()}.` : '';
    const fullName = [firstName, middleInitial, lastName].filter(Boolean).join(' ');

    return {
      fullName: fullName || user.name || '',
      studentId: authUser?.schoolId?.toString() || user.studentId || authUser?.id?.slice(0, 8).toUpperCase() || '',
      email: authUser?.email || user.email || '',
      contactNumber: authUser?.contactNumber || '',
      currentCollege: authUser?.collegeName || authUser?.department || user.college || 'Not specified in profile',
      currentCourse: authUser?.courseName || (user.course && user.course !== 'N/A' ? user.course : '') || 'Not specified in profile'
    };
  }, [authUser, user]);

  const instructions = `Make sure you have met the minimum GPA requirements of your target college before applying. You are currently enrolled in ${profileData.currentCourse || 'your current program'}.`;

  useEffect(() => {
    const loadSubmissionStatus = async () => {
      const result = await appointmentApi.getShiftingSubmissionStatus();
      if (result.ok) {
        setIsSubmissionOpen(!!result.data.isOpen);
      }
    };
    void loadSubmissionStatus();
  }, []);

  useEffect(() => {
    const loadLatest = async () => {
      if (!accessToken) return;
      const result = await appointmentApi.getLatestShiftingAppointment(accessToken);
      if (result.ok && result.data.appointment) {
        setSubmittedInfo({
          submittedAt: result.data.appointment.created_at,
          scheduledAt: result.data.appointment.scheduled_time
        });
      }
    };
    void loadLatest();
  }, [accessToken]);

  const uploadedCount = useMemo(
    () => Object.values(uploadedDocs).filter(Boolean).length,
    [uploadedDocs]
  );

  const allDocsUploaded = uploadedCount === documents.length;
  const canSubmit = isSubmissionOpen && !!formData.targetCourse.trim() && !!formData.reason.trim() && !!examDate && !!examTimeSlot && allDocsUploaded && !isSubmitting;

  const handleFileUpload = (key: string, file: File | null) => {
    setUploadedDocs((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      showToast.warning(
        isSubmissionOpen
          ? 'Please complete all required fields and upload all documents.'
          : 'Shifting submission is currently closed.'
      );
      return;
    }
    if (!accessToken) {
      showToast.error('Please sign in again before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await appointmentApi.createShiftingAppointment({
        date: examDate,
        timeSlot: examTimeSlot,
        currentCourse: profileData.currentCourse,
        targetCourse: formData.targetCourse,
        reason: formData.reason,
        bookingReceiptName: uploadedDocs.bookingReceipt?.name || '',
        pictureName: uploadedDocs.picture?.name || '',
        gradesName: uploadedDocs.grades?.name || '',
        latestCorName: uploadedDocs.latestCor?.name || '',
        entranceResultName: uploadedDocs.entranceResult?.name || ''
      }, accessToken);

      if (!result.ok) {
        showToast.error((result.data as { error?: string })?.error || 'Failed to submit shifting application.');
        return;
      }

      setSubmittedInfo({
        submittedAt: result.data.appointment.created_at,
        scheduledAt: result.data.appointment.scheduled_time
      });
      showToast.success('Shifting application submitted. Staff will review your requirements.');
      setFormData((prev) => ({ ...prev, targetCourse: '', reason: '' }));
      setUploadedDocs({
        bookingReceipt: null,
        picture: null,
        grades: null,
        latestCor: null,
        entranceResult: null
      });
      setExamTimeSlot('');
      setDocStep(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">{header.title}</h2>
          <p className="text-slate-500 font-medium text-sm">{header.subtitle}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Card */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-lg p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{profileInfo.title}</h3>
                <p className="text-slate-400 text-sm font-medium">{profileInfo.subtitle}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Name</label>
                <input value={profileData.fullName} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-lg px-6 py-4 text-sm font-bold text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Student ID</label>
                <input value={profileData.studentId} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-lg px-6 py-4 text-sm font-bold text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Email Address</label>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-6 py-4 text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Mail size={15} className="text-slate-400" />
                  <span>{profileData.email || 'Not available'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Contact Number</label>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-6 py-4 text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Phone size={15} className="text-slate-400" />
                  <span>{profileData.contactNumber || 'Not available'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Current Course</label>
                <input value={profileData.currentCourse} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-lg px-6 py-4 text-sm font-bold text-slate-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{academic.title}</h3>
                <p className="text-slate-400 text-sm font-medium">{academic.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 relative">
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Current Course</label>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-6 py-4 font-bold text-slate-400 flex items-center gap-3 overflow-hidden">
                  <GraduationCap size={18} className="shrink-0" />
                  <MarqueeText
                    text={profileData.currentCourse}
                    className="text-sm font-bold"
                    containerClassName="flex-1"
                  />
                </div>
              </div>

              <div className="hidden md:flex mt-4 w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                <ArrowRight size={20} />
              </div>

              <div className="flex-1 w-full space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 ml-4">Course to Shift</label>
                <div className="relative">
                  <button
                    disabled={!isSubmissionOpen}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-white border-2 border-emerald-100 rounded-lg px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex-1 overflow-hidden">
                      {formData.targetCourse ? (
                        <MarqueeText 
                          text={formData.targetCourse} 
                          className="text-sm font-bold text-slate-900"
                          containerClassName="w-full"
                        />
                      ) : (
                        <span className="text-slate-300 text-sm font-bold">Select target course</span>
                      )}
                    </div>
                    <ChevronDown size={20} className={`text-emerald-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-lg shadow-2xl shadow-emerald-900/10 overflow-hidden max-h-[250px] overflow-y-auto scrollbar-hide"
                      >
                        {courses.filter(c => c !== profileData.currentCourse).map(course => (
                          <button
                            key={course}
                            onClick={() => {
                              setFormData({ ...formData, targetCourse: course });
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0
                              ${formData.targetCourse === course 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-600'
                              }
                            `}
                          >
                            {course}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reason to Shift</label>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Numbers or sentences allowed</span>
              </div>
              <textarea 
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                disabled={!isSubmissionOpen}
                placeholder="Type your reason for shifting here..."
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300 resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <Upload size={24} />
              </div>
              <div className="flex-1 flex justify-between items-center w-full">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Required Documents</h3>
                  <p className="text-slate-400 text-sm font-medium">Upload high-quality scans of your documents.</p>
                </div>
                <div className="hidden sm:block text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg">
                  Step {docStep + 1} of {documents.length}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={docStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex justify-center w-full"
                >
                    <div className="aspect-square w-[280px] p-8 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group flex flex-col items-center justify-center text-center shadow-sm shrink-0">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shadow-sm mb-6 shrink-0">
                        {(() => {
                          const Icon = ICON_MAP[documents[docStep].iconName] || FileText;
                          return <Icon size={28} />;
                        })()}
                      </div>
                      <div className="mb-6">
                        <p className="text-sm font-black text-slate-900 mb-1 leading-tight">{documents[docStep].label}*</p>
                        <p className="text-[10px] text-slate-400 font-medium">{documents[docStep].note}</p>
                      </div>
                      <label className="w-full">
                        <input
                          type="file"
                          accept={documents[docStep].accept}
                          className="hidden"
                          disabled={!isSubmissionOpen}
                          onChange={(e) => handleFileUpload(documents[docStep].key, e.target.files?.[0] || null)}
                        />
                        <span className={`w-full py-3.5 mt-auto rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm border cursor-pointer ${
                          uploadedDocs[documents[docStep].key]
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                        }`}>
                          {uploadedDocs[documents[docStep].key] ? <CheckCircle2 size={14} /> : <Upload size={14} />}
                          {uploadedDocs[documents[docStep].key] ? 'Uploaded' : 'Upload'}
                        </span>
                      </label>
                      {uploadedDocs[documents[docStep].key] && (
                        <p className="mt-2 text-[10px] font-bold text-emerald-700 truncate w-full">
                          {uploadedDocs[documents[docStep].key]?.name}
                        </p>
                      )}
                    </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setDocStep(Math.max(0, docStep - 1))}
                disabled={docStep === 0}
                className="px-6 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-500"
              >
                Previous
              </button>
              <button
                onClick={() => setDocStep(Math.min(documents.length - 1, docStep + 1))}
                disabled={docStep === documents.length - 1}
                className="px-6 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <CalendarIcon size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Exam Schedule</h3>
                <p className="text-slate-400 text-sm font-medium">Set your preferred schedule for the shifting exam.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  min={toDateKey(new Date())}
                  disabled={!isSubmissionOpen}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-lg px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Exam Time Slot</label>
                <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setExamTimeSlot(slot)}
                      type="button"
                      disabled={!isSubmissionOpen}
                      className={`py-3 px-4 rounded-lg border font-bold text-xs text-left transition-all ${
                        examTimeSlot === slot
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Progress & Tips */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-slate-900 rounded-lg p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <h3 className="font-black text-xl mb-8 relative z-10">Application Status</h3>
            
            <div className="space-y-6 relative z-10 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm">Identity Verified</p>
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Automatic</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 ${allDocsUploaded ? '' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${allDocsUploaded ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  {allDocsUploaded ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div>
                  <p className={`font-bold text-sm ${allDocsUploaded ? '' : 'text-white/50'}`}>Documents</p>
                  <p className={`text-[10px] font-medium uppercase tracking-widest ${allDocsUploaded ? 'text-emerald-300' : 'text-white/20'}`}>
                    {uploadedCount}/{documents.length} Uploaded
                  </p>
                </div>
              </div>
              <div className={`flex items-start gap-4 ${examDate && examTimeSlot ? '' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${examDate && examTimeSlot ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  {examDate && examTimeSlot ? <CheckCircle2 size={16} /> : <CalendarIcon size={14} />}
                </div>
                <div>
                  <p className={`font-bold text-sm ${examDate && examTimeSlot ? '' : 'text-white/50'}`}>Exam Schedule</p>
                  <p className={`text-[10px] font-medium uppercase tracking-widest ${examDate && examTimeSlot ? 'text-emerald-300' : 'text-white/20'}`}>
                    {examDate && examTimeSlot ? 'Selected' : 'Not Set'}
                  </p>
                </div>
              </div>
              <div className={`flex items-start gap-4 ${isSubmissionOpen ? '' : 'opacity-70'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSubmissionOpen ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  {isSubmissionOpen ? <CheckCircle2 size={16} /> : <AlertCircle size={14} />}
                </div>
                <div>
                  <p className="font-bold text-sm">Submission Window</p>
                  <p className={`text-[10px] font-medium uppercase tracking-widest ${isSubmissionOpen ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {isSubmissionOpen ? 'Open' : 'Closed'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-5 rounded-lg font-black text-sm transition-all shadow-xl shadow-emerald-950/40 ${
                canSubmit
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>

          <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm">
            <h4 className="font-black text-sm text-slate-900 mb-5">Latest Application</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black uppercase tracking-widest text-slate-400">Date Submitted</span>
                <span className="font-bold text-slate-700">
                  {submittedInfo?.submittedAt ? new Date(submittedInfo.submittedAt).toLocaleString() : 'No submission yet'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-black uppercase tracking-widest text-slate-400">Exam Schedule</span>
                <span className="font-bold text-slate-700">
                  {submittedInfo?.scheduledAt ? new Date(submittedInfo.scheduledAt).toLocaleString() : `${examDate || '---'} ${examTimeSlot || ''}`.trim() || 'Not selected'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-4 text-emerald-700">
              <AlertCircle size={18} />
              <h4 className="font-black text-xs uppercase tracking-widest">Instructions</h4>
            </div>
            <p className="text-xs text-emerald-700/70 leading-relaxed font-medium">
              {instructions.split(profileData.currentCourse).map((part: string, i: number, arr: string[]) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <strong>{profileData.currentCourse}</strong>}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Shifting;

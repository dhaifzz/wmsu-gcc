import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { showAlert } from '../../../../components/modal-notification/sweetalert';
import toast from 'react-hot-toast';

import { useAuth } from '../../../../auth/AuthContext';
import { appointmentApi, cmsApi } from '../../../../lib/api';

// ── Office schedule types ────────────────────────────────────────────────────────
type OfficeStatus = 'open' | 'morning_only' | 'afternoon_only' | 'closed' | 'holiday';

interface OfficeConfig {
  status: OfficeStatus;
  note?: string;
  startTime?: string;
  endTime?: string;
}

const toDateKey = (year: number, monthIndex: number, day: number) => {
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const morningSlots = [
  '08:00 AM – 09:00 AM', '09:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
];
const afternoonSlots = [
  '01:00 PM – 02:00 PM', '02:00 PM – 03:00 PM',
  '03:00 PM – 04:00 PM', '04:00 PM – 05:00 PM',
];
const allTimeSlots = [...morningSlots, ...afternoonSlots];

export const BookingPanel = ({ onBack }: { onBack: () => void }) => {
  const { accessToken } = useAuth();
  const [step, setStep] = useState<'type' | 'calendar' | 'shifting'>('type');
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // ── Office schedule state ──────────────────────────────────────────────────
  const [officeSchedule, setOfficeSchedule] = useState<{ [key: string]: OfficeConfig }>({});
  const [maxAvailableDate, setMaxAvailableDate] = useState<string | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // ── Admin shifting form state ──────────────────────────────────────────────
  const [shiftingForm, setShiftingForm] = useState({
    studentName: '',
    studentId: '',
    email: '',
    contactNumber: '',
    currentCourse: '',
    targetCourse: '',
    reason: '',
  });
  const [shiftingDocs, setShiftingDocs] = useState<Record<string, File | null>>({
    picture: null,
    grades: null,
    latestCor: null,
    entranceResult: null,
  });
  const [isSubmittingShifting, setIsSubmittingShifting] = useState(false);
  const [courses, setCourses] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoadingSchedule(true);
        const res = await cmsApi.getContent('office-schedule');
        if (res.ok && res.data) {
          if (res.data.maxAvailableDate) setMaxAvailableDate(res.data.maxAvailableDate);
          if (res.data.officeSchedule) setOfficeSchedule(res.data.officeSchedule);
        }
      } catch (err) {
        console.error('Failed to fetch office schedule:', err);
      } finally {
        setLoadingSchedule(false);
      }
    };
    fetchSchedule();
  }, []);

  // Fetch available courses for the target course dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await cmsApi.getAcademicData();
        if (result.ok && result.data) {
          const payload = result.data as any;
          const source = payload?.data || payload?.content || payload?.system || payload;
          const rawColleges = Array.isArray(source?.colleges) ? source.colleges : [];
          const allCourses: string[] = [];
          rawColleges.forEach((col: any) => {
            if (col && Array.isArray(col.courses)) {
              col.courses.forEach((c: any) => {
                const name = typeof c?.name === 'string' ? c.name : typeof c?.course_name === 'string' ? c.course_name : '';
                if (name.trim()) allCourses.push(name.trim());
              });
            }
          });
          setCourses(Array.from(new Set(allCourses)).sort());
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const services = [
    { id: 'counseling', label: 'Counseling', icon: MessageCircle, color: 'bg-blue-500' },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck, color: 'bg-teal-500' },
    { id: 'shifting', label: 'Shifting Exam', icon: RefreshCw, color: 'bg-rose-500' },
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // ── Date availability logic (mirrors Counseling.tsx / Assessment.tsx) ──────
  const isDisabledDay = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = toDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);

    // Weekend check
    if (dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6) return true;
    // Past date check
    if (dateToCheck < today) return true;
    // Global deadline check
    if (maxAvailableDate && dateKey > maxAvailableDate) return true;
    // Office schedule status check
    const config = officeSchedule[dateKey];
    if (config?.status === 'closed' || config?.status === 'holiday') return true;

    return false;
  };

  const getDateStatus = (day: number): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = toDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    const config = officeSchedule[dateKey];

    if (dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6) return 'Weekend';
    if (dateToCheck < today) return 'Past';
    if (maxAvailableDate && dateKey > maxAvailableDate) return 'Deadline';
    if (config?.status === 'closed') return 'Closed';
    if (config?.status === 'holiday') return 'Holiday';
    if (config?.status === 'morning_only') return 'AM Only';
    if (config?.status === 'afternoon_only') return 'PM Only';
    return null;
  };

  // ── Visible time slots based on selected day's office status ───────────────
  const getVisibleTimeSlots = () => {
    if (!selectedDay) return allTimeSlots;
    const dateKey = toDateKey(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    const config = officeSchedule[dateKey];
    const status = config?.status || 'open';
    if (status === 'morning_only') return morningSlots;
    if (status === 'afternoon_only') return afternoonSlots;
    return allTimeSlots;
  };

  const changeMonth = (offset: number) => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    const today = new Date();
    if (next.getMonth() < today.getMonth() && next.getFullYear() <= today.getFullYear()) return;
    setCurrentDate(next);
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const handleConfirm = async () => {
    const result = await showAlert.confirm(
      'Confirm Appointment',
      `Book a ${serviceType} appointment on ${currentDate.toLocaleString('default', { month: 'long' })} ${selectedDay} at ${selectedTime}?`,
      'Confirm Booking',
      'Cancel'
    );
    if (result.isConfirmed) {
      toast.success('Appointment booked successfully!');
      onBack();
    }
  };

  // ── Admin Shifting Form (manual input — no auto-fill) ──────────────────────
  if (step === 'shifting') {
    const shiftingDocuments = [
      { key: 'picture', label: '2x2 Picture', note: 'Formal 2x2 colored picture with name tag.', accept: '.jpg,.jpeg,.png' },
      { key: 'grades', label: 'Downloadable Grades', note: 'Complete copy of all previous semester grades.', accept: '.pdf,.jpg,.jpeg,.png' },
      { key: 'latestCor', label: 'Latest COR', note: 'Most recent Certificate of Registration.', accept: '.pdf,.jpg,.jpeg,.png' },
      { key: 'entranceResult', label: 'Entrance Test Result', note: 'Original or certified entrance test result.', accept: '.pdf,.jpg,.jpeg,.png' },
    ];
    const uploadedCount = Object.values(shiftingDocs).filter(Boolean).length;
    const allDocsUploaded = uploadedCount === shiftingDocuments.length;
    const canSubmit = shiftingForm.studentName.trim() && shiftingForm.currentCourse.trim() && shiftingForm.targetCourse.trim() && shiftingForm.reason.trim() && allDocsUploaded && !isSubmittingShifting;

    const handleShiftingSubmit = async () => {
      if (!canSubmit || !accessToken) {
        toast.error('Please complete all required fields and upload all documents.');
        return;
      }
      setIsSubmittingShifting(true);
      try {
        const result = await appointmentApi.createShiftingAppointment({
          currentCourse: shiftingForm.currentCourse,
          targetCourse: shiftingForm.targetCourse,
          reason: shiftingForm.reason,
          pictureName: shiftingDocs.picture?.name || '',
          gradesName: shiftingDocs.grades?.name || '',
          latestCorName: shiftingDocs.latestCor?.name || '',
          entranceResultName: shiftingDocs.entranceResult?.name || '',
        }, accessToken);
        if (result.ok) {
          toast.success('Shifting application submitted successfully!');
          setStep('type');
          setServiceType(null);
          setShiftingForm({ studentName: '', studentId: '', email: '', contactNumber: '', currentCourse: '', targetCourse: '', reason: '' });
          setShiftingDocs({ picture: null, grades: null, latestCor: null, entranceResult: null });
        } else {
          toast.error((result.data as any)?.error || 'Failed to submit shifting application.');
        }
      } catch {
        toast.error('An error occurred while submitting.');
      } finally {
        setIsSubmittingShifting(false);
      }
    };

    return (
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => { setStep('type'); setServiceType(null); }}
            className="p-3 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h3 className="text-3xl font-black tracking-tight">Shifting Exam Application</h3>
            <p className="text-slate-400 text-sm font-medium">Manually enter the student's information below.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-6">Student Information</h4>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name *</label>
                <input
                  value={shiftingForm.studentName}
                  onChange={e => setShiftingForm(f => ({ ...f, studentName: e.target.value }))}
                  placeholder="e.g. Juan Dela Cruz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Student ID</label>
                <input
                  value={shiftingForm.studentId}
                  onChange={e => setShiftingForm(f => ({ ...f, studentId: e.target.value }))}
                  placeholder="e.g. 2021-12345"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                <input
                  value={shiftingForm.email}
                  onChange={e => setShiftingForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. student@wmsu.edu.ph"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contact Number</label>
                <input
                  value={shiftingForm.contactNumber}
                  onChange={e => setShiftingForm(f => ({ ...f, contactNumber: e.target.value }))}
                  placeholder="e.g. 09171234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-6">Academic Details</h4>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Current Course *</label>
                <input
                  value={shiftingForm.currentCourse}
                  onChange={e => setShiftingForm(f => ({ ...f, currentCourse: e.target.value }))}
                  placeholder="e.g. BS Information Technology"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 ml-1">Target Course *</label>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white border-2 border-teal-100 rounded-lg px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all flex items-center justify-between text-left"
                >
                  <span className={shiftingForm.targetCourse ? 'text-slate-900' : 'text-slate-300'}>
                    {shiftingForm.targetCourse || 'Select target course'}
                  </span>
                  <ChevronRight size={16} className={`text-teal-500 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-lg shadow-2xl max-h-[250px] overflow-y-auto"
                    >
                      {courses.filter(c => c !== shiftingForm.currentCourse).map(course => (
                        <button
                          key={course}
                          onClick={() => { setShiftingForm(f => ({ ...f, targetCourse: course })); setIsDropdownOpen(false); }}
                          className={`w-full px-5 py-3.5 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0
                            ${shiftingForm.targetCourse === course ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-600'}
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
            <div className="mt-5 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Reason for Shifting *</label>
              <textarea
                rows={3}
                value={shiftingForm.reason}
                onChange={e => setShiftingForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Type the reason for shifting here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300 resize-none"
              />
            </div>
          </div>

          {/* Documents Upload */}
          <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-black text-slate-900">Required Documents</h4>
              <span className="text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg">
                {uploadedCount} / {shiftingDocuments.length} Uploaded
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {shiftingDocuments.map(doc => (
                <div key={doc.key} className="border border-slate-100 rounded-lg p-5 hover:border-teal-200 transition-all">
                  <p className="text-sm font-black text-slate-900 mb-1">{doc.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium mb-4">{doc.note}</p>
                  <label className="block">
                    <input
                      type="file"
                      accept={doc.accept}
                      className="hidden"
                      onChange={e => setShiftingDocs(d => ({ ...d, [doc.key]: e.target.files?.[0] || null }))}
                    />
                    <span className={`w-full py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border cursor-pointer
                      ${shiftingDocs[doc.key]
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-teal-600 hover:text-white hover:border-teal-600'}
                    `}>
                      {shiftingDocs[doc.key] ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                      {shiftingDocs[doc.key] ? 'Uploaded' : 'Upload'}
                    </span>
                  </label>
                  {shiftingDocs[doc.key] && (
                    <p className="mt-2 text-[10px] font-bold text-teal-700 truncate">{shiftingDocs[doc.key]?.name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              onClick={() => { setStep('type'); setServiceType(null); }}
              className="flex-1 py-4 bg-slate-100 text-slate-700 font-black rounded-lg hover:bg-slate-200 transition-all"
            >
              Back
            </button>
            <button
              disabled={!canSubmit}
              onClick={handleShiftingSubmit}
              className="flex-1 py-4 bg-teal-600 text-white font-black rounded-lg hover:bg-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmittingShifting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const visibleSlots = getVisibleTimeSlots();

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <h3 className="text-3xl font-black tracking-tight">Book an Appointment</h3>
          <p className="text-slate-400 text-sm font-medium">Schedule a session on behalf of a client or yourself.</p>
        </div>
      </div>

      {/* Step: choose service */}
      {step === 'type' && (
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setServiceType(s.label);
                if (s.id === 'shifting') {
                  setStep('shifting');
                } else {
                  setStep('calendar');
                }
              }}
              className="p-8 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 group cursor-pointer transition-all flex flex-col text-left"
            >
              <div className={`w-14 h-14 ${s.color} text-white rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <s.icon size={28} />
              </div>
              <h4 className="text-xl font-black mb-2 text-slate-900">{s.label}</h4>
              <div className="mt-auto flex items-center gap-2 text-teal-600 font-black text-sm">
                Select <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step: pick date + time (for Counseling & Assessment) */}
      {step === 'calendar' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => changeMonth(-1)}
                disabled={loadingSchedule || (currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear())}
                className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <h4 className="text-lg font-black text-slate-900">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h4>
              <button
                onClick={() => changeMonth(1)}
                disabled={loadingSchedule}
                className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} />)}
              {days.map(day => {
                const disabled = isDisabledDay(day);
                const status = getDateStatus(day);
                return (
                  <button
                    key={day}
                    disabled={disabled || loadingSchedule}
                    onClick={() => {
                      if (disabled) {
                        if (status) toast(status, { icon: 'ℹ️' });
                        return;
                      }
                      setSelectedDay(day);
                      setSelectedTime(null);
                    }}
                    className={`h-12 w-full rounded-lg text-sm font-bold transition-all flex flex-col items-center justify-center
                      ${disabled ? 'text-slate-200 cursor-not-allowed opacity-50' : ''}
                      ${selectedDay === day ? 'bg-teal-600 text-white shadow-lg' : !disabled ? 'hover:bg-teal-50 text-slate-700' : ''}
                    `}
                  >
                    <span>{day}</span>
                    {status && (
                      <span className={`text-[7px] font-black uppercase leading-none mt-0.5
                        ${selectedDay === day ? 'text-white/80' :
                          status === 'Holiday' || status === 'Closed' ? 'text-rose-500' :
                          'text-slate-400'}
                      `}>
                        {status}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm flex flex-col">
            <h4 className="font-black text-slate-900 mb-4">
              {selectedDay
                ? `Available Slots — ${currentDate.toLocaleString('default', { month: 'short' })} ${selectedDay}`
                : 'Pick a date first'}
            </h4>
            {selectedDay ? (
              <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto">
                {visibleSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-lg text-sm font-bold border transition-all
                      ${selectedTime === slot
                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg'
                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-teal-200 hover:bg-teal-50'}
                    `}
                  >
                    <Clock size={16} />
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-300 italic text-sm">
                No date selected
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setStep('type'); setSelectedDay(null); setSelectedTime(null); }}
                className="flex-1 py-4 bg-slate-100 text-slate-700 font-black rounded-lg hover:bg-slate-200 transition-all"
              >
                Back
              </button>
              <button
                disabled={!selectedDay || !selectedTime}
                onClick={handleConfirm}
                className="flex-1 py-4 bg-teal-600 text-white font-black rounded-lg hover:bg-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

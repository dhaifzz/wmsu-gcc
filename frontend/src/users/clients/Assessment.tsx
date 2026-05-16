import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Info, ClipboardCheck, CheckCircle2, FileText } from 'lucide-react';
import Loader from '../../components/loader/Loader';
import { io } from 'socket.io-client';
import { appointmentApi, cmsApi, API_URL } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../components/modal-notification/toast';

type OfficeStatus = 'open' | 'morning_only' | 'afternoon_only' | 'closed' | 'holiday';

interface OfficeConfig {
  status: OfficeStatus;
  note?: string;
  startTime?: string;
  endTime?: string;
}

const morningSlots = ['08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM'];
const afternoonSlots = ['01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM'];

const timeSlots = [...morningSlots, ...afternoonSlots];

const hourToTimeSlot: Record<number, string> = {
  8: '08:00 AM - 09:00 AM',
  9: '09:00 AM - 10:00 AM',
  10: '10:00 AM - 11:00 AM',
  13: '01:00 PM - 02:00 PM',
  14: '02:00 PM - 03:00 PM',
  15: '03:00 PM - 04:00 PM'
};

const toDateKey = (year: number, monthIndex: number, day: number) => {
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const Assessment = ({ onBack }: { onBack: () => void }) => {
  const { accessToken, user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<Record<string, string[]>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState<{ submittedAt: string; scheduledTime: string; status: string } | null>(null);
  const [logoSettings, setLogoSettings] = useState<any>(null);
  const [maxAvailableDate, setMaxAvailableDate] = useState<string | null>(null);
  const [officeSchedule, setOfficeSchedule] = useState<{ [key: string]: OfficeConfig }>({});
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loading, setLoading] = useState(true);

  const assessmentType = useMemo<'Assessment (DAS-Y)' | 'Assessment (DAS-21)' | null>(() => {
    if (user?.role === 'High School Student') return 'Assessment (DAS-Y)';
    if (user?.role === 'College Student') return 'Assessment (DAS-21)';
    return null;
  }, [user?.role]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
    
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        fetchSchedule(),
        loadLatest()
      ]);

      // Fetch logos
      try {
        const logoRes = await cmsApi.getContent('logos');
        if (logoRes.ok && logoRes.data) {
          setLogoSettings(logoRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch logos:", err);
      }

      setLoading(false);
    };
    initialize();
  }, [accessToken, assessmentType]);

  const fetchSchedule = async () => {
    try {
      setLoadingSchedule(true);
      const res = await cmsApi.getContent('office-schedule');
      if (res.ok && res.data) {
        if (res.data.maxAvailableDate) setMaxAvailableDate(res.data.maxAvailableDate);
        if (res.data.officeSchedule) setOfficeSchedule(res.data.officeSchedule);
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };



  const loadLatest = async () => {
    if (!accessToken || !assessmentType) return;
    const result = await appointmentApi.getLatestAppointmentByType(assessmentType, accessToken);
    if (result.ok && result.data.appointment) {
      const appt = result.data.appointment;
      const status = appt.appointment_statuses?.status_name || '';
      const isFinished = status === 'Completed' || status === 'Cancelled' || status === 'Rejected';
      
      if (!isFinished) {
        setSubmittedInfo({
          submittedAt: appt.created_at,
          scheduledTime: appt.scheduled_time,
          status: status || 'Pending'
        });
      }
    }
  };
  const header = { title: "Psychological Assessment", subtitle: "Schedule your testing session" };
  const requirements = { title: "Requirements", content: "Students must complete the Personal Data Form and have their Student ID ready before the assessment." };
  const duration = { title: "Test Duration", content: "The assessment typically takes between 30 to 45 minutes to complete." };
  const important = { title: "Important Note", content: "Please arrive at the GCC office 15 minutes before your scheduled slot for verification." };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isPastDay = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = toDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Weekend check
    const isWeekend = dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6;
    if (isWeekend) return true;

    // Past date check
    if (dateToCheck < today) return true;

    // Global deadline check
    if (maxAvailableDate && dateKey > maxAvailableDate) return true;

    // Office schedule status check
    const config = officeSchedule[dateKey];
    if (config?.status === 'closed' || config?.status === 'holiday') return true;

    return false;
  };

  const getDateStatus = (day: number) => {
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

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    const today = new Date();
    if (nextDate.getMonth() < today.getMonth() && nextDate.getFullYear() <= today.getFullYear()) return;

    // Reset selection when month changes to prevent invalid state
    setSelectedDate(null);
    setSelectedTime(null);

    setCurrentDate(nextDate);
  };

  const selectedDateKey = useMemo(() => {
    if (!selectedDate) return null;
    return toDateKey(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
  }, [currentDate, selectedDate]);

  const selectedDayOccupied = useMemo(
    () => (selectedDateKey ? occupiedSlots[selectedDateKey] || [] : []),
    [occupiedSlots, selectedDateKey]
  );

  const getMonthAvailabilityData = useCallback(async (date: Date, activeType: 'Assessment (DAS-Y)' | 'Assessment (DAS-21)') => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const result = await appointmentApi.getAssessmentAvailability(activeType, year, month);
    if (!result.ok) {
      throw new Error((result.data as { error?: string })?.error || 'Failed to load availability');
    }

    const nextOccupied: Record<string, string[]> = {};
    for (const iso of result.data.occupied || []) {
      const utc = new Date(iso);
      const key = `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}-${String(utc.getUTCDate()).padStart(2, '0')}`;
      const slot = hourToTimeSlot[utc.getUTCHours()];
      if (!slot) continue;
      if (!nextOccupied[key]) nextOccupied[key] = [];
      if (!nextOccupied[key].includes(slot)) nextOccupied[key].push(slot);
    }
    return nextOccupied;
  }, []);

  const fetchMonthAvailability = useCallback(async (date: Date) => {
    if (!assessmentType) {
      setOccupiedSlots({});
      return;
    }
    setLoadingAvailability(true);
    try {
      const nextOccupied = await getMonthAvailabilityData(date, assessmentType);
      setOccupiedSlots(nextOccupied);
    } catch {
      showToast.error('Failed to load available assessment slots.');
    } finally {
      setLoadingAvailability(false);
    }
  }, [assessmentType, getMonthAvailabilityData]);

  useEffect(() => {
    void fetchMonthAvailability(currentDate);
  }, [currentDate, fetchMonthAvailability]);

  useEffect(() => {
    if (!accessToken) return undefined;
    const socketUrl = import.meta.env.VITE_WS_URL || API_URL;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: { token: accessToken },
    });

    const onSlotBooked = (payload?: { assessmentType?: string }) => {
      if (!assessmentType) return;
      if (payload?.assessmentType && payload.assessmentType !== assessmentType) return;
      void fetchMonthAvailability(currentDate);
    };

    socket.on('assessment:slot-booked', onSlotBooked);
    return () => {
      socket.off('assessment:slot-booked', onSlotBooked);
      socket.disconnect();
    };
  }, [accessToken, assessmentType, currentDate, fetchMonthAvailability]);

  useEffect(() => {
    if (selectedTime && selectedDayOccupied.includes(selectedTime)) {
      setSelectedTime(null);
      showToast.warning('That assessment slot was just taken by another student.');
    }
  }, [selectedDayOccupied, selectedTime]);

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;
    if (!accessToken) {
      showToast.error('Please sign in again before booking.');
      return;
    }
    if (!assessmentType) {
      showToast.error('Only high school and college students can book assessments.');
      return;
    }

    const date = toDateKey(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
    setSubmitting(true);
    try {
      const result = await appointmentApi.createAssessmentAppointment({ date, timeSlot: selectedTime }, accessToken);
      if (!result.ok) {
        const errorMessage = (result.data as { error?: string })?.error || 'Failed to book assessment appointment.';
        showToast.error(errorMessage);
        await fetchMonthAvailability(currentDate);
        return;
      }
      showToast.success(`${assessmentType} appointment submitted. Staff will review your request.`);
      setSelectedTime(null);
      setSelectedDate(null);
      setSubmittedInfo({
        submittedAt: result.data.appointment.created_at,
        scheduledTime: result.data.appointment.scheduled_time,
        status: 'Pending'
      });
      await fetchMonthAvailability(currentDate);
    } catch {
      showToast.error('Unable to connect to booking service.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader type="assessment-client" />;
  }

  if (submittedInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-10 print:mb-6">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100 print:hidden"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">Application Receipt</h2>
            <p className="text-slate-500 font-medium text-sm">Please keep this for your records.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative print:shadow-none print:border-slate-300">
          <div className="bg-emerald-600 p-8 text-white text-center print:bg-emerald-100 print:text-emerald-900">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 print:bg-emerald-200">
              <CheckCircle2 size={32} className="text-white print:text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black mb-2">Assessment Scheduled!</h3>
            <p className="text-emerald-100 text-sm font-medium print:text-emerald-800">Your assessment appointment has been successfully scheduled and is currently <span className="font-black uppercase">{submittedInfo.status}</span>.</p>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 pb-2">Student Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Name</p>
                  <p className="font-bold text-slate-900 text-sm">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Student ID</p>
                  <p className="font-bold text-slate-900 text-sm">{user?.schoolId || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 pb-2">Assessment Details</h4>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-100 print:bg-white print:border-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Type</p>
                    <p className="font-black text-slate-900">{assessmentType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Scheduled Date & Time</p>
                    <p className="font-black text-slate-900">
                    {new Date(submittedInfo.scheduledTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                    <br />
                    <span className="text-emerald-600">{hourToTimeSlot[new Date(submittedInfo.scheduledTime).getUTCHours()] || 'Scheduled'}</span>
                  </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 pb-2">Submission Details</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Date Requested</p>
                  <p className="font-bold text-slate-900 text-sm">{new Date(submittedInfo.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Status</p>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest print:bg-white print:border print:border-amber-300">{submittedInfo.status}</span>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-2">
              <div className="flex items-center -space-x-4">
                <img src={logoSettings?.wmsuLogo || "/src/assets/logos/WMSU.png"} alt="WMSU Logo" className="w-12 h-12 object-contain drop-shadow-xl z-10" />
                <img src={logoSettings?.gccLogo || "/src/assets/logos/GCC.png"} alt="GCC Logo" className="w-12 h-12 object-contain drop-shadow-xl z-20" />
              </div>
              <div className="text-center">
                <h1 className="text-md font-black text-emerald-900 uppercase leading-none">WMSU GCC</h1>
              </div>
            </div>
          </div>
        </div>



        <div className="mt-8 flex flex-col items-center gap-4 print:hidden">
          {submittedInfo.status === 'Evaluated' || submittedInfo.status === 'Approved' ? (
            <button
              onClick={() => window.print()}
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-slate-800 transition-colors shadow-xl shadow-slate-900/20 flex items-center gap-3"
            >
              <FileText size={18} />
              Print Receipt
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4 max-w-md">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                Wait for the approval of the request then you can print and provide the receipt to the GCC Office.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full relative"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 lg:mb-10">
        <button 
          onClick={onBack}
          className="p-2 lg:p-3 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
        >
          <ChevronLeft size={20} className="lg:w-6 lg:h-6" />
        </button>
        <div>
          <h2 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900">{header.title}</h2>
          <p className="text-slate-500 font-medium text-[10px] lg:text-sm">{header.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left Column: Calendar Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 lg:p-10 border border-slate-100 shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 text-emerald-950">Select Date</h3>
              <p className="text-slate-400 text-sm font-medium">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => changeMonth(-1)}
                disabled={loadingSchedule || (currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear())}
                className="p-3 hover:bg-emerald-50 rounded-lg border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => changeMonth(1)}
                disabled={loadingSchedule}
                className="p-3 hover:bg-emerald-50 rounded-lg border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2">
            <div 
              key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
              className="grid grid-cols-7 gap-y-4 lg:gap-y-6 gap-x-1 lg:gap-x-2"
            >
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="text-center text-[8px] lg:text-[10px] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] text-slate-300">
                  <span className="hidden sm:inline">{day.slice(0, 3)}</span>
                  <span className="inline sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => {
                    if (isPastDay(day)) {
                      const status = getDateStatus(day);
                      if (status) showToast.info(status);
                      return;
                    }
                    setSelectedDate(day);
                    setSelectedTime(null);
                  }}
                  disabled={loadingSchedule}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative overflow-hidden group
                    ${selectedDate === day 
                      ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 scale-105 lg:scale-110 z-10' 
                      : getDateStatus(day) === 'Holiday' || getDateStatus(day) === 'Closed'
                        ? 'bg-rose-50/50 border border-rose-100/50 text-rose-300 cursor-not-allowed'
                        : getDateStatus(day) === 'Weekend'
                          ? 'bg-slate-50/50 text-slate-200 cursor-not-allowed'
                          : getDateStatus(day) === 'Past'
                            ? 'bg-slate-50/30 text-slate-200 cursor-not-allowed opacity-60'
                            : 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:scale-105 border border-transparent hover:border-emerald-100'}
                  `}
                >
                  <span className={`text-sm sm:text-base lg:text-lg font-black mb-0.5 ${selectedDate === day ? 'text-white' : ''}`}>
                    {day}
                  </span>
                  
                  {getDateStatus(day) && (
                    <div className={`
                      px-1 lg:px-1.5 py-0.5 rounded-full text-[5px] lg:text-[7px] font-black uppercase tracking-tighter lg:tracking-widest
                      ${selectedDate === day 
                        ? 'bg-white/20 text-white' 
                        : getDateStatus(day) === 'Holiday' || getDateStatus(day) === 'Closed'
                          ? 'bg-rose-100 text-rose-500'
                          : getDateStatus(day) === 'Past' || getDateStatus(day) === 'Weekend'
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-emerald-100 text-emerald-600'}
                    `}>
                      {getDateStatus(day)}
                    </div>
                  )}

                  {/* Visual indicator for past/unavailable dates */}
                  {isPastDay(day) && selectedDate !== day && (
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Assessment Tips Section */}
          <div className="mt-8 grid grid-cols-1 gap-3">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100/50">
              <div className="flex items-center gap-3 mb-2 text-emerald-600">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                  <ClipboardCheck size={16} />
                </div>
                <span className="text-[12px] font-black uppercase tracking-widest">{requirements.title}</span>
              </div>
              <p className="text-[13px] text-slate-500 font-bold leading-relaxed">
                {requirements.content}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100/50">
              <div className="flex items-center gap-3 mb-2 text-emerald-600">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                  <Clock size={16} />
                </div>
                <span className="text-[12px] font-black uppercase tracking-widest">{duration.title}</span>
              </div>
              <p className="text-[13px] text-slate-500 font-bold leading-relaxed">
                {duration.content}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 mt-auto pt-8 border-t border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-lg shadow-emerald-200"></div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Selected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Available</span>
            </div>
          </div>
        </div>

        {/* Right Column: Time Slots & Summary Stack */}
        <div className="lg:col-span-4 space-y-6">
          {/* Time Slots Card */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6 lg:mb-8">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <Clock size={20} className="lg:w-6 lg:h-6" />
              </div>
              <h3 className="font-black text-lg lg:text-xl text-emerald-950">Select Time</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {(() => {
                const dateKey = selectedDateKey;
                const config = dateKey ? officeSchedule[dateKey] : null;
                const status = config?.status || 'open';
                
                let visibleSlots = timeSlots;
                if (status === 'morning_only') visibleSlots = morningSlots;
                if (status === 'afternoon_only') visibleSlots = afternoonSlots;

                return visibleSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    disabled={!selectedDate || selectedDayOccupied.includes(time)}
                    className={`
                      py-4 px-6 rounded-lg font-bold text-sm transition-all border text-left flex items-center justify-between group
                      ${selectedTime === time 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                        : selectedDayOccupied.includes(time)
                          ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                          : !selectedDate
                            ? 'bg-white border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50'}
                    `}
                  >
                    {time}
                    <div className={`w-2 h-2 rounded-full transition-all ${selectedTime === time ? 'bg-white' : 'bg-transparent group-hover:bg-emerald-400'}`}></div>
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-emerald-950 rounded-lg p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-950/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6 border border-white/10 relative z-10">
              <ClipboardCheck size={24} className="text-emerald-400" />
            </div>
            <h3 className="font-black text-xl mb-8 relative z-10">Summary</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                  <ClipboardCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 mb-0.5">Assessment Type</p>
                  <p className="font-bold text-sm">{assessmentType || 'Students only (High School/College)'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 mb-0.5">Selected Date</p>
                  <p className="font-bold text-sm">
                    {selectedDate 
                      ? `${currentDate.toLocaleString('default', { month: 'long' })} ${selectedDate}, ${currentDate.getFullYear()}` 
                      : '---'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 mb-0.5">Selected Time</p>
                  <p className="font-bold text-sm">{selectedTime || '---'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || !assessmentType || submitting || loadingAvailability}
              className={`
                w-full mt-10 py-5 rounded-lg font-black text-sm transition-all
                ${selectedDate && selectedTime && assessmentType && !submitting && !loadingAvailability
                  ? 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-xl scale-[1.02] active:scale-[0.98]' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
              `}
            >
              {submitting ? 'Booking Appointment...' : 'Confirm Appointment'}
            </button>
          </div>

          {/* Important Info Card */}
          <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-4 text-slate-600">
              <Info size={18} />
              <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">{important.title}</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-bold">
              {important.content}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Assessment;

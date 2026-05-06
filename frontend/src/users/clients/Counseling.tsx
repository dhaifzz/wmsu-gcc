import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Info, MessageCircle, CheckCircle2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { appointmentApi, API_URL } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../components/modal-notification/toast';

const timeSlots = ['08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM'];

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

const Counseling = ({ onBack }: { onBack: () => void }) => {
  const { accessToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<Record<string, string[]>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState<{ submittedAt: string; scheduledTime: string; status: string } | null>(null);

  useEffect(() => {
    const loadLatest = async () => {
      if (!accessToken) return;
      const result = await appointmentApi.getLatestAppointmentByType('Counseling', accessToken);
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
    void loadLatest();
  }, [accessToken]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
  }, []);

  const header = { title: "Professional Counseling", subtitle: "A safe, confidential space for emotional growth and personal discovery." };
  const preparation = { title: "Preparation", content: "Counseling sessions require a quiet environment and about 45-60 minutes of uninterrupted time." };
  const duration = { title: "Session Length", content: "A standard counseling session lasts approximately 50 minutes." };
  const important = { title: "Confidentiality", content: "Everything discussed in your sessions is strictly confidential between you and your counselor." };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isPastDay = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return dateToCheck < today;
  };

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    const today = new Date();
    if (nextDate.getMonth() < today.getMonth() && nextDate.getFullYear() <= today.getFullYear()) return;
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

  const getMonthAvailabilityData = useCallback(async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const result = await appointmentApi.getCounselingAvailability(year, month);
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
    setLoadingAvailability(true);
    try {
      const nextOccupied = await getMonthAvailabilityData(date);
      setOccupiedSlots(nextOccupied);
    } catch {
      showToast.error('Failed to load available counseling slots.');
    } finally {
      setLoadingAvailability(false);
    }
  }, [getMonthAvailabilityData]);

  useEffect(() => {
    const loadAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const nextOccupied = await getMonthAvailabilityData(currentDate);
        setOccupiedSlots(nextOccupied);
      } catch {
        showToast.error('Failed to load available counseling slots.');
      } finally {
        setLoadingAvailability(false);
      }
    };

    void loadAvailability();
  }, [currentDate, getMonthAvailabilityData]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_WS_URL || API_URL;
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    const onSlotBooked = () => {
      fetchMonthAvailability(currentDate);
    };

    socket.on('counseling:slot-booked', onSlotBooked);
    return () => {
      socket.off('counseling:slot-booked', onSlotBooked);
      socket.disconnect();
    };
  }, [currentDate, fetchMonthAvailability]);

  useEffect(() => {
    const handleSlotTaken = () => {
      if (selectedTime && selectedDayOccupied.includes(selectedTime)) {
        setSelectedTime(null);
        showToast.warning('That time slot was just taken by another user.');
      }
    };

    handleSlotTaken();
  }, [selectedDayOccupied, selectedTime]);

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;
    if (!accessToken) {
      showToast.error('Please sign in again before booking.');
      return;
    }

    const date = toDateKey(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
    setSubmitting(true);
    try {
      const result = await appointmentApi.createCounselingAppointment({ date, timeSlot: selectedTime }, accessToken);
      if (!result.ok) {
        const errorMessage = (result.data as { error?: string })?.error || 'Failed to book appointment.';
        showToast.error(errorMessage);
        await fetchMonthAvailability(currentDate);
        return;
      }
      showToast.success('Appointment submitted. Staff will review your request.');
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

  if (submittedInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">Active Progress</h2>
            <p className="text-slate-500 font-medium text-sm">You already have an ongoing counseling appointment.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="bg-blue-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2">Appointment Request Active</h3>
            <p className="text-blue-100 text-sm font-medium">Your request has been successfully submitted and is currently <span className="font-black uppercase">{submittedInfo.status}</span>.</p>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 pb-2">Appointment Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Scheduled Date & Time</p>
                  <p className="font-bold text-slate-900 text-sm">{new Date(submittedInfo.scheduledTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Date Requested</p>
                  <p className="font-bold text-slate-900 text-sm">{new Date(submittedInfo.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 flex flex-col items-center gap-4 border border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">If you need to make changes to this appointment, please contact the GCC office directly or wait for staff feedback.</p>
            </div>
          </div>
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

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Calendar Card */}
        <div className="lg:col-span-8 bg-white rounded-lg p-10 border border-slate-100 shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Select Date</h3>
              <p className="text-slate-400 text-sm font-medium">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => changeMonth(-1)}
                disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
                className="p-3 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => changeMonth(1)}
                className="p-3 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="grid grid-cols-7 gap-y-6 gap-x-2">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  {day.slice(0, 3)}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => {
                    if (isPastDay(day)) return;
                    setSelectedDate(day);
                    setSelectedTime(null);
                  }}
                  disabled={isPastDay(day)}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center font-bold text-lg transition-all
                    ${selectedDate === day 
                      ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 scale-110 z-10' 
                      : isPastDay(day)
                        ? 'text-slate-200 cursor-not-allowed opacity-50'
                        : 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:scale-105'}
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tips Section */}
          <div className="mt-8 grid grid-cols-1 gap-3">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100/50">
              <div className="flex items-center gap-3 mb-2 text-emerald-600">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                  <Info size={16} />
                </div>
                <span className="text-[12px] font-black uppercase tracking-widest">{preparation.title}</span>
              </div>
              <p className="text-[13px] text-slate-500 font-bold leading-relaxed">
                {preparation.content}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100/50">
              <div className="flex items-center gap-3 mb-2 text-blue-600">
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
          <div className="bg-white rounded-lg p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Clock size={24} />
              </div>
              <h3 className="font-black text-xl text-slate-900">Select Time</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  disabled={!selectedDate || selectedDayOccupied.includes(time)}
                  className={`
                    py-4 px-6 rounded-lg font-bold text-sm transition-all border text-left flex items-center justify-between group
                    ${selectedTime === time 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                      : selectedDayOccupied.includes(time)
                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                        : !selectedDate
                          ? 'bg-white border-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/50'}
                  `}
                >
                  {time}
                  <div className={`w-2 h-2 rounded-full transition-all ${selectedTime === time ? 'bg-white' : 'bg-transparent group-hover:bg-blue-400'}`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-emerald-950 rounded-lg p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-950/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6 border border-white/10 relative z-10">
              <MessageCircle size={24} className="text-emerald-400" />
            </div>
            <h3 className="font-black text-xl mb-8 relative z-10">Summary</h3>
            
            <div className="space-y-6 relative z-10">
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
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60 mb-0.5">Selected Time</p>
                  <p className="font-bold text-sm">{selectedTime || '---'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || submitting || loadingAvailability}
              className={`
                w-full mt-10 py-5 rounded-lg font-black text-sm transition-all
                ${selectedDate && selectedTime && !submitting && !loadingAvailability
                  ? 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-xl scale-[1.02] active:scale-[0.98]' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
              `}
            >
              {submitting ? 'Booking Appointment...' : 'Confirm Appointment'}
            </button>
          </div>

          {/* Important Info Card */}
          <div className="bg-emerald-50 rounded-lg p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-4 text-emerald-700">
              <Info size={18} />
              <h4 className="font-black text-xs uppercase tracking-widest">{important.title}</h4>
            </div>
            <p className="text-xs text-emerald-700/70 leading-relaxed font-medium">
              {important.content}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Counseling;

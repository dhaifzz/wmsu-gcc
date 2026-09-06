import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Info, MessageCircle, ClipboardCheck, BookOpen, GraduationCap, School } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { appointmentApi, cmsApi } from '../lib/api';

type ServiceType = 'counseling' | 'assessment_college' | 'assessment_hs' | 'shifting';
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

const parseSlotTo24h = (slotStr: string) => {
  const parts = slotStr.split(/[-–]/).map(s => s.trim());
  if (parts.length !== 2) return null;
  const to24 = (t: string) => {
    const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const period = m[3].toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m[2]}`;
  };
  const start = to24(parts[0]);
  const end = to24(parts[1]);
  return (start && end) ? { start, end } : null;
};

const getVisibleTimeSlots = (allSlots: string[], config?: OfficeConfig) => {
  if (!config) return allSlots;
  const status = config.status || 'open';
  if (status === 'closed' || status === 'holiday') return [];

  let baseSlots = allSlots;
  if (status === 'morning_only') baseSlots = morningSlots;
  else if (status === 'afternoon_only') baseSlots = afternoonSlots;

  const startTime = config.startTime || (status === 'afternoon_only' ? '13:00' : '08:00');
  const endTime = config.endTime || (status === 'morning_only' ? '11:00' : '16:00');

  return baseSlots.filter(slot => {
    const parsed = parseSlotTo24h(slot);
    if (!parsed) return true;
    return parsed.start >= startTime && parsed.end <= endTime;
  });
};

const Schedules = () => {
  const [activeTab, setActiveTab] = useState<ServiceType>('counseling');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  
  const [officeSchedule, setOfficeSchedule] = useState<{ [key: string]: OfficeConfig }>({});
  const [maxAvailableDate, setMaxAvailableDate] = useState<string | null>(null);
  
  const [occupiedSlots, setOccupiedSlots] = useState<Record<string, string[]>>({});
  const [shiftingConfig, setShiftingConfig] = useState<any>(null);
  
  const [, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const initialize = async () => {
      setLoading(true);
      try {
        const [scheduleRes, shiftingRes] = await Promise.all([
          cmsApi.getContent('office-schedule'),
          appointmentApi.getShiftingConfig()
        ]);
        
        if (scheduleRes.ok && scheduleRes.data) {
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          if (scheduleRes.data.maxAvailableDate && scheduleRes.data.maxAvailableDate >= todayStr) {
            setMaxAvailableDate(scheduleRes.data.maxAvailableDate);
          }
          if (scheduleRes.data.officeSchedule) setOfficeSchedule(scheduleRes.data.officeSchedule);
        }
        
        if (shiftingRes.ok && shiftingRes.data) {
          setShiftingConfig(shiftingRes.data);
        }
      } catch (err) {
        console.error('Failed to load global data:', err);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const getMonthAvailabilityData = useCallback(async (date: Date, type: ServiceType) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let result;
    
    if (type === 'counseling') {
      result = await appointmentApi.getCounselingAvailability(year, month);
    } else if (type === 'assessment_college') {
      result = await appointmentApi.getAssessmentAvailability('Assessment (DAS-21)', year, month);
    } else if (type === 'assessment_hs') {
      result = await appointmentApi.getAssessmentAvailability('Assessment (DAS-Y)', year, month);
    } else {
      return {};
    }

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

  useEffect(() => {
    const loadAvailability = async () => {
      if (activeTab === 'shifting') {
        setOccupiedSlots({});
        return;
      }
      setLoadingAvailability(true);
      try {
        const nextOccupied = await getMonthAvailabilityData(currentDate, activeTab);
        setOccupiedSlots(nextOccupied);
      } catch {
        console.error('Failed to load slots.');
      } finally {
        setLoadingAvailability(false);
      }
    };
    
    // Reset selection when tab changes
    setSelectedDate(null);
    void loadAvailability();
  }, [currentDate, activeTab, getMonthAvailabilityData]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isPastDay = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = toDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    const isWeekend = dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6;
    if (isWeekend) return true;
    if (dateToCheck < today) return true;
    if (maxAvailableDate && dateKey > maxAvailableDate) return true;
    
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

    if (activeTab === 'shifting' && shiftingConfig) {
      if (dateKey === shiftingConfig.examDate) return 'Exam Day';
      if (dateKey >= shiftingConfig.startDate && dateKey <= shiftingConfig.endDate) return 'Open Window';
    }

    if (dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6) return 'Weekend';
    if (dateToCheck < today) return 'Past';
    if (maxAvailableDate && dateKey > maxAvailableDate) return 'Deadline';
    if (config?.status === 'closed') return 'Closed';
    if (config?.status === 'holiday') return 'Holiday';
    if (activeTab !== 'shifting') {
      const occupied = occupiedSlots[dateKey] || [];
      const totalSlots = getVisibleTimeSlots(timeSlots, config || undefined).length;
                         
      if (occupied.length >= totalSlots && totalSlots > 0) return 'Fully Booked';
      if (occupied.length > 0) return 'Partial';
      if (config?.status === 'morning_only') return 'AM Only';
      if (config?.status === 'afternoon_only') return 'PM Only';
      return 'Available';
    }
    
    if (config?.status === 'morning_only') return 'AM Only';
    if (config?.status === 'afternoon_only') return 'PM Only';
    return null;
  };

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    const today = new Date();
    if (nextDate.getMonth() < today.getMonth() && nextDate.getFullYear() <= today.getFullYear()) return;
    setSelectedDate(null);
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


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 pb-24">
        {/* Hero Section */}
        <div className="bg-emerald-900 text-white pt-32 pb-24 relative overflow-hidden">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px]"></div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight tracking-tight">Service Schedules</h1>
            <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto font-medium px-4">
              Check the public availability of our counseling and assessment services, or stay updated on shifting examination periods.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 -mt-10 relative z-20">
          <div className="flex flex-row justify-center gap-2 md:gap-4 mb-16 max-w-5xl mx-auto">
            {[
              { id: 'counseling', label: 'Counseling', icon: MessageCircle },
              { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
              { id: 'shifting', label: 'Shifting Exam', icon: BookOpen },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'assessment') {
                    if (!activeTab.startsWith('assessment')) {
                      setActiveTab('assessment_college');
                    }
                  } else {
                    setActiveTab(tab.id as ServiceType);
                  }
                }}
                className={`w-full px-2 md:px-8 py-4 md:py-5 rounded-xl font-black text-[10px] sm:text-sm md:text-base transition-all flex items-center justify-center gap-1.5 md:gap-3 shadow-xl ${
                  (tab.id === 'assessment' ? activeTab.startsWith('assessment') : activeTab === tab.id)
                    ? 'bg-white text-emerald-700 scale-105 border-2 border-emerald-500' 
                    : 'bg-emerald-800 text-emerald-100 border-2 border-transparent hover:bg-emerald-700'
                }`}
              >
                <tab.icon className="w-4 h-4 md:w-6 md:h-6 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Sub-tabs and Calendar */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Calendar Card */}
              <div className="bg-white rounded-xl p-6 lg:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col min-h-[600px]">
                <AnimatePresence>
                  {activeTab.startsWith('assessment') && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="flex flex-wrap items-center gap-3 mb-8 pt-2"
                    >
                      <button
                        onClick={() => setActiveTab('assessment_college')}
                        className={`inline-flex items-center gap-2 py-3 px-6 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-sm
                          ${activeTab === 'assessment_college'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-emerald-700'
                          }`}
                      >
                        <GraduationCap size={18} />
                        College
                      </button>
                      <button
                        onClick={() => setActiveTab('assessment_hs')}
                        className={`inline-flex items-center gap-2 py-3 px-6 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-sm
                          ${activeTab === 'assessment_hs'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-emerald-700'
                          }`}
                      >
                        <School size={18} />
                        High School
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              <div className="flex items-center justify-between mb-8 lg:mb-10">
                <div>
                  <h3 className="text-xl lg:text-2xl font-black text-slate-900">Select Date to View</h3>
                  <p className="text-slate-400 text-xs lg:text-sm font-medium uppercase tracking-widest">
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
                    className="p-3 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-2 relative">
                {loadingAvailability && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col justify-center rounded-2xl p-4">
                    <div className="grid grid-cols-7 gap-y-4 lg:gap-y-6 gap-x-1 lg:gap-x-2">
                      {[...Array(35)].map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse flex flex-col items-center justify-center p-2">
                          <div className="h-4 w-6 bg-slate-200 rounded animate-pulse mb-2"></div>
                          <div className="h-2 w-10 bg-slate-200 rounded-full animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div 
                  key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
                  className="grid grid-cols-7 gap-y-4 lg:gap-y-6 gap-x-1 lg:gap-x-2"
                >
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <div key={day} className="text-center text-[8px] lg:text-[10px] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] text-slate-400">
                      {day.slice(0, 3)}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  {days.map(day => {
                    const isPast = isPastDay(day);
                    const status = getDateStatus(day);
                    
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          if (activeTab === 'shifting') return; // no selection needed for shifting
                          if (isPast) return;
                          setSelectedDate(day);
                        }}
                        disabled={activeTab === 'shifting' ? true : isPast}
                        className={`
                          aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative overflow-hidden group
                          ${activeTab === 'shifting' 
                            ? (status === 'Exam Day' ? 'bg-rose-50 border border-rose-200 text-rose-700 font-bold shadow-sm' : status === 'Open Window' ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 text-slate-400 opacity-60')
                            : selectedDate === day 
                              ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-105 z-10' 
                              : status === 'Closed'
                                ? 'bg-slate-100/70 border border-slate-200/60 text-slate-400 cursor-not-allowed opacity-75'
                                : status === 'Holiday' || status === 'Fully Booked'
                                  ? 'bg-rose-50/50 border border-rose-100/50 text-rose-300 cursor-not-allowed'
                                  : status === 'Weekend' || status === 'Past'
                                    ? 'bg-slate-50/30 text-slate-300 cursor-not-allowed opacity-60'
                                    : status === 'AM Only'
                                      ? 'bg-blue-50/60 hover:bg-blue-100/80 text-slate-700 hover:text-blue-800 border border-blue-200/70 hover:border-blue-300 shadow-sm'
                                      : status === 'PM Only'
                                        ? 'bg-orange-50/60 hover:bg-orange-100/80 text-slate-700 hover:text-orange-800 border border-orange-200/70 hover:border-orange-300 shadow-sm'
                                        : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 hover:scale-105 border border-slate-100 hover:border-emerald-100 shadow-sm'}
                        `}
                      >
                        <span className={`text-base lg:text-lg font-black mb-0.5 ${selectedDate === day ? 'text-white' : ''}`}>
                          {day}
                        </span>
                        
                        {status && (
                          <div className={`
                            px-1.5 py-0.5 rounded-full text-[5px] lg:text-[7px] font-black uppercase tracking-widest text-center leading-tight
                            ${selectedDate === day 
                              ? 'bg-white/20 text-white' 
                              : status === 'Exam Day'
                                ? 'bg-rose-200 text-rose-800'
                                : status === 'Open Window'
                                  ? 'bg-indigo-200 text-indigo-800'
                                  : status === 'Closed'
                                    ? 'bg-slate-200 text-slate-600 font-bold'
                                    : status === 'Holiday' || status === 'Fully Booked'
                                      ? 'bg-rose-100 text-rose-500'
                                      : status === 'Past' || status === 'Weekend' || status === 'Deadline'
                                        ? 'bg-slate-100 text-slate-400'
                                        : status === 'AM Only'
                                          ? 'bg-blue-100 text-blue-700'
                                          : status === 'PM Only'
                                            ? 'bg-orange-100 text-orange-700'
                                            : status === 'Partial' 
                                              ? 'bg-amber-100 text-amber-600'
                                              : 'bg-emerald-100 text-emerald-600'}
                          `}>
                            {status}
                          </div>
                        )}
                        
                        {isPast && selectedDate !== day && activeTab !== 'shifting' && (
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]"></div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 pt-6 border-t border-slate-50">
                {activeTab !== 'shifting' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-md"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-md"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AM Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500 shadow-md"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PM Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400 shadow-md"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partially Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-400 shadow-md"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Closed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400 shadow-md"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fully Booked / Holiday</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-md"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Window</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 shadow-md"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exam Day</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Time Slots & Info */}
            <div className="lg:col-span-4 space-y-6">
              <AnimatePresence mode="wait">
                {activeTab === 'shifting' ? (
                  <motion.div
                    key="shifting-info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[#111827] rounded-xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-950/20 border border-white/5"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10 relative z-10">
                      <BookOpen size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="font-black text-xl mb-2 relative z-10 text-white">Shifting Examination</h3>
                    <p className="text-slate-400 text-xs font-bold mb-8 leading-relaxed">
                      Below are the currently configured dates for the upcoming shifting examinations.
                    </p>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Submission Window</p>
                        <p className="font-bold text-sm text-white">
                          {shiftingConfig?.startDate ? new Date(shiftingConfig.startDate).toLocaleDateString() : 'N/A'} 
                          <span className="text-slate-600 mx-2">&mdash;</span> 
                          {shiftingConfig?.endDate ? new Date(shiftingConfig.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Examination Date & Time</p>
                        <div className="flex items-baseline gap-3">
                          <span className="font-black text-lg text-white">
                            {shiftingConfig?.examDate ? new Date(shiftingConfig.examDate).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className="text-emerald-500 font-black text-base px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            {shiftingConfig?.examTime || 'TBA'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="booking-info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-xl p-6 lg:p-10 border border-slate-100 shadow-2xl shadow-slate-200/50">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-lg text-slate-900 flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Clock size={18} />
                          </div>
                          Daily Slots Status
                        </h3>
                      </div>

                      {!selectedDate ? (
                        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-8 text-center flex flex-col items-center">
                          <CalendarIcon size={32} className="text-slate-300 mb-4" />
                          <p className="text-sm font-bold text-slate-500">Select an available date on the calendar to view its time slot status.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                          {(() => {
                            const dateKey = selectedDateKey;
                            const config = dateKey ? officeSchedule[dateKey] : undefined;
                            const visibleSlots = getVisibleTimeSlots(timeSlots, config);

                            if (visibleSlots.length === 0) {
                              return <p className="text-center text-sm font-bold text-slate-400 py-4">No slots available for this day.</p>;
                            }

                            return visibleSlots.map(time => {
                              const isOccupied = selectedDayOccupied.includes(time);
                              return (
                                <div
                                  key={time}
                                  className={`
                                    py-4 px-5 rounded-xl font-bold text-sm transition-all border flex items-center justify-between
                                    ${isOccupied
                                      ? 'bg-slate-50 border-slate-100 text-slate-400'
                                      : 'bg-emerald-50 border-emerald-100 text-emerald-800'}
                                  `}
                                >
                                  <div className="flex items-center gap-3">
                                    <Clock size={16} className={isOccupied ? 'text-slate-300' : 'text-emerald-500'} />
                                    {time}
                                  </div>
                                  <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${isOccupied ? 'bg-slate-200 text-slate-500' : 'bg-emerald-200 text-emerald-800'}`}>
                                    {isOccupied ? 'Booked' : 'Open'}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100/50 flex gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 text-emerald-600">
                        <Info size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-emerald-900 text-sm mb-1 uppercase tracking-widest">Public Viewing Only</h4>
                        <p className="text-xs text-emerald-700/80 font-bold leading-relaxed">
                          This page provides a live view of our schedules. To secure a slot, you must register and log in to the student portal.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Schedules;

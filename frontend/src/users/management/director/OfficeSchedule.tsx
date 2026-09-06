import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../auth/AuthContext';
import { cmsApi } from '../../../lib/api';
import { showAlert } from '../../../components/modal-notification/sweetalert';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sun,
  Sunrise,
  Sunset,
  Palmtree,
  Building2,
  Info,
  Clock,
  CalendarCheck,
  X,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../../../components/loader/Loader';

type OfficeStatus = 'open' | 'morning_only' | 'afternoon_only' | 'closed' | 'holiday';

interface OfficeConfig {
  status: OfficeStatus;
  note?: string;
  startTime?: string;
  endTime?: string;
}

const OfficeSchedule = () => {
  const { accessToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchOfficeSchedule();
    window.scrollTo(0, 0);
  }, []);

  const fetchOfficeSchedule = async () => {
    try {
      setLoading(true);
      const res = await cmsApi.getContent('office-schedule');
      if (res.ok && res.data && Object.keys(res.data).length > 0) {
        if (res.data.maxAvailableDate) {
          if (res.data.maxAvailableDate >= todayStr) {
            setMaxAvailableDate(res.data.maxAvailableDate);
          } else {
            setMaxAvailableDate(getDefaultDeadline());
          }
        }
        if (res.data.officeSchedule) {
          setOfficeSchedule(res.data.officeSchedule);
        }
      }
    } catch (err) {
      console.error('Failed to fetch office schedule:', err);
      setError('Failed to load schedule configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      const res = await cmsApi.updateContent('office-schedule', { maxAvailableDate, officeSchedule }, accessToken || undefined);
      if (res.ok) {
         setSuccessMessage('Office schedule updated successfully');
         showAlert.success(
           'Changes Confirmed!',
           'The office schedule configuration has been saved successfully and is now active globally across the website.'
         );
         setTimeout(() => setSuccessMessage(null), 3000);
      } else {
         setError(res.error || 'Failed to save changes');
         showAlert.error('Save Failed', res.error || 'Failed to save changes.');
      }
    } catch (err) {
      console.error('Error saving:', err);
      setError('An unexpected error occurred');
      showAlert.error('Error Occurred', 'An unexpected error occurred while saving schedule changes.');
    } finally {
      setSaving(false);
    }
  };

  // Default deadline to 1 year from now
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [maxAvailableDate, setMaxAvailableDate] = useState<string>(getDefaultDeadline());
  const [officeSchedule, setOfficeSchedule] = useState<{ [key: string]: OfficeConfig }>({});
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [deadlineModalMonth, setDeadlineModalMonth] = useState<Date>(new Date());
  const [tempDeadline, setTempDeadline] = useState<string>('');

  const openDeadlineModal = () => {
    const currentDL = maxAvailableDate || getDefaultDeadline();
    setTempDeadline(currentDL);
    const dateObj = new Date(currentDL + 'T00:00:00');
    setDeadlineModalMonth(isNaN(dateObj.getTime()) ? new Date() : dateObj);
    setIsDeadlineModalOpen(true);
  };

  const handleApplyDeadlineModal = async () => {
    if (!tempDeadline) return;
    setMaxAvailableDate(tempDeadline);
    setIsDeadlineModalOpen(false);

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      const res = await cmsApi.updateContent('office-schedule', { maxAvailableDate: tempDeadline, officeSchedule }, accessToken || undefined);
      if (res.ok) {
        setSuccessMessage('Global deadline updated successfully!');
        const formattedDate = new Date(tempDeadline + 'T00:00:00').toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
        showAlert.success(
          'Global Deadline Saved!',
          `The global booking deadline has been set to ${formattedDate} and updated successfully across the website.`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(res.error || 'Failed to save deadline changes');
        showAlert.error('Save Failed', res.error || 'Failed to save deadline changes.');
      }
    } catch (err) {
      console.error('Error saving deadline:', err);
      setError('An unexpected error occurred while saving deadline');
      showAlert.error('Error Occurred', 'An unexpected error occurred while saving deadline changes.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = formatDate(new Date());
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const renderModalCalendar = () => {
    const totalDays = daysInMonth(deadlineModalMonth);
    const firstDay = startOfMonth(deadlineModalMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`modal-empty-${i}`} className="h-12 sm:h-14 border border-transparent"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(deadlineModalMonth.getFullYear(), deadlineModalMonth.getMonth(), d);
      const dateKey = formatDate(date);
      const isPast = dateKey < todayStr;
      const weekend = date.getDay() === 0 || date.getDay() === 6;
      const isSelected = dateKey === tempDeadline;
      const isToday = dateKey === todayStr;

      days.push(
        <button
          key={`modal-day-${d}`}
          type="button"
          disabled={isPast || weekend}
          onClick={() => !isPast && !weekend && setTempDeadline(dateKey)}
          title={weekend ? 'Weekend (Closed)' : isPast ? 'Past Date' : `Select ${dateKey}`}
          className={`h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center font-black text-xs sm:text-sm transition-all relative ${
            isPast || weekend
              ? 'bg-slate-50/70 text-slate-300 cursor-not-allowed opacity-40'
              : isSelected
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105 z-10 ring-2 ring-emerald-600 ring-offset-2 font-black'
                : 'bg-slate-50/80 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200/60 text-slate-700 cursor-pointer'
          }`}
        >
          <span>{d}</span>
          {isToday && !isSelected && (
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-0.5"></span>
          )}
        </button>
      );
    }

    return days;
  };

  const getOfficeConfig = (date: Date) => {
    const key = formatDate(date);
    const config = officeSchedule[key];
    if (config) {
      return {
        ...config,
        startTime: config.startTime || (config.status === 'afternoon_only' ? "13:00" : "08:00"),
        endTime: config.endTime || (config.status === 'morning_only' ? "11:00" : "16:00")
      };
    }

    // Default config for weekdays (8am to 4pm)
    return {
      status: 'open' as OfficeStatus,
      startTime: "08:00",
      endTime: "16:00",
      note: ""
    };
  };

  const setOfficeStatus = (status: OfficeStatus, note?: string, startTime?: string, endTime?: string) => {
    if (!selectedDate) return;
    const dateKey = formatDate(selectedDate);
    const existing = getOfficeConfig(selectedDate);

    let newStart = startTime;
    let newEnd = endTime;

    if (startTime === undefined && endTime === undefined) {
      if (status === 'morning_only') {
        newStart = "08:00";
        newEnd = "11:00";
      } else if (status === 'afternoon_only') {
        newStart = "13:00";
        newEnd = "16:00";
      } else if (status === 'open') {
        newStart = "08:00";
        newEnd = "16:00";
      } else {
        newStart = existing.startTime || "08:00";
        newEnd = existing.endTime || "16:00";
      }
    } else {
      if (newStart === undefined) newStart = existing.startTime || (status === 'afternoon_only' ? "13:00" : "08:00");
      if (newEnd === undefined) newEnd = existing.endTime || (status === 'morning_only' ? "11:00" : "16:00");
    }

    setOfficeSchedule({
      ...officeSchedule,
      [dateKey]: {
        status,
        note: note !== undefined ? note : (existing.note || ""),
        startTime: newStart,
        endTime: newEnd
      }
    });
  };

  const getStatusConfig = (status: OfficeStatus) => {
    switch (status) {
      case 'open': return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Regular Day', shortLabel: 'Open', icon: Sun };
      case 'morning_only': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Morning Only', shortLabel: 'AM', icon: Sunrise };
      case 'afternoon_only': return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Afternoon Only', shortLabel: 'PM', icon: Sunset };
      case 'closed': return { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Full Closure', shortLabel: 'Closed', icon: Building2 };
      case 'holiday': return { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Holiday', shortLabel: 'Holiday', icon: Palmtree };
      default: return { bg: 'bg-slate-50', text: 'text-slate-400', label: 'Not Set', shortLabel: 'None', icon: Info };
    }
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentDate);
    const firstDay = startOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 sm:h-24 md:h-32 border border-slate-100 bg-slate-50/30"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dateKey = formatDate(date);
      const isToday = dateKey === todayStr;
      const isSelected = selectedDate && dateKey === formatDate(selectedDate);
      const weekend = date.getDay() === 0 || date.getDay() === 6;
      const isPastDeadline = dateKey > maxAvailableDate;
      const isPastDate = dateKey < todayStr;

      const config = getOfficeConfig(date);
      const statusInfo = getStatusConfig(config.status);
      const StatusIcon = statusInfo.icon;

      days.push(
        <button
          key={d}
          onClick={() => !weekend && !isPastDate && setSelectedDate(date)}
          disabled={weekend || isPastDate}
          title={weekend ? 'Weekend (Closed)' : isPastDate ? 'Past Date' : `Click to configure ${formatDate(date)}`}
          className={`h-16 sm:h-24 md:h-32 border border-slate-100 p-1 sm:p-2.5 md:p-3 text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${
            weekend || isPastDate
              ? 'bg-slate-50/70 cursor-not-allowed opacity-40'
              : isPastDeadline
                ? 'bg-slate-100/60 grayscale opacity-70 hover:opacity-100 hover:bg-emerald-50/30 hover:border-emerald-300 hover:shadow-md hover:scale-[1.02] hover:z-10 cursor-pointer'
                : isSelected
                  ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/80 z-20 shadow-xl scale-[1.02]'
                  : 'bg-white hover:bg-emerald-50/40 hover:border-emerald-400 hover:shadow-xl hover:scale-[1.03] hover:z-10 cursor-pointer'
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <span className={`text-xs sm:text-sm font-black transition-colors ${weekend || isPastDate ? 'text-slate-300' : isPastDeadline ? 'text-slate-400' : isSelected ? 'text-emerald-700' : isToday ? 'text-emerald-600 underline decoration-2 underline-offset-4' : 'text-slate-600 group-hover:text-emerald-700'
              }`}>
              {d}
            </span>
            {!weekend && !isPastDate && (
              <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                <div className={`p-0.5 sm:p-1 rounded-md ${statusInfo.bg} ${statusInfo.text} group-hover:scale-110 transition-transform`}>
                  <StatusIcon size={10} strokeWidth={2.5} className="sm:hidden" />
                  <StatusIcon size={12} strokeWidth={3} className="hidden sm:block" />
                </div>
                {isPastDeadline && (
                  <div className="bg-slate-200 text-slate-500 p-0.5 sm:p-1 rounded-md" title="Past Booking Deadline">
                    <CalendarCheck size={10} strokeWidth={2.5} className="sm:hidden" />
                    <CalendarCheck size={12} strokeWidth={3} className="hidden sm:block" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile compact indicator (prevents cell text from overlapping phone boundaries) */}
          <div className="sm:hidden w-full mt-auto">
            {isPastDeadline ? (
              <div className="text-[7px] font-black uppercase tracking-tighter text-slate-400 bg-slate-100 px-0.5 py-0.5 rounded text-center truncate">
                Closed
              </div>
            ) : !weekend ? (
              <div className={`text-[7px] font-black uppercase tracking-tighter ${statusInfo.bg} ${statusInfo.text} px-0.5 py-0.5 rounded text-center truncate`}>
                {statusInfo.shortLabel}
              </div>
            ) : null}
          </div>

          {/* Tablet/Desktop full indicator and time slots */}
          <div className="hidden sm:block space-y-1 mt-auto">
            {isPastDeadline ? (
              <div className="text-[8px] font-black uppercase tracking-tight text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm inline-block">
                No Booking
              </div>
            ) : !weekend && (
              <div className={`text-[9px] font-black uppercase tracking-tight ${statusInfo.bg} ${statusInfo.text} px-1.5 py-0.5 rounded-sm inline-block group-hover:shadow-sm`}>
                {statusInfo.label}
              </div>
            )}
            {config.startTime && !weekend && config.status !== 'closed' && config.status !== 'holiday' && (
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter block">
                {config.startTime} - {config.endTime}
              </div>
            )}
          </div>
        </button>
      );
    }
    return days;
  };

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    if (nextDate.getFullYear() <= 2040) {
      setCurrentDate(nextDate);
    }
  };

  if (loading) {
    return <Loader type="management-schedule" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-40"
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Office Schedule</h2>
          <p className="text-slate-500 font-medium max-w-2xl">Weekdays default to Regular Day (Open). Manage global operating hours and booking limits for the entire center.</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden w-full">
            {/* Quick Month Navigation Header inside calendar */}
            <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-emerald-600 shrink-0" />
                <span className="font-black text-slate-800 text-xs sm:text-base">
                  {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => changeMonth(-1)}
                  disabled={currentDate.getFullYear() <= new Date().getFullYear() && currentDate.getMonth() <= new Date().getMonth()}
                  className="p-1 sm:p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-all disabled:opacity-30"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    setCurrentDate(today);
                    setSelectedDate(today);
                  }}
                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all"
                >
                  Today
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  disabled={currentDate.getFullYear() >= 2040 && currentDate.getMonth() >= 11}
                  className="p-1 sm:p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-all disabled:opacity-30"
                  title="Next Month"
                >
                  <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 bg-slate-900 text-white">
              {[
                { full: 'Sun', short: 'S' },
                { full: 'Mon', short: 'M' },
                { full: 'Tue', short: 'T' },
                { full: 'Wed', short: 'W' },
                { full: 'Thu', short: 'T' },
                { full: 'Fri', short: 'F' },
                { full: 'Sat', short: 'S' }
              ].map(day => (
                <div key={day.full} className="py-2.5 sm:py-4 text-center text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] opacity-60">
                  <span className="hidden sm:inline">{day.full}</span>
                  <span className="sm:hidden">{day.short}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">{renderCalendar()}</div>
          </div>

          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-4 sm:gap-8 items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-full">Global Indicators</p>
            {(['morning_only', 'afternoon_only', 'closed', 'holiday'] as OfficeStatus[]).map(s => {
              const info = getStatusConfig(s);
              return (
                <div key={s} className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-xl ${info.bg} ${info.text} flex items-center justify-center shadow-sm shrink-0`}><info.icon size={16} /></div>
                  <span className="text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider">{info.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          {/* Header Month/Year Selector & Jump to Date UI */}
          <div className="bg-emerald-900 p-4 rounded-2xl text-white shadow-2xl shadow-emerald-900/20 w-full flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => changeMonth(-1)}
                disabled={currentDate.getFullYear() <= new Date().getFullYear() && currentDate.getMonth() <= new Date().getMonth()}
                className="p-2 hover:bg-emerald-800 hover:scale-110 active:scale-95 rounded-lg transition-all disabled:opacity-30"
                title="Previous Month"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2">
                {/* Month Selector */}
                <select
                  value={currentDate.getMonth()}
                  onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                  className="bg-emerald-800/90 text-white font-black text-xs uppercase tracking-wider py-1.5 px-3 rounded-xl border border-emerald-700/60 hover:bg-emerald-700 hover:border-emerald-400 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((m, idx) => (
                    <option key={m} value={idx} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>

                {/* Year Selector */}
                <select
                  value={currentDate.getFullYear()}
                  onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                  className="bg-emerald-800/90 text-white font-black text-xs tracking-wider py-1.5 px-2.5 rounded-xl border border-emerald-700/60 hover:bg-emerald-700 hover:border-emerald-400 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                    <option key={y} value={y} className="bg-slate-900 text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => changeMonth(1)}
                disabled={currentDate.getFullYear() >= 2040 && currentDate.getMonth() >= 11}
                className="p-2 hover:bg-emerald-800 hover:scale-110 active:scale-95 rounded-lg transition-all disabled:opacity-30"
                title="Next Month"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Quick Actions Bar: Today & Jump to Date */}
            <div className="flex items-center justify-between pt-2 border-t border-emerald-800/60">
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentDate(today);
                  setSelectedDate(today);
                }}
                className="text-[10px] font-black uppercase tracking-widest text-emerald-200 hover:text-white hover:bg-emerald-800 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              >
                <CalendarIcon size={12} /> Today
              </button>

              <div className="relative group">
                <input
                  type="date"
                  min={todayStr}
                  onChange={(e) => {
                    if (e.target.value) {
                      const picked = new Date(e.target.value + 'T00:00:00');
                      setCurrentDate(picked);
                      setSelectedDate(picked);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <button className="text-[10px] font-black uppercase tracking-widest bg-emerald-800 hover:bg-emerald-700 text-emerald-100 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-emerald-700 shadow-sm group-hover:scale-105">
                  <CalendarCheck size={12} /> Jump to Date
                </button>
              </div>
            </div>
          </div>

          {/* Global Booking Deadline Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 z-0"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-emerald-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Booking Window</p>
                  <h4 className="text-lg font-black text-slate-900">Global Deadline</h4>
                </div>
              </div>

              <div 
                onClick={openDeadlineModal}
                className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:border-emerald-400 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Accepting until</span>
                  <span className="text-sm font-black text-slate-800 group-hover:text-emerald-800 transition-colors">
                    {new Date(maxAvailableDate).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openDeadlineModal(); }}
                  className="px-3.5 py-2 bg-emerald-600 group-hover:bg-emerald-700 active:scale-95 text-white rounded-xl flex items-center gap-2 shadow-md transition-all group-hover:scale-105 cursor-pointer"
                >
                  <CalendarCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Change</span>
                </button>
              </div>
              <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                All booking slots beyond this date will be automatically disabled globally.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={formatDate(selectedDate)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 lg:p-8 pb-8 sm:pb-10 shadow-2xl shadow-slate-200/60 flex flex-col h-fit relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full -mr-32 -mt-32 z-0"></div>
                <div className="relative z-10 space-y-6 sm:space-y-8">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-emerald-900 text-white rounded-xl sm:rounded-[1.25rem] flex items-center justify-center shadow-xl shrink-0"><CalendarIcon size={24} className="sm:w-8 sm:h-8" /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5 sm:mb-1">Configuration for</p>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900">{selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operating Mode</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'open', label: 'Regular Day', icon: Sun },
                        { id: 'morning_only', label: 'Morning Only', icon: Sunrise },
                        { id: 'afternoon_only', label: 'Afternoon Only', icon: Sunset },
                        { id: 'closed', label: 'Full Closure', icon: Building2 },
                        { id: 'holiday', label: 'Special Holiday', icon: Palmtree }
                      ].map(type => {
                        const isCurrent = (officeSchedule[formatDate(selectedDate)]?.status || 'open') === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setOfficeStatus(type.id as any)}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${isCurrent ? 'bg-emerald-900 border-emerald-900 text-white shadow-xl scale-[0.98]' : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'}`}
                          >
                            <div className={`p-2 rounded-lg ${isCurrent ? 'bg-emerald-800' : 'bg-slate-50'}`}><type.icon size={20} /></div>
                            <span className="text-[10px] font-black uppercase tracking-tight">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Adjustments (Fixed based on operating mode) */}
                  {(officeSchedule[formatDate(selectedDate)]?.status !== 'closed' && officeSchedule[formatDate(selectedDate)]?.status !== 'holiday') && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Clock size={14} className="text-emerald-600" /> Fixed Operating Hours</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Start Time</label>
                          <input
                            type="time"
                            value={getOfficeConfig(selectedDate).startTime}
                            disabled
                            readOnly
                            className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-500 cursor-not-allowed select-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">End Time</label>
                          <input
                            type="time"
                            value={getOfficeConfig(selectedDate).endTime}
                            disabled
                            readOnly
                            className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-500 cursor-not-allowed select-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <div className="mt-12 pt-4 relative z-10">
                  {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium mb-4">
                      {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium mb-4">
                      {successMessage}
                    </div>
                  )}
                  <div className="bg-slate-900 p-5 rounded-2xl flex gap-4 mb-6 shadow-xl">
                    <AlertCircle size={20} className="text-emerald-400 shrink-0" />
                    <p className="text-[9px] font-bold text-white/80 uppercase leading-relaxed tracking-wider">Updates reflect globally for all users and staff members instantly.</p>
                  </div>
                  <button 
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Confirm Changes'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center h-full min-h-[600px]">
                <div className="w-24 h-24 bg-white shadow-2xl rounded-lg flex items-center justify-center mb-8"><Building2 size={48} className="text-slate-200" /></div>
                <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] mb-3">Office Control</h4>
                <p className="text-slate-400 font-bold text-sm max-w-[240px] leading-relaxed italic">Select a date to customize its global operating hours or operating mode.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Full Calendar Modal for Picking Global Deadline */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isDeadlineModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-hidden w-screen h-screen"
              onMouseDown={(e) => e.target === e.currentTarget && setIsDeadlineModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-md shadow-slate-200/50 shrink-0">
                      <CalendarIcon size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Select Global Deadline</h3>
                        <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Booking Limit
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">Pick the final date accepting appointments globally.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDeadlineModalOpen(false)}
                    className="p-2 hover:bg-slate-200/60 rounded-xl transition-all text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Controls Bar (Month & Year Selector) */}
                <div className="px-6 sm:px-8 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                  <button
                    onClick={() => {
                      const prev = new Date(deadlineModalMonth.getFullYear(), deadlineModalMonth.getMonth() - 1, 1);
                      setDeadlineModalMonth(prev);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <ChevronLeft size={18} /> Prev
                  </button>

                  <div className="flex items-center gap-2">
                    <select
                      value={deadlineModalMonth.getMonth()}
                      onChange={(e) => setDeadlineModalMonth(new Date(deadlineModalMonth.getFullYear(), parseInt(e.target.value), 1))}
                      className="bg-slate-50 border border-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider py-2 px-3 rounded-xl hover:border-emerald-400 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {[
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map((m, idx) => (
                        <option key={m} value={idx}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      value={deadlineModalMonth.getFullYear()}
                      onChange={(e) => setDeadlineModalMonth(new Date(parseInt(e.target.value), deadlineModalMonth.getMonth(), 1))}
                      className="bg-slate-50 border border-slate-200 text-slate-800 font-black text-xs tracking-wider py-2 px-3 rounded-xl hover:border-emerald-400 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      const next = new Date(deadlineModalMonth.getFullYear(), deadlineModalMonth.getMonth() + 1, 1);
                      setDeadlineModalMonth(next);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>

                {/* Full Calendar Grid Container */}
                <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-7 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                      <span key={idx} className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-1">
                        {day}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {renderModalCalendar()}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 sm:px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <div className="bg-emerald-50 text-emerald-900 border border-emerald-200/60 px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2">
                    <CalendarCheck size={18} className="text-emerald-600" />
                    <span>Selected Deadline: </span>
                    <span className="text-emerald-950 font-black">
                      {tempDeadline ? new Date(tempDeadline + 'T00:00:00').toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' }) : 'None'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setIsDeadlineModalOpen(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyDeadlineModal}
                      disabled={saving}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Saving...' : (
                        <>
                          <Check size={16} /> Confirm & Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default OfficeSchedule;

import { useState } from 'react';
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
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type OfficeStatus = 'open' | 'morning_only' | 'afternoon_only' | 'closed' | 'holiday';

interface OfficeConfig {
  status: OfficeStatus;
  note?: string;
  startTime?: string;
  endTime?: string;
}

const OfficeSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Default deadline to 2 months from now
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date.toISOString().split('T')[0];
  };

  const [maxAvailableDate, setMaxAvailableDate] = useState<string>(getDefaultDeadline());
  const [officeSchedule, setOfficeSchedule] = useState<{ [key: string]: OfficeConfig }>({});

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const todayStr = formatDate(new Date());
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getOfficeConfig = (date: Date) => {
    const key = formatDate(date);
    const config = officeSchedule[key];
    if (config) return config;

    // Default config for weekdays
    return {
      status: 'open' as OfficeStatus,
      startTime: "08:00",
      endTime: "17:00",
      note: ""
    };
  };

  const setOfficeStatus = (status: OfficeStatus, note: string = "", startTime?: string, endTime?: string) => {
    if (!selectedDate) return;
    const dateKey = formatDate(selectedDate);
    const existing = getOfficeConfig(selectedDate);

    setOfficeSchedule({
      ...officeSchedule,
      [dateKey]: {
        status,
        note: note !== undefined ? note : (existing.note || ""),
        startTime: startTime !== undefined ? startTime : (existing.startTime || "08:00"),
        endTime: endTime !== undefined ? endTime : (existing.endTime || "17:00")
      }
    });
  };

  const getStatusConfig = (status: OfficeStatus) => {
    switch (status) {
      case 'open': return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Regular Day', icon: Sun };
      case 'morning_only': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Morning Only', icon: Sunrise };
      case 'afternoon_only': return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Afternoon Only', icon: Sunset };
      case 'closed': return { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Full Closure', icon: Building2 };
      case 'holiday': return { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Holiday', icon: Palmtree };
      default: return { bg: 'bg-slate-50', text: 'text-slate-400', label: 'Not Set', icon: Info };
    }
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentDate);
    const firstDay = startOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-slate-100 bg-slate-50/30"></div>);
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
          className={`h-24 md:h-32 border border-slate-100 p-3 text-left transition-all relative overflow-hidden ${weekend || isPastDate
              ? 'bg-slate-50 cursor-not-allowed opacity-40'
              : isPastDeadline
                ? 'bg-slate-100/50 grayscale opacity-60'
                : isSelected
                  ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/30 z-10'
                  : 'bg-white hover:bg-slate-50'
            }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-black ${weekend || isPastDate ? 'text-slate-300' : isPastDeadline ? 'text-slate-400' : isSelected ? 'text-emerald-700' : isToday ? 'text-emerald-600 underline decoration-2 underline-offset-4' : 'text-slate-600'
              }`}>
              {d}
            </span>
            {!weekend && !isPastDate && (
              <div className="flex flex-col items-end gap-1">
                <div className={`p-1 rounded-md ${statusInfo.bg} ${statusInfo.text}`}>
                  <StatusIcon size={12} strokeWidth={3} />
                </div>
                {isPastDeadline && (
                  <div className="bg-slate-200 text-slate-500 p-1 rounded-md" title="Past Booking Deadline">
                    <CalendarCheck size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1 mt-auto">
            {isPastDeadline ? (
              <div className="text-[8px] font-black uppercase tracking-tight text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm inline-block">
                No Booking
              </div>
            ) : !weekend && (
              <div className={`text-[9px] font-black uppercase tracking-tight ${statusInfo.bg} ${statusInfo.text} px-1.5 py-0.5 rounded-sm inline-block`}>
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
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-900 text-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">{renderCalendar()}</div>
          </div>

          <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-8 items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-full">Global Indicators</p>
            {(['morning_only', 'afternoon_only', 'closed', 'holiday'] as OfficeStatus[]).map(s => {
              const info = getStatusConfig(s);
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${info.bg} ${info.text} flex items-center justify-center shadow-sm`}><info.icon size={18} /></div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{info.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between bg-emerald-900 p-4 rounded-lg text-white shadow-2xl shadow-emerald-900/20 w-full">
            <button
              onClick={() => changeMonth(-1)}
              disabled={currentDate.getFullYear() <= new Date().getFullYear() && currentDate.getMonth() <= new Date().getMonth()}
              className="p-2 hover:bg-emerald-800 rounded-lg transition-all disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black uppercase tracking-widest">{currentDate.toLocaleString('default', { month: 'long' })}</span>
              <span className="text-[10px] font-bold opacity-60 tracking-[0.3em]">{currentDate.getFullYear()}</span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              disabled={currentDate.getFullYear() >= 2040 && currentDate.getMonth() >= 11}
              className="p-2 hover:bg-emerald-800 rounded-lg transition-all disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
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

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Accepting until</span>
                  <span className="text-sm font-black text-slate-700">
                    {new Date(maxAvailableDate).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={maxAvailableDate}
                    min={todayStr}
                    onChange={(e) => setMaxAvailableDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-emerald-700 pointer-events-none">
                    <CalendarCheck size={20} />
                  </div>
                </div>
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
                className="bg-white rounded-lg border border-slate-200 p-8 pb-10 shadow-2xl shadow-slate-200/60 flex flex-col h-fit relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full -mr-32 -mt-32 z-0"></div>
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-emerald-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl"><CalendarIcon size={32} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Configuration for</p>
                      <h4 className="text-2xl font-black text-slate-900">{selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
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

                  {/* Time Adjustments */}
                  {(officeSchedule[formatDate(selectedDate)]?.status !== 'closed' && officeSchedule[formatDate(selectedDate)]?.status !== 'holiday') && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Clock size={14} className="text-emerald-600" /> Custom Office Hours</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Start Time</label>
                          <input
                            type="time"
                            value={officeSchedule[formatDate(selectedDate)]?.startTime || "08:00"}
                            onChange={(e) => setOfficeStatus(officeSchedule[formatDate(selectedDate)]?.status || 'open', undefined, e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">End Time</label>
                          <input
                            type="time"
                            value={officeSchedule[formatDate(selectedDate)]?.endTime || "17:00"}
                            onChange={(e) => setOfficeStatus(officeSchedule[formatDate(selectedDate)]?.status || 'open', undefined, undefined, e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Info size={14} className="text-emerald-600" /> Administrative Note</h5>
                    <textarea
                      placeholder="e.g. Center-wide training session..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                      value={officeSchedule[formatDate(selectedDate)]?.note || ""}
                      onChange={(e) => setOfficeStatus(officeSchedule[formatDate(selectedDate)]?.status || 'open', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-12 pt-4 relative z-10">
                  <div className="bg-slate-900 p-5 rounded-2xl flex gap-4 mb-6 shadow-xl">
                    <AlertCircle size={20} className="text-emerald-400 shrink-0" />
                    <p className="text-[9px] font-bold text-white/80 uppercase leading-relaxed tracking-wider">Updates reflect globally for all users and staff members instantly.</p>
                  </div>
                  <button className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30">Confirm Changes</button>
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
    </motion.div>
  );
};

export default OfficeSchedule;

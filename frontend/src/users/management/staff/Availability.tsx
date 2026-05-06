import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Availability = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  // Empty by default, we will handle the "Full Day" logic implicitly
  const [availability, setAvailability] = useState<{ [key: string]: string[] }>({});

  const timeSlots = [
    "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
    "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM"
  ];

  const morningSlots = ["08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM"];
  const afternoonSlots = ["01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM"];
  const fullDaySlots = [...morningSlots, ...afternoonSlots];

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  const getSlotsForDate = (date: Date) => {
    const key = formatDate(date);
    if (availability[key] !== undefined) return availability[key];
    if (isWeekend(date)) return [];
    return fullDaySlots;
  };

  const setPreset = (type: 'morning' | 'afternoon' | 'full' | 'clear') => {
    if (!selectedDate) return;
    const dateKey = formatDate(selectedDate);
    if (type === 'morning') setAvailability({ ...availability, [dateKey]: morningSlots });
    if (type === 'afternoon') setAvailability({ ...availability, [dateKey]: afternoonSlots });
    if (type === 'full') setAvailability({ ...availability, [dateKey]: fullDaySlots });
    if (type === 'clear') setAvailability({ ...availability, [dateKey]: [] }); // Explicitly empty
  };


  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const toggleTimeSlot = (time: string) => {
    if (!selectedDate) return;
    const dateKey = formatDate(selectedDate);
    const currentSlots = getSlotsForDate(selectedDate);
    
    if (currentSlots.includes(time)) {
      setAvailability({ ...availability, [dateKey]: currentSlots.filter(t => t !== time) });
    } else {
      setAvailability({ ...availability, [dateKey]: [...currentSlots, time].sort() });
    }
  };

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(nextDate);
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
      const isToday = formatDate(date) === formatDate(new Date());
      const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
      const slots = getSlotsForDate(date);
      const hasAvailability = slots.length > 0;
      const weekend = isWeekend(date);

      days.push(
        <button
          key={d}
          onClick={() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date >= today) setSelectedDate(date);
          }}
          disabled={date < new Date(new Date().setHours(0,0,0,0))}
          className={`h-24 md:h-32 border border-slate-100 p-3 text-left transition-all relative overflow-hidden ${
            isSelected ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/30 z-10' : date < new Date(new Date().setHours(0,0,0,0)) ? 'bg-slate-50 opacity-40 cursor-not-allowed' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-black ${
              isSelected ? 'text-emerald-700' : isToday ? 'text-emerald-600 underline decoration-2 underline-offset-4' : 'text-slate-600'
            }`}>
              {d}
            </span>
            {hasAvailability && (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></div>
            )}
            {weekend && (
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Off</span>
            )}
          </div>
          <div className="mt-2 space-y-1">
            {slots.slice(0, 2).map((time, i) => (
              <div key={i} className="text-[9px] font-black uppercase tracking-tight bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-sm truncate">
                {time.split(' ')[0]}
              </div>
            ))}
            {slots.length > 2 && (
              <div className="text-[9px] font-black text-slate-400 pl-1">
                +{slots.length - 2} more
              </div>
            )}
            {!hasAvailability && !weekend && (
              <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest pl-1">
                Unavailable
              </div>
            )}
          </div>
        </button>
      );
    }
    return days;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-40"
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Work Schedule</h2>
          <p className="text-slate-500 font-medium">Weekdays are available full-day by default. Only remove slots when you are busy.</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col">
            <div className="grid grid-cols-7 bg-slate-900 text-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {renderCalendar()}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between bg-emerald-900 p-4 rounded-lg text-white shadow-2xl shadow-emerald-900/20 w-full">
            <button onClick={() => changeMonth(-1)} disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()} className="p-2 hover:bg-emerald-800 rounded-xl transition-all disabled:opacity-30">
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black uppercase tracking-widest">{currentDate.toLocaleString('default', { month: 'long' })}</span>
              <span className="text-[10px] font-bold opacity-60 tracking-[0.3em]">{currentDate.getFullYear()}</span>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-emerald-800 rounded-xl transition-all">
              <ChevronRight size={20} />
            </button>
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
                    <div className="w-16 h-16 bg-emerald-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl"><Clock size={32} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Time Slots for</p>
                      <h4 className="text-2xl font-black text-slate-900">{selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}</h4>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Actions</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Morning Only', type: 'morning' },
                        { label: 'Afternoon Only', type: 'afternoon' },
                        { label: 'Full Day', type: 'full' },
                        { label: 'Clear All', type: 'clear' }
                      ].map(btn => (
                        <button
                          key={btn.type}
                          onClick={() => setPreset(btn.type as any)}
                          className="py-4 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900 hover:text-white transition-all border border-slate-100"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Plus size={14} className="text-emerald-600" /> Individual Slots
                    </h5>
                    <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {timeSlots.map(time => {
                        const isSelected = getSlotsForDate(selectedDate).includes(time);
                        return (
                          <button
                            key={time}
                            onClick={() => toggleTimeSlot(time)}
                            className={`py-4 px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border flex items-center justify-between ${
                              isSelected 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                              : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-100 hover:bg-slate-50'
                            }`}
                          >
                            {time}
                            {isSelected ? <CheckCircle2 size={16} className="text-emerald-600" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-4 relative z-10">
                  <div className="bg-slate-900 p-5 rounded-2xl flex gap-4 mb-6 shadow-xl">
                    <AlertCircle size={20} className="text-emerald-400 shrink-0" />
                    <p className="text-[9px] font-bold text-white/80 uppercase leading-relaxed tracking-wider">Default: Weekdays are fully open. Remove slots only when busy.</p>
                  </div>
                  <button className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30">Confirm Availability</button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center h-full min-h-[600px]">
                <div className="w-24 h-24 bg-white shadow-2xl rounded-lg flex items-center justify-center mb-8"><CalendarIcon size={48} className="text-slate-200" /></div>
                <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] mb-3">No Date Selected</h4>
                <p className="text-slate-400 font-bold text-sm max-w-[240px] leading-relaxed italic">Select a date to manage your individual time slots.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Availability;
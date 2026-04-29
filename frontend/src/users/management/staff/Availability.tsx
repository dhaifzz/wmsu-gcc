import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Availability = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availability, setAvailability] = useState<{ [key: string]: string[] }>({
    "2024-05-24": ["09:00 AM - 10:00 AM", "02:00 PM - 03:00 PM"],
    "2024-05-25": ["08:00 AM - 12:00 PM"],
  });
  const [activeGlobalPreset, setActiveGlobalPreset] = useState<string | null>(null);

  const timeSlots = [
    "08:00 AM - 09:00 AM", 
    "09:00 AM - 10:00 AM", 
    "10:00 AM - 11:00 AM", 
    "11:00 AM - 12:00 PM",
    "01:00 PM - 02:00 PM", 
    "02:00 PM - 03:00 PM", 
    "03:00 PM - 04:00 PM", 
    "04:00 PM - 05:00 PM"
  ];

  const morningSlots = ["08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM"];
  const afternoonSlots = ["01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM"];

  const setPreset = (type: 'morning' | 'afternoon' | 'full' | 'clear') => {
    if (!selectedDate) return;
    const dateKey = formatDate(selectedDate);
    if (type === 'morning') setAvailability({ ...availability, [dateKey]: morningSlots });
    if (type === 'afternoon') setAvailability({ ...availability, [dateKey]: afternoonSlots });
    if (type === 'full') setAvailability({ ...availability, [dateKey]: [...morningSlots, ...afternoonSlots] });
    if (type === 'clear') {
      const newAvailability = { ...availability };
      delete newAvailability[dateKey];
      setAvailability(newAvailability);
    }
  };

  const applyGlobalPreset = (type: 'everyday' | 'mornings' | 'afternoons' | 'reset') => {
    if (type === 'reset') {
      setAvailability({});
      setActiveGlobalPreset(null);
      return;
    }

    const totalDays = daysInMonth(currentDate);
    const newAvailability = { ...availability };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      // Skip weekends and past days
      if (date.getDay() === 0 || date.getDay() === 6 || date < today) continue;
      
      const dateKey = formatDate(date);
      if (type === 'everyday') newAvailability[dateKey] = [...morningSlots, ...afternoonSlots];
      if (type === 'mornings') newAvailability[dateKey] = morningSlots;
      if (type === 'afternoons') newAvailability[dateKey] = afternoonSlots;
    }
    setAvailability(newAvailability);
    setActiveGlobalPreset(type);
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const toggleTimeSlot = (time: string) => {
    if (!selectedDate) return;
    const dateKey = formatDate(selectedDate);
    const currentSlots = availability[dateKey] || [];
    
    if (currentSlots.includes(time)) {
      setAvailability({
        ...availability,
        [dateKey]: currentSlots.filter(t => t !== time)
      });
    } else {
      setAvailability({
        ...availability,
        [dateKey]: [...currentSlots, time].sort()
      });
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

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-slate-50 bg-slate-50/30"></div>);
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const isToday = formatDate(date) === formatDate(new Date());
      const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
      const hasAvailability = (availability[formatDate(date)] || []).length > 0;

      days.push(
        <button
          key={d}
          onClick={() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date >= today) {
              setSelectedDate(date);
            }
          }}
          disabled={date < new Date(new Date().setHours(0,0,0,0))}
          className={`h-24 md:h-32 border border-slate-50 p-2 text-left transition-all relative group overflow-hidden ${
            isSelected ? 'bg-emerald-50' : date < new Date(new Date().setHours(0,0,0,0)) ? 'bg-slate-50/50 cursor-not-allowed opacity-40' : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold ${
              isSelected ? 'text-emerald-700' : isToday ? 'text-emerald-600 underline decoration-2 underline-offset-4' : 'text-slate-600'
            }`}>
              {d}
            </span>
            {hasAvailability && (
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></div>
            )}
          </div>
          <div className="mt-2 space-y-1">
            {(availability[formatDate(date)] || []).slice(0, 2).map((time, i) => (
              <div key={i} className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md truncate">
                {time}
              </div>
            ))}
            {(availability[formatDate(date)] || []).length > 2 && (
              <div className="text-[9px] font-black text-slate-400 pl-2">
                + {(availability[formatDate(date)] || []).length - 2} more
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
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Manage Availability</h2>
          <p className="text-slate-500 font-medium">Set your working hours and available slots for client's bookings.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Quick Fill Month:</p>
          {[
            { label: 'Everyday', type: 'everyday' },
            { label: 'Mornings', type: 'mornings' },
            { label: 'Afternoons', type: 'afternoons' }
          ].map(preset => (
            <button
              key={preset.type}
              onClick={() => applyGlobalPreset(preset.type as any)}
              className={`px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                activeGlobalPreset === preset.type 
                ? 'bg-emerald-600 border-emerald-600 text-white' 
                : 'bg-white border-slate-200 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => applyGlobalPreset('reset')}
            className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-full text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <Trash2 size={12} />
            Reset All
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <button 
            onClick={() => changeMonth(-1)}
            disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
            className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-600 min-w-[150px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-emerald-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Calendar View */}
        <div className="lg:col-span-8 h-full">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden h-full flex flex-col">
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className="lg:col-span-4 h-full">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={formatDate(selectedDate)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-lg border border-slate-200 p-8 shadow-xl shadow-slate-200/50 flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shadow-inner">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Date</p>
                    <h4 className="text-xl font-black text-slate-800">
                      {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h4>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex flex-col gap-3">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Actions</h5>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPreset('morning')}
                        className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                      >
                        Morning Only
                      </button>
                      <button 
                        onClick={() => setPreset('afternoon')}
                        className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                      >
                        Afternoon Only
                      </button>
                      <button 
                        onClick={() => setPreset('clear')}
                        className="px-4 py-3 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 flex items-center justify-center"
                        title="Clear All"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Plus size={14} className="text-emerald-500" />
                    Available Time Slots
                  </h5>
                  <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {timeSlots.map(time => {
                      const isSelected = (availability[formatDate(selectedDate)] || []).includes(time);
                      return (
                        <button
                          key={time}
                          onClick={() => toggleTimeSlot(time)}
                          className={`py-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                            isSelected 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[0.98]' 
                            : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/50'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100">
                  <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-100 mb-6">
                    <AlertCircle size={18} className="text-amber-600 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-800/80 leading-relaxed uppercase tracking-wider">
                      Changing these slots will update the student booking calendar in real-time.
                    </p>
                  </div>
                  <button className="w-full py-5 bg-emerald-900 text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98]">
                    Save Availability
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-lg border border-slate-100 p-8 flex flex-col items-center justify-center text-center h-[600px] border-dashed border-2">
                <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-lg flex items-center justify-center mb-4">
                  <CalendarIcon size={32} />
                </div>
                <p className="text-slate-400 font-bold italic">Select a date from the calendar to manage time slots</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Availability;

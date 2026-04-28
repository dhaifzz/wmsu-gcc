import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Info, ClipboardCheck } from 'lucide-react';

const Assessment = ({ onBack }: { onBack: () => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const header = { title: "Psychological Assessment", subtitle: "Schedule your testing session" };
  const requirements = { title: "Requirements", content: "Students must complete the Personal Data Form and have their Student ID ready before the assessment." };
  const duration = { title: "Test Duration", content: "The assessment typically takes between 30 to 45 minutes to complete." };
  const important = { title: "Important Note", content: "Please arrive at the GCC office 15 minutes before your scheduled slot for verification." };
  const timeSlots = ["08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM"];

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
          className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
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
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm h-full flex flex-col">
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
                disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
                className="p-3 hover:bg-emerald-50 rounded-2xl border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => changeMonth(1)}
                className="p-3 hover:bg-emerald-50 rounded-2xl border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all"
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
                  onClick={() => !isPastDay(day) && setSelectedDate(day)}
                  disabled={isPastDay(day)}
                  className={`
                    aspect-square rounded-[1.75rem] flex items-center justify-center font-bold text-lg transition-all
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

          {/* Assessment Tips Section */}
          <div className="mt-8 grid grid-cols-1 gap-3">
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50">
              <div className="flex items-center gap-3 mb-2 text-emerald-600">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                  <ClipboardCheck size={16} />
                </div>
                <span className="text-[12px] font-black uppercase tracking-widest">{requirements.title}</span>
              </div>
              <p className="text-[13px] text-slate-500 font-bold leading-relaxed">
                {requirements.content}
              </p>
            </div>
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50">
              <div className="flex items-center gap-3 mb-2 text-emerald-600">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
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
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-[1.25rem] flex items-center justify-center">
                <Clock size={24} />
              </div>
              <h3 className="font-black text-xl text-emerald-950">Select Time</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`
                    py-4 px-6 rounded-2xl font-bold text-sm transition-all border text-left flex items-center justify-between group
                    ${selectedTime === time 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50'}
                  `}
                >
                  {time}
                  <div className={`w-2 h-2 rounded-full transition-all ${selectedTime === time ? 'bg-white' : 'bg-transparent group-hover:bg-emerald-400'}`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-emerald-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-950/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10 relative z-10">
              <ClipboardCheck size={24} className="text-emerald-400" />
            </div>
            <h3 className="font-black text-xl mb-8 relative z-10">Summary</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
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

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 mb-0.5">Selected Time</p>
                  <p className="font-bold text-sm">{selectedTime || '---'}</p>
                </div>
              </div>
            </div>

            <button
              disabled={!selectedDate || !selectedTime}
              className={`
                w-full mt-10 py-5 rounded-[1.5rem] font-black text-sm transition-all
                ${selectedDate && selectedTime 
                  ? 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-xl scale-[1.02] active:scale-[0.98]' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
              `}
            >
              Confirm Appointment
            </button>
          </div>

          {/* Important Info Card */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200">
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

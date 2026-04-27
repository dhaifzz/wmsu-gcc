import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  LayoutGrid,
  ListChecks,
  AlertCircle,
} from 'lucide-react';
import { showAlert } from '../../../components/modal-notification/sweetalert';
import toast from 'react-hot-toast';
import Shifting from '../../clients/Shifting';

interface OverviewProps {
  userName: string;
  onNavigate: (tab: string) => void;
}

// ── Booking sub-view ──────────────────────────────────────────────────────────
const BookingPanel = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<'type' | 'calendar' | 'shifting'>('type');
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Placeholder admin user object for Shifting component
  const adminAsUser = {
    name: 'Super Admin',
    studentId: 'ADM-00001',
    type: 'admin',
    course: 'N/A',
  };

  const services = [
    { id: 'counseling', label: 'Counseling', icon: MessageCircle, color: 'bg-blue-500' },
    { id: 'assessment', label: 'Assessment', icon: ClipboardCheck, color: 'bg-teal-500' },
    { id: 'shifting', label: 'Shifting Exam', icon: RefreshCw, color: 'bg-rose-500' },
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isPast = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < today;
  };

  const changeMonth = (offset: number) => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    const today = new Date();
    if (next.getMonth() < today.getMonth() && next.getFullYear() <= today.getFullYear()) return;
    setCurrentDate(next);
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const timeSlots = [
    '08:00 AM – 09:00 AM', '09:00 AM – 10:00 AM',
    '10:00 AM – 11:00 AM', '11:00 AM – 12:00 PM',
    '01:00 PM – 02:00 PM', '02:00 PM – 03:00 PM',
    '03:00 PM – 04:00 PM', '04:00 PM – 05:00 PM',
  ];

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

  // If shifting is selected, render the full Shifting component
  if (step === 'shifting') {
    return (
      <Shifting
        onBack={() => { setStep('type'); setServiceType(null); }}
        user={adminAsUser}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
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
              className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 group cursor-pointer transition-all flex flex-col text-left"
            >
              <div className={`w-14 h-14 ${s.color} text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
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
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-slate-50">
                <ChevronLeft size={20} />
              </button>
              <h4 className="text-lg font-black text-slate-900">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h4>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-slate-50">
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
              {days.map(day => (
                <button
                  key={day}
                  disabled={isPast(day)}
                  onClick={() => setSelectedDay(day)}
                  className={`h-10 w-full rounded-xl text-sm font-bold transition-all 
                    ${isPast(day) ? 'text-slate-200 cursor-not-allowed' : ''}
                    ${selectedDay === day ? 'bg-teal-600 text-white shadow-lg' : !isPast(day) ? 'hover:bg-teal-50 text-slate-700' : ''}
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
            <h4 className="font-black text-slate-900 mb-4">
              {selectedDay
                ? `Available Slots — ${currentDate.toLocaleString('default', { month: 'short' })} ${selectedDay}`
                : 'Pick a date first'}
            </h4>
            {selectedDay ? (
              <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold border transition-all
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
                className="flex-1 py-4 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all"
              >
                Back
              </button>
              <button
                disabled={!selectedDay || !selectedTime}
                onClick={handleConfirm}
                className="flex-1 py-4 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
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

// ── Approval Queue ─────────────────────────────────────────────────────────────
const pendingQueue = [
  { id: 1, name: 'Juan Luna', type: 'Counseling', date: 'May 24, 2025', time: '08:00 AM – 09:00 AM', level: 'College • BSCS' },
  { id: 2, name: 'Maria Clara', type: 'Assessment', date: 'May 25, 2025', time: '10:00 AM – 11:00 AM', level: 'High School • Gr. 12' },
  { id: 3, name: 'Dr. Jose Rizal', type: 'Shifting', date: 'May 26, 2025', time: '01:00 PM – 02:00 PM', level: 'Faculty' },
  { id: 4, name: 'Apolinario Mabini', type: 'Counseling', date: 'May 26, 2025', time: '03:00 PM – 04:00 PM', level: 'Outside Client' },
];

const typeColor: Record<string, string> = {
  Counseling: 'bg-blue-100 text-blue-700',
  Assessment: 'bg-teal-100 text-teal-700',
  Shifting: 'bg-rose-100 text-rose-700',
};

// ── Main Overview ──────────────────────────────────────────────────────────────
const Overview = ({ userName, onNavigate }: OverviewProps) => {
  const [view, setView] = useState<'main' | 'book'>('main');
  const [search, setSearch] = useState('');
  const [queue, setQueue] = useState(pendingQueue);

  const filtered = queue.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id: number) => {
    const result = await showAlert.confirm('Approve Appointment', 'Approve this appointment request?', 'Approve', 'Cancel');
    if (result.isConfirmed) {
      setQueue(q => q.filter(a => a.id !== id));
      toast.success('Appointment approved!');
    }
  };

  const handleDecline = async (id: number) => {
    const result = await showAlert.confirm('Decline Appointment', 'Are you sure you want to decline this appointment?', 'Decline', 'Cancel');
    if (result.isConfirmed) {
      setQueue(q => q.filter(a => a.id !== id));
      toast.error('Appointment declined.');
    }
  };

  if (view === 'book') {
    return <BookingPanel onBack={() => setView('main')} />;
  }

  return (
    <motion.div
      key="main-overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Admin Control Center</span>
          </div>
          <h3 className="text-4xl font-black tracking-tight">Welcome back, {userName.split(' ')[0]}!</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage appointments and oversee system activity.</p>
        </div>
        <button
          onClick={() => setView('book')}
          className="flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-teal-200 shrink-0"
        >
          <Plus size={20} />
          Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
            <Calendar size={24} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Appointments</p>
          <p className="text-2xl font-black">248</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Pending Approval</p>
          <p className="text-2xl font-black">{queue.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Active Users</p>
          <p className="text-2xl font-black">1,204</p>
        </div>
      </div>

      {/* Approval Queue */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
              <ListChecks size={20} className="text-amber-600" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">Pending Approvals</h4>
              <p className="text-slate-400 text-xs font-bold">{queue.length} appointment{queue.length !== 1 ? 's' : ''} awaiting your action</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400 italic text-sm">
              No pending appointments found.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(appt => (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 font-black shrink-0 text-sm">
                      {appt.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate">{appt.name}</p>
                      <p className="text-slate-400 text-xs font-bold">{appt.level}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${typeColor[appt.type] ?? 'bg-slate-100 text-slate-600'}`}>
                    {appt.type}
                  </span>

                  <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs font-bold shrink-0">
                    <Calendar size={13} />
                    {appt.date}
                    <Clock size={13} className="ml-2" />
                    {appt.time}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(appt.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-teal-200 hover:border-teal-600"
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecline(appt.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-200 hover:border-rose-600"
                    >
                      <XCircle size={14} />
                      Decline
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick module nav */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <LayoutGrid size={20} className="text-slate-400" />
          <h4 className="text-xl font-black text-slate-800">All Appointment Modules</h4>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { id: 'counseling', label: 'Counseling', icon: MessageCircle, color: 'bg-blue-500' },
            { id: 'assessment', label: 'Assessment', icon: ClipboardCheck, color: 'bg-teal-500' },
            { id: 'shifting', label: 'Shifting', icon: RefreshCw, color: 'bg-rose-500' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 group cursor-pointer transition-all flex items-center gap-4 text-left"
            >
              <div className={`w-12 h-12 ${s.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                <s.icon size={22} />
              </div>
              <div>
                <p className="font-black text-slate-900">{s.label} Appointments</p>
                <p className="text-xs text-slate-400 font-bold">View all & manage</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 ml-auto group-hover:text-teal-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;


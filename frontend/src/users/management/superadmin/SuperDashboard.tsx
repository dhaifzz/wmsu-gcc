import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
} from 'lucide-react';
import { showAlert } from '../../../components/modal-notification/sweetalert';
import toast from 'react-hot-toast';
import Shifting from '../../clients/Shifting';
import { useAuth } from '../../../auth/AuthContext';
import { analyticsApi, appointmentApi, cmsApi, type AnalyticsDashboardResponse } from '../../../lib/api';

interface OverviewProps {
  userName: string;
  onNavigate: (tab: string) => void;
}

// ── Office schedule types (matching Counseling / Assessment) ──────────────────
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

// ── Booking sub-view ──────────────────────────────────────────────────────────
const BookingPanel = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<'type' | 'calendar' | 'shifting'>('type');
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // ── Office schedule state ──────────────────────────────────────────────────
  const [officeSchedule, setOfficeSchedule] = useState<{ [key: string]: OfficeConfig }>({});
  const [maxAvailableDate, setMaxAvailableDate] = useState<string | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

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

  // If shifting is selected, render the full Shifting component
  if (step === 'shifting') {
    return (
      <Shifting
        onBack={() => { setStep('type'); setServiceType(null); }}
        user={adminAsUser}
      />
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

// ── Type badge colors ──────────────────────────────────────────────────────────
const typeColor: Record<string, string> = {
  Counseling: 'bg-blue-100 text-blue-700',
  Assessment: 'bg-teal-100 text-teal-700',
  Shifting: 'bg-rose-100 text-rose-700',
};

// ── Pending appointment item shape (from analytics API) ────────────────────────
interface PendingItem {
  id: string;
  student: string;
  level: string;
  type: string;
  date: string;
  time: string;
  status: string;
}

// ── Main Overview ──────────────────────────────────────────────────────────────
const Overview = ({ userName, onNavigate }: OverviewProps) => {
  const { accessToken: token } = useAuth();
  const [view, setView] = useState<'main' | 'book'>('main');
  const [search, setSearch] = useState('');

  // ── Analytics data state ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboardResponse | null>(null);
  const [queue, setQueue] = useState<PendingItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await analyticsApi.getAnalyticsDashboardData(token);
      if (res.ok && res.data) {
        setAnalyticsData(res.data);
        setQueue(res.data.pendingAppointmentsList ?? []);
      } else {
        toast.error('Failed to load dashboard data.');
      }
    } catch {
      toast.error('An error occurred while loading dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Filtered queue ─────────────────────────────────────────────────────────
  const filtered = queue.filter(a =>
    a.student.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );

  // ── Resolve API endpoint for approve/decline by type ──────────────────────
  const evaluateAppointment = async (id: string, type: string, action: 'approve' | 'decline') => {
    if (!token) return false;
    const payload = { action };
    const lowerType = type.toLowerCase();
    let res;
    if (lowerType.includes('shifting')) {
      res = await appointmentApi.directorEvaluateShiftingAppointment(id, payload, token);
    } else if (lowerType.includes('assessment')) {
      res = await appointmentApi.directorEvaluateAssessmentAppointment(id, payload, token);
    } else {
      res = await appointmentApi.directorEvaluateCounselingAppointment(id, payload, token);
    }
    return res.ok;
  };

  const handleApprove = async (item: PendingItem) => {
    const result = await showAlert.confirm(
      'Approve Appointment',
      `Approve the ${item.type} appointment for ${item.student}?`,
      'Approve',
      'Cancel'
    );
    if (result.isConfirmed) {
      const ok = await evaluateAppointment(item.id, item.type, 'approve');
      if (ok) {
        setQueue(q => q.filter(a => a.id !== item.id));
        toast.success('Appointment approved!');
      } else {
        toast.error('Failed to approve appointment.');
      }
    }
  };

  const handleDecline = async (item: PendingItem) => {
    const result = await showAlert.confirm(
      'Decline Appointment',
      `Decline the ${item.type} appointment for ${item.student}?`,
      'Decline',
      'Cancel'
    );
    if (result.isConfirmed) {
      const ok = await evaluateAppointment(item.id, item.type, 'decline');
      if (ok) {
        setQueue(q => q.filter(a => a.id !== item.id));
        toast.error('Appointment declined.');
      } else {
        toast.error('Failed to decline appointment.');
      }
    }
  };

  if (view === 'book') {
    return <BookingPanel onBack={() => setView('main')} />;
  }

  // ── Stats shortcuts ────────────────────────────────────────────────────────
  const stats = analyticsData?.stats;
  const totalAppointments = stats?.totalAppointments ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;

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
          className="flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-lg transition-all shadow-lg shadow-teal-200 shrink-0"
        >
          <Plus size={20} />
          Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Appointments */}
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4">
            <Calendar size={24} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Appointments</p>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-bold">Loading…</span>
            </div>
          ) : (
            <p className="text-2xl font-black">{totalAppointments.toLocaleString()}</p>
          )}
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Pending Approval</p>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-bold">Loading…</span>
            </div>
          ) : (
            <p className="text-2xl font-black">{queue.length}</p>
          )}
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Registered Users</p>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-bold">Loading…</span>
            </div>
          ) : (
            <p className="text-2xl font-black">{totalUsers.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Approval Queue */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
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
              className="bg-slate-50 border border-slate-100 rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={32} className="animate-spin text-teal-500" />
            <span className="text-sm font-bold">Loading appointments…</span>
          </div>
        ) : (
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
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-black shrink-0 text-sm">
                        {appt.student.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate">{appt.student}</p>
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
                        onClick={() => handleApprove(appt)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-teal-200 hover:border-teal-600"
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(appt)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-rose-200 hover:border-rose-600"
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
        )}
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
              className="p-6 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 group cursor-pointer transition-all flex items-center gap-4 text-left"
            >
              <div className={`w-12 h-12 ${s.color} text-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
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

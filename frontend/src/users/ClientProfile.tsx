import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  MessageCircle,
  ClipboardCheck,
  RefreshCw,
  LogOut,
  GraduationCap,
  Mail,
  Award,
  X,
  Calendar,
  Clock,
  ChevronRight,
  Edit2,
  Phone,
  MapPin,
  UserCheck,
  Save,
  UserRound
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { showAlert } from '../components/modal-notification/sweetalert';
import { showToast } from '../components/modal-notification/toast';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { appointmentApi, authApi } from '../lib/api';
import phAddresses from '../ph_addresses.json';

interface ProfileProps {
  user: {
    name: string;
    type: string;
    role?: string;
    email: string;
    educationLevel: string;
    studentId: string;
    college?: string;
    course?: string;
    school?: string;
    gradeLevel?: string;
    track?: string;
    department?: string;
    status?: string;
    sex?: string;
    [key: string]: any;
  };
}

const ClientProfile = ({ user }: ProfileProps) => {
  const theme = useTheme();
  const { user: authUser, signOut, accessToken, setAuthData, redirectPath } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    sex: '',
    city: '',
    barangay: '',
    street: ''
  });

  useEffect(() => {
    if (authUser) {
      setEditForm({
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        contactNumber: authUser.contactNumber,
        sex: authUser.sex,
        city: authUser.city || '',
        barangay: authUser.barangay || '',
        street: authUser.street || ''
      });
    }
  }, [authUser]);
  
  const handleLogout = async () => {
    const result = await showAlert.confirm('Logout', 'Are you sure you want to sign out?', 'Logout', 'Stay');
    if (result.isConfirmed) {
      await signOut();
      navigate('/');
    }
  };

  const [activity, setActivity] = useState({
    consultations: { count: 0, status: 'No Sessions' },
    assessments: { count: 0, status: 'No Progress' },
    shifting: { count: 0, status: 'No Request' }
  });
  const [rawHistory, setRawHistory] = useState<any[]>([]);
  const [historyModal, setHistoryModal] = useState<null | 'counseling' | 'assessment' | 'shifting'>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!accessToken) return;
      const result = await appointmentApi.getAppointmentHistory(accessToken);
      if (result.ok && result.data.history) setRawHistory(result.data.history);
      if (result.ok && result.data.history) {
        const history = result.data.history;
        
        // Consultations
        const completedConsultations = history.filter(item => 
          item.type === 'Counseling' && item.status === 'Completed'
        ).length;
        const activeConsultations = history.filter(item => 
          item.type === 'Counseling' && !['Completed', 'Cancelled', 'Rejected'].includes(item.status)
        ).length;

        // Assessments
        const completedAssessments = history.filter(item => 
          item.type.includes('Assessment') && item.status === 'Completed'
        ).length;
        const activeAssessments = history.filter(item => 
          item.type.includes('Assessment') && !['Completed', 'Cancelled', 'Rejected'].includes(item.status)
        ).length;

        // Shifting
        const shiftingRequests = history.filter(item => item.type === 'Shifting');
        const activeShifting = shiftingRequests.filter(item => 
          !['Completed', 'Cancelled', 'Rejected'].includes(item.status)
        ).length;

        setActivity({
          consultations: { 
            count: completedConsultations, 
            status: activeConsultations > 0 ? `${activeConsultations} Active Session${activeConsultations > 1 ? 's' : ''}` : `${completedConsultations} Session${completedConsultations !== 1 ? 's' : ''} Completed`
          },
          assessments: { 
            count: activeAssessments, 
            status: activeAssessments > 0 ? `${activeAssessments} Active Progress` : `${completedAssessments} Completed`
          },
          shifting: { 
            count: activeShifting, 
            status: activeShifting > 0 ? 'Active Request' : shiftingRequests.length > 0 ? 'Request Finished' : 'No Active Request'
          }
        });
      }
    };

    void fetchActivity();
  }, [accessToken]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    try {
      setSaving(true);
      const res = await authApi.updateProfile(editForm, accessToken);
      if (res.ok && res.data.user) {
        setAuthData(res.data.user, accessToken, redirectPath || '/student/dashboard');
        setIsEditing(false);
        showToast.success('Profile updated successfully');
      } else {
        showToast.error(res.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      showToast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Merge the prop user with the real authUser data for accurate display
  const displayUser = {
    ...user,
    name: authUser ? `${authUser.firstName} ${authUser.lastName}` : user.name,
    email: authUser?.email || user.email,
    educationLevel: authUser?.educationLevel || user.educationLevel,
    studentId: authUser?.schoolId?.toString() || authUser?.lrn?.toString() || authUser?.employeeId?.toString() || authUser?.id?.substring(0, 8).toUpperCase() || user.studentId,
    college: authUser?.collegeName || user.college,
    course: authUser?.courseName || user.course,
    school: authUser?.school || user.school,
    gradeLevel: authUser?.gradeLevel?.toString() || user.gradeLevel,
    track: authUser?.track || user.track,
    department: authUser?.department || user.department,
    status: authUser?.occupation || user.status,
    contactNumber: authUser?.contactNumber || "N/A",
    sex: authUser?.sex || user.sex || "Prefer not to say",
    city: authUser?.city || authUser?.address_city || "N/A",
    barangay: authUser?.barangay || authUser?.address_barangay || "N/A",
    street: authUser?.street || authUser?.address_street || "N/A"
  };

  // Determine avatar styling based on sex
  const getAvatarStyles = () => {
    const sex = displayUser.sex.toLowerCase();
    if (sex === 'male') return 'bg-blue-100 text-blue-500';
    if (sex === 'female') return 'bg-pink-100 text-pink-500';
    return 'bg-slate-200 text-slate-500';
  };

  const hourToTimeSlot: Record<number, string> = {
    8: '08:00 AM - 09:00 AM',
    9: '09:00 AM - 10:00 AM',
    10: '10:00 AM - 11:00 AM',
    13: '01:00 PM - 02:00 PM',
    14: '02:00 PM - 03:00 PM',
    15: '03:00 PM - 04:00 PM'
  };

  const renderHistoryModal = () => {
    if (!historyModal) return null;
    const isShifting = historyModal === 'shifting';
    const filtered = rawHistory.filter(item =>
      historyModal === 'counseling'
        ? item.type === 'Counseling'
        : historyModal === 'assessment'
        ? item.type?.includes('Assessment')
        : item.type === 'Shifting'
    );
    const active = filtered.find(item => !['Completed', 'Cancelled', 'Rejected'].includes(item.status));
    const modalTitle = historyModal === 'counseling' ? 'Counseling History' : historyModal === 'assessment' ? 'Assessment History' : 'Shifting Requests';
    const ModalIcon = historyModal === 'counseling' ? MessageCircle : historyModal === 'assessment' ? ClipboardCheck : RefreshCw;

    const formatStatusColor = (s: string) => {
      if (s === 'Completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (s === 'Cancelled' || s === 'Rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
      return 'bg-blue-50 text-blue-700 border-blue-200';
    };

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '—';
    const formatTime = (d: string) => d ? (hourToTimeSlot[new Date(d).getUTCHours()] || 'Scheduled') : '—';

    return (
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        onClick={() => setHistoryModal(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center gap-4 p-6 border-b border-slate-100">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              historyModal === 'counseling' ? 'bg-blue-500' : historyModal === 'assessment' ? 'bg-emerald-500' : 'bg-rose-500'
            } text-white shadow-sm`}>
              <ModalIcon size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900">{modalTitle}</h3>
              <p className="text-xs text-slate-400 font-medium">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
            </div>
            <button onClick={() => setHistoryModal(null)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500">
              <X size={18} />
            </button>
          </div>

          {/* Active Banner */}
          {active && (
            <div className={`mx-6 mt-4 px-4 py-3 rounded-xl border flex items-start gap-3 ${
              historyModal === 'counseling' ? 'bg-blue-50 border-blue-200' : historyModal === 'assessment' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                historyModal === 'counseling' ? 'bg-blue-500' : historyModal === 'assessment' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></div>
              <div>
                <p className={`text-xs font-black uppercase tracking-widest mb-0.5 ${
                  historyModal === 'counseling' ? 'text-blue-600' : historyModal === 'assessment' ? 'text-emerald-600' : 'text-rose-600'
                }`}>Current Active {isShifting ? 'Request' : 'Appointment'}</p>
                <p className="text-sm font-bold text-slate-700">
                  {isShifting
                    ? `${active.currentCourse || '—'} → ${active.targetCourse || '—'}`
                    : `${formatDate(active.scheduledTime)} • ${formatTime(active.scheduledTime)}`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Status: <span className="font-black">{active.status}</span></p>
              </div>
            </div>
          )}

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <ModalIcon size={26} />
                </div>
                <p className="font-black text-slate-500 text-sm">No {isShifting ? 'shifting requests' : 'appointments'} yet</p>
                <p className="text-xs text-slate-400 mt-1">Your history will appear here once you book.</p>
              </div>
            ) : (
              filtered.map((item: any, i: number) => {
                const isActive = !['Completed', 'Cancelled', 'Rejected'].includes(item.status);
                return (
                  <div key={i} className={`rounded-xl border p-4 flex flex-col gap-2 ${
                    isActive ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-white'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${formatStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.type}</span>
                    </div>
                    {isShifting ? (
                      <div className="text-sm text-slate-600 font-medium">
                        <span className="font-black text-slate-800">{item.currentCourse || '—'}</span>
                        <span className="mx-2 text-slate-400">→</span>
                        <span className="font-black text-slate-800">{item.targetCourse || '—'}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={14} className="text-slate-400 shrink-0" />
                          <span className="font-bold">{formatDate(item.scheduledTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <span className="font-bold">{formatTime(item.scheduledTime)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-r ${theme.bg600} to-${theme.bg900.replace('bg-', '')} opacity-10`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 flex-1 w-full">
            <div className="relative group">
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ${getAvatarStyles()}`}>
                {displayUser.sex.toLowerCase() === 'female' ? (
                  <UserRound className="w-12 h-12 md:w-16 md:h-16" />
                ) : (
                  <UserIcon className="w-12 h-12 md:w-16 md:h-16" />
                )}
              </div>
            </div>
            
            <div className="text-center md:text-left w-full">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-3 truncate max-w-full text-slate-900">{displayUser.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                <span className={`px-3 md:px-4 py-1.5 ${theme.bg100} ${theme.text700} rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border ${theme.border200}`}>
                  {displayUser.educationLevel}
                </span>
                <span className="px-3 md:px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border border-slate-200">
                  ID: {displayUser.studentId}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 self-center md:self-auto">
            <button 
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-3 px-6 py-4 bg-white ${theme.text600} rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm border border-slate-100 active:scale-95`}
            >
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-3 px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100 active:scale-95"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <GraduationCap className={theme.text600} size={24} />
                {displayUser.type === 'faculty' ? 'Professional Status' : displayUser.type === 'outside' ? 'Client Profile' : 'Academic Profile'}
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {displayUser.type === 'college' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Affiliation</p>
                    <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">College / Department</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.college}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Major Program</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.course}</p>
                  </div>
                </>
              )}

              {displayUser.type === 'highschool' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Educational Center</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.school || "WMSU Integrated Laboratory School"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year Level</p>
                    <p className="text-lg font-bold text-slate-700 uppercase tracking-tight">Grade {displayUser.gradeLevel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization / Track</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.track}</p>
                  </div>
                </>
              )}

              {displayUser.type === 'faculty' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">University</p>
                    <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employment</p>
                    <p className="text-lg font-bold text-slate-700 uppercase tracking-tight">{displayUser.status || "Permanent Faculty"}</p>
                  </div>
                </>
              )}

              {displayUser.type === 'outside' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Type</p>
                    <p className="text-lg font-bold text-slate-700">External Client</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupation</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.status || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                    <p className="text-lg font-bold text-slate-700">{displayUser.contactNumber}</p>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Contact</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                   <p className="text-base font-bold text-slate-700 break-all">{displayUser.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm border border-slate-100">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3 mb-8">
              <UserCheck className={theme.text600} size={24} />
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sex / Gender</p>
                <p className="text-lg font-bold text-slate-700 capitalize">{displayUser.sex}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <p className="text-lg font-bold text-slate-700">{displayUser.contactNumber}</p>
                </div>
              </div>
              <div className="col-span-full space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Home Address</p>
                <div className="flex items-start gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><MapPin size={16} /></div>
                   <p className="text-base font-bold text-slate-700">
                     {displayUser.street}, {displayUser.barangay}, {displayUser.city}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`${theme.bg900} rounded-lg p-8 text-white shadow-xl relative overflow-hidden group border border-current/10`}>
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full opacity-40"></div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full opacity-30"></div>

            <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
              <Award className="text-emerald-400" size={20} />
              Recent Activity
            </h3>
            
            <div className="space-y-6 relative z-10">
              <button onClick={() => setHistoryModal('counseling')} className="w-full flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Consultations</p>
                  <p className="font-bold text-sm">{activity.consultations.status}</p>
                </div>
                <ChevronRight size={16} className="text-white/30 shrink-0" />
              </button>

              {displayUser.type !== 'faculty' && (
                <button onClick={() => setHistoryModal('assessment')} className="w-full flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <ClipboardCheck size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Assessments</p>
                    <p className="font-bold text-sm">{activity.assessments.status}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/30 shrink-0" />
                </button>
              )}

              {displayUser.type === 'college' && (
                <button onClick={() => setHistoryModal('shifting')} className="w-full flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <RefreshCw size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Shifting Request</p>
                    <p className="font-bold text-sm">{activity.shifting.status}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/30 shrink-0" />
                </button>
              )}
            </div>
            
            <div className="mt-10 pt-6 border-t border-white/5 flex justify-center">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">WMSU GCC Portal</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    <AnimatePresence mode="wait">
      {renderHistoryModal()}
    </AnimatePresence>

    <AnimatePresence>
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header - Same as Recent Activity */}
            <div className="flex items-center gap-4 p-6 border-b border-slate-100">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getAvatarStyles()} shadow-sm`}>
                {displayUser.sex.toLowerCase() === 'female' ? (
                  <UserRound size={20} />
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900">Edit Profile</h3>
                <p className="text-xs text-slate-400 font-medium">Update your personal details</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                    <input
                      type="number"
                      required
                      value={editForm.contactNumber}
                      onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sex</label>
                    <select
                      value={editForm.sex}
                      onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                  <select
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value, barangay: '' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  >
                    <option value="">Select City</option>
                    {Object.keys(phAddresses).sort().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barangay</label>
                  <select
                    value={editForm.barangay}
                    disabled={!editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, barangay: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none disabled:opacity-50"
                  >
                    <option value="">Select Barangay</option>
                    {editForm.city && (phAddresses[editForm.city as keyof typeof phAddresses] as string[]).sort().map(brgy => (
                      <option key={brgy} value={brgy}>{brgy}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Street / House No.</label>
                  <input
                    type="text"
                    required
                    value={editForm.street}
                    onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    placeholder="e.g. 123 Main St."
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50`}
                >
                  {saving ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

export default ClientProfile;

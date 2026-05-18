import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Edit2,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  Mail,
  UserCheck,
  X,
  Save,
  Phone,
  RefreshCw,
  UserRound,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { analyticsApi, authApi } from '../lib/api';
import { showToast } from '../components/modal-notification/toast';
import phAddresses from '../ph_addresses.json';

const validateAndNormalizePhone = (phone: string): { normalized: string; error: string | null } => {
  const cleanPhone = phone.replace(/\s/g, '');
  if (!/^\d+$/.test(cleanPhone)) {
    return { normalized: '', error: 'Phone number must contain only digits.' };
  }

  if (!cleanPhone.startsWith('09')) {
    return { normalized: '', error: 'Phone number must start with 09.' };
  }

  if (cleanPhone.length !== 11) {
    return { normalized: '', error: 'Phone number must be exactly 11 digits.' };
  }

  return { normalized: cleanPhone, error: null };
};

interface ProfileProps {
  user: {
    name: string;
    role?: string;
    email: string;
    department?: string;
    studentId?: string; // This is employeeId for management
    educationLevel?: string;
    [key: string]: any;
  };
}

const ManagementProfile = ({ user }: ProfileProps) => {
  const theme = useTheme();
  const { accessToken, user: authUser, setAuthData, redirectPath } = useAuth();
  const [stats, setStats] = useState<{ totalManaged: number; responseRate: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    sex: '',
    birthdate: '',
    city: '',
    barangay: '',
    street: '',
    occupation: '',
    department: '',
    employeeId: ''
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState<{ [key: string]: boolean }>({
    sex: false,
    city: false,
    barangay: false
  });

  const [citySearch, setCitySearch] = useState('');
  const [barangaySearch, setBarangaySearch] = useState('');

  const ALL_CITIES = Object.keys(phAddresses).sort((a, b) => {
    if (a === 'Zamboanga City') return -1;
    if (b === 'Zamboanga City') return 1;
    return a.localeCompare(b);
  });

  const filteredCities = ALL_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));

  const filteredBarangays = (editForm.city && phAddresses[editForm.city as keyof typeof phAddresses])
    ? (phAddresses[editForm.city as keyof typeof phAddresses] as string[]).filter(b => 
        b.toLowerCase().includes(barangaySearch.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (authUser) {
      setEditForm({
        firstName: authUser.firstName,
        middleName: authUser.middleName || '',
        lastName: authUser.lastName,
        email: authUser.email || '',
        contactNumber: authUser.contactNumber,
        sex: authUser.sex,
        birthdate: authUser.birthdate ? new Date(authUser.birthdate).toISOString().split('T')[0] : '',
        city: authUser.city || authUser.address_city || '',
        barangay: authUser.barangay || authUser.address_barangay || '',
        street: authUser.street || authUser.address_street || '',
        occupation: authUser.occupation || '',
        department: authUser.department || '',
        employeeId: authUser.employeeId?.toString() || ''
      });
    }
  }, [authUser]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!accessToken) return;
      try {
        const res = await analyticsApi.getMyStats(accessToken);
        if (res.ok) setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch profile stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [accessToken]);

  const isDirty = authUser ? (
    editForm.firstName !== authUser.firstName ||
    editForm.middleName !== (authUser.middleName || '') ||
    editForm.lastName !== authUser.lastName ||
    editForm.email !== (authUser.email || '') ||
    editForm.contactNumber !== authUser.contactNumber ||
    editForm.sex !== authUser.sex ||
    editForm.birthdate !== (authUser.birthdate ? new Date(authUser.birthdate).toISOString().split('T')[0] : '') ||
    editForm.city !== (authUser.city || authUser.address_city || '') ||
    editForm.barangay !== (authUser.barangay || authUser.address_barangay || '') ||
    editForm.street !== (authUser.street || authUser.address_street || '') ||
    editForm.occupation !== (authUser.occupation || '') ||
    editForm.department !== (authUser.department || '') ||
    editForm.employeeId !== (authUser.employeeId?.toString() || '')
  ) : false;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    // Contact Number Validation
    const { normalized, error } = validateAndNormalizePhone(editForm.contactNumber);
    if (error) {
      showToast.error(error);
      return;
    }

    try {
      setSaving(true);
      
      // Convert numeric fields from string to number before sending
      const payload = {
        ...editForm,
        contactNumber: normalized,
        employeeId: editForm.employeeId ? parseInt(editForm.employeeId) : null
      };

      const res = await authApi.updateProfile(payload as any, accessToken);
      if (res.ok && res.data.user) {
        setAuthData(res.data.user, accessToken, redirectPath || '/management/dashboard');
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

  // Determine avatar styling based on sex
  const getAvatarStyles = () => {
    const sex = (authUser?.sex || '').toLowerCase();
    if (sex === 'male') return 'bg-blue-100 text-blue-500';
    if (sex === 'female') return 'bg-pink-100 text-pink-500';
    return 'bg-slate-200 text-slate-500';
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-r ${theme.bg600} to-slate-900 opacity-10`}></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8 flex-1 w-full">
            <div className="relative group shrink-0">
              <div className={`w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ${getAvatarStyles()}`}>
                {(authUser?.sex || '').toLowerCase() === 'female' ? (
                  <UserRound className="w-14 h-14 md:w-16 md:h-16" />
                ) : (
                  <UserIcon className="w-14 h-14 md:w-16 md:h-16" />
                )}
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1 min-w-0">
              <div className="flex flex-col items-center md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                <h2 className="text-2xl md:text-4xl font-black tracking-tight break-words text-slate-900 leading-tight">{user.name}</h2>
                <span className={`px-3 md:px-4 py-1.5 rounded-full ${theme.bg100} ${theme.text700} text-[10px] md:text-xs font-black uppercase tracking-widest border ${theme.border200} w-fit`}>
                  {user.role}
                </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                   <Shield size={14} className={theme.text600} />
                   <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{user.educationLevel || 'Staff'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                   <UserCheck size={14} className={theme.text600} />
                   <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">ID: {user.studentId || ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Briefcase className={theme.text600} size={24} />
                Professional Profile
              </h3>
              <button 
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-2 ${theme.text600} font-black text-[10px] uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 hover:bg-white hover:shadow-md transition-all`}
              >
                <Edit2 size={14} /> Edit Details
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Affiliation</p>
                <p className="text-lg font-bold text-slate-700">Western Mindanao State University</p>
                <p className="text-xs font-medium text-slate-400">Main Campus, Zamboanga City</p>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Department</p>
                <p className="text-lg font-bold text-slate-700">{user.department || "Guidance & Counseling Center"}</p>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Official Email</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                   <p className="text-base md:text-lg font-bold text-slate-700 break-all">{user.email}</p>
                </div>
              </div>

               <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Sex / Gender</p>
                <p className="text-lg font-bold text-slate-700 capitalize">{authUser?.sex || ''}</p>
              </div>

              <div className="group md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Home Address</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><MapPin size={16} /></div>
                   <p className="text-lg font-bold text-slate-700">
                     {authUser?.street || authUser?.address_street ? `${authUser.street || authUser.address_street}, ` : ''}
                     {authUser?.barangay || authUser?.address_barangay ? `${authUser.barangay || authUser.address_barangay}, ` : ''}
                     {authUser?.city || authUser?.address_city || ''}
                   </p>
                </div>
              </div>

               <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Contact Number</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={16} /></div>
                   <p className="text-lg font-bold text-slate-700">{authUser?.contactNumber || ''}</p>
                </div>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-600 transition-colors">Account Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-lg font-bold text-slate-700">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-lg p-8 text-white shadow-xl relative overflow-hidden group border border-slate-800">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl"></div>

            <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
              <Calendar className="text-emerald-400" size={20} />
              Service Overview
            </h3>
            
            <div className="space-y-8 relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default group/item">
                <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] mb-2">Total Managed</p>
                <div className="flex items-end justify-between">
                   {statsLoading ? (
                     <div className="h-9 w-16 bg-white/10 rounded-lg animate-pulse"></div>
                   ) : (
                     <p className="text-3xl font-black">{stats?.totalManaged ?? 0}</p>
                   )}
                   <span className="text-[10px] font-bold text-white/30 uppercase group-hover/item:text-white/60 transition-colors">Appointments</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default group/item">
                <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] mb-2">Performance</p>
                <div className="flex items-end justify-between">
                   {statsLoading ? (
                     <div className="h-9 w-16 bg-white/10 rounded-lg animate-pulse"></div>
                   ) : (
                     <p className="text-3xl font-black">{stats?.responseRate ?? 0}%</p>
                   )}
                   <span className="text-[10px] font-bold text-white/30 uppercase group-hover/item:text-white/60 transition-colors">Approval Rate</span>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5">
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center italic">Administrative Access Verified</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

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
            {/* Modal Header - Consistent Design */}
            <div className="flex items-center gap-4 p-6 border-b border-slate-100">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getAvatarStyles()} shadow-sm`}>
                {(authUser?.sex || '').toLowerCase() === 'female' ? (
                  <UserRound size={20} />
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900">Edit Profile</h3>
                <p className="text-xs text-slate-400 font-medium">Update your professional details</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                        const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                        setEditForm({ ...editForm, firstName: capitalized });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Middle Name</label>
                    <input
                      type="text"
                      value={editForm.middleName}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                        const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                        setEditForm({ ...editForm, middleName: capitalized });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                        const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                        setEditForm({ ...editForm, lastName: capitalized });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                </div>

                {authUser?.role === 'Super Admin' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Birthdate</label>
                      <input
                        type="date"
                        required
                        value={editForm.birthdate}
                        onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={editForm.contactNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length > 0 && val[0] !== '0') return;
                        if (val.length > 1 && val[1] !== '9') return;
                        if (val.length <= 11) setEditForm({ ...editForm, contactNumber: val });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sex</label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(prev => ({ ...prev, sex: !prev.sex }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold flex items-center justify-between hover:bg-slate-100 transition-all outline-none"
                    >
                      <span className={editForm.sex ? 'text-slate-900' : 'text-slate-400'}>{editForm.sex || 'Select Sex'}</span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen.sex ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isDropdownOpen.sex && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden"
                        >
                          {['Male', 'Female'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setEditForm({ ...editForm, sex: option });
                                setIsDropdownOpen(prev => ({ ...prev, sex: false }));
                              }}
                              className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-slate-50 last:border-0"
                            >
                              {option}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {authUser?.role === 'Super Admin' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</label>
                      <input
                        type="text"
                        value={editForm.employeeId}
                        onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupation</label>
                      <input
                        type="text"
                        value={editForm.occupation}
                        onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                      <input
                        type="text"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                  <div className={`w-full flex items-center bg-slate-50 border transition-all rounded-xl overflow-hidden ${isDropdownOpen.city ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-slate-200'}`}>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search or Select City"
                        value={isDropdownOpen.city ? citySearch : (editForm.city || '')}
                        onFocus={() => {
                          setIsDropdownOpen(prev => ({ ...prev, city: true }));
                          setCitySearch('');
                        }}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full bg-transparent py-3 px-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                    <div className="pr-4 pointer-events-none">
                      <ChevronDown size={18} className={`text-slate-400 transition-transform ${isDropdownOpen.city ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {isDropdownOpen.city && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(prev => ({ ...prev, city: false }))} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[250px]"
                        >
                          <div className="overflow-y-auto scrollbar-hide">
                            {filteredCities.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setEditForm({ ...editForm, city: opt, barangay: '' });
                                  setIsDropdownOpen(prev => ({ ...prev, city: false }));
                                  setCitySearch('');
                                }}
                                className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${editForm.city === opt ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                              >
                                {opt}
                              </button>
                            ))}
                            {filteredCities.length === 0 && (
                              <div className="p-4 text-center text-slate-400 text-xs italic">No cities found</div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barangay</label>
                  <div className={`w-full flex items-center transition-all border rounded-xl overflow-hidden ${!editForm.city ? 'bg-slate-50 cursor-not-allowed opacity-50 border-slate-200' : isDropdownOpen.barangay ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={editForm.city ? "Search or Type Barangay" : "Select city first"}
                        disabled={!editForm.city}
                        value={isDropdownOpen.barangay ? barangaySearch : (editForm.barangay || '')}
                        onFocus={() => {
                          if (editForm.city) {
                            setIsDropdownOpen(prev => ({ ...prev, barangay: true }));
                            setBarangaySearch('');
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBarangaySearch(val);
                          if (editForm.city !== 'Zamboanga City') {
                            setEditForm({ ...editForm, barangay: val });
                          }
                        }}
                        className="w-full bg-transparent py-3 px-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="pr-4 pointer-events-none">
                      <ChevronDown size={18} className={`text-slate-400 transition-transform ${isDropdownOpen.barangay ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {isDropdownOpen.barangay && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(prev => ({ ...prev, barangay: false }))} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[250px]"
                        >
                          <div className="overflow-y-auto scrollbar-hide">
                            {filteredBarangays.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setEditForm({ ...editForm, barangay: opt });
                                  setIsDropdownOpen(prev => ({ ...prev, barangay: false }));
                                  setBarangaySearch('');
                                }}
                                className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${editForm.barangay === opt ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                              >
                                {opt}
                              </button>
                            ))}
                            {filteredBarangays.length === 0 && editForm.city === 'Zamboanga City' && (
                              <div className="p-4 text-center text-slate-400 text-xs italic">No barangays found</div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
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
                  disabled={saving || !isDirty}
                  className={`flex-1 py-4 ${theme.bg600} text-white font-black rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed`}
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

export default ManagementProfile;



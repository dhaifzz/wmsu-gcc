import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Search,
  UserX,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { showAlert } from '../../../components/modal-notification/sweetalert';
import { showToast } from '../../../components/modal-notification/toast';
import { useAuth } from '../../../auth/AuthContext';
import { adminApi, type AdminUser } from '../../../lib/api';

const UserManagement = () => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ── Fetch users ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers(accessToken);
      if (res.ok && res.data?.users) {
        setUsers(res.data.users);
      } else {
        setError(res.error || 'Failed to load users.');
      }
    } catch {
      setError('An error occurred while loading users.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalAdmin = users.length;
  const activeCount = users.filter(u => u.status === 'Active').length;
  const pendingCount = users.filter(u => u.status === 'Pending').length;

  // ── Search filter ───────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDelete = async (user: AdminUser) => {
    const result = await showAlert.confirm(
      'Delete Account',
      `Are you sure you want to permanently delete the account for ${user.firstName} ${user.lastName} (${user.email})? This action cannot be undone.`,
      'Delete',
      'Cancel'
    );

    if (result.isConfirmed) {
      if (!accessToken) return;
      try {
        const res = await adminApi.deleteUser(user.id, accessToken);
        if (res.ok) {
          setUsers(prev => prev.filter(u => u.id !== user.id));
          showAlert.success('Account Deleted', `The account for ${user.firstName} ${user.lastName} has been permanently removed.`);
        } else {
          showToast.error(res.error || 'Failed to delete account.');
        }
      } catch {
        showToast.error('An error occurred while deleting the account.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">User Accounts</h2>
          <p className="text-slate-500 font-medium">Manage administrative accounts and permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-lg transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-lg transition-all shadow-lg shadow-teal-200"
          >
            <UserPlus size={20} />
            Create Account
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-xl shadow-slate-200/40">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Users</p>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-bold">Loading…</span>
            </div>
          ) : (
            <p className="text-3xl font-black text-slate-900">{totalAdmin}</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-xl shadow-slate-200/40">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Active Now</p>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-bold">Loading…</span>
            </div>
          ) : (
            <p className="text-3xl font-black text-teal-600">{activeCount}</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-xl shadow-slate-200/40">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pending Confirmation</p>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-bold">Loading…</span>
            </div>
          ) : (
            <p className="text-3xl font-black text-amber-500">{pendingCount}</p>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 flex items-center gap-4">
          <AlertCircle className="text-rose-500 shrink-0" size={24} />
          <div>
            <p className="font-bold text-rose-700">{error}</p>
            <button onClick={fetchUsers} className="text-sm font-bold text-rose-500 underline mt-1">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="bg-white rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, or role..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
            {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p className="text-sm font-bold">Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Search size={32} className="mb-4 opacity-40" />
              <p className="text-sm font-bold">{search ? 'No users match your search.' : 'No administrative accounts found.'}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-black">
                          {user.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{user.firstName} {user.lastName}</p>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Mail size={12} />
                            <span className="text-xs font-bold">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600 font-black text-xs uppercase tracking-wider">
                        <Shield size={14} className="text-teal-500" />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.status === 'Active' 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'bg-amber-50 text-amber-600'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDelete(user)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" 
                          title="Delete Account"
                        >
                          <UserX size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Account Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateAccountModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              fetchUsers();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Create Account Modal ────────────────────────────────────────────────────────
interface CreateAccountModalProps {
  onClose: () => void;
  onCreated: () => void;
}

import phAddresses from '../../../ph_addresses.json';
import { cmsApi } from '../../../lib/api';
import { 
  Lock, 
  Phone, 
  ChevronDown, 
  ArrowLeft
} from 'lucide-react';

const AVAILABLE_ROLES = ['College Student', 'High School Student', 'Faculty', 'Outsider', 'Staff', 'Director', 'Admin'];

const CreateAccountModal = ({ onClose, onCreated }: CreateAccountModalProps) => {
  const { accessToken } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [street, setStreet] = useState('');
  const [sex, setSex] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [role, setRole] = useState('Staff');
  const [isWMSU, setIsWMSU] = useState(true);
  const [occupation, setOccupation] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [school, setSchool] = useState('');
  const [course, setCourse] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [track, setTrack] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [lrn, setLrn] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [occupations, setOccupations] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<any>({});

  const isFaculty = role === 'Faculty';
  const isStudent = role.includes('Student');
  const shouldShowEducationStep = isStudent;

  // Fetch Academic Data
  useEffect(() => {
    const fetchData = async () => {
      const academicRes = await cmsApi.getAcademicData();
      if (academicRes.ok && academicRes.data) {
        // Simple normalization for the modal
        const source = (academicRes.data as any).data || (academicRes.data as any).content || academicRes.data;
        setColleges(Array.isArray(source.colleges) ? source.colleges : []);
        setOccupations(Array.isArray(source.occupations) ? source.occupations.map((o: any) => typeof o === 'string' ? o : o.occupation_name) : []);
      }
    };
    fetchData();
  }, []);

  // Validation Helpers (Matching Register.tsx)
  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\s/g, '');
    if (!/^\+?\d+$/.test(clean)) return { error: 'Digits only.' };
    if (clean.startsWith('+639') && clean.length === 13) return { normalized: clean };
    if (clean.startsWith('639') && clean.length === 12) return { normalized: '+' + clean };
    if (clean.startsWith('09') && clean.length === 11) return { normalized: '+63' + clean.substring(1) };
    return { error: 'Start with 09, 639, or +639.' };
  };

  const handleNext = () => {
    if (step === 1) {
      if (!email.includes('@')) return showToast.error('Valid email required.');
      const domain = email.split('@')[1]?.toLowerCase();
      if (!['wmsu.edu.ph', 'gmail.com'].includes(domain)) {
        return showToast.error('Only @wmsu.edu.ph or @gmail.com allowed.');
      }
      if (password.length < 8) return showToast.error('Password min 8 chars.');
      if (password !== confirmPassword) return showToast.error('Passwords mismatch.');
      setStep(2);
    } else if (step === 2) {
      if (!firstName || !lastName) return showToast.error('Names required.');
      const { normalized, error } = validatePhone(contactNumber);
      if (error) return showToast.error(error);
      setContactNumber(normalized!);
      if (!city || !barangay) return showToast.error('Address required.');
      setStep(3);
    } else if (step === 3) {
      if (!sex || !birthdate) return showToast.error('Sex and Birthdate required.');
      if (shouldShowEducationStep) setStep(4);
      else handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) return;
    setSubmitting(true);
    try {
      const payload = {
        email, password, firstName, middleName: middleInitial, lastName,
        contactNumber, city, barangay, street, sex, birthdate,
        isWMSU, isFaculty, occupation: occupation || (isFaculty ? 'Faculty' : (isStudent ? 'Student' : 'Staff')),
        educationLevel: educationLevel || (role === 'College Student' ? 'College' : (role === 'High School Student' ? 'High School' : '')),
        school: isWMSU ? 'Western Mindanao State University' : school,
        course, gradeLevel, track, schoolId, lrn, employeeId, role
      };
      const res = await adminApi.createUser(payload, accessToken);
      if (res.ok) {
        await showAlert.emailConfirmation(email);
        onCreated();
      } else {
        showToast.error(res.error || 'Failed to create account.');
      }
    } catch {
      showToast.error('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const ALL_CITIES = Object.keys(phAddresses).sort();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900">Create Account</h3>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, (shouldShowEducationStep ? 4 : null)].filter(Boolean).map((s: any) => (
                <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? 'bg-teal-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-all"><X size={20} className="text-slate-400" /></button>
        </div>

        {/* Form Body */}
        <div className="px-8 py-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Account Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_ROLES.map(r => (
                    <button key={r} onClick={() => {
                      setRole(r);
                      setIsWMSU(r !== 'Outsider');
                    }} className={`px-3 py-3 rounded-xl text-[11px] font-black border transition-all ${role === r ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-100' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-12 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-12 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                  <input value={firstName} onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                    const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                    setFirstName(capitalized);
                  }} maxLength={50} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Middle Name</label>
                  <input value={middleInitial} onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                    const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                    setMiddleInitial(capitalized);
                  }} maxLength={50} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                  <input value={lastName} onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                    const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                    setLastName(capitalized);
                  }} maxLength={50} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    value={contactNumber} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 11) setContactNumber(val);
                    }} 
                    placeholder="09xxxxxxxxx" 
                    maxLength={11}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">City</label>
                  <button onClick={() => setIsDropdownOpen({ city: !isDropdownOpen.city })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold text-left flex justify-between items-center">
                    {city || 'Select City'} <ChevronDown size={16} />
                  </button>
                  {isDropdownOpen.city && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {ALL_CITIES.map(c => <button key={c} onClick={() => { setCity(c); setBarangay(''); setIsDropdownOpen({}); }} className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-50 border-b border-slate-50">{c}</button>)}
                    </div>
                  )}
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Barangay</label>
                  <button disabled={!city} onClick={() => setIsDropdownOpen({ brgy: !isDropdownOpen.brgy })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold text-left flex justify-between items-center disabled:opacity-50">
                    {barangay || 'Select Barangay'} <ChevronDown size={16} />
                  </button>
                  {isDropdownOpen.brgy && city && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {(phAddresses[city as keyof typeof phAddresses] || []).map((b: string) => <button key={b} onClick={() => { setBarangay(b); setIsDropdownOpen({}); }} className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-50 border-b border-slate-50">{b}</button>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Street / House No.</label>
                <input value={street} onChange={e => setStreet(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sex</label>
                  <div className="flex gap-2">
                    {['Male', 'Female'].map(s => (
                      <button key={s} onClick={() => setSex(s)} className={`flex-1 py-4 rounded-xl text-sm font-black border transition-all ${sex === s ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-100' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Birthdate</label>
                  <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" />
                </div>
              </div>
              {!isStudent && (
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Occupation</label>
                  <button onClick={() => setIsDropdownOpen({ occ: !isDropdownOpen.occ })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold text-left flex justify-between items-center">
                    {occupation || 'Select Occupation'} <ChevronDown size={16} />
                  </button>
                  {isDropdownOpen.occ && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {occupations.map(o => <button key={o} onClick={() => { setOccupation(o); setIsDropdownOpen({}); }} className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-50 border-b border-slate-50">{o}</button>)}
                    </div>
                  )}
                </div>
              )}
              {isFaculty && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employee ID</label>
                  <input 
                    value={employeeId} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) setEmployeeId(val);
                    }} 
                    placeholder="6 digits" 
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" 
                  />
                </div>
              )}
            </div>
          )}

          {step === 4 && isStudent && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">School Name</label>
                <input disabled={isWMSU} value={isWMSU ? 'Western Mindanao State University' : school} onChange={e => setSchool(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none disabled:opacity-50" />
              </div>
              
              {role === 'College Student' && (
                <div className="space-y-4">
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course</label>
                    <button onClick={() => setIsDropdownOpen({ course: !isDropdownOpen.course })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold text-left flex justify-between items-center">
                      {course || 'Select Course'} <ChevronDown size={16} />
                    </button>
                    {isDropdownOpen.course && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {colleges.flatMap(c => c.courses || []).map((crs: any) => (
                          <button key={crs.name} onClick={() => { setCourse(crs.name); setEducationLevel('College'); setIsDropdownOpen({}); }} className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-50 border-b border-slate-50">{crs.name}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {isWMSU && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">School ID</label>
                      <input 
                        value={schoolId} 
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 9) setSchoolId(val);
                        }} 
                        placeholder="9 digits" 
                        maxLength={9}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" 
                      />
                    </div>
                  )}
                </div>
              )}

              {role === 'High School Student' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grade Level</label>
                      <select value={gradeLevel} onChange={e => {
                        setGradeLevel(e.target.value);
                        setEducationLevel('High School');
                      }} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none">
                        <option value="">Select</option>
                        {[7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
                      </select>
                    </div>
                    {['11', '12'].includes(gradeLevel) && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Track</label>
                        <input value={track} onChange={e => setTrack(e.target.value)} placeholder="STEM, ABM, etc." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" />
                      </div>
                    )}
                  </div>
                  {isWMSU && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">LRN</label>
                      <input 
                        value={lrn} 
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 12) setLrn(val);
                        }} 
                        placeholder="12 digits" 
                        maxLength={12}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none" 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button onClick={onClose} className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
          <button disabled={submitting} onClick={handleNext} className="flex-1 py-4 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : (step === (shouldShowEducationStep ? 4 : 3) ? 'Create Account' : 'Next Step')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserManagement;

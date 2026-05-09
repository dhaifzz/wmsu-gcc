import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Search,
  UserX,
  X,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { showAlert } from '../../../components/modal-notification/sweetalert';
import toast from 'react-hot-toast';
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
          toast.success('Account deleted successfully.');
        } else {
          toast.error(res.error || 'Failed to delete account.');
        }
      } catch {
        toast.error('An error occurred while deleting the account.');
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
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Admin</p>
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

const AVAILABLE_ROLES = ['Staff', 'Director', 'Admin', 'Super Admin'];

const CreateAccountModal = ({ onClose, onCreated }: CreateAccountModalProps) => {
  const { accessToken } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Staff',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid = form.email.trim() && form.password.trim() && form.firstName.trim() && form.lastName.trim() && form.role;

  const handleSubmit = async () => {
    if (!isValid || !accessToken) return;
    setSubmitting(true);
    try {
      const res = await adminApi.createUser(form, accessToken);
      if (res.ok) {
        toast.success((res.data as any)?.message || 'Account created successfully!');
        onCreated();
      } else {
        toast.error(res.error || (res.data as any)?.error || 'Failed to create account.');
      }
    } catch {
      toast.error('An error occurred while creating the account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900">Create New Account</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">A confirmation email will be sent to the user.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">First Name *</label>
              <input
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="Juan"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Last Name *</label>
              <input
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder="Dela Cruz"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="user@wmsu.edu.ph"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Role *</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setForm(f => ({ ...f, role }))}
                  className={`px-4 py-3 rounded-lg text-sm font-black border transition-all ${
                    form.role === role
                      ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-black rounded-lg hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            className="flex-1 py-3.5 bg-teal-600 text-white font-black rounded-lg hover:bg-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-200 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserManagement;

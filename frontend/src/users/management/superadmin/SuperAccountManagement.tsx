import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  Search,
  UserCheck,
  UserX,
  Plus
} from 'lucide-react';
import { showAlert } from '../../../components/modal-notification/sweetalert';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users] = useState([
    { id: 1, name: 'Dr. Maria Elena Santos', email: 'maria.santos@wmsu.edu.ph', role: 'Director', status: 'Active' },
    { id: 2, name: 'Prof. Ricardo Dela Cruz', email: 'ricardo.dc@wmsu.edu.ph', role: 'Staff', status: 'Active' },
    { id: 3, name: 'Liza Marie Gomez', email: 'liza.gomez@wmsu.edu.ph', role: 'Staff', status: 'Pending' },
  ]);

  const handleCreateUser = async () => {
    const result = await showAlert.confirm(
      'Invite New User',
      'This will send an invitation link to the specified email address. Continue?',
      'Send Invitation',
      'Cancel'
    );

    if (result.isConfirmed) {
      toast.success('Invitation sent successfully!');
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
        <button 
          onClick={handleCreateUser}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-lg transition-all shadow-lg shadow-teal-200"
        >
          <UserPlus size={20} />
          Create Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-xl shadow-slate-200/40">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Admin</p>
          <p className="text-3xl font-black text-slate-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-xl shadow-slate-200/40">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Active Now</p>
          <p className="text-3xl font-black text-teal-600">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-xl shadow-slate-200/40">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pending Invites</p>
          <p className="text-3xl font-black text-amber-500">3</p>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-lg transition-all">
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-black">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{user.name}</p>
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
                      <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all" title="Approve/Verify">
                        <UserCheck size={18} />
                      </button>
                      <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Revoke/Delete">
                        <UserX size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default UserManagement;

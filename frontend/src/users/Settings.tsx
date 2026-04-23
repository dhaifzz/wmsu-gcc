import { motion } from 'framer-motion';
import { Mail, Bell, Shield } from 'lucide-react';

const Settings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6"
    >
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
        <h3 className="text-2xl font-black tracking-tight mb-8">Account Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-500 shadow-sm">
                <Mail size={24} />
              </div>
              <div>
                <p className="font-black text-slate-700">Email Notifications</p>
                <p className="text-xs text-slate-500 font-medium">Receive updates about your appointments</p>
              </div>
            </div>
            <div className="w-14 h-8 bg-emerald-600 rounded-full p-1 relative cursor-pointer shadow-inner">
              <div className="w-6 h-6 bg-white rounded-full absolute right-1"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-500 shadow-sm">
                <Bell size={24} />
              </div>
              <div>
                <p className="font-black text-slate-700">Push Notifications</p>
                <p className="text-xs text-slate-500 font-medium">Alerts for immediate feedback and messages</p>
              </div>
            </div>
            <div className="w-14 h-8 bg-slate-200 rounded-full p-1 relative cursor-pointer shadow-inner">
              <div className="w-6 h-6 bg-white rounded-full absolute left-1 shadow-sm"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-500 shadow-sm">
                <Shield size={24} />
              </div>
              <div>
                <p className="font-black text-slate-700">Privacy Mode</p>
                <p className="text-xs text-slate-500 font-medium">Keep your consultation history hidden from profile</p>
              </div>
            </div>
            <div className="w-14 h-8 bg-emerald-600 rounded-full p-1 relative cursor-pointer shadow-inner">
              <div className="w-6 h-6 bg-white rounded-full absolute right-1"></div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-4">
          <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5 transition-all active:translate-y-0">
            Save Changes
          </button>
          <button className="bg-white text-rose-600 border-2 border-rose-100 px-8 py-4 rounded-2xl font-black hover:bg-rose-50 transition-all">
            Deactivate Account
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;

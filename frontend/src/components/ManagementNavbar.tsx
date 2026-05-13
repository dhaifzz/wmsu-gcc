import { Bell, Menu, CheckCircle2, Inbox, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { notificationApi, type Notification } from '../lib/api';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

interface ManagementNavbarProps {
  userName: string;
  onMenuClick: () => void;
}

const ManagementNavbar = ({ userName, onMenuClick }: ManagementNavbarProps) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { accessToken } = useAuth();

  const fetchNotifications = async () => {
    if (!accessToken) return;
    try {
      const res = await notificationApi.getNotifications(accessToken);
      if (res.ok && res.data.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [accessToken]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    if (!accessToken) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await notificationApi.markAllAsRead(accessToken);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!accessToken) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await notificationApi.markAsRead(id, accessToken);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 lg:px-10 py-4 lg:py-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-xl lg:text-2xl font-black tracking-tight leading-tight">Good day, {userName.split(' ')[0]}!</h2>
          <p className="text-slate-500 text-[10px] lg:text-sm font-medium">Here's what's happening with your portal today.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <button 
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative border ${
            isNotificationsOpen 
              ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 min-w-[20px] h-[20px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 top-full mt-4 w-[380px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right"
              >
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 tracking-tight leading-none">Admin Alerts</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management Updates</p>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead} 
                      className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-white px-4 py-2 rounded-xl border border-emerald-100 shadow-sm transition-all active:scale-95"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-[440px] overflow-y-auto scrollbar-hide py-2 px-2">
                  {notifications.length > 0 ? (
                    <div className="space-y-1">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`w-full p-4 text-left hover:bg-slate-50 transition-all flex gap-4 rounded-3xl relative group ${!notif.is_read ? 'bg-emerald-50/30' : ''}`}
                        >
                          <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center transition-colors ${
                            notif.type === 'new_request' ? 'bg-emerald-100 text-emerald-600' :
                            notif.type === 'new_account' ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {notif.type === 'new_request' ? <CheckCircle2 size={20} /> :
                             notif.type === 'new_account' ? <Inbox size={20} /> :
                             <AlertCircle size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={`font-black text-sm truncate ${!notif.is_read ? 'text-slate-900' : 'text-slate-500'}`}>
                                {notif.title}
                              </p>
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                {formatTimeAgo(notif.created_at)}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed line-clamp-2 ${!notif.is_read ? 'font-bold text-slate-700' : 'font-medium text-slate-400'}`}>
                              {notif.message}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Inbox size={40} />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No New Alerts</p>
                      <p className="text-xs text-slate-300 font-medium mt-1">You're all caught up for today.</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                  <button className="w-full py-4 rounded-2xl bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm">
                    View Activity Log
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default ManagementNavbar;

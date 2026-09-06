import { useState, useEffect } from 'react';
import { Bell, LayoutDashboard, User, UserRound, Inbox, Clock, CheckCircle2 } from 'lucide-react';
import gccLogoAsset from '../assets/logos/GCC.png';
import wmsuLogoAsset from '../assets/logos/WMSU.png';
import { cmsApi, notificationApi, type Notification } from '../lib/api';
import { useAuth } from '../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

interface ClientNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userType?: string;
}

const ClientNavbar = ({ activeTab, setActiveTab }: ClientNavbarProps) => {
  const { user } = useAuth();
  const [logos, setLogos] = useState({
    wmsuLogo: wmsuLogoAsset,
    gccLogo: gccLogoAsset
  });

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
    // Refresh every 30 seconds as a fallback if no sockets
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [accessToken]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    if (!accessToken) return;
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await notificationApi.markAllAsRead(accessToken);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!accessToken) return;
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await notificationApi.markAsRead(id, accessToken);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await cmsApi.getContent('logos');
        if (res.ok && res.data) {
          setLogos({
            wmsuLogo: res.data.wmsuLogo || wmsuLogoAsset,
            gccLogo: res.data.gccLogo || gccLogoAsset
          });
        }
      } catch (error) {
        console.error('Failed to fetch logos:', error);
      }
    };
    fetchLogos();
  }, []);

  return (
    <header className="bg-emerald-900 text-white sticky top-0 z-50 px-4 md:px-6 lg:px-10 py-3 md:py-4 flex items-center justify-between shadow-xl print:hidden">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center -space-x-1.5 shrink-0">
          <img src={logos.wmsuLogo} alt="WMSU Logo" className="w-10 h-10 md:w-11 md:h-11 object-contain z-10" />
          <img src={logos.gccLogo} alt="GCC Logo" className="w-10 h-10 md:w-11 md:h-11 object-contain z-20" />
        </div>
        <div className="hidden md:flex flex-col justify-center">
          <h1 className="text-2xl font-black tracking-wide uppercase leading-none text-white whitespace-nowrap">WMSU GCC</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-400 mt-1">Portal System</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6 ml-2">
        {/* Actions - Bell moved before the two nav buttons */}
        <div className="flex items-center relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative group shadow-sm border ${
              isNotificationsOpen 
                ? 'bg-white text-emerald-900 border-white' 
                : 'bg-emerald-800/50 hover:bg-emerald-800 text-emerald-100 border-emerald-700/50'
            }`}
          >
            <Bell size={18} className="transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-emerald-900 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                {/* Backdrop to close on click outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotificationsOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute right-0 top-full mt-4 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] origin-top-right"
                >
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                        <Bell size={16} />
                      </div>
                      <h3 className="font-black text-slate-900 tracking-tight">Notifications</h3>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[420px] overflow-y-auto scrollbar-hide py-2">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`w-full p-4 text-left hover:bg-slate-50 transition-all flex gap-4 group relative ${!notif.is_read ? 'bg-emerald-50/30' : ''}`}
                          >
                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                              notif.type === 'status_change' ? 'bg-emerald-100 text-emerald-600' :
                              notif.type === 'exam_reminder' ? 'bg-amber-100 text-amber-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {notif.type === 'status_change' ? <CheckCircle2 size={18} /> :
                               notif.type === 'exam_reminder' ? <Clock size={18} /> :
                               <Inbox size={18} />}
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
                            {!notif.is_read && (
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Inbox size={32} />
                        </div>
                        <p className="text-sm font-black text-slate-400 tracking-widest">All caught up!</p>
                        <p className="text-xs text-slate-300 font-medium mt-1">No new notifications to show.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                    <button className="w-full py-3 rounded-xl bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-600 hover:border-slate-200 transition-all shadow-sm">
                      View All Activity
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex items-center gap-1 md:gap-2 bg-emerald-950/30 p-1 md:p-1.5 rounded-full border border-emerald-800/30 shrink-0">
          {/* Dashboard Button */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`group relative flex items-center transition-all duration-300 ease-out overflow-hidden rounded-full font-bold text-sm ${activeTab === 'overview'
                ? 'bg-white text-emerald-900 px-3 md:px-5 py-2.5 shadow-lg'
                : 'text-emerald-100 hover:bg-emerald-800/50 px-3 py-2.5'
              }`}
          >
            <div className="flex items-center">
              <LayoutDashboard size={18} />
              <span className={`transition-all duration-300 ease-out overflow-hidden whitespace-nowrap hidden lg:inline-block ${activeTab === 'overview' ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2'
                }`}>
                Dashboard
              </span>
            </div>
            {activeTab === 'overview' && <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-pulse"></span>}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`group relative flex items-center transition-all duration-300 ease-out overflow-hidden rounded-full font-bold text-sm ${activeTab === 'profile'
                ? 'bg-white text-emerald-900 px-3 md:px-5 py-2.5 shadow-lg'
                : 'text-emerald-100 hover:bg-emerald-800/50 px-3 py-2.5'
              }`}
          >
            <div className="flex items-center">
              {user?.sex?.toLowerCase() === 'female' ? (
                <UserRound size={18} />
              ) : (
                <User size={18} />
              )}
              <span className={`transition-all duration-300 ease-out overflow-hidden whitespace-nowrap hidden lg:inline-block ${activeTab === 'profile' ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2'
                }`}>
                My Profile
              </span>
            </div>
            {activeTab === 'profile' && <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-pulse"></span>}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default ClientNavbar;

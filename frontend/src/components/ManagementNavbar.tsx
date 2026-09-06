import { Bell, Menu, X, CheckCircle2, Inbox, AlertCircle, LogOut, User, UserRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { notificationApi, cmsApi, type Notification } from '../lib/api';
import { showAlert } from './modal-notification/sweetalert';
import WMSULogoAsset from '../assets/logos/WMSU.png';
import GCCLogoAsset from '../assets/logos/GCC.png';
import type { NavLink } from './ManagementSidebar';

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
  userType?: string;
  onMenuClick: () => void;
  isSidebarOpen?: boolean;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  links?: NavLink[];
  colorScheme?: 'emerald' | 'teal';
}

const ManagementNavbar = ({ 
  userName, 
  userType, 
  onMenuClick, 
  isSidebarOpen = false,
  activeTab,
  setActiveTab,
  links,
  colorScheme = 'emerald'
}: ManagementNavbarProps) => {
  const { signOut, user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [logos, setLogos] = useState({
    wmsuLogo: WMSULogoAsset,
    gccLogo: GCCLogoAsset
  });

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await cmsApi.getContent('logos');
        if (res.ok && res.data) {
          setLogos({
            wmsuLogo: res.data.wmsuLogo || WMSULogoAsset,
            gccLogo: res.data.gccLogo || GCCLogoAsset
          });
        }
      } catch (error) {
        console.error('Failed to fetch logos:', error);
      }
    };
    fetchLogos();
  }, []);

  const handleLogout = async () => {
    const result = await showAlert.confirm('Logout', 'Are you sure you want to sign out?', 'Logout', 'Stay');
    if (result.isConfirmed) {
      await signOut();
      navigate('/');
    }
  };

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
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-4 sm:px-6 lg:px-10 py-3 lg:py-5 flex items-center justify-between">
      {/* Mobile Branding (Logos & Brand, matching public page Navbar.tsx) */}
      <div className="flex items-center gap-2.5 sm:gap-3 group shrink-0 lg:hidden">
        <div className="flex items-center -space-x-2 shrink-0">
          <img src={logos.wmsuLogo} alt="WMSU" className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-md z-10" />
          <img src={logos.gccLogo} alt="GCC" className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-md z-20" />
        </div>
        <div className="flex flex-col leading-tight whitespace-nowrap">
          <span className="text-lg sm:text-xl font-black tracking-tighter text-emerald-950">
            WMSU GCC
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            {userType ? `${userType.toUpperCase()} PORTAL` : 'MANAGEMENT PORTAL'}
          </span>
        </div>
      </div>

      {/* Desktop Greeting Header */}
      <div className="hidden lg:block">
        <h2 className="text-xl lg:text-2xl font-black tracking-tight leading-tight">
          Good day, <span className="text-emerald-600">{userName.split(' ')[0]}</span>!
        </h2>
        <p className="text-slate-500 text-[10px] lg:text-sm font-medium">Here's what's happening with your portal today.</p>
      </div>

      {/* Right Action Section */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Notification Bell (mobile & desktop) */}
        <div className="flex items-center relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all relative border ${isNotificationsOpen
                ? 'bg-white text-emerald-700 border-emerald-200 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs'
              }`}
            aria-label="Notifications"
          >
            <Bell size={18} className="sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:top-2 sm:right-2 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] px-1 bg-rose-500 text-white text-[9px] sm:text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/20 lg:bg-transparent" onClick={() => setIsNotificationsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="fixed right-3 left-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-[320px] md:w-[330px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] origin-top-right flex flex-col max-h-[calc(100vh-5.5rem)] sm:max-h-[380px] md:max-h-[400px]"
                >
                  <div className="px-4 py-3.5 sm:px-5 sm:py-3.5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Bell size={16} />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900 tracking-tight leading-none">Admin Alerts</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Management Updates</p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead} 
                        className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-emerald-100 shadow-xs transition-all active:scale-95"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto custom-scrollbar py-2 px-2 flex-1 min-h-0 overscroll-contain pr-1">
                    {notifications.length > 0 ? (
                      <div className="space-y-1">
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`w-full p-2.5 sm:p-3 text-left hover:bg-slate-50 transition-all flex gap-3 rounded-2xl relative group ${!notif.is_read ? 'bg-emerald-50/30' : ''}`}
                          >
                            <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                              notif.type === 'new_request' ? 'bg-emerald-100 text-emerald-600' :
                              notif.type === 'new_account' ? 'bg-amber-100 text-amber-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {notif.type === 'new_request' ? <CheckCircle2 size={16} /> :
                               notif.type === 'new_account' ? <Inbox size={16} /> :
                               <AlertCircle size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className={`font-black text-xs truncate ${!notif.is_read ? 'text-slate-900' : 'text-slate-500'}`}>
                                  {notif.title}
                                </p>
                                <span className="text-[9px] font-bold text-slate-400 shrink-0">
                                  {formatTimeAgo(notif.created_at)}
                                </span>
                              </div>
                              <p className={`text-[11px] leading-relaxed line-clamp-2 break-words ${!notif.is_read ? 'font-bold text-slate-700' : 'font-medium text-slate-400'}`}>
                                {notif.message}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 sm:py-10 text-center">
                        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-2.5">
                          <Inbox size={24} />
                        </div>
                        <p className="text-xs font-black text-slate-500 tracking-wider">No New Alerts</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">You're all caught up for today.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 sm:p-3 border-t border-slate-50 bg-slate-50/30 shrink-0">
                    <button className="w-full py-2.5 rounded-xl bg-white border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-white hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-xs">
                      View Activity Log
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Toggle Button (matching Navbar.tsx on phone view) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-emerald-950 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown (matching Navbar.tsx in phone view) */}
      <div 
        className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-b border-slate-200 transition-all duration-300 transform ${
          isSidebarOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-4 opacity-0 pointer-events-none'
        } max-h-[calc(100vh-4.5rem)] overflow-y-auto custom-scrollbar z-50`}
      >
        <div className="p-4 space-y-1.5">
          {links && links.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab?.(link.id);
                  onMenuClick();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? colorScheme === 'teal'
                      ? 'bg-teal-50 text-teal-800 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? (colorScheme === 'teal' ? 'text-teal-700' : 'text-emerald-700') : 'text-slate-400'} />
                  <span>{link.label}</span>
                </div>
                {isActive && (
                  <span className={`w-2 h-2 rounded-full ${colorScheme === 'teal' ? 'bg-teal-600' : 'bg-emerald-600'}`}></span>
                )}
              </button>
            );
          })}

          {/* User Card & Logout in Mobile Dropdown */}
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-3 px-2 py-2">
            <div 
              onClick={() => {
                setActiveTab?.('profile');
                onMenuClick();
              }}
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                {user?.sex?.toLowerCase() === 'female' ? <UserRound size={20} /> : <User size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-slate-900 truncate">{userName}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest truncate">{userType || 'Management'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop Overlay to close on tap outside */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          style={{ top: '65px' }}
          onClick={onMenuClick}
        />
      )}
    </header>
  );
};

export default ManagementNavbar;

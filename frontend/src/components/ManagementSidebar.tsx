import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  LogOut,
  Clock as ClockIcon
} from 'lucide-react';

import WMSULogo from '../assets/logos/WMSU.png';
import GCCLogo from '../assets/logos/GCC.png';
import MarqueeText from './MarqueeText';
import { useAuth } from '../auth/AuthProvider';
import { showAlert } from './modal-notification/sweetalert';

interface NavLink {
  id: string;
  label: string;
  icon: any;
}

interface ManagementSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  userType: string;
  isOpen?: boolean;
  onClose?: () => void;
  links?: NavLink[];
  colorScheme?: 'emerald' | 'teal';
}

const ManagementSidebar = ({ activeTab, setActiveTab, userName, userType, isOpen, onClose, links, colorScheme = 'emerald' }: ManagementSidebarProps) => {
  const { signOut } = useAuth();
  const [time, setTime] = useState(new Date());

  const c = colorScheme === 'teal' ? {
    aside: 'bg-teal-950 border-teal-800',
    clockBg: 'bg-teal-900/60 border-teal-800/50',
    clockLabel: 'text-teal-400',
    clockAmpm: 'text-teal-400',
    clockDate: 'text-teal-300/60',
    navLabel: 'text-teal-400/40',
    activeBtn: 'bg-teal-400 text-teal-950 shadow-xl shadow-teal-950/40',
    activeIcon: 'text-teal-900',
    activeDot: 'bg-teal-400',
    inactiveBtn: 'text-teal-100 hover:bg-white/5',
    inactiveIcon: 'text-teal-400',
    userCardBg: 'bg-teal-900/50 border-teal-800/50',
    userCardBorder: 'border-teal-800/50',
    userAvatar: 'bg-teal-800/60 rounded-2xl border-teal-700/40',
    userAvatarIcon: 'text-teal-400',
    userRole: 'text-teal-400/80',
    logoutIcon: 'text-teal-400 hover:text-rose-400',
    overlay: 'bg-teal-950/40',
  } : {
    aside: 'bg-emerald-900 border-emerald-800',
    clockBg: 'bg-emerald-950/40 border-white/5',
    clockLabel: 'text-emerald-400',
    clockAmpm: 'text-emerald-500',
    clockDate: 'text-emerald-200/60',
    navLabel: 'text-emerald-400/40',
    activeBtn: 'bg-white text-emerald-900 shadow-xl shadow-emerald-950/20',
    activeIcon: 'text-emerald-700',
    activeDot: 'bg-emerald-600',
    inactiveBtn: 'text-emerald-100 hover:bg-white/5',
    inactiveIcon: 'text-emerald-300',
    userCardBg: 'bg-emerald-950/30 border-white/5',
    userCardBorder: 'border-emerald-800/50',
    userAvatar: 'bg-white/10 rounded-2xl border-white/10',
    userAvatarIcon: 'text-emerald-300',
    userRole: 'text-emerald-400/80',
    logoutIcon: 'text-emerald-400 hover:text-rose-400',
    overlay: 'bg-emerald-950/40',
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const defaultLinks: NavLink[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const displayLinks = links || defaultLinks;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 ${c.overlay} backdrop-blur-sm z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <aside className={`fixed lg:sticky top-0 left-0 w-80 ${c.aside} text-white border-r flex flex-col p-6 h-screen z-50 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logos & Brand */}
        <div className="flex items-center gap-4 mb-10 px-2">
          <div className="flex -space-x-3">
            <img src={WMSULogo} alt="WMSU" className="w-12 h-12 object-contain drop-shadow-md z-10" />
            <img src={GCCLogo} alt="GCC" className="w-12 h-12 object-contain drop-shadow-md" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter leading-none">WMSU GCC</h1>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Portal System</p>
          </div>
        </div>

        {/* Live Date/Time "Countdown" Style */}
        <div className={`${c.clockBg} rounded-3xl p-5 mb-8 border relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 p-2 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">
            <ClockIcon size={48} />
          </div>
          <div className="relative z-10">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${c.clockLabel} mb-2`}>System Time</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tabular-nums">{formatTime(time).split(' ')[0]}</span>
              <span className={`text-xs font-black uppercase ${c.clockAmpm}`}>{formatTime(time).split(' ')[1]}</span>
            </div>
            <p className={`text-xs font-bold ${c.clockDate} mt-1`}>{formatDate(time)}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${c.navLabel} mb-4 px-4`}>Navigation</p>

          {displayLinks.map((link) => (
            <button
              key={link.id}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative group ${activeTab === link.id ? c.activeBtn : c.inactiveBtn}`}
              onClick={() => { setActiveTab(link.id); onClose(); }}
            >
              <link.icon size={20} className={activeTab === link.id ? c.activeIcon : c.inactiveIcon} />
              {link.label}
              {activeTab === link.id && <div className={`absolute right-4 w-1.5 h-1.5 rounded-full ${c.activeDot}`}></div>}
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className={`mt-auto pt-6 border-t ${c.userCardBorder}`}>
          <div className={`${c.userCardBg} rounded-[2rem] p-4 flex items-center gap-3 border`}>
            <div className={`w-12 h-12 ${c.userAvatar} flex items-center justify-center border`}>
              <User size={24} className={c.userAvatarIcon} />
            </div>
            <div className="flex-1 overflow-hidden">
              <MarqueeText
                text={userName}
                className="font-black text-sm text-white"
              />
              <MarqueeText
                text={userType}
                className={`text-[10px] ${c.userRole} font-black uppercase tracking-widest`}
                containerClassName="mt-0.5"
              />
            </div>
            <button 
              onClick={async () => {
                const result = await showAlert.confirm('Logout', 'Are you sure you want to sign out?', 'Logout', 'Stay');
                if (result.isConfirmed) {
                  await signOut();
                }
              }}
              className={`p-2 ${c.logoutIcon} transition-colors`}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ManagementSidebar;

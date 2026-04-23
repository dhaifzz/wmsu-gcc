import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut,
  Clock as ClockIcon
} from 'lucide-react';

import WMSULogo from '../assets/logos/WMSU.png';
import GCCLogo from '../assets/logos/GCC.png';
import MarqueeText from './MarqueeText';

interface UserSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  userType: string;
  isOpen: boolean;
  onClose: () => void;
}

const UserSidebar = ({ activeTab, setActiveTab, userName, userType, isOpen, onClose }: UserSidebarProps) => {
  const [time, setTime] = useState(new Date());

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

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <aside className={`fixed lg:sticky top-0 left-0 w-80 bg-emerald-900 text-white border-r border-emerald-800 flex flex-col p-6 h-screen z-50 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
        <div className="bg-emerald-950/40 rounded-3xl p-5 mb-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">
            <ClockIcon size={48} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">System Time</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tabular-nums">{formatTime(time).split(' ')[0]}</span>
              <span className="text-xs font-black uppercase text-emerald-500">{formatTime(time).split(' ')[1]}</span>
            </div>
            <p className="text-xs font-bold text-emerald-200/60 mt-1">{formatDate(time)}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/40 mb-4 px-4">Navigation</p>
          
          <button 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative group ${activeTab === 'overview' ? 'bg-white text-emerald-900 shadow-xl shadow-emerald-950/20' : 'text-emerald-100 hover:bg-white/5'}`} 
            onClick={() => { setActiveTab('overview'); onClose(); }}
          >
            <LayoutDashboard size={20} className={activeTab === 'overview' ? 'text-emerald-700' : 'text-emerald-300'} /> 
            Dashboard
            {activeTab === 'overview' && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-600"></div>}
          </button>

          <button 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative group ${activeTab === 'profile' ? 'bg-white text-emerald-900 shadow-xl shadow-emerald-950/20' : 'text-emerald-100 hover:bg-white/5'}`} 
            onClick={() => { setActiveTab('profile'); onClose(); }}
          >
            <User size={20} className={activeTab === 'profile' ? 'text-emerald-700' : 'text-emerald-300'} /> 
            My Profile
            {activeTab === 'profile' && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-600"></div>}
          </button>

          <button 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative group ${activeTab === 'settings' ? 'bg-white text-emerald-900 shadow-xl shadow-emerald-950/20' : 'text-emerald-100 hover:bg-white/5'}`} 
            onClick={() => { setActiveTab('settings'); onClose(); }}
          >
            <Settings size={20} className={activeTab === 'settings' ? 'text-emerald-700' : 'text-emerald-300'} /> 
            Settings
            {activeTab === 'settings' && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-600"></div>}
          </button>
        </nav>

        {/* User Card */}
        <div className="mt-auto pt-6 border-t border-emerald-800/50">
          <div className="bg-emerald-950/30 rounded-[2rem] p-4 flex items-center gap-3 border border-white/5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-300 border border-white/10">
              <User size={24} />
            </div>
            <div className="flex-1 overflow-hidden">
              <MarqueeText 
                text={userName} 
                className="font-black text-sm text-white" 
              />
              <MarqueeText 
                text={userType} 
                className="text-[10px] text-emerald-400/80 font-black uppercase tracking-widest"
                containerClassName="mt-0.5"
              />
            </div>
            <button className="p-2 text-emerald-400 hover:text-rose-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;

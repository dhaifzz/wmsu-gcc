import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  UserRound,
  LogOut
} from 'lucide-react';

import WMSULogoAsset from '../assets/logos/WMSU.png';
import GCCLogoAsset from '../assets/logos/GCC.png';
import MarqueeText from './MarqueeText';
import { useAuth } from '../auth/AuthContext';
import { showAlert } from './modal-notification/sweetalert';
import { cmsApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';

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
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [logos, setLogos] = useState({
    wmsuLogo: WMSULogoAsset,
    gccLogo: GCCLogoAsset
  });

  const c = colorScheme === 'teal' ? {
    aside: 'bg-teal-950 border-teal-800',
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

  const defaultLinks: NavLink[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
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
            <img src={logos.wmsuLogo} alt="WMSU" className="w-12 h-12 object-contain drop-shadow-md z-10" />
            <img src={logos.gccLogo} alt="GCC" className="w-12 h-12 object-contain drop-shadow-md" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter leading-none">WMSU GCC</h1>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Portal System</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {displayLinks.map((link) => (
            <button
              key={link.id}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative group ${activeTab === link.id ? c.activeBtn : c.inactiveBtn}`}
              onClick={() => { setActiveTab(link.id); onClose?.(); }}
            >
              <link.icon size={20} className={activeTab === link.id ? c.activeIcon : c.inactiveIcon} />
              {link.label}
              {activeTab === link.id && <div className={`absolute right-4 w-1.5 h-1.5 rounded-full ${c.activeDot}`}></div>}
            </button>
          ))}
        </nav>

        {/* User Card — clicking opens profile */}
        <div className={`mt-auto pt-6 border-t ${c.userCardBorder}`}>
          <div
            onClick={() => { setActiveTab('profile'); onClose?.(); }}
            className={`w-full ${c.userCardBg} rounded-[2rem] p-4 flex items-center gap-3 border hover:opacity-80 transition-opacity text-left cursor-pointer`}
          >
            <div className={`w-12 h-12 ${c.userAvatar} flex items-center justify-center border overflow-hidden`}>
              {user?.sex?.toLowerCase() === 'female' ? (
                <UserRound size={24} className={c.userAvatarIcon} />
              ) : (
                <User size={24} className={c.userAvatarIcon} />
              )}
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
              onClick={async (e) => {
                e.stopPropagation();
                const result = await showAlert.confirm('Logout', 'Are you sure you want to sign out?', 'Logout', 'Stay');
                if (result.isConfirmed) {
                  await signOut();
                  navigate('/');
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
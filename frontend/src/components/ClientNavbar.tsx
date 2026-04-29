import { useState, useEffect } from 'react';
import { Bell, LayoutDashboard, User } from 'lucide-react';
import gccLogoAsset from '../assets/logos/GCC.png';
import wmsuLogoAsset from '../assets/logos/WMSU.png';
import { cmsApi } from '../lib/api';

interface ClientNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userType?: string;
}

const ClientNavbar = ({ activeTab, setActiveTab }: ClientNavbarProps) => {
  const [logos, setLogos] = useState({
    wmsuLogo: wmsuLogoAsset,
    gccLogo: gccLogoAsset
  });

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
    <header className="bg-emerald-900 text-white sticky top-0 z-30 px-6 lg:px-10 py-4 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center -space-x-1.5">
          <img src={logos.wmsuLogo} alt="WMSU Logo" className="w-11 h-11 object-contain z-10" />
          <img src={logos.gccLogo} alt="GCC Logo" className="w-11 h-11 object-contain z-20" />
        </div>
        <div className="flex flex-col justify-center hidden sm:flex">
          <h1 className="text-2xl font-black tracking-wide uppercase leading-none text-white">WMSU GCC</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-400 mt-1">Portal System</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Actions - Bell moved before the two nav buttons */}
        <div className="flex items-center">
          <button className="w-10 h-10 bg-emerald-800/50 hover:bg-emerald-800 border border-emerald-700/50 rounded-full flex items-center justify-center transition-all relative group">
            <Bell size={18} className="text-emerald-100 group-hover:text-white transition-colors" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-emerald-900"></span>
          </button>
        </div>

        <nav className="flex items-center gap-2 bg-emerald-950/30 p-1.5 rounded-full border border-emerald-800/30">
          {/* Dashboard Button */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`group relative flex items-center transition-all duration-300 ease-out overflow-hidden rounded-full font-bold text-sm ${activeTab === 'overview'
                ? 'bg-white text-emerald-900 px-5 py-2.5 shadow-lg'
                : 'text-emerald-100 hover:bg-emerald-800/50 px-3 py-2.5'
              }`}
          >
            <div className="flex items-center">
              <LayoutDashboard size={18} className={activeTab === 'overview' ? 'mr-2' : 'group-hover:mr-2 transition-all'} />
              <span className={`transition-all duration-300 ease-out overflow-hidden whitespace-nowrap ${activeTab === 'overview' ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'
                }`}>
                Dashboard
              </span>
            </div>
            {activeTab === 'overview' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-pulse"></span>}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`group relative flex items-center transition-all duration-300 ease-out overflow-hidden rounded-full font-bold text-sm ${activeTab === 'profile'
                ? 'bg-white text-emerald-900 px-5 py-2.5 shadow-lg'
                : 'text-emerald-100 hover:bg-emerald-800/50 px-3 py-2.5'
              }`}
          >
            <div className="flex items-center">
              <User size={18} className={activeTab === 'profile' ? 'mr-2' : 'group-hover:mr-2 transition-all'} />
              <span className={`transition-all duration-300 ease-out overflow-hidden whitespace-nowrap ${activeTab === 'profile' ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'
                }`}>
                My Profile
              </span>
            </div>
            {activeTab === 'profile' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-pulse"></span>}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default ClientNavbar;

import { Bell, LayoutDashboard, User } from 'lucide-react';
import gccLogo from '../assets/logos/GCC.png';
import wmsuLogo from '../assets/logos/WMSU.png';

interface ClientNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userType?: string;
}

const ClientNavbar = ({ activeTab, setActiveTab }: ClientNavbarProps) => {
  return (
    <header className="bg-emerald-900 text-white sticky top-0 z-30 px-6 lg:px-10 py-4 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center -space-x-1.5">
          <img src={wmsuLogo} alt="WMSU Logo" className="w-11 h-11 object-contain z-10" />
          <img src={gccLogo} alt="GCC Logo" className="w-11 h-11 object-contain z-20" />
        </div>
        <div className="flex flex-col justify-center hidden sm:flex">
          <h1 className="text-2xl font-black tracking-wide uppercase leading-none text-white">WMSU GCC</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-400 mt-1">Portal System</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <nav className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'overview' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
          >
            <LayoutDashboard size={18} />
            <span className="hidden sm:inline">Dashboard</span>
            {activeTab === 'overview' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'profile' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
          >
            <User size={18} />
            <span className="hidden sm:inline">My Profile</span>
            {activeTab === 'profile' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}
          </button>
        </nav>

        <button className="w-10 h-10 bg-emerald-800 border border-emerald-700 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-emerald-800"></span>
        </button>
      </div>
    </header>
  );
};

export default ClientNavbar;

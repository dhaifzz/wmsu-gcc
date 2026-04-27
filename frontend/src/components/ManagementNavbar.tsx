import { Bell, Menu } from 'lucide-react';

interface ManagementNavbarProps {
  userName: string;
  onMenuClick: () => void;
}

const ManagementNavbar = ({ userName, onMenuClick }: ManagementNavbarProps) => {
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

      <div className="flex items-center gap-4">
        <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 relative">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default ManagementNavbar;

import { Heart, Sparkles, HandHeart, PartyPopper, Lightbulb, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BLOG_CATEGORIES } from '../lib/blogApi';

const REACTION_GUIDE = [
  { icon: Heart, label: 'Support', color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'Show solidarity' },
  { icon: Sparkles, label: 'Inspire', color: 'text-amber-400', bg: 'bg-amber-400/10', desc: 'This motivates you' },
  { icon: HandHeart, label: 'Care', color: 'text-rose-400', bg: 'bg-rose-400/10', desc: 'Sending warmth' },
  { icon: PartyPopper, label: 'Celebrate', color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Congratulations!' },
  { icon: Lightbulb, label: 'Insightful', color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Learned something' },
];

const WELLNESS_TIPS = [
  '"Taking a 5-minute break every hour improves focus by 30%. Step away, breathe deeply, and come back refreshed."',
  '"Journaling for just 10 minutes a day can significantly reduce stress and improve emotional clarity."',
  '"Studies show that spending 20 minutes outdoors can lower cortisol levels and boost your mood."',
  '"Drinking water regularly throughout the day helps maintain concentration and cognitive performance."',
  '"Practicing gratitude — listing 3 things you\'re thankful for — rewires your brain for positivity."',
];

interface RightBlogSidebarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

const RightBlogSidebar = ({ activeCategory, onCategoryChange }: RightBlogSidebarProps) => {
  // Pick a tip based on the day
  const tipIndex = new Date().getDate() % WELLNESS_TIPS.length;

  return (
    <aside className="hidden xl:flex flex-col h-auto min-h-screen w-72 bg-transparent z-20 scrollbar-hide pt-2">
      <div className="p-6 space-y-8">

        {/* Wellness Tip - Vibrant Accent Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative bg-[#BD2D2D] rounded-xl shadow-2xl p-8 overflow-hidden group/tip"
        >
          {/* Glow effect */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full transition-all group-hover/tip:scale-150" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                <Lightbulb size={24} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Daily Insight</h4>
                <p className="text-sm font-black text-white">Wellness Tip</p>
              </div>
            </div>
            <p className="text-[15px] text-white leading-relaxed italic font-bold tracking-tight">
              {WELLNESS_TIPS[tipIndex]}
            </p>
          </div>
        </motion.div>

        {/* Categories - Interactive Tile Grid */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl p-7">
          <div className="flex items-center justify-between mb-6">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Explore Feed</h4>
             <ChevronRight size={14} className="text-slate-300" />
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {BLOG_CATEGORIES.map(cat => (
              <button key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`group/cat relative w-full flex items-center gap-4 px-5 py-4 rounded-xl text-xs font-black transition-all text-left border overflow-hidden ${
                  activeCategory === cat.value
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                    : 'text-slate-500 border-slate-100 bg-slate-50 hover:bg-slate-100 hover:text-emerald-700 hover:border-slate-200'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    activeCategory === cat.value ? 'bg-emerald-500/50' : 'bg-emerald-50 text-emerald-600'
                }`}>
                    <cat.icon size={18} className={activeCategory === cat.value ? 'text-white' : ''} />
                </div>
                <span className="flex-1">{cat.label}</span>
                <ChevronRight size={14} className={`transition-all ${activeCategory === cat.value ? 'translate-x-0 opacity-100 text-white/50' : '-translate-x-2 opacity-0 group-hover/cat:translate-x-0 group-hover/cat:opacity-100'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Reaction Guide - Polished Icon List */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl p-7">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-7">Community Interaction</h4>
          <div className="space-y-6">
            {REACTION_GUIDE.map(r => (
              <div key={r.label} className="flex items-center gap-5 group/react">
                <div className={`w-12 h-12 rounded-xl ${r.bg} flex items-center justify-center shrink-0 shadow-sm border border-white transition-all group-hover/react:scale-110 group-hover/react:rotate-6`}>
                  <r.icon size={22} className={r.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 tracking-wide">{r.label}</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 leading-tight">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Badge - Polished Status */}
        <div className="relative bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm p-8 overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <ShieldCheck size={40} className="text-emerald-600/10" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-emerald-100 shadow-sm">
                    <ShieldCheck size={20} className="text-emerald-600" />
                </div>
                <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Moderated Feed</p>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                All posts are reviewed by our certified GCC counselors to maintain a supportive and safe environment for everyone.
            </p>
          </div>
        </div>

        {/* Spacing for footer overlap protection */}
        <div className="h-10" />
      </div>
    </aside>
  );
};

export default RightBlogSidebar;

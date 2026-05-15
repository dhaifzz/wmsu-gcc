import { Heart, Sparkles, HandHeart, PartyPopper, Lightbulb, Phone, Mail, MapPin, ShieldCheck, ChevronRight, Info } from 'lucide-react';
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
    <aside className="hidden xl:flex flex-col h-full w-80 bg-emerald-950/10 backdrop-blur-3xl border-l border-white/5 z-20 overflow-y-auto scrollbar-hide">
      <div className="p-6 space-y-8">

        {/* About Card - Premium Brand Widget */}
        <div className="relative group bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-7 py-8 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.4),transparent)]" />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
                <Info size={12} className="text-emerald-300/50" />
                <p className="text-emerald-300/60 text-[9px] font-black uppercase tracking-[0.3em]">Official Center</p>
            </div>
            <h3 className="text-white font-black text-2xl tracking-tighter">WMSU GCC</h3>
            <div className="inline-block mt-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
               <p className="text-emerald-100/80 text-[9px] font-black uppercase tracking-widest">Wellness & Support</p>
            </div>
          </div>
          <div className="p-7 bg-white/[0.02]">
            <p className="text-xs text-emerald-50/70 leading-relaxed font-bold">
              Your safe space for academic guidance, career counseling, and mental health support at Western Mindanao State University.
            </p>
          </div>
        </div>

        {/* Wellness Tip - Vibrant Accent Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 rounded-[2.5rem] border border-white/20 shadow-2xl p-8 overflow-hidden group/tip"
        >
          {/* Glow effect */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full transition-all group-hover/tip:scale-150" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
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
        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-7">
          <div className="flex items-center justify-between mb-6">
             <h4 className="text-[10px] font-black text-emerald-100/40 uppercase tracking-[0.2em]">Explore Feed</h4>
             <ChevronRight size={14} className="text-emerald-100/20" />
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {BLOG_CATEGORIES.map(cat => (
              <button key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`group/cat relative w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black transition-all text-left border overflow-hidden ${
                  activeCategory === cat.value
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-xl shadow-emerald-500/20'
                    : 'text-emerald-100/60 border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white hover:border-white/10'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    activeCategory === cat.value ? 'bg-white/20' : 'bg-emerald-500/10'
                }`}>
                    <cat.icon size={18} className={activeCategory === cat.value ? 'text-white' : 'text-emerald-400'} />
                </div>
                <span className="flex-1">{cat.label}</span>
                <ChevronRight size={14} className={`transition-all ${activeCategory === cat.value ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover/cat:translate-x-0 group-hover/cat:opacity-100'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Reaction Guide - Polished Icon List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-7">
          <h4 className="text-[10px] font-black text-emerald-100/40 uppercase tracking-[0.2em] mb-7">Community Interaction</h4>
          <div className="space-y-6">
            {REACTION_GUIDE.map(r => (
              <div key={r.label} className="flex items-center gap-5 group/react">
                <div className={`w-12 h-12 rounded-2xl ${r.bg} flex items-center justify-center shrink-0 shadow-lg border border-white/5 transition-all group-hover/react:scale-110 group-hover/react:rotate-6`}>
                  <r.icon size={22} className={r.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white tracking-wide">{r.label}</p>
                  <p className="text-[10px] text-emerald-100/30 font-bold mt-1 leading-tight">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info - Structured Grid */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-8">
          <h4 className="text-[10px] font-black text-emerald-100/40 uppercase tracking-[0.2em] mb-7 text-center">Helpful Information</h4>
          <div className="space-y-5">
            {[
              { icon: MapPin, label: 'Main Campus', value: 'GCC Building, WMSU Campus, Normal Road, Zamboanga City' },
              { icon: Phone, label: 'Helpline', value: '(062) 991-1040' },
              { icon: Mail, label: 'Email', value: 'gcc@wmsu.edu.ph' },
            ].map(item => (
              <div key={item.label} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5 shrink-0 text-emerald-400">
                  <item.icon size={16} />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-black text-emerald-100/20 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-[11px] text-emerald-50/70 leading-relaxed font-bold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Badge - Polished Status */}
        <div className="relative bg-emerald-600/10 backdrop-blur-md rounded-[2.5rem] border border-emerald-500/20 shadow-xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <ShieldCheck size={40} className="text-emerald-500/10" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck size={20} className="text-emerald-400" />
                </div>
                <p className="text-xs font-black text-white uppercase tracking-widest">Moderated Feed</p>
            </div>
            <p className="text-[11px] text-emerald-100/50 leading-relaxed font-bold">
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

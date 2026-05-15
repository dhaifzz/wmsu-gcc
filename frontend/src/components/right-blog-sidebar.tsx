import { Heart, Sparkles, HandHeart, PartyPopper, Lightbulb, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { BLOG_CATEGORIES } from '../lib/blogApi';

const REACTION_GUIDE = [
  { icon: Heart, label: 'Support', color: 'text-emerald-600', bg: 'bg-emerald-100', desc: 'Show solidarity' },
  { icon: Sparkles, label: 'Inspire', color: 'text-amber-500', bg: 'bg-amber-100', desc: 'This motivates you' },
  { icon: HandHeart, label: 'Care', color: 'text-rose-500', bg: 'bg-rose-100', desc: 'Sending warmth' },
  { icon: PartyPopper, label: 'Celebrate', color: 'text-purple-500', bg: 'bg-purple-100', desc: 'Congratulations!' },
  { icon: Lightbulb, label: 'Insightful', color: 'text-blue-500', bg: 'bg-blue-100', desc: 'Learned something' },
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
    <aside className="hidden lg:flex flex-col sticky top-[260px] h-[calc(100vh-280px)] w-80 bg-emerald-950/20 backdrop-blur-3xl border border-white/5 rounded-3xl z-20 overflow-y-auto no-scrollbar">
      <div className="p-6 space-y-6">

        {/* About Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-6">
            <h3 className="text-white font-black text-lg">WMSU GCC</h3>
            <p className="text-emerald-100/60 text-xs font-bold mt-1 uppercase tracking-widest">Guidance & Counseling</p>
          </div>
          <div className="p-6 text-xs text-emerald-50/70 leading-relaxed font-medium">
            Your safe space for academic guidance, career counseling, mental health support, and personal development at Western Mindanao State University.
          </div>
        </div>

        {/* Wellness Tip */}
        <div className="bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/10">
              <Lightbulb size={20} className="text-white" />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Wellness Tip</h4>
          </div>
          <p className="text-sm text-white/90 leading-relaxed italic font-medium">
            {WELLNESS_TIPS[tipIndex]}
          </p>
        </div>

        {/* Browse by Category */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6">
          <h4 className="text-[10px] font-black text-emerald-100/50 uppercase tracking-[0.2em] mb-4">Browse by Category</h4>
          <div className="space-y-2">
            {BLOG_CATEGORIES.map(cat => (
              <button key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all text-left border ${
                  activeCategory === cat.value
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg'
                    : 'text-emerald-100/60 border-transparent hover:bg-white/5 hover:text-white'
                }`}>
                <cat.icon size={16} className={activeCategory === cat.value ? 'text-white' : 'text-emerald-400/60'} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reaction Guide */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6">
          <h4 className="text-[10px] font-black text-emerald-100/50 uppercase tracking-[0.2em] mb-4">How to React</h4>
          <div className="space-y-4">
            {REACTION_GUIDE.map(r => (
              <div key={r.label} className="flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110`}>
                  <r.icon size={18} className={r.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white">{r.label}</p>
                  <p className="text-[10px] text-emerald-100/40 font-bold mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6">
          <h4 className="text-[10px] font-black text-emerald-100/50 uppercase tracking-[0.2em] mb-4">Get in Touch</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                <MapPin size={14} className="text-emerald-400" />
              </div>
              <p className="text-[11px] text-emerald-50/70 leading-relaxed font-bold">GCC Building, WMSU Campus, Normal Road, Zamboanga City</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                <Phone size={14} className="text-emerald-400" />
              </div>
              <p className="text-[11px] text-emerald-50/70 font-bold">(062) 991-1040</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                <Mail size={14} className="text-emerald-400" />
              </div>
              <p className="text-[11px] text-emerald-50/70 font-bold">gcc@wmsu.edu.ph</p>
            </div>
          </div>
        </div>

        {/* Community Badge */}
        <div className="bg-emerald-600/20 backdrop-blur-md rounded-2xl border border-emerald-500/20 shadow-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck size={20} className="text-emerald-400" />
            <p className="text-xs font-black text-white">Trusted Community</p>
          </div>
          <p className="text-[11px] text-emerald-100/50 leading-relaxed font-bold">
            All posts are reviewed by the GCC team to ensure quality and relevance for our students.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default RightBlogSidebar;

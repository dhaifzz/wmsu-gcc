import { Heart, Sparkles, HandHeart, PartyPopper, Lightbulb, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
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
    <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-36 space-y-4">

      {/* About Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-5 py-4">
          <h3 className="text-white font-black text-sm">Guidance & Counseling Center</h3>
          <p className="text-emerald-100/80 text-xs font-medium mt-1">Western Mindanao State University</p>
        </div>
        <div className="p-4 text-xs text-slate-500 leading-relaxed">
          Your safe space for academic guidance, career counseling, mental health support, and personal development.
        </div>
      </div>

      {/* Wellness Tip */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200/40 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <Lightbulb size={14} className="text-amber-600" />
          </div>
          <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Wellness Tip</h4>
        </div>
        <p className="text-xs text-amber-800/70 leading-relaxed italic">
          {WELLNESS_TIPS[tipIndex]}
        </p>
      </div>

      {/* Browse by Category */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Browse by Category</h4>
        <div className="space-y-1">
          {BLOG_CATEGORIES.map(cat => (
            <button key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                activeCategory === cat.value
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}>
              <cat.icon size={14} className={activeCategory === cat.value ? 'text-emerald-600' : 'text-slate-400'} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reaction Guide */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">How to React</h4>
        <div className="space-y-2">
          {REACTION_GUIDE.map(r => (
            <div key={r.label} className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full ${r.bg} flex items-center justify-center shrink-0`}>
                <r.icon size={13} className={r.color} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-700">{r.label}</p>
                <p className="text-[10px] text-slate-400">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Contact Us</h4>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <MapPin size={13} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">GCC Building, WMSU Campus, Zamboanga City</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone size={13} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] text-slate-500">(062) 991-1040</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail size={13} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] text-slate-500">gcc@wmsu.edu.ph</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock size={13} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] text-slate-500">Mon – Fri, 8:00 AM – 5:00 PM</p>
          </div>
        </div>
      </div>

      {/* Community Badge */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50 p-4">
        <div className="flex items-center gap-2.5 mb-2">
          <ShieldCheck size={16} className="text-emerald-600" />
          <p className="text-xs font-black text-emerald-800">Trusted Community</p>
        </div>
        <p className="text-[11px] text-emerald-700/60 leading-relaxed">
          All posts are reviewed by the GCC team to ensure quality and relevance for our students.
        </p>
      </div>
    </aside>
  );
};

export default RightBlogSidebar;

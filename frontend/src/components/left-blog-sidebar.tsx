import { useState, useEffect } from 'react';
import { LogIn, Bookmark, BookmarkCheck, Pencil, Check, X, Heart, MessageCircle, Sparkles, User, Settings, Info, MapPin, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { blogApi, type SavedPostItem } from '../lib/blogApi';

interface LeftBlogSidebarProps {
  user: { id: string; firstName?: string; lastName?: string } | null;
  token: string | null;
  onToggleSave: (postId: string) => void;
}


const LeftBlogSidebar = ({ user, token, onToggleSave }: LeftBlogSidebarProps) => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [savingNickname, setSavingNickname] = useState(false);
  const [savedPosts, setSavedPosts] = useState<SavedPostItem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Fetch nickname + saved posts when user is logged in
  useEffect(() => {
    if (!user || !token) return;

    blogApi.getNickname(token).then(res => {
      if (res.ok && res.data.nickname) {
        setNickname(res.data.nickname);
        setNicknameInput(res.data.nickname);
      }
    });

    setLoadingSaved(true);
    blogApi.getSavedPosts(token).then(res => {
      if (res.ok) setSavedPosts(res.data.savedPosts);
      setLoadingSaved(false);
    });
  }, [user, token]);

  const handleSaveNickname = async () => {
    if (!token || nicknameInput.trim().length < 2) return;
    setSavingNickname(true);
    const res = await blogApi.setNickname(nicknameInput.trim(), token);
    if (res.ok) {
      setNickname(res.data.nickname);
      setEditingNickname(false);
    }
    setSavingNickname(false);
  };

  // ── Not logged in ────────────────────────────────────────────────
  if (!user) {
    return (
      <aside className="hidden xl:flex flex-col h-auto min-h-screen w-72 bg-transparent z-20 scrollbar-hide">
        <div className="p-6 space-y-6">
          {/* Sign In Card */}
          <div className="group bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-emerald-500/10 hover:border-emerald-500/20">
            <div className="relative bg-emerald-900 px-6 py-10 text-center overflow-hidden">
              {/* Decorative light effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20"
              >
                <LogIn size={36} className="text-white drop-shadow-lg" />
              </motion.div>
              
              <h3 className="text-white font-black text-xl tracking-tight">Welcome Back</h3>
              <p className="text-emerald-100/80 text-[11px] font-bold mt-2 leading-relaxed uppercase tracking-widest">
                Join our Wellness Community
              </p>
            </div>
            
            <div className="p-6 space-y-6 bg-white">
              <div className="space-y-4">
                {[
                  { icon: Heart, label: 'React to wellness posts', color: 'text-rose-400', bg: 'bg-rose-400/10' },
                  { icon: MessageCircle, label: 'Join student discussions', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { icon: Bookmark, label: 'Save important resources', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                  { icon: Sparkles, label: 'Choose your unique alias', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                ].map((f, i) => (
                  <motion.div 
                    key={f.label}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center border border-slate-50`}>
                      <f.icon size={16} className={f.color} />
                    </div>
                    <span className="text-[11px] text-slate-600 font-black tracking-wide">{f.label}</span>
                  </motion.div>
                ))}
              </div>
              
              <a href="/login"
                className="group/btn relative flex items-center justify-center w-full py-4 rounded-xl bg-emerald-600 text-white text-sm font-black transition-all shadow-xl shadow-emerald-900/40 hover:bg-emerald-400 active:scale-95 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                Sign In to Continue
              </a>
            </div>
          </div>

          {/* Guest Stats placeholder or decorative card */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6 text-center">
             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Join 500+ Students online</p>
          </div>

          {/* About Card - Premium Brand Widget */}
          <div className="relative group bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="bg-emerald-900 px-7 py-8 relative">
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
            <div className="p-7 bg-white">
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                Your safe space for academic guidance, career counseling, and mental health support at Western Mindanao State University.
              </p>
            </div>
          </div>

          {/* Contact Info - Structured Grid */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl p-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-7 text-center">Helpful Information</h4>
            <div className="space-y-5">
              {[
                { icon: MapPin, label: 'Main Campus', value: 'GCC Building, WMSU Campus, Normal Road, Zamboanga City' },
                { icon: Phone, label: 'Helpline', value: '(062) 991-1040' },
                { icon: Mail, label: 'Email', value: 'gcc@wmsu.edu.ph' },
              ].map(item => (
                <div key={item.label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0 text-emerald-600">
                    <item.icon size={16} />
                  </div>
                  <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ── Logged in ────────────────────────────────────────────────────
  return (
    <aside className="hidden xl:flex flex-col h-auto min-h-screen w-72 bg-transparent z-20 scrollbar-hide pt-2">
      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <div className="group bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="relative bg-emerald-900 px-6 py-8">
            <div className="absolute top-0 right-0 p-4">
               <Settings size={14} className="text-white/50 hover:text-white transition-colors cursor-pointer" />
            </div>
            
            <div className="flex flex-col items-center text-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-3xl mb-4 shadow-2xl border border-white/20"
              >
                {user.firstName?.charAt(0).toUpperCase() || <User size={32} />}
              </motion.div>
              
              <h3 className="text-white font-black text-xl tracking-tight truncate w-full px-2">
                {user.firstName} {user.lastName}
              </h3>
              
              <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-black/20 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-100/70 uppercase tracking-widest">Active Now</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Alias Identity</h4>
              <Sparkles size={12} className="text-amber-500" />
            </div>

            {editingNickname ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    placeholder="Set your alias..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-900 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-400"
                    autoFocus
                    maxLength={30}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-black">
                    {nicknameInput.length}/30
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNickname}
                    disabled={savingNickname || nicknameInput.trim().length < 2}
                    className="flex-1 bg-emerald-500 text-white py-3.5 rounded-xl text-xs font-black hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {savingNickname ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                    Update
                  </button>
                  <button
                    onClick={() => { setEditingNickname(false); setNicknameInput(nickname || ''); }}
                    className="px-5 bg-slate-200 text-slate-600 py-3.5 rounded-xl text-xs font-black hover:bg-slate-300 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-between group/nick">
                <div className="min-w-0">
                  <p className={`font-black text-lg truncate ${nickname ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                    {nickname ? `@${nickname}` : 'No Alias Set'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    Your public identifier
                  </p>
                </div>
                <button
                  onClick={() => { setNicknameInput(nickname || ''); setEditingNickname(true); }}
                  className="p-3 rounded-xl bg-slate-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Saved Posts / Bookmarks */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <BookmarkCheck size={18} className="text-emerald-600" />
              </div>
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Bookmarks</h4>
            </div>
            {savedPosts.length > 0 && (
              <div className="relative">
                 <div className="absolute inset-0 bg-emerald-400 blur-md opacity-20" />
                 <span className="relative text-[10px] bg-emerald-500 text-white px-3 py-1 rounded-full font-black shadow-lg shadow-emerald-500/40">
                  {savedPosts.length}
                 </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {loadingSaved ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase">Syncing...</p>
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="text-center py-12 px-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                   <Bookmark size={20} className="text-slate-300" />
                </div>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  Your saved wellness resources will appear here for quick access.
                </p>
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto pr-2 no-scrollbar space-y-3">
                <AnimatePresence mode="popLayout">
                  {savedPosts.map((p, idx) => (
                    <motion.div
                      key={p.post_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative bg-white hover:bg-slate-50 rounded-xl p-4 border border-slate-100 transition-all cursor-pointer hover:border-emerald-200 hover:shadow-md"
                    >
                      <a href={`#post-${p.post_id}`} className="block pr-8">
                        <p className="text-xs text-slate-700 font-black line-clamp-2 leading-relaxed transition-colors group-hover:text-emerald-700">
                          {p.blog_posts?.content || 'Saved Resource'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="w-1 h-1 rounded-full bg-emerald-500" />
                           <span className="text-[9px] text-slate-400 font-black uppercase">Wellness Post</span>
                        </div>
                      </a>
                      <button
                        onClick={(e) => { e.preventDefault(); onToggleSave(p.post_id); }}
                        className="absolute right-3 top-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* About Card - Premium Brand Widget */}
        <div className="relative group bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="bg-emerald-900 px-7 py-8 relative">
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
          <div className="p-7 bg-white">
            <p className="text-xs text-slate-500 leading-relaxed font-bold">
              Your safe space for academic guidance, career counseling, and mental health support at Western Mindanao State University.
            </p>
          </div>
        </div>

        {/* Contact Info - Structured Grid */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl p-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-7 text-center">Helpful Information</h4>
          <div className="space-y-5">
            {[
              { icon: MapPin, label: 'Main Campus', value: 'GCC Building, WMSU Campus, Normal Road, Zamboanga City' },
              { icon: Phone, label: 'Helpline', value: '(062) 991-1040' },
              { icon: Mail, label: 'Email', value: 'gcc@wmsu.edu.ph' },
            ].map(item => (
              <div key={item.label} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0 text-emerald-600">
                  <item.icon size={16} />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-bold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
};

export default LeftBlogSidebar;

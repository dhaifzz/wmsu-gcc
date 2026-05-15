import { useState, useEffect } from 'react';
import { LogIn, Bookmark, BookmarkCheck, Pencil, Check, X, Heart, MessageCircle, Sparkles, User, Settings } from 'lucide-react';
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
      <aside className="hidden xl:flex flex-col h-full w-72 bg-emerald-950/10 backdrop-blur-3xl border-r border-white/5 z-20 overflow-y-auto scrollbar-hide">
        <div className="p-6 space-y-6">
          {/* Sign In Card */}
          <div className="group bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-emerald-500/10 hover:border-emerald-500/20">
            <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-6 py-10 text-center overflow-hidden">
              {/* Decorative light effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20"
              >
                <LogIn size={36} className="text-white drop-shadow-lg" />
              </motion.div>
              
              <h3 className="text-white font-black text-xl tracking-tight">Welcome Back</h3>
              <p className="text-emerald-100/60 text-[11px] font-bold mt-2 leading-relaxed uppercase tracking-widest">
                Join our Wellness Community
              </p>
            </div>
            
            <div className="p-6 space-y-6 bg-white/[0.02]">
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
                    <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center border border-white/5`}>
                      <f.icon size={16} className={f.color} />
                    </div>
                    <span className="text-[11px] text-emerald-50/70 font-black tracking-wide">{f.label}</span>
                  </motion.div>
                ))}
              </div>
              
              <a href="/login"
                className="group/btn relative flex items-center justify-center w-full py-4 rounded-2xl bg-emerald-500 text-white text-sm font-black transition-all shadow-xl shadow-emerald-900/40 hover:bg-emerald-400 active:scale-95 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                Sign In to Continue
              </a>
            </div>
          </div>

          {/* Guest Stats placeholder or decorative card */}
          <div className="bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 p-6 text-center">
             <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.2em]">Join 500+ Students online</p>
          </div>
        </div>
      </aside>
    );
  }

  // ── Logged in ────────────────────────────────────────────────────
  return (
    <aside className="hidden xl:flex flex-col h-full w-72 bg-emerald-950/10 backdrop-blur-3xl border-r border-white/5 z-20 overflow-y-auto scrollbar-hide">
      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-6 py-8">
            <div className="absolute top-0 right-0 p-4">
               <Settings size={14} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
            </div>
            
            <div className="flex flex-col items-center text-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-3xl mb-4 shadow-2xl border border-white/20"
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

          <div className="p-6 bg-emerald-900/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-black text-emerald-100/50 uppercase tracking-[0.2em]">Alias Identity</h4>
              <Sparkles size={12} className="text-amber-400" />
            </div>

            {editingNickname ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    placeholder="Set your alias..."
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-emerald-400/50 outline-none transition-all placeholder:text-white/10"
                    autoFocus
                    maxLength={30}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-white/20 font-black">
                    {nicknameInput.length}/30
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNickname}
                    disabled={savingNickname || nicknameInput.trim().length < 2}
                    className="flex-1 bg-emerald-500 text-white py-3.5 rounded-2xl text-xs font-black hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {savingNickname ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                    Update
                  </button>
                  <button
                    onClick={() => { setEditingNickname(false); setNicknameInput(nickname || ''); }}
                    className="px-5 bg-white/5 text-white/70 py-3.5 rounded-2xl text-xs font-black hover:bg-white/10 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-between group/nick">
                <div className="min-w-0">
                  <p className={`font-black text-lg truncate ${nickname ? 'text-white' : 'text-white/20 italic'}`}>
                    {nickname ? `@${nickname}` : 'No Alias Set'}
                  </p>
                  <p className="text-[10px] text-emerald-100/30 font-bold mt-1">
                    Your public identifier
                  </p>
                </div>
                <button
                  onClick={() => { setNicknameInput(nickname || ''); setEditingNickname(true); }}
                  className="p-3 rounded-2xl bg-white/5 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Saved Posts / Bookmarks */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                <BookmarkCheck size={18} className="text-emerald-400" />
              </div>
              <h4 className="text-[11px] font-black text-emerald-100/70 uppercase tracking-[0.2em]">Bookmarks</h4>
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
                <div className="w-8 h-8 border-3 border-emerald-200/10 border-t-emerald-400 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-emerald-100/20 uppercase">Syncing...</p>
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="text-center py-12 px-6 bg-black/20 rounded-[2rem] border border-white/5">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                   <Bookmark size={20} className="text-emerald-100/10" />
                </div>
                <p className="text-[11px] text-emerald-100/30 font-bold leading-relaxed">
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
                      className="group relative bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl p-4 border border-white/5 transition-all cursor-pointer hover:border-emerald-500/30"
                    >
                      <a href={`#post-${p.post_id}`} className="block pr-8">
                        <p className="text-xs text-emerald-50 font-black line-clamp-2 leading-relaxed transition-colors group-hover:text-white">
                          {p.blog_posts?.content || 'Saved Resource'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                           <span className="text-[9px] text-emerald-100/30 font-black uppercase">Wellness Post</span>
                        </div>
                      </a>
                      <button
                        onClick={(e) => { e.preventDefault(); onToggleSave(p.post_id); }}
                        className="absolute right-3 top-4 p-2 text-white/10 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
      </div>
    </aside>
  );
};

export default LeftBlogSidebar;

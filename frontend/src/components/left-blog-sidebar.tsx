import { useState, useEffect } from 'react';
import { LogIn, Bookmark, BookmarkCheck, UserCircle, Pencil, Check, X, Heart, MessageCircle, Sparkles } from 'lucide-react';
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
      <aside className="hidden xl:flex flex-col sticky top-[260px] h-[calc(100vh-280px)] w-80 bg-emerald-950/20 backdrop-blur-3xl border border-white/5 rounded-3xl z-20 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-6">
          {/* Sign In Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <LogIn size={32} className="text-white" />
              </div>
              <h3 className="text-white font-black text-lg">Join the Conversation</h3>
              <p className="text-emerald-100/60 text-xs font-medium mt-2 leading-relaxed">
                Sign in to react, comment, and save your favorite wellness posts.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {[
                  { icon: Heart, label: 'React to posts', color: 'text-rose-400' },
                  { icon: MessageCircle, label: 'Join discussions', color: 'text-blue-400' },
                  { icon: Bookmark, label: 'Save favorites', color: 'text-amber-400' },
                  { icon: Sparkles, label: 'Set a nickname', color: 'text-purple-400' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                      <f.icon size={14} className={f.color} />
                    </div>
                    <span className="text-xs text-emerald-50/70 font-bold">{f.label}</span>
                  </div>
                ))}
              </div>
              <a href="/login"
                className="flex items-center justify-center w-full py-4 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/40 active:scale-95">
                Sign In Now
              </a>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ── Loged in ────────────────────────────────────────────────────
  return (
    <aside className="hidden xl:flex flex-col sticky top-[260px] h-[calc(100vh-280px)] w-80 bg-emerald-950/20 backdrop-blur-3xl border border-white/5 rounded-3xl z-20 overflow-y-auto no-scrollbar">
      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-inner">
                {user.firstName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-white font-black text-lg truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-emerald-100/60 text-xs font-bold flex items-center gap-1.5 mt-1">
                  <UserCircle size={12} /> Active Account
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-emerald-900/40">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black text-emerald-100/50 uppercase tracking-[0.2em]">Your Identity</h4>
              <Sparkles size={12} className="text-amber-400" />
            </div>

            {editingNickname ? (
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    placeholder="Enter nickname..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-400 outline-none transition-all"
                    autoFocus
                    maxLength={30}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-bold">
                    {nicknameInput.length}/30
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNickname}
                    disabled={savingNickname || nicknameInput.trim().length < 2}
                    className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-black hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {savingNickname ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingNickname(false); setNicknameInput(nickname || ''); }}
                    className="px-4 bg-white/5 text-white/70 py-2.5 rounded-xl text-xs font-black hover:bg-white/10 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <div className="min-w-0">
                  <p className="text-white font-black text-base truncate">
                    {nickname ? `@${nickname}` : 'No Nickname Set'}
                  </p>
                  <p className="text-[10px] text-emerald-100/40 font-bold mt-0.5">
                    Visible in comments
                  </p>
                </div>
                <button
                  onClick={() => { setNicknameInput(nickname || ''); setEditingNickname(true); }}
                  className="p-2.5 rounded-xl bg-white/5 text-emerald-400 hover:bg-white/10 hover:text-emerald-300 transition-all"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Saved Posts */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <BookmarkCheck size={16} className="text-emerald-400" />
              <h4 className="text-[11px] font-black text-emerald-100/70 uppercase tracking-widest">Bookmarks</h4>
            </div>
            {savedPosts.length > 0 && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black border border-emerald-500/30">
                {savedPosts.length}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {loadingSaved ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-emerald-200/20 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="text-center py-8 px-4 bg-black/10 rounded-2xl border border-white/5">
                <Bookmark size={24} className="text-emerald-100/10 mx-auto mb-2" />
                <p className="text-[10px] text-emerald-100/30 font-bold leading-relaxed">
                  Saved posts appear here.
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto pr-1 no-scrollbar space-y-2.5">
                <AnimatePresence>
                  {savedPosts.map(p => (
                    <motion.div
                      key={p.post_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="group relative bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/5 transition-all cursor-pointer"
                    >
                      <a href={`#post-${p.post_id}`} className="block pr-6">
                        <p className="text-[11px] text-emerald-50 font-black line-clamp-2 leading-relaxed">
                          {p.blog_posts?.content || 'Saved Post'}
                        </p>
                      </a>
                      <button
                        onClick={(e) => { e.preventDefault(); onToggleSave(p.post_id); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
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

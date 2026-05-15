import { useState, useEffect } from 'react';
import { LogIn, Bookmark, BookmarkCheck, UserCircle, Pencil, Check, X, Heart, MessageCircle, Sparkles, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { blogApi, type SavedPostItem } from '../lib/blogApi';

interface LeftBlogSidebarProps {
  user: { id: string; firstName?: string; lastName?: string } | null;
  token: string | null;
  savedPostIds: Set<string>;
  onToggleSave: (postId: string) => void;
}

function formatTimeShort(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const LeftBlogSidebar = ({ user, token, savedPostIds, onToggleSave }: LeftBlogSidebarProps) => {
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
      <aside className="hidden xl:block w-72 shrink-0 sticky top-36 space-y-4">
        {/* Sign In Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-5 py-5 text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <LogIn size={24} className="text-white" />
            </div>
            <h3 className="text-white font-black text-sm">Join the Conversation</h3>
            <p className="text-emerald-100/70 text-[11px] font-medium mt-1">
              Sign in to react and comment on posts.
            </p>
          </div>
          <div className="p-4 space-y-3">
            {/* Feature preview */}
            <div className="space-y-2">
              {[
                { icon: Heart, label: 'React to posts', color: 'text-rose-500' },
                { icon: MessageCircle, label: 'Join discussions', color: 'text-blue-500' },
                { icon: Bookmark, label: 'Save favorites', color: 'text-amber-500' },
                { icon: Sparkles, label: 'Set a nickname', color: 'text-purple-500' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center">
                    <f.icon size={12} className={f.color} />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{f.label}</span>
                </div>
              ))}
            </div>
            <a href="/login"
              className="block w-full py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors text-center shadow-sm">
              Sign In
            </a>
          </div>
        </div>
      </aside>
    );
  }

  // ── Loged in ────────────────────────────────────────────────────
  return (
    <aside className="hidden xl:block w-72 shrink-0 sticky top-36 space-y-4">
      {/* Profile Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg shrink-0">
              {user.firstName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-white font-black text-sm truncate">{user.firstName} {user.lastName}</p>
              {nickname && (
                <p className="text-emerald-200/80 text-[10px] font-bold truncate">@{nickname}</p>
              )}
            </div>
          </div>
        </div>

        {/* Nickname Editor */}
        <div className="p-3 border-b border-slate-50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Comment Nickname</span>
            {!editingNickname && (
              <button onClick={() => { setEditingNickname(true); setNicknameInput(nickname || ''); }}
                className="text-slate-400 hover:text-emerald-600 transition-colors">
                <Pencil size={11} />
              </button>
            )}
          </div>
          <AnimatePresence mode="wait">
            {editingNickname ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5">
                <input
                  value={nicknameInput}
                  onChange={e => setNicknameInput(e.target.value)}
                  placeholder="e.g. WMSUBear"
                  maxLength={30}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 outline-none focus:border-emerald-300 text-slate-700"
                  autoFocus
                />
                <button onClick={handleSaveNickname} disabled={savingNickname || nicknameInput.trim().length < 2}
                  className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 disabled:opacity-40 transition-colors">
                  <Check size={12} />
                </button>
                <button onClick={() => setEditingNickname(false)}
                  className="w-7 h-7 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <X size={12} />
                </button>
              </motion.div>
            ) : (
              <motion.p key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-slate-600 font-medium">
                {nickname ? (
                  <span className="text-emerald-600 font-bold">@{nickname}</span>
                ) : (
                  <span className="text-slate-400 italic">No nickname set — tap edit</span>
                )}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="text-[9px] text-slate-300 mt-1">Used when posting comments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 divide-x divide-slate-50">
          <div className="p-3 text-center">
            <p className="text-lg font-black text-emerald-600">{savedPostIds.size}</p>
            <p className="text-[10px] text-slate-400 font-bold">Saved</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-black text-blue-500">
              <UserCircle size={18} className="inline" />
            </p>
            <p className="text-[10px] text-slate-400 font-bold">Active</p>
          </div>
        </div>
      </div>

      {/* Saved Posts */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookmarkCheck size={13} className="text-emerald-600" />
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Saved Posts</h4>
        </div>

        {loadingSaved ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="text-center py-3">
            <Save size={20} className="text-slate-200 mx-auto mb-1.5" />
            <p className="text-[11px] text-slate-400 font-medium">No saved posts yet</p>
            <p className="text-[10px] text-slate-300 mt-0.5">Bookmark posts to see them here</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {savedPosts.map(item => (
              <div key={item.post_id} className="group relative">
                <a href={`#post-${item.post_id}`}
                  className="block p-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <p className="text-[11px] text-slate-700 font-medium line-clamp-2 leading-relaxed">
                    {item.blog_posts?.content?.slice(0, 80) || 'Post'}
                    {(item.blog_posts?.content?.length ?? 0) > 80 ? '...' : ''}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {item.blog_posts?.author_name} · {formatTimeShort(item.created_at)}
                  </p>
                </a>
                <button
                  onClick={(e) => { e.preventDefault(); onToggleSave(item.post_id); setSavedPosts(prev => prev.filter(p => p.post_id !== item.post_id)); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-400"
                  title="Unsave">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default LeftBlogSidebar;

import { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, HandHeart, PartyPopper, Lightbulb, MessageCircle, Send, CornerDownRight, ExternalLink, X, LogIn, Search, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { blogApi, BLOG_CATEGORIES, type BlogPost, type BlogComment, type ReactionType } from '../lib/blogApi';

const REACTION_CONFIG: { type: ReactionType; icon: any; label: string; color: string; bg: string; desc: string }[] = [
  { type: 'support', icon: Heart, label: 'Support', color: 'text-emerald-600', bg: 'bg-emerald-100', desc: 'Show solidarity' },
  { type: 'inspire', icon: Sparkles, label: 'Inspire', color: 'text-amber-500', bg: 'bg-amber-100', desc: 'This motivates you' },
  { type: 'care', icon: HandHeart, label: 'Care', color: 'text-rose-500', bg: 'bg-rose-100', desc: 'Sending warmth' },
  { type: 'celebrate', icon: PartyPopper, label: 'Celebrate', color: 'text-purple-500', bg: 'bg-purple-100', desc: 'Congratulations!' },
  { type: 'insightful', icon: Lightbulb, label: 'Insightful', color: 'text-blue-500', bg: 'bg-blue-100', desc: 'Learned something' },
];

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildCommentTree(comments: BlogComment[]): (BlogComment & { replies: BlogComment[] })[] {
  const map = new Map<string, BlogComment & { replies: BlogComment[] }>();
  const roots: (BlogComment & { replies: BlogComment[] })[] = [];
  comments.forEach(c => map.set(c.id, { ...c, replies: [] }));
  comments.forEach(c => {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function getRoleBadgeColor(role: string) {
  const r = role.toLowerCase();
  if (r.includes('director')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (r.includes('admin') || r.includes('super')) return 'bg-purple-100 text-purple-700 border-purple-200';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200';
}

// ── Post Card ─────────────────────────────────────────────────────

function PostCard({ post, user, token, onNeedLogin }: { post: BlogPost; user: any; token: string | null; onNeedLogin: () => void }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>(post.reactions || {});
  const [totalReactions, setTotalReactions] = useState(post.totalReactions || 0);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const reactionTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (user && token) {
      blogApi.getReactions(post.id, user.id).then(res => {
        if (res.ok) {
          setReactions(res.data.reactions);
          setTotalReactions(res.data.totalReactions);
          setUserReaction(res.data.userReaction);
        }
      });
    }
  }, [post.id, user, token]);

  const loadComments = async () => {
    setLoadingComments(true);
    const res = await blogApi.getComments(post.id);
    if (res.ok) setComments(res.data.comments);
    setLoadingComments(false);
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleReact = async (type: ReactionType) => {
    if (!user || !token) { onNeedLogin(); return; }
    setShowReactionPicker(false);
    const prev = userReaction;
    const prevReactions = { ...reactions };
    const prevTotal = totalReactions;

    // Optimistic update
    if (prev === type) {
      setUserReaction(null);
      setReactions(r => ({ ...r, [type]: Math.max(0, (r[type] || 0) - 1) }));
      setTotalReactions(t => Math.max(0, t - 1));
    } else {
      if (prev) setReactions(r => ({ ...r, [prev]: Math.max(0, (r[prev] || 0) - 1) }));
      setUserReaction(type);
      setReactions(r => ({ ...r, [type]: (r[type] || 0) + 1 }));
      setTotalReactions(t => prev ? t : t + 1);
    }

    const res = await blogApi.toggleReaction(post.id, type, token);
    if (!res.ok) {
      setUserReaction(prev);
      setReactions(prevReactions);
      setTotalReactions(prevTotal);
    }
  };

  const handleComment = async () => {
    if (!user || !token) { onNeedLogin(); return; }
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const res = await blogApi.addComment(post.id, {
      content: commentText.trim(),
      parent_id: replyTo?.id || null,
      mentioned_user_name: replyTo?.name || null,
    }, token);
    if (res.ok) {
      setCommentText('');
      setReplyTo(null);
      loadComments();
    }
    setSubmitting(false);
  };

  const topReactions = Object.entries(reactions)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const commentTree = buildCommentTree(comments);

  const renderComment = (c: BlogComment & { replies: BlogComment[] }, depth = 0) => (
    <div key={c.id} className={`${depth > 0 ? 'ml-4 sm:ml-6 border-l-2 border-slate-100 pl-3 sm:pl-4' : ''}`}>
      <div className="flex gap-2 sm:gap-3 py-2 group">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-black">
          {c.author_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 rounded-2xl px-3 sm:px-4 py-2">
            <p className="font-bold text-xs sm:text-sm text-slate-800">{c.author_name}</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {c.mentioned_user_name && <span className="text-emerald-600 font-bold">@{c.mentioned_user_name} </span>}
              {c.content}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1 px-2">
            <span className="text-[10px] text-slate-400 font-bold">{formatTimeAgo(c.created_at)}</span>
            {user && token && (
              <button
                onClick={() => setReplyTo({ id: c.id, name: c.author_name })}
                className="text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
              >
                <CornerDownRight size={10} /> Reply
              </button>
            )}
          </div>
        </div>
      </div>
      {c.replies.map(r => renderComment(r as any, depth + 1))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl sm:rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-2 flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md">
          {post.author_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <p className="font-black text-slate-900 text-xs sm:text-sm">{post.author_name}</p>
            <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full border ${getRoleBadgeColor(post.author_role)}`}>
              {post.author_role}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-bold">
            {formatTimeAgo(post.created_at)}
            {post.category && post.category !== 'general' && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                {(() => { const catCfg = BLOG_CATEGORIES.find(c => c.value === post.category); return catCfg ? <><catCfg.icon size={10} /> {catCfg.label}</> : null; })()}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-5 pb-2">
        <p className="text-slate-700 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.link_url && (
          <a href={post.link_url} target="_blank" rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-bold bg-emerald-50 px-3 py-2 rounded-xl transition-colors border border-emerald-100">
            <ExternalLink size={14} /> <span className="truncate">{post.link_url}</span>
          </a>
        )}
      </div>

      {/* Media */}
      {post.media_urls.length > 0 && (
        <div className="relative">
          {post.media_types[mediaIndex] === 'video' ? (
            <video src={post.media_urls[mediaIndex]} controls className="w-full max-h-[300px] sm:max-h-[420px] object-contain bg-black" />
          ) : (
            <img src={post.media_urls[mediaIndex]} alt="" className="w-full max-h-[300px] sm:max-h-[420px] object-cover" />
          )}
          {post.media_urls.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
              {post.media_urls.map((_, i) => (
                <button key={i} onClick={() => setMediaIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === mediaIndex ? 'bg-white w-5' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reaction Summary & Comment Count */}
      {(totalReactions > 0 || post.commentCount > 0) && (
        <div className="px-4 sm:px-5 py-2 flex items-center justify-between text-[11px] sm:text-xs text-slate-400 border-b border-slate-50">
          <div className="flex items-center gap-1.5">
            {topReactions.map(([type]) => {
              const cfg = REACTION_CONFIG.find(r => r.type === type);
              if (!cfg) return null;
              return <div key={type} className={`w-5 h-5 rounded-full ${cfg.bg} flex items-center justify-center`}>
                <cfg.icon size={10} className={cfg.color} />
              </div>;
            })}
            {totalReactions > 0 && <span className="font-bold ml-1">{totalReactions}</span>}
          </div>
          {post.commentCount > 0 && (
            <button onClick={toggleComments} className="font-bold hover:text-emerald-600 hover:underline transition-colors">
              {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="px-3 sm:px-4 py-1 flex items-center border-b border-slate-50 relative">
        <div
          className="flex-1 relative"
          onMouseEnter={() => { clearTimeout(reactionTimeout.current); setShowReactionPicker(true); }}
          onMouseLeave={() => { reactionTimeout.current = setTimeout(() => setShowReactionPicker(false), 400); }}
        >
          <button
            onClick={() => { if (!user) { onNeedLogin(); return; } handleReact(userReaction || 'support'); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all w-full justify-center ${
              userReaction ? `${REACTION_CONFIG.find(r => r.type === userReaction)?.color} bg-slate-50` : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {userReaction ? (() => { const c = REACTION_CONFIG.find(r => r.type === userReaction); return c ? <><c.icon size={18} /> {c.label}</> : null; })() : <><Heart size={18} /> React</>}
          </button>

          <AnimatePresence>
            {showReactionPicker && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.9 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-full shadow-2xl border border-slate-100 px-2 py-1.5 flex gap-1 z-50">
                {REACTION_CONFIG.map(r => (
                  <button key={r.type} onClick={() => handleReact(r.type)} title={r.label}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-125 hover:${r.bg} ${userReaction === r.type ? r.bg + ' scale-110' : ''}`}>
                    <r.icon size={20} className={r.color} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={toggleComments}
          className="flex-1 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all justify-center">
          <MessageCircle size={18} /> Comment
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 sm:px-5 py-3">
              {loadingComments ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-0 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {commentTree.length === 0 && (
                    <p className="text-center text-sm text-slate-400 py-4 font-medium">No comments yet. Be the first!</p>
                  )}
                  {commentTree.map(c => renderComment(c))}
                </div>
              )}

              {/* Comment Input */}
              {user && token ? (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {replyTo && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg">
                      <CornerDownRight size={12} /> Replying to <span className="font-black">{replyTo.name}</span>
                      <button onClick={() => setReplyTo(null)} className="ml-auto text-slate-400 hover:text-slate-600"><X size={12} /></button>
                    </div>
                  )}
                    <div className="flex gap-2 sm:gap-3 items-end">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-black">
                      {user.firstName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 border border-slate-100 focus-within:border-emerald-300 transition-colors">
                      <input
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleComment()}
                        placeholder={replyTo ? `Reply to ${replyTo.name}...` : 'Write a comment...'}
                        className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400"
                      />
                      <button onClick={handleComment} disabled={submitting || !commentText.trim()}
                        className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                  <a href="/login" className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs sm:text-sm hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-colors border border-emerald-100">
                    <LogIn size={14} /> Sign in to comment
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Blog Page ─────────────────────────────────────────────────────

const BlogPage = () => {
  const { user, accessToken } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchPosts = async (p = 1, cat?: string, search?: string) => {
    setLoading(true);
    const c = cat !== undefined ? cat : activeCategory;
    const s = search !== undefined ? search : searchQuery;
    const res = await blogApi.getPosts(p, 10, c || undefined, s || undefined);
    if (res.ok) {
      setPosts(prev => p === 1 ? res.data.posts : [...prev, ...res.data.posts]);
      setTotal(res.data.total);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleCategoryChange = (cat: string) => {
    const newCat = activeCategory === cat ? '' : cat;
    setActiveCategory(newCat);
    setPage(1);
    fetchPosts(1, newCat, searchQuery);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(value);
      setPage(1);
      fetchPosts(1, activeCategory, value);
    }, 400);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, activeCategory, searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero removed — jump straight to content */}

      {/* Search & Filter Bar */}
      <section className="sticky top-16 z-30 bg-slate-50/90 backdrop-blur-md border-b border-slate-100 pt-2">
        <div className="container mx-auto px-3 sm:px-6 max-w-5xl py-3 space-y-3">
          {/* Search */}
          <div className="relative max-w-2xl">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={e => handleSearchInput(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-300 transition-colors shadow-sm"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); handleSearchInput(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => handleCategoryChange('')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeCategory === ''
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
              }`}>
              All
            </button>
            {BLOG_CATEGORIES.map(cat => (
              <button key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  activeCategory === cat.value
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}>
                <cat.icon size={12} /> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content: Feed + Sidebar */}
      <section className="py-6 sm:py-8 flex-1">
        <div className="container mx-auto px-3 sm:px-6 max-w-5xl">
          <div className="flex gap-6 items-start">

            {/* ── Feed Column ─────────────────────────── */}
            <div className="flex-1 min-w-0">
              {loading && posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-slate-400 font-bold text-sm">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-400">No posts yet</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Check back soon for updates!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} user={user} token={accessToken} onNeedLogin={() => setShowLoginPrompt(true)} />
                  ))}
                  {posts.length < total && (
                    <div className="text-center pt-3">
                      <button onClick={loadMore} disabled={loading}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm disabled:opacity-50">
                        {loading ? 'Loading...' : 'Load More Posts'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Sidebar ─────────────────────────────── */}
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
                  "Taking a 5-minute break every hour improves focus by 30%. Step away, breathe deeply, and come back refreshed."
                </p>
              </div>

              {/* Browse by Category */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Browse by Category</h4>
                <div className="space-y-1">
                  {BLOG_CATEGORIES.map(cat => (
                    <button key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
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
                  {REACTION_CONFIG.map(r => (
                    <div key={r.type} className="flex items-center gap-2.5">
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

              {/* Sign In Prompt (guests only) */}
              {!user && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                  <LogIn size={20} className="text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-1">Join the conversation</p>
                  <p className="text-[11px] text-slate-500 mb-3">Sign in to react and comment on posts.</p>
                  <a href="/login"
                    className="block w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-sm">
                    Sign In
                  </a>
                </div>
              )}
            </aside>

          </div>
        </div>
      </section>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setShowLoginPrompt(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn size={28} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Sign In Required</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">Please sign in to react and comment on posts.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLoginPrompt(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <a href="/login" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors text-center shadow-lg shadow-emerald-900/20">
                  Sign In
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default BlogPage;

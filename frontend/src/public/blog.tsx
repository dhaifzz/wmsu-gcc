import { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, HandHeart, PartyPopper, Lightbulb, MessageCircle, Send, CornerDownRight, ExternalLink, X, LogIn, Search, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeftBlogSidebar from '../components/left-blog-sidebar';
import RightBlogSidebar from '../components/right-blog-sidebar';
import { useAuth } from '../auth/AuthContext';
import { blogApi, BLOG_CATEGORIES, type BlogPost, type BlogComment, type ReactionType } from '../lib/blogApi';
import authBg from '../assets/img/Auth-Background.jpg';

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

function getYouTubeID(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getFacebookEmbedURL(url: string) {
  let sanitized = url.replace('m.facebook.com', 'www.facebook.com');
  if (!sanitized.includes('www.facebook.com') && sanitized.includes('facebook.com')) {
    sanitized = sanitized.replace('facebook.com', 'www.facebook.com');
  }
  return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(sanitized)}&show_text=true&width=500`;
}

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
          <div className="bg-emerald-50/50 backdrop-blur-sm rounded-2xl px-3 sm:px-4 py-2">
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
      className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden"
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
        {post.content && <p className="text-slate-700 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap mb-2">{post.content}</p>}
        
        {post.link_url && (
          <div className="space-y-3">
            {post.link_type === 'youtube' && getYouTubeID(post.link_url) ? (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeID(post.link_url)}`}
                  className="absolute inset-0 w-full h-full"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : post.link_type === 'facebook' ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white min-h-[500px]">
                <iframe
                  src={getFacebookEmbedURL(post.link_url)}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-sm border-t border-slate-100 flex justify-center">
                  <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <ExternalLink size={10} /> View on Facebook
                  </a>
                </div>
              </div>
            ) : (
              <a href={post.link_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-bold bg-emerald-50 px-3 py-2 rounded-xl transition-colors border border-emerald-100 group">
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
                <span className="truncate">{post.link_url}</span>
              </a>
            )}
          </div>
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
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    if (!accessToken) return;
    blogApi.getSavedPosts(accessToken).then(res => {
      if (res.ok) {
        setSavedPostIds(new Set(res.data.savedPosts.map(s => s.post_id)));
      }
    });
  }, [accessToken]);

  const handleToggleSave = async (postId: string) => {
    if (!accessToken) return;
    const isSaved = savedPostIds.has(postId);
    if (isSaved) {
      await blogApi.unsavePost(postId, accessToken);
      setSavedPostIds(prev => { const next = new Set(prev); next.delete(postId); return next; });
    } else {
      await blogApi.savePost(postId, accessToken);
      setSavedPostIds(prev => new Set(prev).add(postId));
    }
  };

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
    <div className="h-screen relative flex flex-col overflow-hidden bg-[#047857]">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBg})` }}
      />
      <div className="fixed inset-0 z-0 bg-[#047857]/85 backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        <Navbar />
        
        {/* Navbar Spacer - ensures content starts below the fixed navbar */}
        <div className="h-20 shrink-0" />

        <section className="flex-1 relative flex w-full overflow-hidden">
          <LeftBlogSidebar
            user={user}
            token={accessToken}
            onToggleSave={handleToggleSave}
          />

          <div className="flex-1 h-full min-w-0 overflow-y-auto custom-scrollbar flex flex-col items-center">
            {/* Search Area - No longer needs top-20 because parent section is already below navbar */}
            <div className="sticky top-0 z-30 w-full px-4 sm:px-6 mb-8 pt-6">
                <div className="bg-emerald-900/40 backdrop-blur-3xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Search Input */}
                    <div className="relative group max-w-2xl mx-auto">
                      <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
                      <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-300/40 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        value={searchInput}
                        onChange={e => handleSearchInput(e.target.value)}
                        placeholder="Search posts and discussions..."
                        className="relative w-full pl-14 pr-6 py-4.5 bg-black/20 border border-white/10 rounded-2xl text-base text-white placeholder:text-emerald-100/20 outline-none focus:bg-black/40 focus:border-emerald-400/50 transition-all shadow-inner backdrop-blur-md"
                      />
                      {searchInput && (
                        <button onClick={() => { setSearchInput(''); handleSearchInput(''); }}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    {/* Auto Carousel Category Filters - Infinite Marquee */}
                    <div className="relative group/filters max-w-4xl mx-auto overflow-hidden">
                      <motion.div 
                        className="flex gap-3 whitespace-nowrap py-2"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 40, 
                          ease: "linear" 
                        }}
                        style={{ width: "fit-content" }}
                        onHoverStart={() => { 
                           // This is a simplified way to pause, though Framer Motion's "pause" 
                           // state usually requires a useAnimation hook or similar. 
                           // For now, I'll use a CSS hover state or just leave it flowing.
                        }}
                      >
                        {/* First Set */}
                        <button
                          onClick={() => handleCategoryChange('')}
                          className={`shrink-0 px-8 py-3 rounded-xl text-[10px] font-black transition-all border tracking-[0.2em] uppercase ${
                            activeCategory === ''
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
                              : 'bg-white/5 text-emerald-100/50 border-white/5 hover:bg-white/10 hover:text-white'
                          }`}>
                          All
                        </button>
                        {BLOG_CATEGORIES.map(cat => (
                          <button key={`set1-${cat.value}`}
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`shrink-0 flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black transition-all border tracking-[0.2em] uppercase ${
                              activeCategory === cat.value
                                ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
                                : 'bg-white/5 text-emerald-100/50 border-white/5 hover:bg-white/10 hover:text-white'
                            }`}>
                            <cat.icon size={14} className={activeCategory === cat.value ? 'text-white' : 'text-emerald-400'} /> 
                            {cat.label}
                          </button>
                        ))}

                        {/* Duplicated Set for Seamless Loop */}
                        <button
                          onClick={() => handleCategoryChange('')}
                          className={`shrink-0 px-8 py-3 rounded-xl text-[10px] font-black transition-all border tracking-[0.2em] uppercase ${
                            activeCategory === ''
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
                              : 'bg-white/5 text-emerald-100/50 border-white/5 hover:bg-white/10 hover:text-white'
                          }`}>
                          All
                        </button>
                        {BLOG_CATEGORIES.map(cat => (
                          <button key={`set2-${cat.value}`}
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`shrink-0 flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black transition-all border tracking-[0.2em] uppercase ${
                              activeCategory === cat.value
                                ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
                                : 'bg-white/5 text-emerald-100/50 border-white/5 hover:bg-white/10 hover:text-white'
                            }`}>
                            <cat.icon size={14} className={activeCategory === cat.value ? 'text-white' : 'text-emerald-400'} /> 
                            {cat.label}
                          </button>
                        ))}
                      </motion.div>

                      {/* Edge Fades */}
                      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-emerald-950/40 to-transparent pointer-events-none z-10" />
                      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-emerald-950/40 to-transparent pointer-events-none z-10" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-2 px-4 sm:px-8 w-full flex justify-center">
                <div className="max-w-3xl w-full">
                  {loading && posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-200/10 border-t-emerald-400 rounded-full animate-spin shadow-2xl" />
                      <p className="text-emerald-100/30 font-black text-xs uppercase tracking-widest">Refreshing Feed...</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 shadow-2xl">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <MessageCircle size={48} className="text-emerald-200/20" />
                      </div>
                      <h3 className="text-2xl font-black text-white/80 tracking-tight">No conversations found</h3>
                      <p className="text-emerald-100/30 text-sm font-bold mt-2 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-8 pb-20">
                      {posts.map(post => (
                        <div key={post.id} id={`post-${post.id}`} className="relative group">
                          <PostCard post={post} user={user} token={accessToken} onNeedLogin={() => setShowLoginPrompt(true)} />
                          <button
                            onClick={() => user ? handleToggleSave(post.id) : setShowLoginPrompt(true)}
                            className={`absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all z-10 shadow-2xl border ${
                              savedPostIds.has(post.id)
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : 'bg-white/10 text-white/20 hover:bg-emerald-500 hover:text-white border-white/10 backdrop-blur-xl'
                            }`}
                            title={savedPostIds.has(post.id) ? 'Unsave post' : 'Save post'}>
                            {savedPostIds.has(post.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                          </button>
                        </div>
                      ))}
                      {posts.length < total && (
                        <div className="text-center pt-10">
                          <button onClick={loadMore} disabled={loading}
                            className="group relative px-14 py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[2rem] font-black text-sm transition-all shadow-2xl shadow-emerald-900/60 disabled:opacity-50 active:scale-95 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {loading ? 'Synchronizing...' : 'Load More Experiences'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
              </div>
            </div>

            <RightBlogSidebar
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
        </section>

        <div className="relative z-20 bg-[#BD2D2D] border-t border-rose-800/50 shrink-0">
          <Footer />
        </div>

        <AnimatePresence>
          {showLoginPrompt && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
              onClick={() => setShowLoginPrompt(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center border border-white/10">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <LogIn size={36} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Identity Required</h3>
                <p className="text-sm text-slate-500 font-bold mb-8 leading-relaxed">Join our community to interact, comment, and save valuable experiences.</p>
                <div className="flex flex-col gap-3">
                  <a href="/login" className="py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-500 transition-all text-center shadow-xl shadow-emerald-900/20">
                    Sign In to GCC
                  </a>
                  <button onClick={() => setShowLoginPrompt(false)} className="py-4 rounded-2xl border border-slate-100 text-slate-400 font-black text-sm hover:bg-slate-50 transition-all">
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Removed Footer from scroll area to keep focus on feed, 
            or we can put it at the bottom of the middle column scroll */}
      </div>
    </div>
  );
};

export default BlogPage;

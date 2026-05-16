import { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, HandHeart, PartyPopper, Lightbulb, MessageCircle, Send, CornerDownRight, X, LogIn, Search, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeftBlogSidebar from '../components/left-blog-sidebar';
import RightBlogSidebar from '../components/right-blog-sidebar';
import { useAuth } from '../auth/AuthContext';
import { blogApi, BLOG_CATEGORIES, type BlogPost, type BlogComment, type ReactionType } from '../lib/blogApi';
import BlogPostContent from '../components/blog-post-content';
import authBg from '../assets/img/Auth-Background.jpg';
import GCCLogo from '../assets/logos/GCC.png';

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

// Helper functions moved to BlogPostContent.tsx
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
      <div className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-2 flex items-center gap-3 sm:gap-4">
        <div className="w-11 h-11 sm:w-14 sm:h-14 shrink-0">
          <img src={GCCLogo} alt="GCC Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <p className="font-black text-slate-900 text-sm sm:text-base truncate">WMSU Guidance and Counseling Center</p>
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
      {/* Content, Links & Media */}
      <div className="px-4 sm:px-5 pb-4">
        <BlogPostContent 
          content={post.content}
          link_url={post.link_url}
          link_type={post.link_type}
          media_urls={post.media_urls}
          media_types={post.media_types}
        />
      </div>


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
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [isScrolled, setIsScrolled] = useState(false);

  const fetchPosts = async (p = 1, cat?: string, search?: string) => {
    setLoading(true);
    const c = cat !== undefined ? cat : activeCategory;
    const s = search !== undefined ? search : searchQuery;
    const res = await blogApi.getPosts(p, 2, c === 'all' ? undefined : (c || undefined), s || undefined);
    if (res.ok) {
      setPosts(res.data.posts);
      setTotal(res.data.total);
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchPosts(); 
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    const newCat = activeCategory === cat ? 'all' : cat;
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPosts(newPage, activeCategory, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 flex flex-col">
          {/* Hero Section */}
          <div className="relative pt-32 pb-24 overflow-hidden shrink-0">
            {/* Background Image with Emerald Overlay */}
            <div className="absolute inset-0 z-0">
              <img src={authBg} alt="Community Background" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-emerald-900/80"></div>
            </div>
            
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="container mx-auto px-6 relative z-10 text-center">
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 tracking-tight">
                Wellness Community
              </h1>
              <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 font-medium px-4">
                Explore insights, share experiences, and support one another in a safe, professional space designed for your growth.
              </p>
            </div>
          </div>
          {/* Sidebars + Feed Container */}
          <section className="flex flex-row w-full max-w-[1800px] relative mx-auto px-4 lg:px-8 xl:px-12 2xl:px-16 -mt-10 z-20">
            <LeftBlogSidebar
              user={user}
              token={accessToken}
              onToggleSave={handleToggleSave}
            />

            <div className="flex-1 min-w-0 flex flex-col items-center">
              {/* Search Area */}
              <div className="sticky top-20 z-30 w-full px-4 sm:px-6 mb-8 pt-2 transition-all duration-300">
                <div className={`rounded-[2rem] p-6 transition-all duration-500 border ${
                  isScrolled 
                    ? 'bg-white/40 backdrop-blur-2xl border-white/50 shadow-[0_8px_32px_rgba(16,185,129,0.15)] hover:bg-white hover:backdrop-blur-none hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 focus-within:bg-white focus-within:backdrop-blur-none focus-within:border-slate-100 focus-within:shadow-2xl focus-within:shadow-slate-200/50' 
                    : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50'
                } ${
                  (isScrolled && !searchInput) ? 'opacity-70 hover:opacity-100 focus-within:opacity-100' : 'opacity-100'
                }`}>
                  <div className="max-w-5xl mx-auto space-y-6">
                    {/* Search Input */}
                    <div className="relative group w-full mx-auto">
                      <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl" />
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        value={searchInput}
                        onChange={e => handleSearchInput(e.target.value)}
                        placeholder="Search posts and discussions..."
                        className="relative w-full pl-11 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-400 transition-all shadow-inner"
                      />
                      {searchInput && (
                        <button onClick={() => { setSearchInput(''); handleSearchInput(''); }}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    {/* Category Filters Carousel */}
                    <div className="relative group/filters max-w-5xl mx-auto overflow-hidden">
                      <div className="flex gap-3 overflow-x-auto custom-scrollbar-emerald py-2 px-1">
                        <button
                          onClick={() => handleCategoryChange('all')}
                          className={`shrink-0 flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black transition-all border tracking-[0.2em] uppercase ${
                            activeCategory === 'all'
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20 scale-105'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                          }`}
                        >
                          All
                        </button>
                        {BLOG_CATEGORIES.map(cat => (
                          <button key={`cat-${cat.value}`}
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`shrink-0 flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black transition-all border tracking-[0.2em] uppercase ${
                              activeCategory === cat.value
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20 scale-105'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                            }`}>
                            <cat.icon size={14} className={activeCategory === cat.value ? 'text-emerald-200' : 'text-emerald-600'} /> 
                            {cat.label}
                          </button>
                        ))}
                      </div>
                      
                      </div>
                  </div>
                </div>
              </div>

              {/* Feed Content */}
              <div className="py-2 px-4 sm:px-8 w-full flex justify-center">
                <div className="max-w-5xl w-full">
                  {loading && posts.length === 0 ? (
                    <div className="space-y-8 pb-20">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-8">
                          {/* Post Header Skeleton */}
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
                            <div className="space-y-2 flex-1">
                              <div className="w-32 h-4 bg-slate-100 rounded-lg animate-pulse" />
                              <div className="w-24 h-3 bg-slate-50 rounded-lg animate-pulse" />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 animate-pulse shrink-0" />
                          </div>
                          
                          {/* Post Content Skeleton */}
                          <div className="space-y-3 mb-8">
                            <div className="w-full h-4 bg-slate-100 rounded-lg animate-pulse" />
                            <div className="w-full h-4 bg-slate-100 rounded-lg animate-pulse" />
                            <div className="w-3/4 h-4 bg-slate-100 rounded-lg animate-pulse" />
                          </div>
                          
                          {/* Post Actions Skeleton */}
                          <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                            <div className="w-20 h-10 rounded-xl bg-slate-50 animate-pulse" />
                            <div className="w-20 h-10 rounded-xl bg-slate-50 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <MessageCircle size={48} className="text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">No conversations found</h3>
                      <p className="text-slate-500 text-sm font-bold mt-2 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
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
                      {total > 2 && (
                        <div className="flex items-center justify-between pt-10 border-t border-slate-200 mt-8">
                          <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1 || loading}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            Previous
                          </button>
                          <span className="text-sm font-bold text-slate-500">
                            Page {page} of {Math.ceil(total / 2)}
                          </span>
                          <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= Math.ceil(total / 2) || loading}
                            className="px-6 py-3 bg-emerald-600 border border-emerald-500 text-white rounded-xl font-black hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20"
                          >
                            Next
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

          {/* Global Footer - Now below both sidebars and feed */}
          <div className="w-full relative z-30">
            <Footer />
          </div>
        </main>

        {/* Global Overlays */}
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
      </div>
    </div>
  );
};

export default BlogPage;
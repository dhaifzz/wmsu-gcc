import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Video, Link2, Send, Trash2, CheckCircle, XCircle, Clock, Eye, Pencil, X, Loader2, AlertCircle, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import { blogApi, uploadBlogMedia, BLOG_CATEGORIES, type BlogPost, type BlogCategory } from '../../lib/blogApi';
import BlogPostContent from '../../components/blog-post-content';
import { useDirectorPresence } from '../../hooks/useDirectorPresence';

interface BlogPostingProps {
  role?: 'staff' | 'director' | 'admin';
}

const Youtube = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
);

const Facebook = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Pending' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle, label: 'Approved' },
  rejected: { bg: 'bg-rose-50', text: 'text-rose-700', icon: XCircle, label: 'Rejected' },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const BlogPosting = ({ role = 'staff' }: BlogPostingProps) => {
  const { user, accessToken } = useAuth();
  const canApprove = role === 'director' || role === 'admin';
  const { isDirectorOnline } = useDirectorPresence(role);

  const [activeView, setActiveView] = useState<'compose' | 'my-posts' | 'approval'>('compose');
  const [myPosts, setMyPosts] = useState<BlogPost[]>([]);
  const [pendingPosts, setPendingPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  // Compose state
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<BlogCategory>('general');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkType, setLinkType] = useState<'general' | 'youtube' | 'facebook'>('general');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const fetchMyPosts = async () => {
    if (!accessToken) return;
    setLoading(true);
    const res = await blogApi.getMyPosts(accessToken);
    if (res.ok) setMyPosts(res.data.posts);
    setLoading(false);
  };

  const fetchPendingPosts = async () => {
    if (!accessToken || !canApprove) return;
    setLoading(true);
    const res = await blogApi.getAllPosts(accessToken, 'pending');
    if (res.ok) setPendingPosts(res.data.posts);
    setLoading(false);
  };

  useEffect(() => {
    if (activeView === 'my-posts') fetchMyPosts();
    if (activeView === 'approval') fetchPendingPosts();
  }, [activeView, accessToken]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (mediaFiles.length + valid.length > 10) {
      importSwal().then(Swal => Swal.fire('Limit Reached', 'Maximum 10 media files per post.', 'warning'));
      return;
    }
    setMediaFiles(prev => [...prev, ...valid]);
    const newPreviews = valid.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
    }));
    setMediaPreviews(prev => [...prev, ...newPreviews]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index].url);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const importSwal = async () => (await import('sweetalert2')).default;

  const handleSubmit = async () => {
    const hasMedia = mediaFiles.length > 0 || (editingPost && editingPost.media_urls.length > 0);
    const hasLink = linkUrl.trim().length > 0;
    const hasContent = content.trim().length > 0;

    if (!(hasContent || hasMedia || hasLink) || !accessToken || submitting) return;
    setSubmitting(true);
    setUploading(mediaFiles.length > 0);

    try {
      // Upload media
      const uploadedMedia: { url: string; type: 'image' | 'video' }[] = [];
      for (const file of mediaFiles) {
        const result = await uploadBlogMedia(file, accessToken);
        if (result) uploadedMedia.push(result);
      }
      setUploading(false);

      const payload = {
        content: content.trim(),
        category,
        media_urls: uploadedMedia.length > 0 ? uploadedMedia.map(m => m.url) : (editingPost ? editingPost.media_urls : []),
        media_types: uploadedMedia.length > 0 ? uploadedMedia.map(m => m.type) : (editingPost ? editingPost.media_types : []),
        link_url: linkUrl.trim() || null,
        link_type: linkType,
        autoApprove: !canApprove && !isDirectorOnline && autoPublish,
      };

      const res = editingPost
        ? await blogApi.updatePost(editingPost.id, payload, accessToken)
        : await blogApi.createPost(payload, accessToken);

      if (res.ok) {
        const Swal = await importSwal();
        await Swal.fire({ icon: 'success', title: editingPost ? 'Post Updated' : 'Post Created', text: res.data.message, confirmButtonColor: '#065f46' });
        resetCompose();
        setActiveView('my-posts');
        fetchMyPosts();
      } else {
        const Swal = await importSwal();
        await Swal.fire({ icon: 'error', title: 'Error', text: res.error || 'Failed to create post.', confirmButtonColor: '#065f46' });
      }
    } catch (err) {
      const Swal = await importSwal();
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong.', confirmButtonColor: '#065f46' });
    }
    setSubmitting(false);
    setUploading(false);
  };

  const resetCompose = () => {
    setContent('');
    setCategory('general');
    setLinkUrl('');
    setLinkType('general');
    setShowLinkInput(false);
    setAutoPublish(false);
    mediaPreviews.forEach(p => URL.revokeObjectURL(p.url));
    setMediaFiles([]);
    setMediaPreviews([]);
    setEditingPost(null);
  };

  const handleDelete = async (postId: string) => {
    if (!accessToken) return;
    const Swal = await importSwal();
    const result = await Swal.fire({
      title: 'Delete Post?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
    });
    if (!result.isConfirmed) return;
    const res = await blogApi.deletePost(postId, accessToken);
    if (res.ok) {
      fetchMyPosts();
      fetchPendingPosts();
    }
  };

  const handleApprove = async (postId: string) => {
    if (!accessToken) return;
    const Swal = await importSwal();
    const result = await Swal.fire({
      title: 'Approve Post?',
      text: 'This post will be visible to the public.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      confirmButtonColor: '#065f46',
      cancelButtonColor: '#94a3b8',
    });
    if (!result.isConfirmed) return;
    const res = await blogApi.approvePost(postId, accessToken);
    if (res.ok) {
      await Swal.fire({ icon: 'success', title: 'Approved!', timer: 1500, showConfirmButton: false });
      fetchPendingPosts();
    }
  };

  const handleReject = async (postId: string) => {
    if (!accessToken) return;
    const Swal = await importSwal();
    const { value: reason } = await Swal.fire({
      title: 'Reject Post',
      input: 'textarea',
      inputLabel: 'Reason for rejection (optional)',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
    });
    if (reason === undefined) return; // cancelled
    const res = await blogApi.rejectPost(postId, reason || '', accessToken);
    if (res.ok) {
      await Swal.fire({ icon: 'success', title: 'Rejected', timer: 1500, showConfirmButton: false });
      fetchPendingPosts();
    }
  };

  const startEdit = (post: BlogPost) => {
    setContent(post.content);
    setCategory(post.category || 'general');
    setLinkUrl(post.link_url || '');
    setLinkType((post.link_type as any) || 'general');
    setShowLinkInput(!!post.link_url);
    setEditingPost(post);
    setMediaFiles([]);
    setMediaPreviews(post.media_urls.map((url, i) => ({ url, type: post.media_types[i] || 'image' })));
    setActiveView('compose');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Blog Management</h1>
        <p className="text-slate-500 font-medium mt-1">Create and manage posts for the public blog feed.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
        {[
          { id: 'compose' as const, label: editingPost ? 'Edit Post' : 'New Post', icon: Pencil },
          { id: 'my-posts' as const, label: 'My Posts', icon: Eye },
          ...(canApprove ? [{ id: 'approval' as const, label: `Approval Queue${pendingPosts.length > 0 ? ` (${pendingPosts.length})` : ''}`, icon: Clock }] : []),
        ].map(tab => (
          <button key={tab.id} onClick={() => { if (tab.id === 'compose' && activeView === 'compose') resetCompose(); setActiveView(tab.id); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeView === tab.id ? 'bg-emerald-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Compose View ──────────────────────────────────────────── */}
      {activeView === 'compose' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-lg shadow-md">
                {user?.firstName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-400 font-bold">
                  {canApprove ? '🟢 Auto-publish' : (isDirectorOnline ? '🟡 Requires approval (Director is online)' : '🟡 Director Offline (Auto-publish optional)')}
                </p>
              </div>
            </div>

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind? Share an update with the community..."
              className="w-full min-h-[150px] resize-none outline-none text-slate-700 text-[15px] leading-relaxed placeholder:text-slate-400 border border-slate-100 rounded-2xl p-4 focus:border-emerald-300 transition-colors"
            />

            {/* Category Selector */}
            <div className="mt-3">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
                <Tag size={12} /> Category
              </label>
              <div className="flex flex-wrap gap-2">
                {BLOG_CATEGORIES.map(cat => (
                  <button key={cat.value} onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      category === cat.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                    }`}>
                    <cat.icon size={12} /> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Link Input */}
            <AnimatePresence>
              {showLinkInput && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <Link2 size={16} className="text-slate-400 shrink-0" />
                      <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                        placeholder="https://example.com" className="flex-1 bg-transparent outline-none text-sm text-slate-700" />
                      <button onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { id: 'general', label: 'General', icon: Link2 },
                        { id: 'youtube', label: 'YouTube', icon: Youtube },
                        { id: 'facebook', label: 'Facebook', icon: Facebook },
                      ].map(t => (
                        <button key={t.id} onClick={() => setLinkType(t.id as any)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black transition-all border ${
                            linkType === t.id 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                              : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                          }`}>
                          <t.icon size={12} /> {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Media Previews */}
            {mediaPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {mediaPreviews.map((p, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden bg-slate-100 aspect-square group">
                    {p.type === 'video' ? (
                      <video src={p.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <button onClick={() => removeMedia(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                    {p.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Video size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Live Preview Section */}
            {(content.trim() || linkUrl.trim() || mediaPreviews.length > 0) && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Eye size={12} /> Post Preview
                </p>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                   <BlogPostContent 
                    content={content}
                    link_url={linkUrl}
                    link_type={linkType}
                    media_urls={mediaPreviews.map(p => p.url)}
                    media_types={mediaPreviews.map(p => p.type)}
                  />
                </div>
              </div>
            )}
            
            {/* Auto Publish Toggle for Staff when Director is Offline */}
            {!canApprove && !isDirectorOnline && (
              <div className="mt-6 flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">Auto-publish Post</p>
                  <p className="text-[10px] text-slate-500 font-medium">Bypass approval queue since Director is currently offline.</p>
                </div>
                <button
                  onClick={() => setAutoPublish(!autoPublish)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${autoPublish ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoPublish ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex gap-2">
              <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-white hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100">
                <ImageIcon size={18} /> Photo
              </button>
              <button onClick={() => { fileRef.current?.setAttribute('accept', 'video/*'); fileRef.current?.click(); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-white hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100">
                <Video size={18} /> Video
              </button>
              <button onClick={() => setShowLinkInput(!showLinkInput)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-transparent ${
                  showLinkInput ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'text-slate-500 hover:bg-white hover:text-emerald-600 hover:border-emerald-100'
                }`}>
                <Link2 size={18} /> Link
              </button>
            </div>

            <button onClick={handleSubmit} disabled={submitting || !(content.trim() || mediaFiles.length > 0 || (editingPost && editingPost.media_urls.length > 0) || linkUrl.trim())}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> {uploading ? 'Uploading...' : 'Posting...'}</> : <><Send size={16} /> {editingPost ? 'Update' : 'Post'}</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── My Posts View ─────────────────────────────────────────── */}
      {activeView === 'my-posts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : myPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <Pencil size={40} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-400">No posts yet</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Create your first post!</p>
            </div>
          ) : (
            myPosts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {(() => { const s = STATUS_STYLES[post.status]; return (
                        <span className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
                          <s.icon size={12} /> {s.label}
                        </span>
                      ); })()}
                      <span className="text-[11px] text-slate-400 font-bold">{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(post)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(post.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <BlogPostContent 
                    content={post.content}
                    link_url={post.link_url}
                    link_type={post.link_type}
                    media_urls={post.media_urls}
                    media_types={post.media_types}
                  />
                  
                  {post.status === 'rejected' && post.rejection_reason && (
                    <div className="mt-3 flex items-start gap-2 bg-rose-50 text-rose-700 text-xs font-bold px-3 py-2 rounded-lg border border-rose-100">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>Rejection reason: {post.rejection_reason}</span>
                    </div>
                  )}
                  <div className="flex gap-4 mt-3 text-xs text-slate-400 font-bold">
                    <span>❤️ {post.totalReactions} reactions</span>
                    <span>💬 {post.commentCount} comments</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* ── Approval Queue View (Director/Admin only) ────────────── */}
      {activeView === 'approval' && canApprove && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : pendingPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <CheckCircle size={40} className="text-emerald-200 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-400">All caught up!</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">No posts awaiting approval.</p>
            </div>
          ) : (
            pendingPosts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black">
                      {post.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{post.author_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{post.author_role} • {formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  <BlogPostContent 
                    content={post.content}
                    link_url={post.link_url}
                    link_type={post.link_type}
                    media_urls={post.media_urls}
                    media_types={post.media_types}
                  />
                </div>
                <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex gap-2 justify-end">
                  <button onClick={() => handleReject(post.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-all">
                    <XCircle size={16} /> Reject
                  </button>
                  <button onClick={() => handleApprove(post.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                    <CheckCircle size={16} /> Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default BlogPosting;

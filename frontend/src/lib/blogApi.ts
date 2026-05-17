import { api } from './api';
import { supabase } from './supabaseClient';
import { Megaphone, CalendarDays, Brain, Briefcase, BookOpen, GraduationCap, MessageSquareText, type LucideIcon } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────

export type ReactionType = 'support' | 'inspire' | 'care' | 'celebrate' | 'insightful';

export type BlogCategory = 'announcements' | 'events' | 'mental-health' | 'career-guidance' | 'academic-support' | 'student-life' | 'general';

export const BLOG_CATEGORIES: { value: BlogCategory; label: string; icon: LucideIcon }[] = [
  { value: 'announcements', label: 'Announcements', icon: Megaphone },
  { value: 'events', label: 'Events', icon: CalendarDays },
  { value: 'mental-health', label: 'Mental Health', icon: Brain },
  { value: 'career-guidance', label: 'Career Guidance', icon: Briefcase },
  { value: 'academic-support', label: 'Academic Support', icon: BookOpen },
  { value: 'student-life', label: 'Student Life', icon: GraduationCap },
  { value: 'general', label: 'General', icon: MessageSquareText },
];

export interface BlogPost {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  category: BlogCategory;
  content: string;
  media_urls: string[];
  media_types: string[];  
  link_url: string | null;
  link_type: 'general' | 'youtube' | 'facebook' | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  reactions: Record<ReactionType, number>;
  totalReactions: number;
  commentCount: number;
}

export interface BlogComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  author_name: string;
  author_role?: string | null;
  author_profile_picture?: string | null;
  author_sex?: string | null;
  content: string;
  mentioned_user_id: string | null;
  mentioned_user_name: string | null;
  created_at: string;
}

export interface PostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentsResponse {
  comments: BlogComment[];
}

export interface ReactionsResponse {
  reactions: Record<ReactionType, number>;
  totalReactions: number;
  userReaction: ReactionType | null;
}

// ── Image compression helper ────────────────────────────────────────

function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// ── Upload media to Supabase Storage (with compression) ─────────────

export async function uploadBlogMedia(
  file: File,
  token: string
): Promise<{ url: string; type: 'image' | 'video' } | null> {
  try {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) return null;

    let uploadBlob: Blob = file;
    let ext = file.name.split('.').pop() || 'bin';

    // Compress images to WebP
    if (isImage) {
      try {
        uploadBlob = await compressImage(file);
        ext = 'webp';
      } catch (e) {
        console.warn('Image compression failed, uploading original:', e);
        uploadBlob = file;
      }
    }

    // Generate unique filename
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Get user id from token for path
    const { data: { user } } = await supabase.auth.getUser(token);
    const userId = user?.id || 'unknown';
    const storagePath = `${userId}/${uniqueName}`;

    const { error } = await supabase.storage
      .from('blog-media')
      .upload(storagePath, uploadBlob, {
        contentType: isImage ? 'image/webp' : file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blog-media')
      .getPublicUrl(storagePath);

    return {
      url: publicUrl,
      type: isImage ? 'image' : 'video',
    };
  } catch (err) {
    console.error('uploadBlogMedia error:', err);
    return null;
  }
}

// ── Blog API ────────────────────────────────────────────────────────

export const blogApi = {
  // Public: get approved posts
  getPosts: (page = 1, limit = 10, category?: string, search?: string) => {
    let url = `/api/blog/posts?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return api<PostsResponse>(url);
  },

  // Management: get all posts (any status)
  getAllPosts: (token: string, status?: string, page = 1, limit = 20) => {
    let url = `/api/blog/posts/all?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return api<PostsResponse>(url, { token });
  },

  // My posts
  getMyPosts: (token: string) =>
    api<{ posts: BlogPost[] }>('/api/blog/posts/my', { token }),

  // Create post
  createPost: (
    payload: {
      content: string;
      category?: string;
      media_urls?: string[];
      media_types?: string[];
      link_url?: string | null;
      link_type?: 'general' | 'youtube' | 'facebook' | null;
      autoApprove?: boolean;
    },
    token: string
  ) =>
    api<{ message: string; post: BlogPost }>('/api/blog/posts', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
      token,
    }),

  // Update post
  updatePost: (
    id: string,
    payload: {
      content: string;
      category?: string;
      media_urls?: string[];
      media_types?: string[];
      link_url?: string | null;
      link_type?: 'general' | 'youtube' | 'facebook' | null;
    },
    token: string
  ) =>
    api<{ message: string; post: BlogPost }>(`/api/blog/posts/${id}`, {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      token,
    }),

  // Delete post
  deletePost: (id: string, token: string) =>
    api<{ message: string }>(`/api/blog/posts/${id}`, {
      method: 'DELETE',
      token,
    }),

  // Approve post
  approvePost: (id: string, token: string) =>
    api<{ message: string; post: BlogPost }>(`/api/blog/posts/${id}/approve`, {
      method: 'PUT',
      body: {},
      token,
    }),

  // Reject post
  rejectPost: (id: string, reason: string, token: string) =>
    api<{ message: string; post: BlogPost }>(`/api/blog/posts/${id}/reject`, {
      method: 'PUT',
      body: { reason } as unknown as Record<string, unknown>,
      token,
    }),

  // Get comments
  getComments: (postId: string) =>
    api<CommentsResponse>(`/api/blog/posts/${postId}/comments`),

  // Add comment (auth required)
  addComment: (
    postId: string,
    payload: {
      content: string;
      parent_id?: string | null;
      mentioned_user_id?: string | null;
      mentioned_user_name?: string | null;
    },
    token: string
  ) =>
    api<{ message: string; comment: BlogComment }>(`/api/blog/posts/${postId}/comments`, {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
      token,
    }),

  // Delete comment
  deleteComment: (commentId: string, token: string) =>
    api<{ message: string }>(`/api/blog/comments/${commentId}`, {
      method: 'DELETE',
      token,
    }),

  // Toggle reaction
  toggleReaction: (postId: string, reactionType: ReactionType, token: string) =>
    api<{ message: string; action: string; reaction_type?: ReactionType }>(
      `/api/blog/posts/${postId}/reactions`,
      {
        method: 'POST',
        body: { reaction_type: reactionType } as unknown as Record<string, unknown>,
        token,
      }
    ),

  // Get reactions for a post
  getReactions: (postId: string, userId?: string) => {
    let url = `/api/blog/posts/${postId}/reactions`;
    if (userId) url += `?userId=${userId}`;
    return api<ReactionsResponse>(url);
  },

  // Saved posts
  getSavedPosts: (token: string) =>
    api<{ savedPosts: SavedPostItem[] }>('/api/blog/saved', { token }),

  savePost: (postId: string, token: string) =>
    api<{ message: string }>(`/api/blog/saved/${postId}`, {
      method: 'POST',
      body: {},
      token,
    }),

  unsavePost: (postId: string, token: string) =>
    api<{ message: string }>(`/api/blog/saved/${postId}`, {
      method: 'DELETE',
      token,
    }),

  // Nickname
  getNickname: (token: string) =>
    api<{ nickname: string | null }>('/api/blog/nickname', { token }),

  setNickname: (nickname: string, token: string) =>
    api<{ message: string; nickname: string }>('/api/blog/nickname', {
      method: 'PUT',
      body: { nickname } as unknown as Record<string, unknown>,
      token,
    }),
};

export interface SavedPostItem {
  post_id: string;
  created_at: string;
  blog_posts: {
    id: string;
    content: string;
    category: string;
    author_name: string;
    created_at: string;
    media_urls: string[];
  } | null;
}

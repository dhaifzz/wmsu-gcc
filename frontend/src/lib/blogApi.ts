import { api } from './api';
import { supabase } from './supabaseClient';

// ── Types ───────────────────────────────────────────────────────────

export type ReactionType = 'support' | 'inspire' | 'care' | 'celebrate' | 'insightful';

export interface BlogPost {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  content: string;
  media_urls: string[];
  media_types: string[]; // 'image' | 'video'
  link_url: string | null;
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
  getPosts: (page = 1, limit = 10) =>
    api<PostsResponse>(`/api/blog/posts?page=${page}&limit=${limit}`),

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
      media_urls?: string[];
      media_types?: string[];
      link_url?: string | null;
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
      media_urls?: string[];
      media_types?: string[];
      link_url?: string | null;
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
};

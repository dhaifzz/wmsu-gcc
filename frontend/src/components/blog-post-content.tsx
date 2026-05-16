import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface BlogPostContentProps {
  content: string;
  link_url?: string | null;
  link_type?: 'general' | 'youtube' | 'facebook' | null;
  media_urls?: string[];
  media_types?: string[];
}

export function getYouTubeID(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getFacebookEmbedURL(url: string) {
  try {
    const urlObj = new URL(url);
    // Remove tracking parameters for cleaner embed
    const cleanUrl = `${urlObj.origin}${urlObj.pathname}`;
    
    let sanitized = cleanUrl.replace('m.facebook.com', 'www.facebook.com');
    if (!sanitized.includes('www.facebook.com') && sanitized.includes('facebook.com')) {
      sanitized = sanitized.replace('facebook.com', 'www.facebook.com');
    }

    // Check if it's a video/watch URL
    if (sanitized.includes('/videos/') || sanitized.includes('/watch') || sanitized.includes('v=')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(sanitized)}&show_text=true&width=500`;
    }

    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(sanitized)}&show_text=true&width=500`;
  } catch (e) {
    // Fallback if URL is malformed
    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;
  }
}

const BlogPostContent = ({ content, link_url, link_type, media_urls = [], media_types = [] }: BlogPostContentProps) => {
  const [mediaIndex, setMediaIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Text Content */}
      {content && (
        <p className="text-slate-700 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      )}

      {/* Link Embeds */}
      {link_url && (
        <div className="space-y-3">
          {link_type === 'youtube' && getYouTubeID(link_url) ? (
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeID(link_url)}`}
                className="absolute inset-0 w-full h-full"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : link_type === 'facebook' ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white min-h-[500px]">
              <iframe
                src={getFacebookEmbedURL(link_url)}
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-sm border-t border-slate-100 flex justify-center">
                <a href={link_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <ExternalLink size={10} /> View on Facebook
                </a>
              </div>
            </div>
          ) : (
            <a href={link_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-bold bg-emerald-50 px-3 py-2 rounded-xl transition-colors border border-emerald-100 group">
              <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
              <span className="truncate">{link_url}</span>
            </a>
          )}
        </div>
      )}

      {/* Media Gallery */}
      {media_urls.length > 0 && (
        <div className="relative rounded-xl overflow-hidden border border-slate-100">
          {media_types[mediaIndex] === 'video' ? (
            <video src={media_urls[mediaIndex]} controls className="w-full max-h-[300px] sm:max-h-[420px] object-contain bg-black" />
          ) : (
            <img src={media_urls[mediaIndex]} alt="" className="w-full max-h-[300px] sm:max-h-[420px] object-cover" />
          )}
          {media_urls.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
              {media_urls.map((_, i) => (
                <button key={i} onClick={() => setMediaIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === mediaIndex ? 'bg-white w-5' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogPostContent;

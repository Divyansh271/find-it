import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Tag,
  Palette,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { Post } from '../types/post';
import { getPostById } from '../services/postsService';

interface PostDetailProps {
  postId: string;
  onBackToLost: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  postId,
  onBackToLost,
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestRequested, setRequestRequested] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPost = async () => {
      setLoading(true);
      try {
        const found = await getPostById(postId);
        if (isMounted) {
          setPost(found);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch post', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchPost();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-16 text-center text-slate-400 text-xs">
        Loading post details...
      </div>
    );
  }

  // 404 / Invalid ID State
  if (!post) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-16 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Post Not Found</h2>
        <p className="text-xs text-slate-500">
          The post with ID <code>{postId}</code> does not exist or has already been resolved.
        </p>
        <button
          onClick={onBackToLost}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Lost Feed</span>
        </button>
      </div>
    );
  }

  const isFoundPost = post.type === 'found';

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToLost}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lost Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Copy link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {copied && (
            <span className="text-[11px] text-slate-500">Copied!</span>
          )}
        </div>
      </div>

      {/* Main Post Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header Badge & Title */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isFoundPost
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {isFoundPost ? 'Found Post' : 'Lost Post'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {post.post_id}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900">
            {post.title}
          </h1>
        </div>

        {/* Metadata grid */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {post.location_text && (
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Location</span>
                <span>{post.location_text}</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-900">Posted On</span>
              <span>
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description
          </h2>
          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 border border-slate-100 rounded-xl p-4">
            {post.desc_text}
          </p>
        </div>

        {/* Tags (Category & Colour) */}
        {(post.category || post.colour) && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Item Details
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {post.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 font-medium rounded-lg">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  Category: {post.category}
                </span>
              )}
              {post.colour && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 font-medium rounded-lg">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  Colour: {post.colour}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Section */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Is this your missing belonging?
            </div>

            {/* Placeholder action: Request conversation */}
            <button
              onClick={() => setRequestRequested(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Request conversation</span>
            </button>
          </div>

          {requestRequested && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Conversation Request Placeholder</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  The request flow (creating a <code>conversations</code> record with optional photo attachment before chat acceptance) will be connected when Supabase is introduced in the upcoming step.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

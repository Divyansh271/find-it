import React, { useState } from 'react';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Tag,
  Palette,
  MapPin,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { Post, CreatePostInput } from '../types/post';
import {
  createFoundPost,
  getSuggestedLostMatches,
  CATEGORIES,
  COLOURS
} from '../services/postsService';

interface CreateFoundPostProps {
  onBackToFound: () => void;
  onSelectPost: (postId: string) => void;
}

export const CreateFoundPost: React.FC<CreateFoundPostProps> = ({
  onBackToFound,
  onSelectPost,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [descText, setDescText] = useState('');
  const [category, setCategory] = useState<string>('');
  const [colour, setColour] = useState<string>('');
  const [locationText, setLocationText] = useState('');
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Result & Opposite-Type Matching State
  const [createdPost, setCreatedPost] = useState<Post | null>(null);
  const [suggestedMatches, setSuggestedMatches] = useState<Post[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setImageNames(names);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Please provide a title for the found item.');
      return;
    }

    if (!descText.trim()) {
      setError('Please provide a description of the item and where you found it on campus.');
      return;
    }

    setSubmitting(true);
    try {
      const input: CreatePostInput = {
        title: title.trim(),
        desc_text: descText.trim(),
        category: category || undefined,
        colour: colour || undefined,
        location_text: locationText.trim() || undefined,
        images: imageNames,
      };

      // Call data-access layer function
      const newPost = await createFoundPost(input);
      // Call opposite-type matching function (matches against LOST posts!)
      const matches = await getSuggestedLostMatches(newPost);

      setCreatedPost(newPost);
      setSuggestedMatches(matches);
    } catch (err: any) {
      console.error('Failed to create found post', err);
      setError(err?.message || 'Something went wrong creating your post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS / MATCHES RESULT VIEW
  if (createdPost) {
    return (
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Success Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Found Post Created!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Thank you for being a good campus citizen! Your found report for <strong>"{createdPost.title}"</strong> is now live.
          </p>
          <div className="pt-2">
            <button
              onClick={onBackToFound}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Found Section</span>
            </button>
          </div>
        </div>

        {/* Suggested Matches Section (Opposite type: LOST reports!) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Suggested Matches from Lost Reports
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Based on the item's category, colour, and location, these students have reported losing a matching item:
          </p>

          {suggestedMatches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
              No matching lost reports found right now. When the owner posts a lost report, your found post will appear in their search.
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedMatches.map((lostPost) => (
                <div
                  key={lostPost.post_id}
                  onClick={() => onSelectPost(lostPost.post_id)}
                  className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                        Lost Report
                      </span>
                      {lostPost.category && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {lostPost.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {lostPost.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {lostPost.location_text || 'Campus location'}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-emerald-700 shrink-0 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // CREATE FORM VIEW
  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Navigation button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToFound}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back to Found Section</span>
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
          New Found Post
        </span>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Report a Found Item
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide details of the item you found so the student searching for it can locate their belonging.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Title (Required) */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Black TI-84 Graphing Calculator, Navy Hydro Flask..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 text-xs"
            />
          </div>

          {/* Description (Required) */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Description & Finding Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe where you found it, what building/room, any stickers, safe custody location (e.g. handed to reception/security), etc..."
              value={descText}
              onChange={(e) => setDescText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 text-xs resize-none"
            />
          </div>

          {/* Category & Colour Helpers (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Category (Optional)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-xs cursor-pointer"
              >
                <option value="">Select Category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Primary Colour (Optional)
              </label>
              <select
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-xs cursor-pointer"
              >
                <option value="">Select Colour...</option>
                {COLOURS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location (Optional) */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Found Location on Campus (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Student Center 2nd Floor, Engineering Cafe, Main Quad Lawn..."
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 text-xs"
            />
          </div>

          {/* Images (Optional) */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Photos of the Found Item (Optional)
            </label>
            <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 text-center bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center transition-colors">
              <Camera className="w-5 h-5 text-slate-400 mb-1" />
              <span className="font-medium text-slate-700">
                {imageNames.length > 0 ? `${imageNames.length} image(s) selected` : 'Attach photo of the item'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {imageNames.length > 0 ? imageNames.join(', ') : 'PNG, JPG or JPEG'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBackToFound}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating Post...' : 'Publish Found Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

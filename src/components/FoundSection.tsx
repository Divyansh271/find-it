import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  MapPin,
  X,
  ArrowRight,
  ArrowLeft,
  Tag,
  Palette,
  HelpCircle,
  PackageCheck
} from 'lucide-react';
import { Post, PostFilterOptions } from '../types/post';
import {
  searchLostPosts,
  CATEGORIES,
  COLOURS
} from '../services/postsService';

import { User } from '../types/auth';

interface FoundSectionProps {
  currentUser: User | null;
  onBackToHome: () => void;
  onCreateFoundPost: () => void;
  onSelectPost: (postId: string) => void;
  onRequireAuth: (targetUrl: string) => void;
}

export const FoundSection: React.FC<FoundSectionProps> = ({
  currentUser,
  onBackToHome,
  onCreateFoundPost,
  onSelectPost,
  onRequireAuth,
}) => {
  const handleCreateClick = () => {
    if (currentUser) {
      onCreateFoundPost();
    } else {
      onRequireAuth('/post/new?type=found');
    }
  };
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedColour, setSelectedColour] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('');

  // Fetch posts from data-access layer (LOST posts)
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const filters: PostFilterOptions = {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          colour: selectedColour !== 'All' ? selectedColour : undefined,
          location: locationFilter.trim() || undefined,
        };
        const results = await searchLostPosts(searchQuery, filters);
        if (isMounted) {
          setPosts(results);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load lost posts', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, selectedColour, locationFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedColour !== 'All' ||
    locationFilter.trim() !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedColour('All');
    setLocationFilter('');
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
          Found Section
        </span>
      </div>

      {/* Main Header & Intentional Mirrored Feed Note */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              I Found Something
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
              Holding someone's lost item? Below are reports from students who have <strong>LOST</strong> belongings on campus. Browse or search through them to locate the rightful owner.
            </p>
          </div>

          <button
            onClick={handleCreateClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Found Post</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main search text input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search lost reports (e.g. MacBook charger, car keys, jacket, student ID)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Location text filter */}
          <div className="relative sm:w-60">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by building or area..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Dropdown Filters (Category & Colour) + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Colour Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium">Colour:</span>
              <select
                value={selectedColour}
                onChange={(e) => setSelectedColour(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="All">All Colours</option>
                {COLOURS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Filters Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Showing <strong className="text-slate-900">{posts.length}</strong> lost report{posts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Posts Results Feed */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          Loading lost item reports...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            No matching lost reports
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No student has reported losing this specific item yet. You can reset your filters or create a Found Post so the owner can discover it when they search.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={handleCreateClick}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              Post a Found Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.post_id}
              onClick={() => onSelectPost(post.post_id)}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Lost Report
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1.5">
                  {post.title}
                </h3>

                {/* Description snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {post.desc_text}
                </p>

                {/* Tags (Category & Colour) */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                  {post.category && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {post.category}
                    </span>
                  )}
                  {post.colour && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {post.colour}
                    </span>
                  )}
                </div>

                {/* Location */}
                {post.location_text && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{post.location_text}</span>
                  </div>
                )}
              </div>

              {/* Footer action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Click to inspect</span>
                <span className="font-semibold text-emerald-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  CreditCard,
  Laptop,
  Key,
  Coffee,
  Briefcase,
  BookOpen,
  Shirt,
  HelpCircle,
  Eye
} from 'lucide-react';
import { CampusItem, ItemType } from '../types/campus';

interface RecentItemsProps {
  items: CampusItem[];
  searchQuery: string;
  onSelectItem: (item: CampusItem) => void;
  onViewAll?: () => void;
}

export const RecentItems: React.FC<RecentItemsProps> = ({
  items,
  searchQuery,
  onSelectItem,
  onViewAll
}) => {
  const [filterType, setFilterType] = useState<'All' | ItemType>('All');

  // Filter items
  const filtered = items.filter((item) => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ID & Cards':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case 'Electronics':
        return <Laptop className="w-5 h-5 text-blue-600" />;
      case 'Keys & Lanyards':
        return <Key className="w-5 h-5 text-amber-600" />;
      case 'Bottles & Tumblers':
        return <Coffee className="w-5 h-5 text-teal-600" />;
      case 'Bags & Backpacks':
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'Books & Notes':
        return <BookOpen className="w-5 h-5 text-orange-600" />;
      case 'Clothing & Accessories':
        return <Shirt className="w-5 h-5 text-rose-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Lost & Found
          </h2>
          <p className="text-xs text-slate-500">
            Latest items reported across campus buildings and facilities
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
            {(['All', 'Lost', 'Found'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-2 cursor-pointer hover:underline"
            >
              <span>View feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Items Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No items match your criteria</p>
          <p className="text-xs text-slate-500 mt-0.5">Try searching with a broader keyword or change the filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 6).map((item) => {
            const isLost = item.type === 'Lost';

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-2xs transition-all duration-150 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Image Placeholder + Status Header */}
                  <div className="relative w-full h-36 rounded-lg bg-slate-100 border border-slate-200/80 mb-3 overflow-hidden flex flex-col items-center justify-center">
                    {/* Visual Placeholder graphic */}
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getCategoryIcon(item.category)}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 mt-2">
                      {item.category}
                    </span>

                    {/* Lost / Found badge tag */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isLost
                            ? 'bg-rose-100 text-rose-700 border border-rose-200/60'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    {/* AI Potential Matches Indicator if applicable */}
                    {item.potentialMatches && item.potentialMatches > 0 ? (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-xs text-indigo-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-indigo-100">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>{item.potentialMatches} matches</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Title & Metadata */}
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                  </div>

                  {/* Location & Date */}
                  <div className="space-y-1 text-xs text-slate-500 mb-3">
                    <div className="flex items-start gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.date}</span>
                      {item.time && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span>{item.time}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Short description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Footer action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    By {item.reportedBy.name}
                  </span>
                  <div className="flex items-center gap-1 font-medium text-slate-700 group-hover:text-indigo-600">
                    <span>Inspect</span>
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

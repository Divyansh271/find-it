import React, { useState } from 'react';
import { Search, PackageCheck, MapPin, Calendar, Plus, Eye, Sparkles } from 'lucide-react';
import { CampusItem } from '../../types/campus';

interface FoundItemsViewProps {
  items: CampusItem[];
  onSelectItem: (item: CampusItem) => void;
  onOpenReport: () => void;
}

export const FoundItemsView: React.FC<FoundItemsViewProps> = ({
  items,
  onSelectItem,
  onOpenReport
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');

  const foundItems = items.filter((i) => i.type === 'Found');
  const filtered = foundItems.filter((i) => {
    const matchesCat = category === 'All' || i.category === category;
    const matchesSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Found Belongings Feed
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Items turned in or spotted around campus waiting to be claimed
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report Found Item</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search found items by keyword, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="ID & Cards">ID & Cards</option>
            <option value="Electronics">Electronics</option>
            <option value="Keys & Lanyards">Keys & Lanyards</option>
            <option value="Bottles & Tumblers">Bottles & Tumblers</option>
            <option value="Bags & Backpacks">Bags & Backpacks</option>
          </select>

          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {filtered.length} items
          </span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <PackageCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No found items match query</p>
          <p className="text-xs text-slate-400 mt-1">If you turned in an item, file a quick report above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                    Found
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.id}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1">
                  {item.name}
                </h3>

                <div className="space-y-1 text-xs text-slate-500 mb-3">
                  <div className="flex items-start gap-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Turned in by {item.reportedBy.name}</span>
                <span className="font-medium text-slate-700 group-hover:text-emerald-600 inline-flex items-center gap-1">
                  Inspect <Eye className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

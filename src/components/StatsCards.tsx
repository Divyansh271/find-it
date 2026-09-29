import React from 'react';
import { Search, PackageCheck, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { CampusStats } from '../types/campus';

interface StatsCardsProps {
  stats: CampusStats;
  onSelectFilter?: (type: 'all' | 'Lost' | 'Found' | 'matches') => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, onSelectFilter }) => {
  const cards = [
    {
      id: 'lost',
      label: 'My Lost Reports',
      value: stats.myLostReports,
      subtitle: 'Active searches on campus',
      icon: Search,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      actionType: 'Lost' as const,
    },
    {
      id: 'found',
      label: 'My Found Reports',
      value: stats.myFoundReports,
      subtitle: 'Items you turned in',
      icon: PackageCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      actionType: 'Found' as const,
    },
    {
      id: 'matches',
      label: 'Potential Matches',
      value: stats.potentialMatches,
      subtitle: 'AI similarity suggestions',
      icon: Sparkles,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      actionType: 'matches' as const,
    },
    {
      id: 'recovered',
      label: 'Items Recovered',
      value: stats.itemsRecovered,
      subtitle: 'Campus-wide reunions',
      icon: CheckCircle,
      color: 'text-slate-900',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
      actionType: 'all' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter && onSelectFilter(card.actionType)}
            className="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-slate-300 hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mb-1">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

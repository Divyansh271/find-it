import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  PlusCircle,
  Clock,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { CampusActivity } from '../types/campus';

interface RecentActivityProps {
  activities: CampusActivity[];
  onExploreMatches?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onExploreMatches
}) => {
  const getActivityIcon = (type: CampusActivity['type']) => {
    switch (type) {
      case 'match_found':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      case 'item_recovered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'report_lost':
        return <HelpCircle className="w-4 h-4 text-rose-500" />;
      case 'report_found':
        return <PlusCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Recent Campus Activity
          </h2>
          <p className="text-[11px] text-slate-500">
            Live updates from the student body & lost desk posts
          </p>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Live feed
        </span>
      </div>

      <div className="space-y-3.5">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg shrink-0 mt-0.5">
              {getActivityIcon(act.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-semibold text-slate-900 truncate">
                  {act.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {act.time}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {act.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {onExploreMatches && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onExploreMatches}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Check your item match notifications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

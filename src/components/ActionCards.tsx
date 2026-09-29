import React from 'react';
import { HelpCircle, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ActionCardsProps {
  onReportLost: () => void;
  onReportFound: () => void;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  onReportLost,
  onReportFound
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Report Lost Item Card */}
      <div
        onClick={onReportLost}
        className="group relative bg-white border border-rose-200/80 hover:border-rose-300 rounded-2xl p-5 sm:p-6 transition-all duration-150 hover:shadow-xs cursor-pointer flex flex-col justify-between overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-transform">
            <HelpCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
            Missing Gear
          </span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-rose-700 transition-colors">
            Report Lost Item
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
            Misplaced your wallet, headphones, student ID, keys, or backpack on campus? File a report with details and photos so fellow students can notify you.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform">
          <span>Start lost report</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Report Found Item Card */}
      <div
        onClick={onReportFound}
        className="group relative bg-white border border-emerald-200/80 hover:border-emerald-300 rounded-2xl p-5 sm:p-6 transition-all duration-150 hover:shadow-xs cursor-pointer flex flex-col justify-between overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Found Belonging
          </span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
            Report Found Item
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
            Picked up someone’s water bottle, calculator, charger, or dorm keys? Post the location or front-desk dropoff point to help return it safely.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
          <span>Submit found item</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

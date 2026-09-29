import React from 'react';
import { Search, PackageCheck, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onSelectLost: () => void;
  onSelectFound: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectLost,
  onSelectFound,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 max-w-4xl mx-auto w-full text-center">
      {/* Title & Tagline */}
      <div className="mb-10 sm:mb-14 max-w-xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-3">
          findIt
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium">
          Lost & Found, simplified for university students.
        </p>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          A centralized campus platform to reconnect students with their missing belongings.
        </p>
      </div>

      {/* Two Large, Clearly Distinguishable Interactive Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {/* OPTION 1: LOST */}
        <button
          onClick={onSelectLost}
          className="group relative bg-white border-2 border-slate-200 hover:border-rose-400 rounded-2xl p-7 sm:p-8 text-left transition-all duration-150 hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Search className="w-6 h-6" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 mb-1">
              Need to find something?
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
              I Lost Something
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Browse items that other students have found across campus to locate your missing belonging.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-600">
            <span>Browse Found Posts</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* OPTION 2: FOUND */}
        <button
          onClick={onSelectFound}
          className="group relative bg-white border-2 border-slate-200 hover:border-emerald-400 rounded-2xl p-7 sm:p-8 text-left transition-all duration-150 hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-6 h-6" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
              Holding someone's item?
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
              I Found Something
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Browse reports from students who lost something on campus to find the rightful owner.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
            <span>Browse Lost Reports</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Subtle campus footer hint */}
      <div className="mt-14 text-xs text-slate-400">
        Campus-wide network for dorms, libraries, lecture halls, and student centers.
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowLeft, Search, Layers, ArrowRight } from 'lucide-react';

interface LostFeedPlaceholderProps {
  onBackToHome: () => void;
  onNavigateToFound: () => void;
}

export const LostFeedPlaceholder: React.FC<LostFeedPlaceholderProps> = ({
  onBackToHome,
  onNavigateToFound,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-2xl mx-auto w-full text-center">
      {/* Navigation button */}
      <div className="w-full flex items-center justify-start mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main card */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs text-left">
        {/* Section Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Search className="w-3.5 h-3.5" />
          <span>Lost Section (/lost)</span>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Found Items Feed
        </h1>

        {/* Mirrored Feed Architecture Explanation */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p className="font-medium text-slate-800">
            You are in the <strong>Lost</strong> flow.
          </p>
          <p>
            Because you lost an item, this feed will display posts from students who have <strong>FOUND</strong> belongings across campus.
          </p>
          <p className="text-slate-500 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <strong>Mirrored-Feed Architecture:</strong> Students looking for missing belongings browse the Found feed to discover if their item has already been turned in or reported.
          </p>
        </div>

        {/* Placeholder state */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Layers className="w-4 h-4" />
            <span>Feed items & search filters will be built in the next step.</span>
          </div>

          <button
            onClick={onNavigateToFound}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Switch to Found section</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

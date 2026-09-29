import React from 'react';
import { ArrowLeft, PackageCheck, Layers, ArrowRight } from 'lucide-react';

interface FoundFeedPlaceholderProps {
  onBackToHome: () => void;
  onNavigateToLost: () => void;
}

export const FoundFeedPlaceholder: React.FC<FoundFeedPlaceholderProps> = ({
  onBackToHome,
  onNavigateToLost,
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Found Section (/found)</span>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Lost Items Feed
        </h1>

        {/* Mirrored Feed Architecture Explanation */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p className="font-medium text-slate-800">
            You are in the <strong>Found</strong> flow.
          </p>
          <p>
            Because you found an item, this feed will display posts from students who have reported <strong>LOST</strong> belongings across campus.
          </p>
          <p className="text-slate-500 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <strong>Mirrored-Feed Architecture:</strong> Students holding a found item browse the Lost feed to locate the student actively searching for it.
          </p>
        </div>

        {/* Placeholder state */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Layers className="w-4 h-4" />
            <span>Feed items & search filters will be built in the next step.</span>
          </div>

          <button
            onClick={onNavigateToLost}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Switch to Lost section</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Compass } from 'lucide-react';

interface NavbarProps {
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome }) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
      {/* Brand Logo */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-2.5 text-left group cursor-pointer"
      >
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
          <Compass className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            findIt
          </span>
        </div>
      </button>

      {/* Dummy Auth Buttons (Simple buttons, no modals or text fields) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {}}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => {}}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          Sign Up
        </button>
      </div>
    </header>
  );
};

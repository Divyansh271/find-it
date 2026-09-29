import React from 'react';
import { Compass, User as UserIcon, LogOut, LayoutDashboard, Award } from 'lucide-react';
import { User } from '../types/auth';

interface NavbarProps {
  currentUser: User | null;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  onNavigateDashboard?: () => void;
  onNavigateProfile?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onNavigateHome,
  onNavigateLogin,
  onNavigateSignup,
  onNavigateDashboard,
  onNavigateProfile,
  onLogout,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
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

      {/* Auth State / Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {currentUser ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dashboard Link */}
            {onNavigateDashboard && (
              <button
                type="button"
                onClick={onNavigateDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}

            {/* Authenticated User Badge (Display Name & Profile Link) */}
            <button
              type="button"
              onClick={onNavigateProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
              title="View profile"
            >
              <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentUser.display_name}</span>
              {typeof currentUser.trust_score === 'number' && currentUser.trust_score > 0 && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-bold">
                  ★ {currentUser.trust_score}
                </span>
              )}
            </button>

            {/* Logout Action */}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={onNavigateSignup}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

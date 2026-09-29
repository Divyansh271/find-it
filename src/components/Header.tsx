import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PlusCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { NavTab } from '../types/campus';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onReportLost: () => void;
  onReportFound: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onReportLost,
  onReportFound,
  searchQuery,
  onSearchChange,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifications = [
    {
      id: 'n-1',
      title: 'Potential Match Found',
      desc: 'An item matching "AirPods Pro" was found at Student Activity Center.',
      time: '18m ago',
      unread: true,
      type: 'match'
    },
    {
      id: 'n-2',
      title: 'Report Verified',
      desc: 'Your report for "Brown Leather Bifold Wallet" is active on the campus feed.',
      time: '2h ago',
      unread: true,
      type: 'status'
    },
    {
      id: 'n-3',
      title: 'Item Claimed',
      desc: 'Student ID card at Engineering Cafe was returned to owner.',
      time: 'Yesterday',
      unread: false,
      type: 'recovered'
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const tabLabels: Record<NavTab, string> = {
    dashboard: 'Dashboard',
    lost: 'Lost Items Feed',
    found: 'Found Items Feed',
    'report-lost': 'Report Lost Item',
    'report-found': 'Report Found Item',
    messages: 'Student Messages',
    profile: 'Student Profile',
    settings: 'Settings & Alerts'
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200">
      {/* Left zone: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-md md:hidden hover:bg-slate-100 cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
          <span className="font-semibold text-slate-900">
            {tabLabels[currentTab]}
          </span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="hidden sm:inline text-slate-400 text-xs">Campus Network</span>
        </div>
      </div>

      {/* Center zone: Search bar */}
      <div className="flex-1 max-w-md mx-4 lg:mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items, locations, IDs, keys, backpacks..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-500 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right zone: Notifications & User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Report Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={onReportLost}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </button>
          <button
            onClick={onReportFound}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Found</span>
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Campus alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[11px] font-mono text-indigo-600 font-medium">
                  {unreadCount} new alerts
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className={`p-3.5 hover:bg-slate-50 text-left cursor-pointer ${item.unread ? 'bg-indigo-50/20' : ''}`}>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {item.type === 'match' ? (
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                        ) : item.type === 'recovered' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge / Profile */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
              DT
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-800">
              Divyansh
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">Divyansh Tyagi</p>
                <p className="text-[11px] text-slate-500">Student ID: #ST-27120</p>
              </div>
              <button
                onClick={() => setUserMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
              >
                My Reported Items
              </button>
              <button
                onClick={() => setUserMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
              >
                Notification Preferences
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => setUserMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-rose-600"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

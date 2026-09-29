import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ActionCards } from './components/ActionCards';
import { StatsCards } from './components/StatsCards';
import { RecentItems } from './components/RecentItems';
import { RecentActivity } from './components/RecentActivity';
import { ReportModal } from './components/ReportModal';
import { ItemDetailModal } from './components/ItemDetailModal';

// Dedicated Sub-views
import { LostItemsView } from './components/views/LostItemsView';
import { FoundItemsView } from './components/views/FoundItemsView';
import { MessagesView } from './components/views/MessagesView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';

import {
  INITIAL_CAMPUS_ITEMS,
  INITIAL_ACTIVITIES,
  INITIAL_STATS
} from './data/campusData';
import {
  CampusItem,
  CampusActivity,
  CampusStats,
  NavTab,
  ItemType
} from './types/campus';
import { CheckCircle2, Sparkles } from 'lucide-react';

const STORAGE_KEY_ITEMS = 'findit_campus_items_v1';
const STORAGE_KEY_STATS = 'findit_campus_stats_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Items State (persisted to localStorage)
  const [items, setItems] = useState<CampusItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_CAMPUS_ITEMS;
    } catch {
      return INITIAL_CAMPUS_ITEMS;
    }
  });

  // Stats State
  const [stats, setStats] = useState<CampusStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  const [activities, setActivities] = useState<CampusActivity[]>(INITIAL_ACTIVITIES);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState<ItemType>('Lost');
  const [selectedItem, setSelectedItem] = useState<CampusItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save items to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save stats to localStorage', e);
    }
  }, [stats]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Report Modal with default type
  const openReportLost = () => {
    setReportType('Lost');
    setIsReportOpen(true);
  };

  const openReportFound = () => {
    setReportType('Found');
    setIsReportOpen(true);
  };

  // Handle new item report
  const handleCreateReport = (newItem: CampusItem) => {
    setItems([newItem, ...items]);

    // Update stats
    setStats((prev) => ({
      ...prev,
      myLostReports: newItem.type === 'Lost' ? prev.myLostReports + 1 : prev.myLostReports,
      myFoundReports: newItem.type === 'Found' ? prev.myFoundReports + 1 : prev.myFoundReports,
    }));

    // Log Activity
    const newAct: CampusActivity = {
      id: `act-${Date.now()}`,
      title: newItem.type === 'Lost' ? 'New Lost Item Reported' : 'New Found Item Logged',
      description: `You reported ${newItem.name} at ${newItem.location}.`,
      time: 'Just now',
      type: newItem.type === 'Lost' ? 'report_lost' : 'report_found'
    };
    setActivities([newAct, ...activities]);

    showToast(`${newItem.type} report for "${newItem.name}" submitted!`);
  };

  // Handle recover item
  const handleMarkRecovered = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'Recovered' as const } : i))
    );
    setStats((prev) => ({
      ...prev,
      itemsRecovered: prev.itemsRecovered + 1,
    }));

    const recoveredItem = items.find((i) => i.id === id);
    if (recoveredItem) {
      const newAct: CampusActivity = {
        id: `act-${Date.now()}`,
        title: 'Item Marked Recovered!',
        description: `"${recoveredItem.name}" was reunited with its owner.`,
        time: 'Just now',
        type: 'item_recovered'
      };
      setActivities([newAct, ...activities]);
    }

    showToast('Item successfully marked as recovered!');
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (window.confirm('Reset all demo campus reports to defaults?')) {
      localStorage.removeItem(STORAGE_KEY_ITEMS);
      localStorage.removeItem(STORAGE_KEY_STATS);
      setItems(INITIAL_CAMPUS_ITEMS);
      setStats(INITIAL_STATS);
      setActivities(INITIAL_ACTIVITIES);
      showToast('Reset to default campus demonstration items.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl border border-slate-800 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'report-lost') {
            openReportLost();
          } else if (tab === 'report-found') {
            openReportFound();
          } else {
            setCurrentTab(tab);
          }
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        unreadMessagesCount={2}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onReportLost={openReportLost}
          onReportFound={openReportFound}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 3. Welcoming heading and short platform description */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-3 backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Campus Central Lost & Found</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Welcome back, Divyansh!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                    Misplaced your dorm keys, hydro flask, or student ID on campus? FindIt connects students across lecture halls, libraries, and student centers to report missing gear and return found belongings quickly.
                  </p>
                </div>
              </div>

              {/* 3. Two Prominent Action Cards */}
              <ActionCards
                onReportLost={openReportLost}
                onReportFound={openReportFound}
              />

              {/* 4. Statistics Section */}
              <StatsCards
                stats={stats}
                onSelectFilter={(type) => {
                  if (type === 'Lost') setCurrentTab('lost');
                  else if (type === 'Found') setCurrentTab('found');
                  else if (type === 'matches') showToast('3 potential AI item matches ready for review!');
                }}
              />

              {/* Main Content Split: Recent Items (6) + Recent Activity (5) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 6. Recent Lost & Found */}
                <div className="lg:col-span-8">
                  <RecentItems
                    items={items}
                    searchQuery={searchQuery}
                    onSelectItem={setSelectedItem}
                    onViewAll={() => setCurrentTab('lost')}
                  />
                </div>

                {/* 5. Recent Activity */}
                <div className="lg:col-span-4">
                  <RecentActivity
                    activities={activities}
                    onExploreMatches={() => showToast('Displaying high-confidence AI similarity matches.')}
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'lost' && (
            <LostItemsView
              items={items}
              onSelectItem={setSelectedItem}
              onOpenReport={openReportLost}
            />
          )}

          {currentTab === 'found' && (
            <FoundItemsView
              items={items}
              onSelectItem={setSelectedItem}
              onOpenReport={openReportFound}
            />
          )}

          {currentTab === 'messages' && <MessagesView />}

          {currentTab === 'profile' && (
            <ProfileView myItems={items} onSelectItem={setSelectedItem} />
          )}

          {currentTab === 'settings' && (
            <SettingsView onResetData={handleResetData} />
          )}
        </main>
      </div>

      {/* Report Modal (Lost / Found) */}
      <ReportModal
        isOpen={isReportOpen}
        initialType={reportType}
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleCreateReport}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onMarkRecovered={handleMarkRecovered}
      />
    </div>
  );
}

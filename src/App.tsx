import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LostFeedPlaceholder } from './components/LostFeedPlaceholder';
import { FoundFeedPlaceholder } from './components/FoundFeedPlaceholder';

type RoutePath = '/' | '/lost' | '/found';

export default function App() {
  const [currentPath, setCurrentPath] = useState<RoutePath>(() => {
    const path = window.location.pathname;
    if (path === '/lost') return '/lost';
    if (path === '/found') return '/found';
    return '/';
  });

  // Sync route changes with browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/lost') setCurrentPath('/lost');
      else if (path === '/found') setCurrentPath('/found');
      else setCurrentPath('/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: RoutePath) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Header with findIt logo & dummy auth buttons */}
      <Navbar onNavigateHome={() => navigate('/')} />

      {/* Main View Area based on path */}
      <main className="flex-1 flex flex-col">
        {currentPath === '/' && (
          <LandingPage
            onSelectLost={() => navigate('/lost')}
            onSelectFound={() => navigate('/found')}
          />
        )}

        {currentPath === '/lost' && (
          <LostFeedPlaceholder
            onBackToHome={() => navigate('/')}
            onNavigateToFound={() => navigate('/found')}
          />
        )}

        {currentPath === '/found' && (
          <FoundFeedPlaceholder
            onBackToHome={() => navigate('/')}
            onNavigateToLost={() => navigate('/lost')}
          />
        )}
      </main>
    </div>
  );
}

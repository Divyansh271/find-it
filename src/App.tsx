import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LostSection } from './components/LostSection';
import { CreateLostPost } from './components/CreateLostPost';
import { PostDetail } from './components/PostDetail';
import { FoundFeedPlaceholder } from './components/FoundFeedPlaceholder';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState(() => {
    return window.location.pathname + window.location.search;
  });

  // Sync route changes with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (url: string) => {
    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState({}, '', url);
    }
    setCurrentUrl(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Resolver
  const pathname = currentUrl.split('?')[0];
  const isPostNew = pathname === '/post/new';
  const isPostDetail = pathname.startsWith('/post/') && !isPostNew;
  const postId = isPostDetail ? pathname.replace('/post/', '') : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Header with findIt logo & dummy auth buttons */}
      <Navbar onNavigateHome={() => navigate('/')} />

      {/* Main Viewport Routing */}
      <main className="flex-1 flex flex-col">
        {pathname === '/' && (
          <LandingPage
            onSelectLost={() => navigate('/lost')}
            onSelectFound={() => navigate('/found')}
          />
        )}

        {pathname === '/lost' && (
          <LostSection
            onBackToHome={() => navigate('/')}
            onCreateLostPost={() => navigate('/post/new?type=lost')}
            onSelectPost={(id) => navigate(`/post/${id}`)}
          />
        )}

        {isPostNew && (
          <CreateLostPost
            onBackToLost={() => navigate('/lost')}
            onSelectPost={(id) => navigate(`/post/${id}`)}
          />
        )}

        {isPostDetail && postId && (
          <PostDetail
            postId={postId}
            onBackToLost={() => navigate('/lost')}
          />
        )}

        {pathname === '/found' && (
          <FoundFeedPlaceholder
            onBackToHome={() => navigate('/')}
            onNavigateToLost={() => navigate('/lost')}
          />
        )}
      </main>
    </div>
  );
}

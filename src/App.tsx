import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LostSection } from './components/LostSection';
import { FoundSection } from './components/FoundSection';
import { CreateLostPost } from './components/CreateLostPost';
import { CreateFoundPost } from './components/CreateFoundPost';
import { PostDetail } from './components/PostDetail';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState(() => {
    return window.location.pathname + window.location.search;
  });

  const [previousSection, setPreviousSection] = useState<string>('/lost');

  // Sync route changes with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (url: string) => {
    if (url === '/lost' || url === '/found') {
      setPreviousSection(url);
    }
    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState({}, '', url);
    }
    setCurrentUrl(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Resolver
  const [pathname, search] = currentUrl.split('?');
  const searchParams = new URLSearchParams(search || '');
  const postTypeParam = searchParams.get('type');

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

        {pathname === '/found' && (
          <FoundSection
            onBackToHome={() => navigate('/')}
            onCreateFoundPost={() => navigate('/post/new?type=found')}
            onSelectPost={(id) => navigate(`/post/${id}`)}
          />
        )}

        {isPostNew && postTypeParam === 'found' && (
          <CreateFoundPost
            onBackToFound={() => navigate('/found')}
            onSelectPost={(id) => navigate(`/post/${id}`)}
          />
        )}

        {isPostNew && postTypeParam !== 'found' && (
          <CreateLostPost
            onBackToLost={() => navigate('/lost')}
            onSelectPost={(id) => navigate(`/post/${id}`)}
          />
        )}

        {isPostDetail && postId && (
          <PostDetail
            postId={postId}
            onBack={() => navigate(previousSection || '/')}
          />
        )}
      </main>
    </div>
  );
}

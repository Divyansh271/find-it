import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LostSection } from './components/LostSection';
import { FoundSection } from './components/FoundSection';
import { CreateLostPost } from './components/CreateLostPost';
import { CreateFoundPost } from './components/CreateFoundPost';
import { PostDetail } from './components/PostDetail';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { Dashboard } from './components/Dashboard';
import { ChatPage } from './components/ChatPage';
import { ProfilePage } from './components/ProfilePage';
import { User } from './types/auth';
import { getCurrentUser, onAuthStateChange, logout } from './services/authService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser);
  const [currentUrl, setCurrentUrl] = useState(() => {
    return window.location.pathname + window.location.search;
  });
  const [previousSection, setPreviousSection] = useState<string>('/lost');

  // Subscribe to auth state changes from authService
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

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

  const handleRequireAuth = (targetUrl: string) => {
    navigate(`/auth/login?redirect=${encodeURIComponent(targetUrl)}`);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Route Resolver
  const [pathname, search] = currentUrl.split('?');
  const searchParams = new URLSearchParams(search || '');
  const postTypeParam = searchParams.get('type');
  const redirectParam = searchParams.get('redirect');

  const isPostNew = pathname === '/post/new';
  const isPostDetail = pathname.startsWith('/post/') && !isPostNew;
  const postId = isPostDetail ? pathname.replace('/post/', '') : null;
  const isLogin = pathname === '/auth/login';
  const isSignup = pathname === '/auth/signup';
  const isDashboard = pathname === '/dashboard';
  const isProfile = pathname === '/profile';
  const isChat = pathname.startsWith('/chat/');
  const convoId = isChat ? pathname.replace('/chat/', '') : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Header with findIt logo & auth state */}
      <Navbar
        currentUser={currentUser}
        onNavigateHome={() => navigate('/')}
        onNavigateLogin={() => navigate('/auth/login')}
        onNavigateSignup={() => navigate('/auth/signup')}
        onNavigateDashboard={() => navigate('/dashboard')}
        onNavigateProfile={() => navigate('/profile')}
        onLogout={handleLogout}
      />

      {/* Main Viewport Routing */}
      <main className="flex-1 flex flex-col">
        {/* PUBLIC: Landing Page */}
        {pathname === '/' && (
          <LandingPage
            onSelectLost={() => navigate('/lost')}
            onSelectFound={() => navigate('/found')}
          />
        )}

        {/* PUBLIC: Lost Section (Searches FOUND posts) */}
        {pathname === '/lost' && (
          <LostSection
            currentUser={currentUser}
            onBackToHome={() => navigate('/')}
            onCreateLostPost={() => navigate('/post/new?type=lost')}
            onSelectPost={(id) => navigate(`/post/${id}`)}
            onRequireAuth={handleRequireAuth}
          />
        )}

        {/* PUBLIC: Found Section (Searches LOST posts) */}
        {pathname === '/found' && (
          <FoundSection
            currentUser={currentUser}
            onBackToHome={() => navigate('/')}
            onCreateFoundPost={() => navigate('/post/new?type=found')}
            onSelectPost={(id) => navigate(`/post/${id}`)}
            onRequireAuth={handleRequireAuth}
          />
        )}

        {/* AUTHENTICATION: Login */}
        {isLogin && (
          <LoginPage
            redirectUrl={redirectParam ? decodeURIComponent(redirectParam) : undefined}
            onSuccess={(target) => navigate(target)}
            onNavigateToSignup={() => {
              const redirectSuffix = redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : '';
              navigate(`/auth/signup${redirectSuffix}`);
            }}
            onBackToHome={() => navigate('/')}
          />
        )}

        {/* AUTHENTICATION: Signup */}
        {isSignup && (
          <SignupPage
            redirectUrl={redirectParam ? decodeURIComponent(redirectParam) : undefined}
            onSuccess={(target) => navigate(target)}
            onNavigateToLogin={() => {
              const redirectSuffix = redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : '';
              navigate(`/auth/login${redirectSuffix}`);
            }}
            onBackToHome={() => navigate('/')}
          />
        )}

        {/* PROTECTED: Create Post (/post/new) */}
        {isPostNew && (
          !currentUser ? (
            // Authentication Guard: Redirects to login preserving intended target
            <LoginPage
              redirectUrl={currentUrl}
              onSuccess={(target) => navigate(target)}
              onNavigateToSignup={() => navigate(`/auth/signup?redirect=${encodeURIComponent(currentUrl)}`)}
              onBackToHome={() => navigate(postTypeParam === 'found' ? '/found' : '/lost')}
            />
          ) : postTypeParam === 'found' ? (
            <CreateFoundPost
              onBackToFound={() => navigate('/found')}
              onSelectPost={(id) => navigate(`/post/${id}`)}
            />
          ) : (
            <CreateLostPost
              onBackToLost={() => navigate('/lost')}
              onSelectPost={(id) => navigate(`/post/${id}`)}
            />
          )
        )}

        {/* PROTECTED: Dashboard (/dashboard) */}
        {isDashboard && (
          !currentUser ? (
            <LoginPage
              redirectUrl="/dashboard"
              onSuccess={(target) => navigate(target)}
              onNavigateToSignup={() => navigate('/auth/signup?redirect=%2Fdashboard')}
              onBackToHome={() => navigate('/')}
            />
          ) : (
            <Dashboard
              currentUser={currentUser}
              onNavigateToChat={(id) => navigate(`/chat/${id}`)}
              onNavigateToPost={(id) => navigate(`/post/${id}`)}
              onCreatePost={(type) => navigate(`/post/new?type=${type}`)}
            />
          )
        )}

        {/* PROTECTED: Live Chat (/chat/[convo_id]) */}
        {isChat && convoId && (
          !currentUser ? (
            <LoginPage
              redirectUrl={currentUrl}
              onSuccess={(target) => navigate(target)}
              onNavigateToSignup={() => navigate(`/auth/signup?redirect=${encodeURIComponent(currentUrl)}`)}
              onBackToHome={() => navigate('/')}
            />
          ) : (
            <ChatPage
              convoId={convoId}
              currentUser={currentUser}
              onBack={() => navigate('/dashboard')}
              onNavigateToPost={(id) => navigate(`/post/${id}`)}
              onNavigateToDashboard={() => navigate('/dashboard')}
            />
          )
        )}

        {/* PROTECTED: User Profile (/profile) */}
        {isProfile && (
          !currentUser ? (
            <LoginPage
              redirectUrl="/profile"
              onSuccess={(target) => navigate(target)}
              onNavigateToSignup={() => navigate('/auth/signup?redirect=%2Fprofile')}
              onBackToHome={() => navigate('/')}
            />
          ) : (
            <ProfilePage
              currentUser={currentUser}
              onNavigateToPost={(id) => navigate(`/post/${id}`)}
              onNavigateToDashboard={() => navigate('/dashboard')}
            />
          )
        )}

        {/* PUBLIC: Post Detail View */}
        {isPostDetail && postId && (
          <PostDetail
            postId={postId}
            currentUser={currentUser}
            onBack={() => navigate(previousSection || '/')}
            onRequireAuth={handleRequireAuth}
            onNavigateToChat={(id) => navigate(`/chat/${id}`)}
            onNavigateToDashboard={() => navigate('/dashboard')}
          />
        )}
      </main>
    </div>
  );
}

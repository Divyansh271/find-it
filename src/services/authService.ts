import { User, Session } from '../types/auth';
import { supabase, isSupabaseConfigured, SUPABASE_URL } from './supabaseClient';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export { isSupabaseConfigured, SUPABASE_URL };

type AuthListener = (user: User | null) => void;
const listeners: Set<AuthListener> = new Set();

let cachedUser: User | null = null;
let cachedSession: Session | null = null;
let isInitialized = false;

// Helper to map Supabase User to findIt User model
export function mapSupabaseUser(sbUser: SupabaseUser | null): User | null {
  if (!sbUser) return null;

  const metadata = sbUser.user_metadata || {};
  const email = sbUser.email || '';
  const emailPrefix = email.split('@')[0] || '';
  const fallbackName = emailPrefix
    ? emailPrefix.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Campus Student';

  return {
    user_id: sbUser.id,
    email,
    display_name: metadata.display_name || metadata.full_name || fallbackName,
    trust_score: 0,
    created_at: sbUser.created_at || new Date().toISOString(),
  };
}

// Helper to map Supabase Session to findIt Session model
export function mapSupabaseSession(sbSession: SupabaseSession | null): Session | null {
  if (!sbSession || !sbSession.user) return null;

  const user = mapSupabaseUser(sbSession.user);
  if (!user) return null;

  return {
    user,
    access_token: sbSession.access_token,
    expires_at: sbSession.expires_at ? sbSession.expires_at * 1000 : Date.now() + 3600 * 1000,
  };
}

function notifyListeners(user: User | null) {
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

// Initialize session state from Supabase client
async function initAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data.session) {
      cachedSession = mapSupabaseSession(data.session);
      cachedUser = cachedSession?.user || null;
    }
  } catch (err) {
    console.error('Failed to get Supabase session on init:', err);
  } finally {
    isInitialized = true;
    notifyListeners(cachedUser);
  }
}

// Listen to Supabase Auth state changes
supabase.auth.onAuthStateChange((_event, sbSession) => {
  if (sbSession) {
    cachedSession = mapSupabaseSession(sbSession);
    cachedUser = cachedSession?.user || null;
  } else {
    cachedSession = null;
    cachedUser = null;
  }
  notifyListeners(cachedUser);
});

// Kick off initialization
initAuth();

/**
 * Authentication Abstraction Layer
 * Backed by real Supabase Auth (@supabase/supabase-js)
 */

export function getCurrentUser(): User | null {
  return cachedUser;
}

export function getSession(): Session | null {
  return cachedSession;
}

export async function login(email: string, password: string): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    throw new Error('Please enter both email and password.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      throw new Error(
        'Invalid login credentials. Please ensure you have created an account first, or verify your email and password.'
      );
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('No user returned after sign in.');
  }

  const user = mapSupabaseUser(data.user);
  if (!user) {
    throw new Error('Failed to parse user profile.');
  }

  cachedUser = user;
  if (data.session) {
    cachedSession = mapSupabaseSession(data.session);
  }
  notifyListeners(cachedUser);
  return user;
}

export async function signUp(
  displayName: string,
  email: string,
  password: string
): Promise<User> {
  const trimmedName = displayName.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 30) {
    throw new Error('Display name must be between 2 and 30 characters.');
  }

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    throw new Error('Please provide a valid university email address.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: {
        display_name: trimmedName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('No user returned after sign up.');
  }

  const user = mapSupabaseUser(data.user);
  if (!user) {
    throw new Error('Failed to parse signed-up user profile.');
  }

  // If a session is returned immediately (e.g. email confirmation off), update cache
  if (data.session) {
    cachedSession = mapSupabaseSession(data.session);
    cachedUser = user;
    notifyListeners(cachedUser);
  }

  return user;
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  cachedUser = null;
  cachedSession = null;
  notifyListeners(null);
  if (error) {
    console.error('Error signing out:', error.message);
  }
}

export async function resendConfirmationEmail(email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    throw new Error('Please enter an email address.');
  }
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: trimmed,
  });
  if (error) {
    throw new Error(error.message);
  }
}

function generateValidUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0').slice(-12);
}

export function signInWithDevBypass(email: string, displayName?: string): User {
  const cleanEmail = email.trim().toLowerCase() || 'student@university.edu';
  const emailPrefix = cleanEmail.split('@')[0] || '';
  const fallbackName = emailPrefix
    ? emailPrefix.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Campus Student';

  const user: User = {
    user_id: generateValidUuid(),
    email: cleanEmail,
    display_name: displayName?.trim() || fallbackName,
    trust_score: 0,
    created_at: new Date().toISOString(),
  };

  cachedUser = user;
  cachedSession = {
    user,
    access_token: `dev_bypass_token_${Date.now()}`,
    expires_at: Date.now() + 86400 * 1000,
  };

  notifyListeners(cachedUser);
  return user;
}

export function onAuthStateChange(callback: AuthListener): () => void {
  listeners.add(callback);
  // Call immediately with current state
  callback(cachedUser);
  return () => {
    listeners.delete(callback);
  };
}

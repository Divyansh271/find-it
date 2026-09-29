import { User, Session } from '../types/auth';

const STORAGE_KEY = 'findit_mock_session';

type AuthListener = (user: User | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: User | null) {
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.error('Error in auth state listener', e);
    }
  });
}

function loadSessionFromStorage(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSessionToStorage(session: Session | null) {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to access localStorage for auth', e);
  }
}

let currentSession: Session | null = loadSessionFromStorage();

/**
 * Clean Frontend Authentication Abstraction
 * Currently powered by a dummy/mock implementation.
 * Codex will replace these functions with Supabase Auth (supabase.auth.*)
 * without requiring the UI components to change.
 */

export function getCurrentUser(): User | null {
  return currentSession ? currentSession.user : null;
}

export function getSession(): Session | null {
  return currentSession;
}

export async function login(email: string, password: string): Promise<User> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 80));

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    throw new Error('Please enter both email and password.');
  }

  // Derive a friendly student display name from email if not already stored
  const emailPrefix = trimmedEmail.split('@')[0];
  const derivedName = emailPrefix
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const user: User = {
    user_id: `usr-${Date.now().toString().slice(-6)}`,
    email: trimmedEmail,
    display_name: derivedName || 'Campus Student',
    trust_score: 0,
    created_at: new Date().toISOString(),
  };

  currentSession = {
    user,
    access_token: `dummy_token_${Date.now()}`,
    expires_at: Date.now() + 3600 * 1000,
  };

  saveSessionToStorage(currentSession);
  notifyListeners(user);
  return user;
}

export async function signUp(
  displayName: string,
  email: string,
  password: string
): Promise<User> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 80));

  const trimmedName = displayName.trim();
  const trimmedEmail = email.trim().toLowerCase();

  // Validate according to specification
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 30) {
    throw new Error('Display name must be between 2 and 30 characters.');
  }

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    throw new Error('Please provide a valid university email address.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const user: User = {
    user_id: `usr-${Date.now().toString().slice(-6)}`,
    email: trimmedEmail,
    display_name: trimmedName,
    trust_score: 0,
    created_at: new Date().toISOString(),
  };

  currentSession = {
    user,
    access_token: `dummy_token_${Date.now()}`,
    expires_at: Date.now() + 3600 * 1000,
  };

  saveSessionToStorage(currentSession);
  notifyListeners(user);
  return user;
}

export async function logout(): Promise<void> {
  await new Promise((r) => setTimeout(r, 40));
  currentSession = null;
  saveSessionToStorage(null);
  notifyListeners(null);
}

export function onAuthStateChange(callback: AuthListener): () => void {
  listeners.add(callback);
  // Immediately call with current user state
  callback(getCurrentUser());
  return () => {
    listeners.delete(callback);
  };
}

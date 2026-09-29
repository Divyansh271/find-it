import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, AlertCircle, Compass } from 'lucide-react';
import { login } from '../services/authService';

interface LoginPageProps {
  redirectUrl?: string;
  onSuccess: (targetUrl: string) => void;
  onNavigateToSignup: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  redirectUrl,
  onSuccess,
  onNavigateToSignup,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your university email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      onSuccess(redirectUrl || '/');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-md mx-auto w-full">
      {/* Back button */}
      <div className="w-full flex items-center justify-start mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold mx-auto mb-3">
            <Compass className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Sign in to findIt
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your university lost & found account to report or claim items.
          </p>
        </div>

        {redirectUrl && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800">
            <strong>Authentication required:</strong> Please sign in to proceed with your action.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              University Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 text-xs mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <button
            onClick={onNavigateToSignup}
            className="font-semibold text-slate-900 hover:underline cursor-pointer"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

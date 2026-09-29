import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, User, AlertCircle, Compass, Shield } from 'lucide-react';
import { signUp } from '../services/authService';

interface SignupPageProps {
  redirectUrl?: string;
  onSuccess: (targetUrl: string) => void;
  onNavigateToLogin: () => void;
  onBackToHome: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  redirectUrl,
  onSuccess,
  onNavigateToLogin,
  onBackToHome,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 30) {
      setError('Display name must be between 2 and 30 characters.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid university email.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signUp(trimmedName, email, password);
      onSuccess(redirectUrl || '/');
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.');
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

      {/* Main Signup Card */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold mx-auto mb-3">
            <Compass className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join findIt to report lost belongings or connect with owners.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Display Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">2–30 chars</span>
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                maxLength={30}
                placeholder="e.g. Alex R., CampusDave21"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-xs"
              />
            </div>
            {/* Student Privacy Note */}
            <div className="flex items-start gap-1.5 mt-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2">
              <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                Your display name is shown to other students instead of your real name for campus privacy and safety.
              </span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              University Email <span className="text-rose-500">*</span>
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

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <button
            onClick={onNavigateToLogin}
            className="font-semibold text-slate-900 hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

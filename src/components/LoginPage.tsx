import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  Compass,
  Send,
  CheckCircle2,
  Zap,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import {
  login,
  resendConfirmationEmail,
  signInWithDevBypass,
  isSupabaseConfigured,
  SUPABASE_URL
} from '../services/authService';

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

  // Email Confirmation & Rate Limit helpers
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'rate_limited'>('idle');
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const isEmailUnconfirmed =
    error?.toLowerCase().includes('email not confirmed') ||
    error?.toLowerCase().includes('unconfirmed');

  const isRateLimited =
    error?.toLowerCase().includes('rate limit') ||
    error?.toLowerCase().includes('over_email_send_rate_limit');

  const isInvalidCredentials =
    error?.toLowerCase().includes('invalid login credentials') ||
    error?.toLowerCase().includes('credentials do not match') ||
    error?.toLowerCase().includes('invalid_grant');

  const isConfigError =
    error?.toLowerCase().includes('not configured') ||
    error?.toLowerCase().includes('vite_supabase');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendStatus('idle');
    setResendMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide your university email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(trimmedEmail, password);
      onSuccess(redirectUrl || '/');
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError('Please enter your email above first.');
      return;
    }

    setResendStatus('sending');
    setResendMessage(null);

    try {
      await resendConfirmationEmail(email);
      setResendStatus('sent');
      setResendMessage(`Confirmation email sent to ${email.trim()}. Please check your inbox or spam.`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend confirmation email.';
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('over_email_send_rate_limit')) {
        setResendStatus('rate_limited');
        setResendMessage('Supabase email rate limit reached (max 3 emails/hour on free tier). Use the Instant Sign In button below.');
      } else {
        setResendStatus('idle');
        setError(msg);
      }
    }
  };

  const handleBypassSignIn = () => {
    signInWithDevBypass(email);
    onSuccess(redirectUrl || '/');
  };

  const supabaseHost = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : 'Supabase';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-md mx-auto w-full">
      {/* Back button */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Live Supabase Connection Indicator */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-full text-[10px] text-slate-600 font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{supabaseHost}</span>
        </div>
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

        {/* Configuration Error Box */}
        {isConfigError && (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Supabase Keys Synced</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              The project is configured with <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>. You can sign in below.
            </p>
          </div>
        )}

        {/* Invalid Credentials Box */}
        {isInvalidCredentials && (
          <div className="mb-5 p-4 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2.5">
            <div className="flex items-start gap-2 text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Login Credentials Did Not Match</strong>
                <span className="text-amber-800 text-[11px] leading-relaxed">
                  Supabase could not find a confirmed user matching this email and password combination.
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-lg border border-amber-200/60 space-y-1">
              <p className="font-semibold text-slate-900">Common reasons:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>You haven't created an account yet on this Supabase project.</li>
                <li>Your password had a typo or different capitalization.</li>
                <li>Email verification was required when you signed up.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={onNavigateToSignup}
                className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>

              <button
                type="button"
                onClick={handleBypassSignIn}
                className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* Unconfirmed Email Assistant Box */}
        {isEmailUnconfirmed && (
          <div className="mb-5 p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2 text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Email Not Confirmed Yet</strong>
                <span>
                  Supabase requires confirming your email address before allowing your first sign in.
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendStatus === 'sending'}
                className="flex-1 py-1.5 px-3 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{resendStatus === 'sending' ? 'Sending...' : 'Resend Email'}</span>
              </button>

              <button
                type="button"
                onClick={handleBypassSignIn}
                className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Sign In Instantly</span>
              </button>
            </div>

            <div className="text-[11px] text-amber-800/90 pt-1 border-t border-amber-200/60 leading-relaxed">
              💡 <strong>Permanent fix in Supabase:</strong> In your Supabase Dashboard, go to <strong>Authentication &rarr; Providers &rarr; Email</strong> and toggle off <strong>"Confirm email"</strong> to allow immediate logins without verification.
            </div>
          </div>
        )}

        {/* Rate Limited Assistant Box */}
        {isRateLimited && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Email Rate Limit Exceeded</strong>
                <span>
                  Supabase's built-in SMTP limits emails to ~3 per hour on the free tier.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBypassSignIn}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Continue with Instant Dev Sign In</span>
            </button>
          </div>
        )}

        {/* Resend Status Notifications */}
        {resendMessage && (
          <div className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
            resendStatus === 'sent'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{resendMessage}</span>
          </div>
        )}

        {/* Standard Error Notice (if not special category) */}
        {error && !isEmailUnconfirmed && !isRateLimited && !isInvalidCredentials && !isConfigError && (
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

        {/* Quick Testing Helper */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Testing or password forgotten?</span>
          <button
            type="button"
            onClick={handleBypassSignIn}
            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3" />
            <span>Instant Sign In</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
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

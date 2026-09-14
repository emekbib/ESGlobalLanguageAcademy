'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, Star } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('loading');

    if (authMethod === 'magic-link') {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (signInError) {
        setError(signInError.message);
        setStatus('idle');
        return;
      }

      setStatus('sent');
      return;
    }

    // Password authentication flow
    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setStatus('idle');
        return;
      }

      if (data.session) {
        router.push('/onboarding');
        return;
      }

      setStatus('sent');
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setStatus('idle');
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!profile) {
          router.push('/onboarding');
        } else if (profile.role === 'admin') {
          router.push('/admin');
        } else if (profile.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (signInError) {
      setError(signInError.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[440px] animate-fade-in">
      {/* Outer Card */}
      <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        {status === 'sent' ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Check your inbox
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-500">
              We sent a verification link to{' '}
              <span className="font-semibold text-stone-900">{email}</span>.
            </p>
            <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-xs text-stone-600">
              Click the link inside the email to immediately access your account.
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setEmail('');
                setPassword('');
              }}
              className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 transition hover:text-stone-950"
            >
              ← Use a different email address
            </button>
          </div>
        ) : (
          <>
            {/* Mode Switcher Pills */}
            <div className="flex rounded-full bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
                className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Header Text */}
            <div className="mt-8 text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                {mode === 'signin' ? 'Welcome back' : 'Start learning today'}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                {mode === 'signin'
                  ? 'Access your lessons, calendar, and teachers.'
                  : 'Connect with native educators across Amharic, Tigrigna, Afaan Oromo, Somali & Swahili.'}
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-800 shadow-sm transition-all hover:border-stone-400 hover:bg-stone-50 active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? 'Connecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-stone-400">
              <span className="h-px flex-1 bg-stone-200" />
              <span>or email</span>
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700" htmlFor="email">
                  Email address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="h-12 w-full rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {authMethod === 'password' && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-stone-700" htmlFor="password">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setAuthMethod('magic-link')}
                        className="text-xs font-medium text-stone-500 hover:text-stone-900"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="h-12 w-full rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-stone-900 text-sm font-semibold text-white shadow-md transition-all hover:bg-stone-800 active:scale-[0.99] disabled:opacity-60"
              >
                <span>
                  {status === 'loading'
                    ? 'Authenticating…'
                    : authMethod === 'magic-link'
                    ? 'Send Magic Sign-in Link'
                    : mode === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod(authMethod === 'password' ? 'magic-link' : 'password');
                    setError('');
                  }}
                  className="text-xs font-medium text-stone-500 hover:text-stone-900 transition"
                >
                  {authMethod === 'password'
                    ? '✉ Prefer a passwordless email link? Click here'
                    : '🔑 Sign in with password instead'}
                </button>
              </div>
            </form>

            {/* Trust footer */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
              <ShieldCheck className="h-4 w-4 text-stone-400" />
              <span>256-bit SSL encrypted · Verified platform</span>
            </div>

            {/* Social proof strip inside card */}
            <div className="mt-6 border-t border-stone-100 pt-5 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
                <span className="ml-1.5 text-xs font-bold text-stone-800">4.98 / 5.0</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-400">
                Over 15,000 lessons taught by verified educators worldwide
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

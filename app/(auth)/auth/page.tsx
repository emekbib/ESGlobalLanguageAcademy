'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, GraduationCap, Mail } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('loading');

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
    <div className="w-full max-w-md animate-fade-in">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </span>
        ESGlobalLanguageAcademy
      </Link>
      <div className="rounded-2xl border bg-card p-8 text-card-foreground shadow-lg shadow-slate-200/40">
        {status === 'sent' ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">Check your inbox</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              We sent a secure sign-in link to <span className="font-medium text-foreground">{email}</span>.
            </p>
            <button onClick={() => setStatus('idle')} className="mt-8 text-sm font-semibold text-primary hover:underline">
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Welcome back</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">Sign in to ESGlobalLanguageAcademy</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Connect with the right people to learn, teach, and grow.</p>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border bg-background text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-base font-bold text-slate-700">G</span>
              {googleLoading ? 'Opening Google…' : 'Continue with Google'}
            </button>
            <div className="my-7 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or continue with email
              <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <label className="block text-sm font-medium" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending link…' : 'Send magic link'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
            <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">No password needed. We’ll email you a secure sign-in link.</p>
          </>
        )}
      </div>
    </div>
  );
}

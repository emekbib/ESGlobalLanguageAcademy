'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { ShieldCheck, Loader2, Lock, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        // Log them out and show error since they aren't an admin
        await supabase.auth.signOut();
        setError('Access Denied: You do not have administrative privileges.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] dark:bg-stone-950 font-sans transition-colors duration-200">
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Back button */}
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to main site
          </Link>

          {/* Logo & Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 dark:bg-stone-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="font-display text-3xl font-black text-stone-950 dark:text-white">
              Operations Console
            </h1>
            <p className="mt-3 text-sm font-medium text-stone-500 dark:text-stone-400">
              ES Global Language Academy Admin Portal
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-950/30 p-4">
                  <p className="text-center text-sm font-bold text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/50 pl-10 pr-4 py-3 text-sm font-medium text-stone-900 dark:text-white placeholder-stone-400 transition-all focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:border-stone-600 dark:focus:ring-stone-600"
                    placeholder="admin@esglobal.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/50 pl-10 pr-4 py-3 text-sm font-medium text-stone-900 dark:text-white placeholder-stone-400 transition-all focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:border-stone-600 dark:focus:ring-stone-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-stone-950 dark:bg-white px-4 py-6 text-sm font-bold text-white dark:text-stone-950 shadow-md transition-all hover:bg-stone-800 dark:hover:bg-stone-200 hover:shadow-lg disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Access Dashboard'
                  )}
                </Button>
              </div>
            </form>
          </div>
          
          <p className="mt-8 text-center text-xs text-stone-400 dark:text-stone-500">
            This area is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}

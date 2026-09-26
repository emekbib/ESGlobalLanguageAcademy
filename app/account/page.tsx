'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Check,
  Loader2,
  LogOut,
  Save,
  Moon,
  Sun,
  LayoutDashboard,
  ExternalLink,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import LogoutModal from '@/components/dashboard/logout-modal';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme ? resolvedTheme === 'dark' : theme === 'dark');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth');
        return;
      }

      const userEmail = user.email || '';

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        router.replace('/onboarding');
        return;
      }

      if (active) {
        setUserId(profile.user_id);
        setEmail(userEmail);
        setRole(profile.role ?? 'student');
        setFullName(profile.full_name || '');
        setAvatarUrl(profile.avatar_url ?? '');
        setCreatedAt(profile.created_at || null);
        setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const trimmedName = fullName.trim() || 'ESGlobal Member';
    const trimmedAvatar = avatarUrl.trim() || null;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: trimmedName,
        avatar_url: trimmedAvatar,
      })
      .eq('user_id', userId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Profile settings saved successfully.');
      setTimeout(() => setMessage(''), 4000);
    }
    setSaving(false);
  }

  const dashboardHref =
    role === 'admin'
      ? '/admin'
      : role === 'teacher'
      ? '/teacher/dashboard'
      : '/dashboard';

  const roleLabel =
    role === 'admin'
      ? 'Academy Administrator'
      : role === 'teacher'
      ? 'Educator / Tutor'
      : 'Student Learner';

  const memberSinceFormatted = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const firstLetter = fullName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] dark:bg-stone-950">
        <Loader2 className="h-8 w-8 animate-spin text-stone-900 dark:text-stone-100" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-28 pb-20">
        {/* Top Breadcrumb & Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 shadow-sm hover:border-amber-400 dark:hover:border-amber-400 transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-amber-500" />
              <span>Workspace</span>
            </Link>
          </div>
        </div>

        {/* Hero Identity Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-stone-950 dark:bg-stone-800 border-2 border-amber-400/40 text-2xl font-bold text-amber-300 shadow-md">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="h-full w-full object-cover"
                      onError={() => {
                        // fallback if url breaks
                      }}
                    />
                  ) : (
                    firstLetter
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white dark:ring-stone-900">
                  <Check className="h-3.5 w-3.5" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
                    {fullName || 'ESGlobal Member'}
                  </h1>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    {roleLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {email || 'Verified Academy Account'} • Member since {memberSinceFormatted}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="inline-flex items-center gap-2 self-start sm:self-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 px-4 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/60 transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Main Settings Sections Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left Column: Quick Navigation & Profile Highlights */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-4">
                Account Summary
              </h2>
              <dl className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <dt className="text-stone-500 dark:text-stone-400">Account Role</dt>
                  <dd className="font-bold text-stone-900 dark:text-stone-100 capitalize">
                    {role}
                  </dd>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <dt className="text-stone-500 dark:text-stone-400">Status</dt>
                  <dd className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Active
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-stone-500 dark:text-stone-400">Security Tier</dt>
                  <dd className="font-bold text-stone-900 dark:text-stone-100">
                    Supabase Auth
                  </dd>
                </div>
              </dl>
            </div>

            {/* Horn of Africa Supported Dialects */}
            <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 p-6">
              <div className="flex items-center gap-2 mb-2 text-stone-950 dark:text-white">
                <GraduationCap className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Academy Languages
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-3">
                ESGlobal specializes in Horn of Africa linguistic heritage:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Amharic (አማርኛ)', 'Tigrigna (ትግርኛ)', 'Afaan Oromo', 'Somali'].map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Profile Form & Appearance */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form Card */}
            <form
              onSubmit={saveProfile}
              className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)] space-y-6"
            >
              <div>
                <h2 className="font-display text-lg font-bold text-stone-950 dark:text-white">
                  Personal Profile
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Update your display name and public avatar across the academy.
                </p>
              </div>

              {/* Success / Error Message Banner */}
              {message && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fade-in">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{message}</span>
                </div>
              )}
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-bold text-red-800 dark:text-red-300 animate-fade-in">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2"
                >
                  Full Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    id="full_name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Almaz Bekele"
                    className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/60 py-3.5 pl-11 pr-4 text-sm font-semibold text-stone-900 dark:text-white outline-none transition focus:border-stone-950 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-stone-800"
                  />
                </div>
              </div>

              {/* Email (Read-Only) */}
              <div>
                <label
                  htmlFor="account_email"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2"
                >
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    id="account_email"
                    type="email"
                    disabled
                    value={email}
                    className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-800/30 py-3.5 pl-11 pr-24 text-sm font-medium text-stone-600 dark:text-stone-400 cursor-not-allowed select-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">
                  Authentication is managed securely through your verified credentials.
                </p>
              </div>

              {/* Avatar Image URL */}
              <div>
                <label
                  htmlFor="avatar_url"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2"
                >
                  Avatar Photo URL
                </label>
                <input
                  id="avatar_url"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/60 px-4 py-3.5 text-sm font-medium text-stone-900 dark:text-white outline-none transition focus:border-stone-950 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-stone-800"
                />
                <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">
                  Provide a direct link to any portrait photograph to display in the academy directory.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-stone-950 dark:bg-stone-100 px-6 py-3.5 text-sm font-bold text-white dark:text-stone-950 shadow-md hover:bg-stone-800 dark:hover:bg-white transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Changes…</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Appearance & Theme Preference Card */}
            <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.3)] space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-stone-950 dark:text-white">
                  Appearance Preferences
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Choose how ESGlobal Language Academy looks on your device.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition cursor-pointer ${
                    !isDark
                      ? 'border-stone-950 dark:border-white bg-stone-50 dark:bg-stone-800 ring-2 ring-stone-950 dark:ring-white'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-950 dark:text-white">
                      Light Mode
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Editorial warm ivory
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition cursor-pointer ${
                    isDark
                      ? 'border-amber-400 bg-stone-800 ring-2 ring-amber-400'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-800 text-amber-300">
                    <Moon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-950 dark:text-white">
                      Dark Mode
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Deep night stone
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}

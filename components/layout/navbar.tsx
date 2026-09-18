'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, Menu, X, Bell, Moon, Sun } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import ProfileMenu from '@/components/account/profile-menu';
import { useTheme } from 'next-themes';

export default function Navbar({
  transparentOverHero = false,
}: {
  transparentOverHero?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDark = mounted && (resolvedTheme ? resolvedTheme === 'dark' : theme === 'dark');
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        // Fetch role to determine which dashboard to link to
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUserRole(profile.role);
          setUserProfile({ full_name: profile.full_name, avatar_url: profile.avatar_url });
        }
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        checkUser(); // Re-fetch role
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isOverHeroTransparent = transparentOverHero && !scrolled;
  const dashboardLink = userRole === 'admin' ? '/admin' : userRole === 'teacher' ? '/teacher/dashboard' : '/dashboard';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOverHeroTransparent
          ? 'bg-transparent text-white'
          : 'border-b border-stone-200/80 dark:border-stone-800 bg-[#faf9f6]/95 dark:bg-stone-950/95 backdrop-blur-md text-stone-900 dark:text-white shadow-sm'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        {/* Logo — clean modern wordmark */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 transition-opacity hover:opacity-80 ${
            isOverHeroTransparent ? 'text-white' : 'text-stone-900 dark:text-white'
          }`}
        >
          <GraduationCap className="h-6 w-6 text-amber-500" />
          <span className="font-display text-xl font-bold tracking-tight">
            ESGlobal
          </span>
        </Link>

        {/* Center nav links */}
        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/teachers"
            className={`text-sm font-medium transition-colors ${
              isOverHeroTransparent
                ? 'text-white/80 hover:text-white'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Find a Teacher
          </Link>

          {!isLoggedIn ? (
            <Link
              href="/auth"
              className={`text-sm font-medium transition-colors ${
                isOverHeroTransparent
                  ? 'text-white/80 hover:text-white'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </Link>
          ) : null}

          {(!isLoggedIn || userRole === 'student') && (
            <Link
              href="/teacher/onboarding"
              className={`text-sm font-medium transition-colors ${
                isOverHeroTransparent
                  ? 'text-white/80 hover:text-white'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Become a Teacher
            </Link>
          )}
        </nav>

        {/* Right action buttons */}
        <div className="hidden items-center gap-5 md:flex">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link
                href={dashboardLink}
                className={`hidden md:block rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  isOverHeroTransparent
                    ? 'border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-stone-900'
                    : 'border border-stone-900 dark:border-stone-200 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-white shadow-sm'
                }`}
              >
                Dashboard
              </Link>
              
              <div className={`flex items-center gap-2 border-l pl-4 ${isOverHeroTransparent ? 'border-white/20' : 'border-stone-200 dark:border-stone-800'}`}>
                <button
                  type="button"
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    isOverHeroTransparent ? 'hover:bg-white/10 text-white/90 hover:text-white' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    isOverHeroTransparent ? 'hover:bg-white/10 text-white/90 hover:text-white' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                {userProfile && (
                  <ProfileMenu fullName={userProfile.full_name} avatarUrl={userProfile.avatar_url} />
                )}
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/auth"
                className={`text-sm font-medium transition-colors ${
                  isOverHeroTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  isOverHeroTransparent
                    ? 'border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-stone-900'
                    : 'border border-stone-900 dark:border-stone-200 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-white shadow-sm'
                }`}
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`rounded-xl p-2 md:hidden ${
            isOverHeroTransparent ? 'text-white hover:bg-white/10' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-stone-200/80 bg-[#faf9f6]/98 px-6 py-6 text-stone-900 md:hidden shadow-2xl backdrop-blur-xl animate-fade-in max-h-[calc(100dvh-5rem)] overflow-y-auto">
          <div className="flex flex-col gap-3">
            <Link
              href="/teachers"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-2xl p-3 text-sm font-bold text-stone-800 hover:bg-stone-100 transition"
            >
              <span>Find a Teacher</span>
              <span className="text-xs text-stone-400">Directory</span>
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-2xl p-3 text-sm font-bold text-stone-800 hover:bg-stone-100 transition"
            >
              <span>How It Works</span>
              <span className="text-xs text-stone-400">Method</span>
            </Link>
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-2xl p-3 text-sm font-bold text-stone-800 hover:bg-stone-100 transition"
            >
              <span>Become a Teacher</span>
              <span className="text-xs text-amber-600 font-semibold">Join Faculty</span>
            </Link>

            {/* Quick Language Shortcuts on Mobile */}
            <div className="pt-2">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Explore Languages
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5 px-2">
                {[
                  { name: 'Amharic', q: 'amharic' },
                  { name: 'Tigrigna', q: 'tigrigna' },
                  { name: 'Afaan Oromo', q: 'afaan oromo' },
                  { name: 'Somali', q: 'somali' },
                  { name: 'Swahili', q: 'swahili' },
                ].map((l) => (
                  <Link
                    key={l.name}
                    href={`/teachers?lang=${l.q}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-700 hover:border-amber-400 transition"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2.5 border-t border-stone-200/80 pt-5">
              {isLoggedIn ? (
                <Link
                  href={dashboardLink}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl bg-stone-950 py-3 text-center text-xs font-bold text-white shadow-md transition hover:bg-stone-800"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-stone-200 bg-white py-3 text-center text-xs font-bold text-stone-900 shadow-sm hover:bg-stone-50 transition"
                  >
                    Sign In to Account
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl bg-stone-950 py-3 text-center text-xs font-bold text-white shadow-md transition hover:bg-stone-800"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

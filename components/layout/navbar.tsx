'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, Menu, X } from 'lucide-react';

export default function Navbar({
  transparentOverHero = false,
}: {
  transparentOverHero?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDark = transparentOverHero && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDark
          ? 'bg-transparent text-white'
          : 'border-b border-stone-200/80 bg-[#faf9f6]/90 backdrop-blur-md text-stone-900 shadow-sm'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        {/* Logo — clean modern wordmark */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 transition-opacity hover:opacity-80 ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}
        >
          <GraduationCap className="h-6 w-6" />
          <span className="font-display text-xl font-bold tracking-tight">
            ESGlobal
          </span>
        </Link>

        {/* Center nav links */}
        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/teachers"
            className={`text-sm font-medium transition-colors ${
              isDark ? 'text-white/80 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Find a Teacher
          </Link>
          <a
            href="/#how-it-works"
            className={`text-sm font-medium transition-colors ${
              isDark ? 'text-white/80 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            How it Works
          </a>
          <Link
            href="/auth"
            className={`text-sm font-medium transition-colors ${
              isDark ? 'text-white/80 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Become a Teacher
          </Link>
        </nav>

        {/* Right action buttons */}
        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/auth"
            className={`text-sm font-medium transition-colors ${
              isDark ? 'text-white/80 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              isDark
                ? 'border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-stone-900'
                : 'border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white'
            }`}
          >
            Sign up
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`rounded-lg p-2 md:hidden ${
            isDark ? 'text-white hover:bg-white/10' : 'text-stone-700 hover:bg-stone-100'
          }`}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-stone-200 bg-[#faf9f6] px-6 py-6 text-stone-900 md:hidden shadow-xl">
          <div className="flex flex-col gap-4">
            <Link
              href="/teachers"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-stone-700"
            >
              Find a Teacher
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-stone-700"
            >
              How it Works
            </a>
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-stone-700"
            >
              Become a Teacher
            </Link>
            <div className="mt-2 flex flex-col gap-2 border-t border-stone-200 pt-4">
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-stone-600"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-stone-900 py-2.5 text-center text-sm font-semibold text-white"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

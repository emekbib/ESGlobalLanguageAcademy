import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-stone-900 selection:text-white transition-colors">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-100/40 dark:from-amber-500/10 via-stone-100/20 dark:via-stone-900/10 to-transparent blur-3xl" />
      </div>

      {/* Top navigation */}
      <header className="relative z-10 mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 px-4 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 shadow-sm backdrop-blur-sm transition-all hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to ESGlobal
        </Link>

        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <GraduationCap className="h-5 w-5 text-stone-900 dark:text-amber-400" />
          <span className="font-display text-lg font-bold tracking-tight text-stone-900 dark:text-white">
            ESGlobal
          </span>
        </Link>
      </header>

      {/* Main card container */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Auth footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-stone-400 dark:text-stone-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <p>© {new Date().getFullYear()} ESGlobal Language Academy. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="transition hover:text-stone-700 dark:hover:text-stone-300">Privacy Policy</Link>
            <Link href="/" className="transition hover:text-stone-700 dark:hover:text-stone-300">Terms of Service</Link>
            <Link href="/" className="transition hover:text-stone-700 dark:hover:text-stone-300">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

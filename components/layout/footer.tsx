import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/80 dark:border-stone-800 bg-[#faf9f6] dark:bg-stone-950 py-12 transition-colors">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-stone-700 dark:text-amber-300" />
            <span className="font-display font-bold text-stone-900 dark:text-white">
              ESGlobal Language Academy
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-500 dark:text-stone-400">
            <Link href="/teachers" className="hover:text-stone-900 dark:hover:text-white transition-colors">Teachers</Link>
            <Link href="/auth" className="hover:text-stone-900 dark:hover:text-white transition-colors">Become a Tutor</Link>
            <Link href="/#how-it-works" className="hover:text-stone-900 dark:hover:text-white transition-colors">How it Works</Link>
            <Link href="/auth" className="hover:text-stone-900 dark:hover:text-white transition-colors">Sign In</Link>
          </div>

          <p className="text-xs text-stone-400 dark:text-stone-500">
            © {new Date().getFullYear()} ESGlobal Language Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

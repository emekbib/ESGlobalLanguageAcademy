import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#faf9f6] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-stone-700" />
            <span className="font-display font-bold text-stone-900">
              ESGlobal Language Academy
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-500">
            <Link href="/teachers" className="hover:text-stone-900">Teachers</Link>
            <Link href="/auth" className="hover:text-stone-900">Become a Tutor</Link>
            <Link href="/#how-it-works" className="hover:text-stone-900">How it Works</Link>
            <Link href="/auth" className="hover:text-stone-900">Sign In</Link>
          </div>

          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} ESGlobal Language Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

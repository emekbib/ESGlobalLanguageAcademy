import Link from 'next/link';
import { ArrowLeft, Compass, GraduationCap, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-xl text-center">
          {/* Brand Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 px-4 py-1.5 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              404 · Page Not Found
            </span>
          </div>

          <h1 className="mt-6 font-display text-4xl sm:text-5xl font-black tracking-tight text-stone-950 dark:text-white">
            Lost in translation?
          </h1>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-400 font-medium">
            The lesson or page you are looking for does not exist or has been relocated. Let&apos;s guide you back to our native language faculty.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 dark:bg-stone-100 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-md transition hover:bg-stone-800 dark:hover:bg-white active:scale-95 sm:w-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Homepage
            </Link>

            <Link
              href="/teachers"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 shadow-sm transition hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95 sm:w-auto"
            >
              <Compass className="h-3.5 w-3.5 text-amber-500" />
              Browse Faculty Directory
            </Link>
          </div>

          {/* Quick Language Shortcuts */}
          <div className="mt-12 border-t border-stone-200/80 dark:border-stone-800 pt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Explore Native Focus Languages
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {[
                { name: 'Amharic', q: 'amharic' },
                { name: 'Tigrigna', q: 'tigrigna' },
                { name: 'Afaan Oromo', q: 'afaan oromo' },
                { name: 'Somali', q: 'somali' },
                { name: 'Swahili', q: 'swahili' },
              ].map((lang) => (
                <Link
                  key={lang.name}
                  href={`/teachers?lang=${lang.q}`}
                  className="rounded-full border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 px-3.5 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300 shadow-sm transition hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400"
                >
                  {lang.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

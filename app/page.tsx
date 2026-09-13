'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, GraduationCap, ShieldCheck, Video, Zap } from 'lucide-react';
import FeaturedTeachers from '@/components/home/featured-teachers';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

const TESTIMONIALS = [
  {
    quote: "Booking Elena for Spanish conversation prep helped me pass my DELE B2 exam on the first attempt. The 1-on-1 video classroom is seamless.",
    author: "Marcus Vance",
    role: "Software Engineer",
    language: "Learning Spanish",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
  },
  {
    quote: "As a teacher, ESGlobal provides the cleanest platform for scheduling students, managing my payouts, and running high-quality video lessons.",
    author: "Antoine Laurent",
    role: "Certified French Educator",
    language: "Teaching French",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    quote: "I tried language apps for years without speaking fluently. Two months of 1-on-1 sessions with Yuki completely unlocked conversational Japanese.",
    author: "Sophie Lindqvist",
    role: "Product Designer",
    language: "Learning Japanese",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] text-stone-900 selection:bg-sky-500 selection:text-white">
      <Navbar transparentOverHero={true} />

      {/* ── HERO (Intro.co style: Full 100vh viewport height with press bar at bottom) ── */}
      <section className="relative flex h-screen min-h-[660px] flex-col justify-between overflow-hidden bg-stone-950">
        {/* Background image — sunlit luxury study & villa */}
        <Image
          src="/hero.jpg"
          alt="Sunlit modern luxury villa with floor to ceiling glass overlooking green trees"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Warm contrast overlay maintaining sunlit daylight while ensuring crisp readability */}
        <div className="absolute inset-0 bg-stone-950/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-stone-950/65" />

        {/* Top spacer matching fixed navbar */}
        <div className="h-20 shrink-0" />

        {/* Content — perfectly centered in the full-height viewport */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Social Proof Pill */}
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 shadow-lg backdrop-blur-md">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-6 w-6 rounded-full object-cover ring-2 ring-white/80"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                alt="Tutor Elena"
              />
              <img
                className="inline-block h-6 w-6 rounded-full object-cover ring-2 ring-white/80"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
                alt="Tutor Antoine"
              />
              <img
                className="inline-block h-6 w-6 rounded-full object-cover ring-2 ring-white/80"
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=120&auto=format&fit=crop"
                alt="Tutor Yuki"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>4.98 ★</span>
              <span className="text-white/50">·</span>
              <span className="text-white/85">15,000+ completed lessons</span>
            </div>
          </div>

          <h1 className="font-display text-4xl font-medium leading-[1.14] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)] sm:text-5xl md:text-6xl">
            Book 1-on-1 language lessons with native teachers worldwide
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base font-normal text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.85)] sm:text-lg">
            Master conversation, ace exams, or gain business fluency with vetted native educators over 1-on-1 video.
          </p>

          {/* High-Attention Magnetic CTA Button */}
          <div className="mt-9 flex justify-center">
            <Link
              href="/teachers"
              className="group relative inline-flex items-center gap-3.5 rounded-full border border-white/90 bg-white py-2.5 pl-8 pr-3 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(255,255,255,0.4)] ring-4 ring-white/30 transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:ring-white/60 hover:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_50px_rgba(255,255,255,0.6)] active:scale-100"
            >
              <span className="font-display text-base font-bold tracking-tight text-stone-950">
                Find Your Teacher
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-950 text-white shadow-md transition-all duration-300 group-hover:translate-x-1 group-hover:bg-amber-400 group-hover:text-stone-950">
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          </div>

          {/* Quick Language Shortcuts */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-medium text-white/70">Popular:</span>
            {[
              { name: 'English', query: 'english' },
              { name: 'German', query: 'german' },
              { name: 'French', query: 'french' },
              { name: 'Amharic', query: 'amharic' },
              { name: 'Arabic', query: 'arabic' },
              { name: 'Italian', query: 'italian' },
              { name: 'Afan Oromo', query: 'oromo' },
              { name: 'Mandarin', query: 'mandarin' },
            ].map((lang) => (
              <Link
                key={lang.name}
                href={`/teachers?lang=${lang.query}`}
                className="rounded-full border border-white/25 bg-black/30 px-3 py-1 font-medium text-white/90 backdrop-blur-sm transition hover:border-white/60 hover:bg-white/20 hover:text-white"
              >
                {lang.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom: Refined Editorial Metrics (Bilt luxury style — no rainbow icon clutter) */}
        <div className="relative z-10 border-t border-white/10 bg-black/45 py-5 backdrop-blur-xl">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 text-center md:grid-cols-4 md:divide-x md:divide-white/10">
            <div className="px-3">
              <p className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">40+</p>
              <p className="mt-1 text-[11px] font-semibold tracking-widest uppercase text-stone-300/80">Languages Offered</p>
            </div>
            <div className="px-3">
              <p className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">100%</p>
              <p className="mt-1 text-[11px] font-semibold tracking-widest uppercase text-stone-300/80">Vetted Native Tutors</p>
            </div>
            <div className="px-3">
              <p className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">4.98 ★</p>
              <p className="mt-1 text-[11px] font-semibold tracking-widest uppercase text-stone-300/80">Student Satisfaction</p>
            </div>
            <div className="px-3">
              <p className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">$0</p>
              <p className="mt-1 text-[11px] font-semibold tracking-widest uppercase text-stone-300/80">Subscription Required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS (Clean Editorial 3-Column Layout) ── */}
      <section className="bg-[#faf9f6] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="border-b border-stone-200/80 pb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              The ESGlobal Standard
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Language learning built around you, not a generic app.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-16">
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold tracking-wider text-stone-400">01</span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Accredited Native Tutors
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
                Curated roster of verified educators across 40+ languages, hand-screened for university credentials, dialect mastery, and teaching dedication.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold tracking-wider text-stone-400">02</span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Tailored 1-on-1 Sessions
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
                Every minute is personalized to your goals — whether you are preparing for Goethe-Zertifikat, IELTS, business negotiations, or conversational fluency.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold tracking-wider text-stone-400">03</span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Zero Subscriptions Required
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
                Book and pay per lesson with upfront, transparent pricing. Free rescheduling up to 24 hours prior with no lock-in contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED TEACHERS ── */}
      <section className="border-t border-stone-200/60 bg-white py-4">
        <FeaturedTeachers />
      </section>

      {/* ── HOW IT WORKS (Intro.co Editorial Steps) ── */}
      <section id="how-it-works" className="border-t border-stone-200/60 bg-[#faf9f6] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              Seamless Experience
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              How it works.{' '}
              <span className="font-normal text-stone-400">
                Language mastery made simple
              </span>
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="border-t border-stone-300/80 pt-6">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-stone-400">Step 01</span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Discover top native experts
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Explore certified tutors filtered by native dialect, hourly rate, verified credentials, and real student reviews.
              </p>
            </div>
            <div className="border-t border-stone-300/80 pt-6">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-stone-400">Step 02</span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Book a 1-on-1 slot in 60 seconds
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Pick an available time slot directly from the teacher's calendar with transparent upfront pricing and zero hidden fees.
              </p>
            </div>
            <div className="border-t border-stone-300/80 pt-6">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-stone-400">Step 03</span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Meet in your virtual classroom
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Connect instantly in an HD video room right on the platform. No app downloads required — just click and start learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (Refined Social Proof) ── */}
      <section className="border-t border-stone-200/60 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              Verified Feedback
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Loved by students and educators worldwide
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-stone-200/70 bg-[#faf9f6] p-8 transition-all duration-300 hover:border-stone-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-5 text-[15px] leading-relaxed text-stone-700">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-3.5 border-t border-stone-200/60 pt-5">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-stone-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{t.author}</h4>
                    <p className="text-xs text-stone-500">
                      {t.role} · <span className="font-semibold text-stone-800">{t.language}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA (Editorial Luxury Style) ── */}
      <section className="border-t border-stone-200/60 bg-[#faf9f6] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-stone-950 px-8 py-20 text-center text-white shadow-2xl sm:px-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Start speaking fluently today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-stone-300/80">
              Join students worldwide. Book your first 1-on-1 session with a certified native speaker in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                href="/teachers"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-stone-950 shadow-lg transition-all duration-300 hover:bg-stone-100 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
              >
                Browse All Teachers
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                Apply as a Teacher
              </Link>
            </div>
            <p className="mt-6 text-xs text-stone-400">
              Instant booking · 100% verified native educators · Cancel or reschedule anytime
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

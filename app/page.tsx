'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Star,
  GraduationCap,
  ShieldCheck,
  Video,
  BookOpen,
  Sparkles,
  Users,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import FeaturedTeachers from '@/components/home/featured-teachers';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

const TESTIMONIALS = [
  {
    quote:
      'I wanted my 8-year-old daughter to read the Fidel script and speak Amharic like her grandparents back home. Bethelhem’s patience and cultural storytelling made all the difference. She now reads children’s books and sings traditional songs fluently.',
    author: 'Selamawit Bekele',
    role: 'Heritage Parent & Tech Lead',
    location: 'Washington, D.C.',
    language: 'Amharic & Fidel Literacy',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=240&auto=format&fit=crop',
  },
  {
    quote:
      'Growing up in Seattle, I could understand basic Tigrigna but froze whenever I tried speaking with my grandparents. After 8 weeks with Semhar, I held an entire dinner conversation in Tigrigna without switching to English. Truly life-changing.',
    author: 'Samuel Ghebre',
    role: 'Healthcare Analyst',
    location: 'Seattle, WA',
    language: 'Conversational Tigrigna',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=240&auto=format&fit=crop',
  },
  {
    quote:
      'Preparing for community legal and medical advocacy across the Twin Cities required accurate terminology and formal dialect mastery. Dawit and Ayan provided rigorous, professional-grade 1-on-1 coaching that exceeded expectations.',
    author: 'Farhan Abdi',
    role: 'Community Legal Advocate',
    location: 'Minneapolis, MN',
    language: 'Somali & Afaan Oromo',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=240&auto=format&fit=crop',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] text-stone-900 selection:bg-amber-400 selection:text-stone-950">
      <Navbar transparentOverHero={true} />

      {/* ── HERO (Full 100dvh viewport height with luxury aesthetic) ── */}
      <section className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden bg-stone-950">
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
        <div className="h-16 sm:h-20 shrink-0" />

        {/* Content — perfectly centered in the full-height viewport */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 text-center">
          {/* Social Proof Pill with verified East African faculty */}
          <div className="mb-5 sm:mb-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-full border border-white/25 bg-black/40 px-3.5 sm:px-4 py-1.5 shadow-lg backdrop-blur-md">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-6 w-6 rounded-full object-cover ring-2 ring-white/80"
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=120&auto=format&fit=crop"
                alt="Tutor Bethelhem"
              />
              <img
                className="inline-block h-6 w-6 rounded-full object-cover ring-2 ring-white/80"
                src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=120&auto=format&fit=crop"
                alt="Tutor Semhar"
              />
              <img
                className="inline-block h-6 w-6 rounded-full object-cover ring-2 ring-white/80"
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=120&auto=format&fit=crop"
                alt="Tutor Dawit"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>4.98 ★</span>
              <span className="text-white/50">·</span>
              <span className="text-white/85">15,000+ diaspora lessons completed</span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-medium leading-[1.16] sm:leading-[1.14] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]">
            Master Amharic, Tigrigna, Afaan Oromo, Somali &amp; Swahili
          </h1>

          <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg font-normal text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.85)] leading-relaxed">
            1-on-1 private video lessons with accredited native educators. Tailored for heritage
            learners reconnecting with family, diaspora youth, and professional interpreters.
          </p>

          {/* High-Attention Magnetic CTA Button */}
          <div className="mt-7 sm:mt-9 flex flex-col items-center justify-center gap-3">
            <Link
              href="/teachers"
              className="group relative inline-flex w-full max-w-xs sm:w-auto items-center justify-between sm:justify-start gap-3.5 rounded-full border border-white/90 bg-white py-2.5 pl-6 sm:pl-8 pr-2.5 sm:pr-3 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(255,255,255,0.4)] ring-4 ring-white/30 transition-all duration-300 hover:scale-[1.03] hover:bg-white hover:ring-white/60 active:scale-100"
            >
              <span className="font-display text-sm sm:text-base font-bold tracking-tight text-stone-950">
                Find Your Educator
              </span>
              <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-stone-950 text-white shadow-md transition-all duration-300 group-hover:translate-x-1 group-hover:bg-amber-400 group-hover:text-stone-950">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
            </Link>

            {/* Trial Offer Callout & Escrow Protection Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/90 drop-shadow-sm font-medium">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-amber-300 backdrop-blur-sm border border-amber-400/30 font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                First 15-Minute Trial Free or 100% Satisfaction Guarantee
              </span>
              <span className="hidden sm:inline text-white/40">·</span>
              <span className="inline-flex items-center gap-1 text-white/80">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Escrow-Protected Booking
              </span>
            </div>
          </div>

          {/* Quick Language Shortcuts */}
          <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
            <span className="font-medium text-white/70 w-full sm:w-auto mb-1 sm:mb-0">
              5 Core Languages:
            </span>
            {[
              { name: 'Amharic (አማርኛ)', query: 'amharic' },
              { name: 'Tigrigna (ትግርኛ)', query: 'tigrigna' },
              { name: 'Afaan Oromo', query: 'afaan oromo' },
              { name: 'Somali (Soomaali)', query: 'somali' },
              { name: 'Swahili (Kiswahili)', query: 'swahili' },
            ].map((lang) => (
              <Link
                key={lang.name}
                href={`/teachers?lang=${lang.query}`}
                className="rounded-full border border-white/25 bg-black/30 px-3 py-1 font-medium text-white/90 backdrop-blur-sm transition hover:border-white/60 hover:bg-white/20 hover:text-white text-[11px] sm:text-xs"
              >
                {lang.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom: Refined Editorial Metrics with Escrow & Diaspora Signals */}
        <div className="relative z-10 border-t border-white/10 bg-black/45 py-4 sm:py-5 backdrop-blur-xl">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 text-center md:grid-cols-4 md:divide-x md:divide-white/10">
            <div className="px-2 sm:px-3">
              <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                5 Languages
              </p>
              <p className="mt-1 text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-stone-300/80">
                Horn &amp; East Africa
              </p>
            </div>
            <div className="px-2 sm:px-3">
              <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                100% Escrow
              </p>
              <p className="mt-1 text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-stone-300/80">
                Payment Protection
              </p>
            </div>
            <div className="px-2 sm:px-3">
              <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                Fidel &amp; Qubee
              </p>
              <p className="mt-1 text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-stone-300/80">
                Native Script Literacy
              </p>
            </div>
            <div className="px-2 sm:px-3">
              <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                Global Hubs
              </p>
              <p className="mt-1 text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-stone-300/80">
                DC · Mpls · Seattle · London
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPECIALIZED LEARNING TRACKS (Heritage vs. Professional) ── */}
      <section className="bg-white py-16 sm:py-20 border-b border-stone-200/80">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
              Two Specialized Pathways
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Tailored specifically to your language goals
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-500 font-medium">
              Whether you are reconnecting with family or preparing for certified translation, our educators design custom syllabi around you.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Track 1: Heritage & Family Fluency */}
            <div className="rounded-3xl border border-stone-200/90 bg-[#faf9f6] p-7 sm:p-9 shadow-sm transition hover:shadow-md hover:border-amber-400/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-700 ring-1 ring-amber-400/30 mb-5">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Track 01
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-stone-950">
                Heritage &amp; Family Reconnection
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-stone-600 font-medium">
                Designed for diaspora adults, heritage youth, and intercultural partners. Focus on spoken confidence with relatives, cultural etiquette, storytelling, and reading the Fidel/Ge’ez alphabet without fear.
              </p>
              <ul className="mt-5 space-y-2 text-xs font-semibold text-stone-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                  Conversational fluency for family gatherings and homeland visits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                  Fidel (Amharic &amp; Tigrigna) &amp; Qubee (Oromo) reading mastery
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                  Tailored curriculum for diaspora children &amp; young adults
                </li>
              </ul>
              <div className="mt-6 pt-5 border-t border-stone-200/80">
                <Link
                  href="/teachers"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-950 hover:text-amber-700 transition"
                >
                  <span>Explore Heritage Educators</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Track 2: Professional & Interpreter Prep */}
            <div className="rounded-3xl border border-stone-200/90 bg-[#faf9f6] p-7 sm:p-9 shadow-sm transition hover:shadow-md hover:border-amber-400/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white ring-1 ring-stone-950/20 mb-5">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Track 02
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-stone-950">
                Professional &amp; Interpreter Preparation
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-stone-600 font-medium">
                Structured for medical interpreters, legal caseworkers, NGO professionals, and researchers. Master formal registers, technical terminology, dialect variations, and translation accuracy.
              </p>
              <ul className="mt-5 space-y-2 text-xs font-semibold text-stone-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-stone-900 shrink-0" />
                  Medical, legal, and humanitarian sector terminology
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-stone-900 shrink-0" />
                  Formal grammar, regional dialect nuances, and document review
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-stone-900 shrink-0" />
                  Coaching from university alumni (Addis Ababa University, Asmara, Nairobi)
                </li>
              </ul>
              <div className="mt-6 pt-5 border-t border-stone-200/80">
                <Link
                  href="/teachers"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-950 hover:text-amber-700 transition"
                >
                  <span>Explore Professional Faculty</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS (The ESGlobal Standard) ── */}
      <section className="bg-[#faf9f6] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="border-b border-stone-200/80 pb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              The ESGlobal Standard
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Authentic language mastery built around you, not an algorithm.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-16">
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold tracking-wider text-stone-400">
                01
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Fidel, Ge’ez &amp; Qubee Script Training
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600 font-medium">
                Don’t settle for generic Latin transliterations. Learn the authentic writing
                systems of the Horn of Africa — from the Fidel abugida of Amharic &amp; Tigrigna to
                standardized Qubee for Afaan Oromo — with certified linguistics scholars.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold tracking-wider text-stone-400">
                02
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                100% Escrow Payment Protection
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600 font-medium">
                Your lesson fee is held securely in Stripe escrow and released to the educator only
                after you complete your live session. Zero monthly subscription traps or expiring
                credits — book and pay per lesson with complete peace of mind.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold tracking-wider text-stone-400">
                03
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Vetted University-Trained Faculty
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600 font-medium">
                Every teacher is individually vetted for pedagogical experience and dialect
                authenticity. Many are alumni of Addis Ababa University, University of Asmara, and
                premier East African institutions with years of diaspora teaching success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED TEACHERS ── */}
      <section className="border-t border-stone-200/60 bg-white py-4">
        <FeaturedTeachers />
      </section>

      {/* ── HOW IT WORKS ── */}
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
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-stone-400">
                Step 01
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Discover top native experts
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 font-medium">
                Explore certified educators filtered by language, dialect, hourly rate, verified
                degrees, and video introductions.
              </p>
            </div>
            <div className="border-t border-stone-300/80 pt-6">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-stone-400">
                Step 02
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Book a 1-on-1 slot in 60 seconds
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 font-medium">
                Select your preferred lesson duration from the teacher&apos;s interactive weekly
                calendar with transparent pricing and escrow hold.
              </p>
            </div>
            <div className="border-t border-stone-300/80 pt-6">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-stone-400">
                Step 03
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-stone-900">
                Meet in your private classroom
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 font-medium">
                Connect in our encrypted, private HD video classroom right in your browser. No
                downloads or third-party apps needed — just one click to start learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (Authentic Diaspora Voices) ── */}
      <section className="border-t border-stone-200/60 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                Verified Diaspora Feedback
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Stories from our global community
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              Real learners across Washington D.C., Seattle, Minneapolis, London &amp; beyond.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-stone-200/70 bg-[#faf9f6] p-8 transition-all duration-300 hover:border-amber-400/60 hover:shadow-sm"
              >
                <div>
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-5 text-[15px] leading-relaxed text-stone-700 font-medium">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-3.5 border-t border-stone-200/60 pt-5">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-stone-200 shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{t.author}</h4>
                    <p className="text-xs text-stone-500 font-medium">
                      {t.role} · <span className="font-semibold text-stone-700">{t.location}</span>
                    </p>
                    <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                      {t.language}
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm border border-white/15 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              100% Satisfaction Guarantee · Zero Subscriptions
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Start speaking with native confidence today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-stone-300/80 leading-relaxed">
              Join diaspora learners across North America, Europe, and worldwide. Book your 1-on-1
              session with an accredited native educator in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                href="/teachers"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-stone-950 shadow-lg transition-all duration-300 hover:bg-amber-300 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
              >
                Browse All Educators
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                Apply to Teach
              </Link>
            </div>
            <p className="mt-6 text-xs text-stone-400">
              Escrow payment protection · First 15 minutes trial guarantee · Free rescheduling up to 24h
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

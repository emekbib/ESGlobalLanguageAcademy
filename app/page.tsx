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
import ContactSection from '@/components/home/contact-section';
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
          src="/images/hero-bg.png"
          alt="Student learning a language online with a native tutor via video call, with a global map and cityscape in the background"
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
        <div className="relative z-10 mx-auto flex flex-1 flex-col items-center justify-center max-w-4xl px-4 sm:px-6 py-10 sm:py-16 text-center">
          {/* Social Proof Pill */}
          <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 sm:gap-3 rounded-full border border-white/20 bg-black/35 px-4 py-1.5 backdrop-blur-md">
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
            <span className="text-xs font-semibold text-white/90">
              <Star className="inline h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1" />
              4.98 · 15,000+ lessons completed
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]">
            Master Conversations in Amharic, Tigrigna, Afaan Oromo, Somali &amp; Swahili
          </h1>

          <p className="mx-auto mt-5 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-white drop-shadow-[0_2px_16px_rgba(0,0,0,1)] leading-relaxed" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)' }}>
            1-on-1 private video lessons with accredited native educators. Tailored for heritage
            learners reconnecting with family, diaspora youth, and professional interpreters.
          </p>

          {/* CTA Button */}
          <div className="mt-8 sm:mt-10">
            <Link
              href="/teachers"
              className="group relative inline-flex items-center gap-2.5 rounded-full border border-white/90 bg-white px-8 py-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(255,255,255,0.4)] ring-4 ring-white/30 transition-all duration-300 hover:scale-[1.03] hover:ring-white/60 hover:bg-stone-50 active:scale-100"
            >
              <span className="font-display text-base font-bold tracking-tight text-stone-950">
                Find Your Educator
              </span>
              <ArrowRight className="h-5 w-5 text-stone-950 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Subtle trust line */}
          <p className="mt-4 text-xs text-white/90 font-medium" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}>
            <Sparkles className="inline h-3 w-3 text-amber-400 mr-1" />
            First 15 min free · Escrow-protected · No subscriptions
          </p>
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

      {/* ── UNIFIED HOW IT WORKS & ESGLOBAL STANDARD ── */}
      <section id="how-it-works" className="border-b border-stone-200/80 bg-[#faf9f6] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
              The ESGlobal Standard
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Authentic language mastery, made simple.
            </h2>
            <p className="mt-4 text-sm text-stone-500 font-medium">
              We've combined rigorous native curriculum with seamless booking technology so you can focus entirely on fluency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {/* Step 1 / Feature 1 */}
            <div className="flex flex-col">
              <div className="mb-6 h-48 w-full rounded-2xl overflow-hidden relative shadow-sm border border-stone-200/60">
                <Image src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=600&auto=format&fit=crop" alt="Discover educators" fill className="object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">01. Discover</div>
              </div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Vetted University-Trained Faculty
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600 font-medium">
                Explore certified native educators filtered by language, dialect, and verified degrees. Many are alumni of premier East African institutions.
              </p>
            </div>

            {/* Step 2 / Feature 2 */}
            <div className="flex flex-col">
              <div className="mb-6 h-48 w-full rounded-2xl overflow-hidden relative shadow-sm border border-stone-200/60">
                <Image src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600&auto=format&fit=crop" alt="Escrow protection" fill className="object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">02. Book & Secure</div>
              </div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                100% Escrow Payment Protection
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600 font-medium">
                Book a 1-on-1 slot in 60 seconds. Your fee is held securely in Stripe escrow and released only after you complete your live session.
              </p>
            </div>

            {/* Step 3 / Feature 3 */}
            <div className="flex flex-col">
              <div className="mb-6 h-48 w-full rounded-2xl overflow-hidden relative shadow-sm border border-stone-200/60">
                <Image src="/scripts-graphic.jpg" alt="Fidel, Qubee, and Somali Latin scripts" fill className="object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">03. Learn</div>
              </div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Fidel & Qubee Script Training
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600 font-medium">
                Connect in our private HD classroom and learn the authentic writing systems (Fidel/Qubee) without relying on generic Latin transliterations.
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

      {/* ── FEATURED TEACHERS ── */}
      <section className="border-t border-stone-200/60 bg-white py-4">
        <FeaturedTeachers />
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

      {/* ── CONTACT US ── */}
      <ContactSection />

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

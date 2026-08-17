'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  Globe2,
  Users,
  Star,
  Play,
} from 'lucide-react';
import FeaturedTeachers from '@/components/home/featured-teachers';

const GREETINGS = [
  { word: 'Hello', lang: 'English' },
  { word: 'Hola', lang: 'Spanish' },
  { word: 'Bonjour', lang: 'French' },
  { word: '你好', lang: 'Chinese' },
  { word: 'こんにちは', lang: 'Japanese' },
  { word: '안녕하세요', lang: 'Korean' },
  { word: 'Olá', lang: 'Portuguese' },
  { word: 'Привет', lang: 'Russian' },
  { word: 'مرحبا', lang: 'Arabic' },
  { word: 'नमस्ते', lang: 'Hindi' },
  { word: 'Ciao', lang: 'Italian' },
  { word: 'Hallo', lang: 'German' },
  { word: 'Merhaba', lang: 'Turkish' },
  { word: 'Sawubona', lang: 'Zulu' },
  { word: 'Xin chào', lang: 'Vietnamese' },
  { word: 'สวัสดี', lang: 'Thai' },
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'Mandarin', 'Japanese', 'Korean',
  'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Italian', 'German',
  'Turkish', 'Swahili', 'Vietnamese', 'Thai', 'Dutch', 'Polish',
  'Greek', 'Hebrew', 'Swedish', 'Indonesian',
];

const STATS = [
  { icon: Globe2, value: '40+', label: 'Languages' },
  { icon: Users, value: '12,000+', label: 'Learners' },
  { icon: GraduationCap, value: '500+', label: 'Teachers' },
  { icon: Star, value: '4.9', label: 'Avg. rating' },
];

export default function Home() {
  const [greetingIdx, setGreetingIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIdx((prev) => (prev + 1) % GREETINGS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">ESGlobalLanguageAcademy</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/auth"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/teachers"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Find a teacher
            </Link>
            <Link
              href="/auth"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-105"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative flex flex-1 flex-col items-center overflow-hidden px-6 pt-20 pb-12">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-float" />
          <div className="absolute right-1/4 top-32 h-80 w-80 rounded-full bg-accent/15 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          {/* Rotating greeting badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-foreground/80">A language academy for the whole world</span>
          </div>

          {/* Rotating greeting */}
          <div className="mb-4 flex h-16 items-center justify-center">
            <span
              key={greetingIdx}
              className="font-display text-4xl font-semibold text-foreground animate-fade-in sm:text-5xl"
            >
              {GREETINGS[greetingIdx].word}
            </span>
          </div>

          <h1 className="font-display text-5xl font-bold tracking-tight text-foreground text-balance sm:text-6xl animate-fade-in">
            Where the world{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-emerald-500 bg-clip-text text-transparent">
              learns together
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground animate-fade-in">
            Learn any language from native speakers across the globe — or share yours
            with eager students. One platform, every language, a world of connection.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in">
            <Link
              href="/student"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-105"
            >
              I&apos;m a student
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/teacher"
              className="group inline-flex items-center gap-2 rounded-xl border bg-background px-6 py-3 text-base font-semibold text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md"
            >
              <BookOpen className="h-4 w-4 text-accent" />
              I&apos;m a teacher
            </Link>
          </div>
        </div>

        {/* Language marquee */}
        <div className="mt-16 w-full">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Languages you can learn
          </p>
          <div className="marquee-mask relative overflow-hidden">
            <div className="flex w-max animate-marquee gap-3">
              {[...LANGUAGES, ...LANGUAGES].map((lang, i) => (
                <Link
                  key={`${lang}-${i}`}
                  href={`/teachers?lang=${encodeURIComponent(lang)}`}
                  className="whitespace-nowrap rounded-full border bg-card px-5 py-2 text-sm font-medium text-foreground/80 shadow-sm transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {lang}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Featured teachers */}
      <FeaturedTeachers />

      {/* Stats band */}
      <section className="border-y bg-gradient-to-r from-primary/5 via-accent/5 to-emerald-500/5">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <stat.icon className="mb-2 h-6 w-6 text-accent" />
              <span className="font-display text-3xl font-bold text-foreground">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            One platform, two journeys
          </h2>
          <p className="mt-3 text-muted-foreground">
            Whether you&apos;re learning or teaching, everything you need is here.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: 'For Students',
              desc: 'Browse teachers from around the world, book sessions at times that suit you, and track your progress across every language you learn.',
            },
            {
              icon: BookOpen,
              title: 'For Teachers',
              desc: 'List your expertise, set your availability, manage your schedule, and grow a global audience of motivated learners.',
            },
            {
              icon: Globe2,
              title: 'A Global Community',
              desc: 'Connect across continents with built-in video calls, time-zone-aware scheduling, and a lively community of language lovers.',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="group rounded-2xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 transition-transform group-hover:scale-110">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent px-6 py-20 text-center text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-20">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-white blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        <div className="mx-auto max-w-2xl">
          <Play className="mx-auto mb-4 h-8 w-8" />
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start your language journey?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Join thousands of learners and teachers building connections across cultures.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth"
              className="group inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-base font-semibold text-foreground shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/teachers"
              className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 px-6 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10"
            >
              Browse teachers
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-sm font-bold">ESGlobalLanguageAcademy</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Learn any language. Teach the world.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

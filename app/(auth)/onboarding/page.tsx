'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Sparkles,
  UserRound,
  ShieldCheck,
  Globe2,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types/database';

const LEARNING_LANGUAGES = [
  'Amharic',
  'Tigrigna',
  'Afaan Oromo',
  'Somali',
  'Swahili',
];

const LEARNING_GOALS = [
  'Conversational Fluency',
  'Reading & Writing (Fidel / Qubee / Latin)',
  'Heritage & Family Connection',
  'Career & Professional Fluency',
  'Travel & Cultural Immersion',
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('Amharic');
  const [learningGoal, setLearningGoal] = useState('Conversational Fluency');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }
      if (active) {
        setFullName(user.user_metadata.full_name ?? user.user_metadata.name ?? '');
        setAvatarUrl(user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null);
        setLoading(false);
      }
    }
    void loadUser();
    return () => {
      active = false;
    };
  }, [router, supabase]);

  async function completeOnboarding() {
    setSaving(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/auth');
      return;
    }

    const nameToSave = fullName.trim() || 'ESGlobal Member';

    // Insert or update profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: user.id,
      role,
      user_type: role,
      full_name: nameToSave,
      avatar_url: avatarUrl,
    });

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    router.replace(role === 'teacher' ? '/teacher/onboarding' : '/dashboard');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-500">
        <Loader2 className="h-8 w-8 animate-spin text-stone-900" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Loading your account…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl animate-fade-in py-4">
      {/* Outer Grand Card with Split Editorial Layout (Intro.co style) */}
      <div className="overflow-hidden rounded-[2.5rem] border border-stone-200/90 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Atmospheric Luxury Editorial Panel (5 cols) */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-stone-950 p-10 text-white lg:col-span-5 lg:flex">
            {/* Background image — sunlit luxury study */}
            <Image
              src="/hero.jpg"
              alt="Sunlit architectural study"
              fill
              priority
              className="object-cover object-center opacity-40"
            />
            {/* Dark warm vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/80" />

            {/* Top Brand Marker */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
                <GraduationCap className="h-4 w-4 text-amber-300" />
                <span className="font-display text-xs font-bold tracking-wide uppercase text-white">
                  ESGlobal Academy
                </span>
              </div>
              <p className="mt-4 text-[11px] font-semibold tracking-widest uppercase text-stone-400">
                Addis Ababa · Berlin · Worldwide
              </p>
            </div>

            {/* Middle Quote & Story */}
            <div className="relative z-10 my-12">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                  The Fluency Standard
                </span>
              </div>
              <blockquote className="mt-4 font-display text-xl font-bold leading-relaxed tracking-tight text-white/95">
                &ldquo;Real fluency is unlocked through genuine conversations with native speakers, tailored to your personal goals.&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop"
                  alt="Bethelhem Mengistu"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20 shadow-md"
                />
                <div>
                  <p className="text-xs font-bold text-white">Bethelhem Mengistu</p>
                  <p className="text-[11px] text-stone-400">Faculty Lead · Native Amharic Educator</p>
                </div>
              </div>
            </div>

            {/* Bottom Key Badges */}
            <div className="relative z-10 border-t border-white/10 pt-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-display text-xl font-black text-white">40+</p>
                  <p className="text-[11px] text-stone-400">Verified Native Faculty</p>
                </div>
                <div>
                  <p className="font-display text-xl font-black text-white">100%</p>
                  <p className="text-[11px] text-stone-400">Escrow-Protected Sessions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Setup Experience (7 cols) */}
          <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-7">
            <div>
              {/* Step & Title */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Step 02 / 02
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 rounded-full px-3 py-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Account Verified
                </span>
              </div>

              <h1 className="mt-3 font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950">
                How will you use ESGlobal?
              </h1>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-500 font-medium">
                Select your path to customize your private 1-on-1 language experience.
              </p>

              {/* Role Selection Cards */}
              <div className="mt-7 space-y-3.5">
                {/* Option 1: Student */}
                <div
                  onClick={() => setRole('student')}
                  className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                    role === 'student'
                      ? 'border-stone-950 bg-stone-50/50 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        role === 'student'
                          ? 'bg-stone-950 text-amber-300 shadow-sm'
                          : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                      }`}
                    >
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-base font-bold text-stone-950">
                          I am a Language Learner
                        </h2>
                        {role === 'student' && (
                          <span className="rounded-full bg-stone-950 px-2 py-0.5 text-[10px] font-bold text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-stone-500 font-medium">
                        Book private 1-on-1 video lessons with certified native speakers. Learn on your schedule with zero subscription commitments.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-lg border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                          1-on-1 Video Lessons
                        </span>
                        <span className="rounded-lg border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                          Pay Per Session
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Radio Chip */}
                  <div className="absolute right-5 top-5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                        role === 'student'
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {role === 'student' && <CheckCircle2 className="h-3.5 w-3.5 fill-current" />}
                    </div>
                  </div>
                </div>

                {/* Option 2: Teacher */}
                <div
                  onClick={() => setRole('teacher')}
                  className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                    role === 'teacher'
                      ? 'border-stone-950 bg-stone-50/50 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        role === 'teacher'
                          ? 'bg-stone-950 text-amber-300 shadow-sm'
                          : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                      }`}
                    >
                      <BriefcaseBusiness className="h-5 w-5" />
                    </div>

                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-base font-bold text-stone-950">
                          I am a Native Educator
                        </h2>
                        {role === 'teacher' && (
                          <span className="rounded-full bg-stone-950 px-2 py-0.5 text-[10px] font-bold text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-stone-500 font-medium">
                        Join our faculty roster to teach students worldwide. Set your hourly rates, manage your calendar, and receive direct Stripe payouts.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-lg border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                          Custom Rates
                        </span>
                        <span className="rounded-lg border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                          Direct Stripe Payouts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Radio Chip */}
                  <div className="absolute right-5 top-5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                        role === 'teacher'
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {role === 'teacher' && <CheckCircle2 className="h-3.5 w-3.5 fill-current" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Preferences: Target Language & Focus */}
              {role === 'student' && (
                <div className="mt-6 space-y-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 animate-fade-in">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                      Primary Language Goal
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {LEARNING_LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setTargetLanguage(lang)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            targetLanguage === lang
                              ? 'bg-stone-950 text-white shadow-sm'
                              : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                      Speaking Focus
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {LEARNING_GOALS.map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setLearningGoal(goal)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            learningGoal === goal
                              ? 'bg-stone-950 text-white shadow-sm'
                              : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Full Name Input */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                    htmlFor="full-name"
                  >
                    Your Full Name
                  </label>
                  <span className="text-[11px] text-stone-400">Displayed in video classrooms</span>
                </div>
                <input
                  id="full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dawit Tolosa"
                  className="mt-2 h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-900 outline-none transition focus:border-stone-950 focus:ring-1 focus:ring-stone-950"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Bottom Action Button (Intro.co Magnetic Style) */}
            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() => void completeOnboarding()}
                disabled={saving}
                className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-stone-950 py-4 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:bg-stone-800 hover:shadow-2xl active:scale-[0.99] disabled:opacity-60"
              >
                <span className="tracking-tight">
                  {saving
                    ? 'Setting up your space…'
                    : role === 'teacher'
                      ? 'Continue to Educator Setup'
                      : 'Enter Student Dashboard'}
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-amber-300 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>

              <p className="mt-4 text-center text-xs text-stone-400 font-medium">
                Protected by 256-bit SSL encryption · Free to join
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

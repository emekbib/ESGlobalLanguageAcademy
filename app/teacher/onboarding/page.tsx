'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { TeacherType } from '@/lib/types/database';

const AVAILABLE_LANGUAGES = [
  'English',
  'Amharic',
  'German',
  'French',
  'Afan Oromo',
  'Arabic',
  'Italian',
  'Mandarin',
  'Spanish',
];

const SPECIALTY_OPTIONS = [
  'Conversational Fluency',
  'Exam Preparation (IELTS / Goethe)',
  'Business & Professional',
  'Grammar & Pronunciation',
  'Fidel Script / Alphabet',
  'Children & Beginners',
];

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [teacherType, setTeacherType] = useState<TeacherType>('professional');
  const [languagesTaught, setLanguagesTaught] = useState<string[]>(['English']);
  const [languagesSpoken, setLanguagesSpoken] = useState<string>('English, Amharic');
  const [hourlyRate, setHourlyRate] = useState<number>(30);
  const [yearsExperience, setYearsExperience] = useState<number>(4);
  const [bio, setBio] = useState<string>('');
  const [specialties, setSpecialties] = useState<string[]>(['Conversational Fluency']);
  const [videoIntroUrl, setVideoIntroUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }

      const { data: existing } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (active && existing) {
        setTeacherType(existing.teacher_type ?? 'professional');
        if (existing.languages_taught?.length) setLanguagesTaught(existing.languages_taught);
        if (existing.languages_spoken?.length) setLanguagesSpoken(existing.languages_spoken.join(', '));
        if (existing.hourly_rate) setHourlyRate(Number(existing.hourly_rate));
        if (existing.years_experience !== undefined) setYearsExperience(existing.years_experience);
        if (existing.bio) setBio(existing.bio);
        if (existing.specialties?.length) setSpecialties(existing.specialties);
        if (existing.video_intro_url) setVideoIntroUrl(existing.video_intro_url);
      }
      if (active) setLoading(false);
    }
    void checkAuth();
    return () => {
      active = false;
    };
  }, [router, supabase]);

  const toggleLanguage = (lang: string) => {
    setLanguagesTaught((prev) =>
      prev.includes(lang) ? (prev.length > 1 ? prev.filter((l) => l !== lang) : prev) : [...prev, lang],
    );
  };

  const toggleSpecialty = (spec: string) => {
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/auth');
      return;
    }

    const spokenList = languagesSpoken
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      user_id: user.id,
      teacher_type: teacherType,
      languages_taught: languagesTaught,
      languages_spoken: spokenList,
      hourly_rate: hourlyRate,
      years_experience: yearsExperience,
      bio: bio.trim(),
      specialties: specialties,
      video_intro_url: videoIntroUrl.trim() || null,
      is_published: true,
    };

    const { data: existing } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let saveError = null;
    if (existing) {
      const { error } = await supabase
        .from('teacher_profiles')
        .update(payload)
        .eq('id', existing.id);
      saveError = error;
    } else {
      const { error } = await supabase.from('teacher_profiles').insert(payload);
      saveError = error;
    }

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    router.replace('/teacher/dashboard');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <Loader2 className="h-8 w-8 animate-spin text-stone-900" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <Link
          href="/teacher/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="border-b border-stone-200/80 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
            Educator Registration
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Complete your teacher profile
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            This information will be displayed to students in the public directory and booking pages.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveProfile} className="mt-8 space-y-8">
          {/* Teacher Type */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              1. Teaching Category
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTeacherType('professional')}
                className={`rounded-2xl border p-4 text-left transition ${
                  teacherType === 'professional'
                    ? 'border-stone-950 bg-[#faf9f6] ring-2 ring-stone-950'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-stone-900">Professional Teacher</span>
                  {teacherType === 'professional' && <Check className="h-4 w-4 text-stone-900" />}
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Certified educator with university degree or accredited language certificate (Goethe, CELTA, etc.).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTeacherType('community_tutor')}
                className={`rounded-2xl border p-4 text-left transition ${
                  teacherType === 'community_tutor'
                    ? 'border-stone-950 bg-[#faf9f6] ring-2 ring-stone-950'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-stone-900">Community Tutor</span>
                  {teacherType === 'community_tutor' && <Check className="h-4 w-4 text-stone-900" />}
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Native or advanced speaker passionate about informal conversation practice and cultural exchange.
                </p>
              </button>
            </div>
          </div>

          {/* Languages */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              2. Languages You Teach
            </h2>
            <p className="mt-1 text-xs text-stone-400">
              Select all languages you are qualified to tutor:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = languagesTaught.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {isSelected && <Check className="mr-1.5 inline h-3 w-3" />}
                    {lang}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Other Languages You Speak
              </label>
              <input
                type="text"
                value={languagesSpoken}
                onChange={(e) => setLanguagesSpoken(e.target.value)}
                placeholder="e.g. Amharic (Native), English (Fluent), German (B2)"
                className="mt-2 h-11 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Rates & Experience */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              3. Rate &amp; Experience
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Hourly Rate ($ USD)
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={150}
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-4 text-sm font-semibold text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  required
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="mt-2 h-11 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 text-sm font-semibold text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Bio & Specialties */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              4. Bio &amp; Specialties
            </h2>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Teacher Bio &amp; Introduction
              </label>
              <textarea
                rows={5}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce yourself, your teaching philosophy, and what students will accomplish in your lessons…"
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 text-sm font-medium leading-relaxed text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Specialties
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map((spec) => {
                  const active = specialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                        active
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Video Introduction URL (Optional)
              </label>
              <input
                type="url"
                value={videoIntroUrl}
                onChange={(e) => setVideoIntroUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className="mt-2 h-11 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/teacher/dashboard"
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="group inline-flex items-center gap-2 rounded-full bg-stone-950 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800 disabled:opacity-60"
            >
              <span>{saving ? 'Publishing Profile…' : 'Save & Publish Profile'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Loader2, DollarSign, Video, GraduationCap, ShieldCheck } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { TeacherType } from '@/lib/types/database';

const AVAILABLE_LANGUAGES = [
  'Amharic',
  'Tigrigna',
  'Afaan Oromo',
  'Somali',
];

const SPECIALTY_OPTIONS = [
  'Conversational Fluency',
  'Reading & Writing (Fidel / Qubee / Latin)',
  'Heritage & Family Connection',
  'Grammar & Pronunciation',
  'Children & Beginners',
  'Business & Professional',
];

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [teacherType, setTeacherType] = useState<TeacherType>('professional');
  const [languagesTaught, setLanguagesTaught] = useState<string[]>(['Amharic']);
  const [languagesSpoken, setLanguagesSpoken] = useState<string>('Amharic, English');
  const [hourlyRate, setHourlyRate] = useState<number>(35);
  const [yearsExperience, setYearsExperience] = useState<number>(4);
  const [bio, setBio] = useState<string>('');
  const [specialties, setSpecialties] = useState<string[]>(['Conversational Fluency']);
  const [videoIntroUrl, setVideoIntroUrl] = useState<string>('');
  const [degreeTitle, setDegreeTitle] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');

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

    const isProfessional = teacherType === 'professional';
    const credentialsList = isProfessional && degreeTitle.trim()
      ? [`${degreeTitle.trim()} — ${institution.trim() || 'Accredited University'}`]
      : [];

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
      credentials: credentialsList,
      application_status: isProfessional ? 'pending' : 'approved',
      is_published: !isProfessional,
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

    router.replace(isProfessional ? '/teacher/dashboard?status=pending_review' : '/teacher/dashboard');
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
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspace
        </Link>

        {/* Header */}
        <div className="border-b border-stone-200/80 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Educator Registration
          </span>
          <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
            Complete your teacher profile
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 font-medium">
            This information will be displayed to prospective language students in the public directory and booking pages.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveProfile} className="mt-8 space-y-8">
          {/* 1. Teaching Category */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              1. Teaching Category
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTeacherType('professional')}
                className={`rounded-2xl border p-5 text-left transition ${
                  teacherType === 'professional'
                    ? 'border-stone-950 bg-stone-50/60 ring-2 ring-stone-950'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-stone-950 text-base">Professional Teacher</span>
                  {teacherType === 'professional' && <Check className="h-4 w-4 text-stone-950" />}
                </div>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed font-medium">
                  Educator with university degree in advanced language or related fields.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTeacherType('community_tutor')}
                className={`rounded-2xl border p-5 text-left transition ${
                  teacherType === 'community_tutor'
                    ? 'border-stone-950 bg-stone-50/60 ring-2 ring-stone-950'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-stone-950 text-base">Community Tutor</span>
                  {teacherType === 'community_tutor' && <Check className="h-4 w-4 text-stone-950" />}
                </div>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed font-medium">
                  Native or near-native speaker passionate about conversational practice, vocabulary, and cultural immersion.
                </p>
              </button>
            </div>

            {/* Workflow Notice Banner */}
            <div className="mt-4 rounded-2xl border p-4 text-xs font-medium leading-relaxed transition">
              {teacherType === 'community_tutor' ? (
                <div className="flex items-start gap-3 text-emerald-800 bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Track 1 Instant Auto-Publish:</span> As a Community Tutor, your account is activated immediately upon submission. Students will review and vet lessons as time goes by—no administrative approval delay required.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-amber-900 bg-amber-50/60 border border-amber-200/80 rounded-xl p-3">
                  <GraduationCap className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Track 2 Awaiting Review:</span> Professional Educators handle high-stakes language (legal, medical, Qene/ቅኔ, advanced registers). Submitting places your application in &apos;Awaiting Review&apos; for academy administration verification.
                  </div>
                </div>
              )}
            </div>

            {/* Track 2 Credentials Upload Section */}
            {teacherType === 'professional' && (
              <div className="mt-6 border-t border-stone-200/80 pt-6 space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Degree Title (Required for Track 2)
                  </label>
                  <input
                    type="text"
                    required
                    value={degreeTitle}
                    onChange={(e) => setDegreeTitle(e.target.value)}
                    placeholder="e.g. BA in Linguistics, Ethiopian Languages &amp; Literature, Translation"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-950 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    University or Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Addis Ababa University, Mekelle University, Jimma University"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-950 focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Languages You Teach */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              2. Languages You Teach
            </h2>
            <p className="mt-1 text-xs text-stone-500 font-medium">
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
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-stone-950 text-white shadow-sm'
                        : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Languages You Speak (Comma separated)
              </label>
              <input
                type="text"
                value={languagesSpoken}
                onChange={(e) => setLanguagesSpoken(e.target.value)}
                placeholder="e.g. English (Native), Amharic (Fluent), German (B2)"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-950 focus:bg-white"
              />
            </div>
          </div>

          {/* 3. Pricing & Experience */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              3. Rate & Experience
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Hourly Rate (USD / 50-min lesson)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 py-3 pl-8 pr-4 text-sm font-bold text-stone-900 outline-none transition focus:border-stone-950 focus:bg-white"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-emerald-700 font-semibold">
                  You earn ${hourlyRate} per completed lesson.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Years of Teaching Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm font-bold text-stone-900 outline-none transition focus:border-stone-950 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 4. Specialties */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              4. Teaching Specialties
            </h2>
            <p className="mt-1 text-xs text-stone-500 font-medium">
              Select topics you specialize in:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map((spec) => {
                const isSelected = specialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-stone-950 text-white shadow-sm'
                        : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Biography & Video Intro */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              5. Profile Bio & Video Intro
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Teacher Headline &amp; Bio
              </label>
              <textarea
                rows={5}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce yourself, your teaching philosophy, and what students can expect in a 1-on-1 session with you..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Video Introduction URL (YouTube or Vimeo)
              </label>
              <div className="relative">
                <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="url"
                  value={videoIntroUrl}
                  onChange={(e) => setVideoIntroUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 py-3 pl-11 pr-4 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-950 focus:bg-white"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-stone-400">
                A 1–2 minute video welcoming prospective students significantly increases booking rates.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-stone-950 py-4 text-sm font-bold text-white shadow-xl transition hover:bg-stone-800 active:scale-[0.99] disabled:opacity-60"
            >
              <span>
                {saving
                  ? 'Processing Profile…'
                  : teacherType === 'professional'
                  ? 'Submit Track 2 Application for Review'
                  : 'Publish Community Profile & Enter Workspace'}
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-amber-300 transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  User,
  DollarSign,
  Video,
  Globe,
  Clock,
  Check,
  Loader2,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const FOCUS_LANGUAGES = [
  'Amharic',
  'Tigrigna',
  'Afaan Oromo',
  'Somali',
  'Swahili',
];

type TeacherAccountTabProps = {
  profile: {
    role: string;
    full_name: string;
    avatar_url: string | null;
  };
  teacherProfile: {
    id?: string;
    bio?: string;
    languages_taught?: string[];
    hourly_rate?: number;
    years_experience?: number;
    video_intro_url?: string | null;
    is_published?: boolean;
    stripe_account_id?: string | null;
    stripe_onboarding_complete?: boolean | null;
  } | null;
  onProfileUpdated?: (updated: any) => void;
};

export default function TeacherAccountTab({
  profile,
  teacherProfile,
  onProfileUpdated,
}: TeacherAccountTabProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states initialized from server props
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [hourlyRate, setHourlyRate] = useState<number>(teacherProfile?.hourly_rate || 35);
  const [yearsExperience, setYearsExperience] = useState<number>(
    teacherProfile?.years_experience !== undefined ? teacherProfile.years_experience : 3
  );
  const [languagesTaught, setLanguagesTaught] = useState<string[]>(
    teacherProfile?.languages_taught && teacherProfile.languages_taught.length > 0
      ? teacherProfile.languages_taught
      : ['Amharic']
  );
  const [bio, setBio] = useState(teacherProfile?.bio || '');
  const [videoIntroUrl, setVideoIntroUrl] = useState(teacherProfile?.video_intro_url || '');
  const [teacherType, setTeacherType] = useState<'professional' | 'community'>('professional');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const timezone =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      : 'UTC';

  const toggleLanguage = (lang: string) => {
    setLanguagesTaught((prev) =>
      prev.includes(lang)
        ? prev.length > 1
          ? prev.filter((l) => l !== lang)
          : prev
        : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherProfile?.id === 'admin-preview-id') {
      setErrorMessage('Cannot save profile details in admin preview mode.');
      return;
    }
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage('Session expired. Please sign in again.');
        setSaving(false);
        return;
      }

      // 1. Update basic profile name
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('user_id', user.id);

      if (profileErr) {
        console.warn('Profile name update note:', profileErr.message);
      }

      // 2. Update or Insert teacher profile
      const teacherPayload = {
        user_id: user.id,
        hourly_rate: Number(hourlyRate),
        years_experience: Number(yearsExperience),
        languages_taught: languagesTaught,
        bio: bio.trim(),
        video_intro_url: videoIntroUrl.trim() || null,
        is_published: true,
      };

      const { data: existing } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let teacherErr = null;
      if (existing?.id) {
        const { error } = await supabase
          .from('teacher_profiles')
          .update(teacherPayload)
          .eq('id', existing.id);
        teacherErr = error;
      } else {
        const { error } = await supabase.from('teacher_profiles').insert(teacherPayload);
        teacherErr = error;
      }

      if (teacherErr) {
        setErrorMessage(teacherErr.message || 'Failed to save teacher details.');
        setSaving(false);
        return;
      }

      setSaveSuccess(true);
      router.refresh();
      if (onProfileUpdated) {
        onProfileUpdated({
          ...teacherPayload,
          full_name: fullName,
        });
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="border-b border-stone-200/80 dark:border-stone-800 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Educator Credentials
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
          Account & Profile Details
        </h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
          Update your public profile, rates, languages, and classroom credentials visible to learners.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Personal & Identity Details */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950 dark:text-white">
                Educator Identity
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                Your name as presented across the teacher directory and lesson bookings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 px-4 py-3 text-sm font-medium text-stone-900 dark:text-stone-100 shadow-sm transition focus:border-stone-950 dark:focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-950 dark:focus:ring-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                Platform Role
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-4 py-3 text-sm font-medium text-stone-600 dark:text-stone-300">
                <GraduationCap className="h-4 w-4 text-amber-500" />
                <span>Verified Native Educator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Professional Teaching Credentials & Pricing */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950 dark:text-white">
                Rates & Teaching Category
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                Set your hourly pricing and highlight your qualifications
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                Hourly Rate ($ USD / 50 min)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                  $
                </span>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  required
                  className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 py-3 pl-9 pr-4 text-sm font-medium text-stone-900 dark:text-stone-100 shadow-sm transition focus:border-stone-950 dark:focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-950 dark:focus:ring-stone-500"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">
                Recommended rates: $25–$45/hr for professional 1-on-1 tutoring.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                required
                className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 px-4 py-3 text-sm font-medium text-stone-900 dark:text-stone-100 shadow-sm transition focus:border-stone-950 dark:focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-950 dark:focus:ring-stone-500"
              />
            </div>
          </div>

          {/* Languages Taught */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              Focus Languages You Teach
            </label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_LANGUAGES.map((lang) => {
                const isSelected = languagesTaught.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                        : 'border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600'
                    }`}
                  >
                    {lang} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">
              Students search for tutors by these primary focus languages.
            </p>
          </div>

          {/* Video Intro URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              Video Introduction URL (YouTube or Vimeo)
            </label>
            <div className="relative">
              <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="url"
                value={videoIntroUrl}
                onChange={(e) => setVideoIntroUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 py-3 pl-11 pr-4 text-sm font-medium text-stone-900 dark:text-stone-100 shadow-sm transition focus:border-stone-950 dark:focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-950 dark:focus:ring-stone-500"
              />
            </div>
          </div>

          {/* Biography */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              Professional Biography & Teaching Methodology
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Introduce your background, teaching philosophy, and what students will accomplish in your sessions…"
              required
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 p-4 text-sm font-medium text-stone-900 dark:text-stone-100 shadow-sm transition focus:border-stone-950 dark:focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-950 dark:focus:ring-stone-500"
            />
          </div>
        </div>

        {/* Card 3: Classroom Settings & Timezone */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950 dark:text-white">
                Classroom Timezone
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                All availability slots are aligned with your local time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300">
            <Globe className="h-4 w-4 text-stone-400" />
            <span>{timezone}</span>
          </div>
        </div>

        {/* Card 4: Appearance & Theme */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950 dark:text-white">
                Appearance & Theme
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                Choose your interface color scheme
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                mounted && (theme === 'light' || (!theme && resolvedTheme === 'light'))
                  ? 'border-stone-950 bg-stone-50 dark:border-amber-400 dark:bg-stone-800/80 shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Sun className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-bold text-stone-900 dark:text-white">Light Mode</span>
              <span className="text-[10px] text-stone-400">Warm Ivory</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                mounted && (theme === 'dark' || (!theme && resolvedTheme === 'dark'))
                  ? 'border-stone-950 bg-stone-50 dark:border-amber-400 dark:bg-stone-800/80 shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Moon className="h-5 w-5 text-stone-700 dark:text-amber-300" />
              <span className="text-xs font-bold text-stone-900 dark:text-white">Dark Mode</span>
              <span className="text-[10px] text-stone-400">Obsidian Luxury</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                mounted && theme === 'system'
                  ? 'border-stone-950 bg-stone-50 dark:border-amber-400 dark:bg-stone-800/80 shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Monitor className="h-5 w-5 text-stone-500" />
              <span className="text-xs font-bold text-stone-900 dark:text-white">System</span>
              <span className="text-[10px] text-stone-400">Auto Detect</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Submit & Save Status */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-stone-950 dark:bg-stone-100 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating Details…
              </>
            ) : (
              'Save Account Details'
            )}
          </button>

          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 animate-fade-in">
              <Check className="h-4 w-4" />
              Account details saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

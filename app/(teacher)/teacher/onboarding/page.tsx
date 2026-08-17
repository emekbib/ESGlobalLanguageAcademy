'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Video } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const languageOptions = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Arabic'];

type FormState = {
  bio: string;
  languages: string[];
  hourlyRate: string;
  yearsExperience: string;
  videoIntroUrl: string;
  isPublished: boolean;
};

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ bio: '', languages: [], hourlyRate: '', yearsExperience: '', videoIntroUrl: '', isPublished: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }
      const { data } = await supabase.from('teacher_profiles').select('bio, languages_taught, hourly_rate, years_experience, video_intro_url, is_published').eq('user_id', user.id).maybeSingle();
      if (active && data) {
        setForm({ bio: data.bio ?? '', languages: data.languages_taught ?? [], hourlyRate: String(data.hourly_rate || ''), yearsExperience: String(data.years_experience || ''), videoIntroUrl: data.video_intro_url ?? '', isPublished: Boolean(data.is_published) });
      }
      if (active) setLoading(false);
    }
    void loadProfile();
    return () => { active = false; };
  }, [router, supabase]);

  function toggleLanguage(language: string) {
    setForm((current) => ({ ...current, languages: current.languages.includes(language) ? current.languages.filter((item) => item !== language) : [...current.languages, language] }));
  }

  function validateStep(): boolean {
    setError('');
    if (step === 1 && form.bio.trim().length < 40) { setError('Tell students a little more about your teaching style, experience, and what they can expect.'); return false; }
    if (step === 2 && form.languages.length === 0) { setError('Choose at least one language you teach.'); return false; }
    if (step === 3 && (!Number(form.hourlyRate) || Number(form.hourlyRate) <= 0 || Number(form.yearsExperience) < 0)) { setError('Add a valid hourly rate and years of experience.'); return false; }
    return true;
  }

  function nextStep() { if (validateStep()) setStep((current) => Math.min(3, current + 1)); }
  function previousStep() { setError(''); setStep((current) => Math.max(1, current - 1)); }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/auth'); return; }
    const { error: saveError } = await supabase.from('teacher_profiles').upsert({
      user_id: user.id,
      bio: form.bio.trim(),
      languages_taught: form.languages,
      hourly_rate: Number(form.hourlyRate),
      years_experience: Number(form.yearsExperience),
      video_intro_url: form.videoIntroUrl.trim() || null,
    }, { onConflict: 'user_id' });
    if (saveError) { setError(saveError.message); setSaving(false); return; }
    router.replace('/teacher/dashboard');
  }

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
      <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
      <div className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Teacher profile</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Put your expertise in the spotlight.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Complete your profile so the right students can discover you. You can save it privately and publish when you are ready.</p>
      </div>
      <div className="mt-10 flex items-center gap-3" aria-label="Profile setup progress">
        {[1, 2, 3].map((item) => <div key={item} className={`h-2 flex-1 rounded-full transition-colors ${item <= step ? 'bg-primary' : 'bg-muted'}`} />)}
      </div>
      <form onSubmit={saveProfile} className="mt-8 rounded-3xl border bg-card p-6 shadow-xl shadow-slate-200/40 sm:p-10">
        {step === 1 && <section><p className="text-sm font-semibold text-primary">Step 1 of 3</p><h2 className="mt-2 text-2xl font-bold">Introduce yourself</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">A warm, specific introduction helps students choose the right teacher.</p><label className="mt-8 block text-sm font-medium" htmlFor="bio">Your teaching bio</label><textarea id="bio" required minLength={40} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={7} placeholder="Share your background, teaching approach, and who you love helping…" className="mt-2 w-full resize-none rounded-2xl border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /><p className="mt-2 text-xs text-muted-foreground">At least 40 characters</p></section>}
        {step === 2 && <section><p className="text-sm font-semibold text-primary">Step 2 of 3</p><h2 className="mt-2 text-2xl font-bold">What do you teach?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Select every language you are ready to teach.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{languageOptions.map((language) => { const selected = form.languages.includes(language); return <button key={language} type="button" onClick={() => toggleLanguage(language)} className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${selected ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/10' : 'hover:border-primary/40 hover:bg-muted/40'}`}>{language}{selected && <CheckCircle2 className="h-5 w-5" />}</button>; })}</div></section>}
        {step === 3 && <section><p className="text-sm font-semibold text-primary">Step 3 of 3</p><h2 className="mt-2 text-2xl font-bold">Set your teaching details</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Students use these details to find a teacher who fits their needs.</p><div className="mt-8 grid gap-6 sm:grid-cols-2"><div><label className="block text-sm font-medium" htmlFor="rate">Hourly rate (USD)</label><input id="rate" type="number" min="1" step="0.01" required value={form.hourlyRate} onChange={(event) => setForm({ ...form, hourlyRate: event.target.value })} placeholder="25" className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /></div><div><label className="block text-sm font-medium" htmlFor="experience">Years of experience</label><input id="experience" type="number" min="0" required value={form.yearsExperience} onChange={(event) => setForm({ ...form, yearsExperience: event.target.value })} placeholder="3" className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /></div></div><label className="mt-6 block text-sm font-medium" htmlFor="video"><span className="flex items-center gap-2"><Video className="h-4 w-4 text-primary" />Video introduction URL <span className="font-normal text-muted-foreground">(optional)</span></span></label><input id="video" type="url" value={form.videoIntroUrl} onChange={(event) => setForm({ ...form, videoIntroUrl: event.target.value })} placeholder="https://youtube.com/watch?v=…" className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /><label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border bg-muted/30 p-4"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} className="mt-1 h-4 w-4 accent-primary" /><span><span className="block text-sm font-semibold">Publish my profile</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Make your profile visible in the public teacher directory. You can turn this off later.</span></span></label></section>}
        {error && <p className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
        <div className="mt-10 flex items-center justify-between gap-4"><button type="button" onClick={previousStep} disabled={step === 1 || saving} className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted disabled:invisible"><ArrowLeft className="h-4 w-4" />Back</button>{step < 3 ? <button type="button" onClick={nextStep} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-105">Continue<ArrowRight className="h-4 w-4" /></button> : <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-105 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{saving ? 'Saving…' : 'Save profile'}</button>}</div>
      </form>
    </main>
  );
}

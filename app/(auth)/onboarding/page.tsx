'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, GraduationCap, Loader2, UserRound } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types/database';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
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
    return () => { active = false; };
  }, [router, supabase]);

  async function completeOnboarding() {
    setSaving(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/auth');
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: user.id,
      role,
      user_type: role,
      full_name: fullName.trim() || 'ESGlobalLanguageAcademy member',
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
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="w-full max-w-2xl animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><GraduationCap className="h-6 w-6" /></div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Make ESGlobalLanguageAcademy yours</h1>
        <p className="mt-3 text-muted-foreground">Tell us how you’d like to use the platform.</p>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-lg shadow-slate-200/40 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            { value: 'student' as const, title: 'I’m a student', description: 'Find teachers and build your skills.', icon: UserRound },
            { value: 'teacher' as const, title: 'I’m a teacher', description: 'Share your expertise with learners.', icon: BriefcaseBusiness },
          ]).map((option) => {
            const Icon = option.icon;
            const selected = role === option.value;
            return (
              <button key={option.value} type="button" onClick={() => setRole(option.value)} className={`rounded-2xl border p-5 text-left transition ${selected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-primary/40 hover:bg-muted/50'}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><Icon className="h-5 w-5" /></div>
                <h2 className="mt-4 font-semibold">{option.title}</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{option.description}</p>
              </button>
            );
          })}
        </div>
        <label className="mt-7 block text-sm font-medium" htmlFor="full-name">Your name</label>
        <input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Your full name" />
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <button onClick={() => void completeOnboarding()} disabled={saving} className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-105 disabled:opacity-60">{saving ? 'Saving your profile…' : 'Continue to ESGlobalLanguageAcademy'}</button>
      </div>
    </div>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, Loader2, LogOut, Save } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }
      const { data: profile, error: profileError } = await supabase.from('profiles').select('user_id, full_name, avatar_url').eq('user_id', user.id).maybeSingle();
      if (profileError || !profile) { router.replace('/onboarding'); return; }
      if (active) { setUserId(profile.user_id); setFullName(profile.full_name); setAvatarUrl(profile.avatar_url ?? ''); setLoading(false); }
    }
    void loadProfile();
    return () => { active = false; };
  }, [router, supabase]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage(''); setError('');
    const { error: updateError } = await supabase.from('profiles').update({ full_name: fullName.trim() || 'ESGlobalLanguageAcademy member', avatar_url: avatarUrl.trim() || null }).eq('user_id', userId);
    if (updateError) setError(updateError.message); else setMessage('Your profile is up to date.');
    setSaving(false);
  }

  async function signOut() { await supabase.auth.signOut(); router.replace('/auth'); }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return <main className="mx-auto max-w-2xl px-6 py-12"><Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" />Back home</Link><div className="mt-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Your account</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Account settings</h1><p className="mt-3 text-muted-foreground">Keep your public profile current so people know who they’re connecting with.</p></div><form onSubmit={saveProfile} className="mt-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-8"><label className="block text-sm font-medium" htmlFor="name">Full name</label><input id="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /><label className="mt-6 block text-sm font-medium" htmlFor="avatar">Avatar image URL</label><input id="avatar" type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://example.com/your-photo.jpg" className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />{error && <p className="mt-4 text-sm text-destructive">{error}</p>}{message && <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700"><Check className="h-4 w-4" />{message}</p>}<button type="submit" disabled={saving} className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save changes'}</button></form><button onClick={() => void signOut()} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-destructive"><LogOut className="h-4 w-4" />Sign out</button></main>;
}

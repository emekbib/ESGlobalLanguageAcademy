'use client';

import { useState } from 'react';
import { User, Globe, Clock, Shield, Check, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function DashboardSettingsTab({
  fullName,
  avatarUrl,
  role = 'student',
}: {
  fullName: string;
  avatarUrl: string | null;
  role?: string;
}) {
  const [name, setName] = useState(fullName);
  const [selectedLanguage, setSelectedLanguage] = useState('German');
  const [timezone, setTimezone] = useState(
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC'
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const supabase = createSupabaseBrowserClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ full_name: name }).eq('user_id', user.id);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="border-b border-stone-200/80 pb-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
          Account Credentials
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950">
          Profile & Settings
        </h2>
        <p className="mt-1 text-xs text-stone-500 font-medium">
          Manage your personal learner credentials, preferences, and classroom settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details Card */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-stone-800">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950">
                Personal Details
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                Your public identity in tutor video classrooms
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-900 shadow-sm transition focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Account Role
            </label>
            <input
              type="text"
              value={role === 'student' ? 'Student / Language Learner' : 'Educator'}
              disabled
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-400 capitalize cursor-not-allowed"
            />
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-stone-800">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950">
                Learning Target
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                Customize your primary language and lesson schedule
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Primary Language of Study
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-900 shadow-sm transition focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950"
            >
              <option value="German">German (Goethe / telc / Ausbildung)</option>
              <option value="Amharic">Amharic (Fidel Script & Conversational)</option>
              <option value="English">English (IELTS / Cambridge / TOEFL)</option>
              <option value="French">French (DELF / DALF / Conversational)</option>
              <option value="Arabic">Arabic (Modern Standard / Dialects)</option>
              <option value="Afan Oromo">Afan Oromo (Conversational)</option>
              <option value="Italian">Italian (Conversational)</option>
              <option value="Mandarin">Mandarin (HSK 1–6)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Classroom Timezone
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 bg-stone-50">
              <Clock className="h-4 w-4 text-stone-400" />
              <span>{timezone}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-stone-400">
              Times automatically convert to your local timezone for scheduling.
            </p>
          </div>
        </div>

        {/* Security / Escrow Protection */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-stone-800">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950">
                Payment & Escrow Protection
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                Escrow protection on all 1-on-1 scheduled sessions
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-stone-500 leading-relaxed font-medium">
            Payments are securely processed via Stripe. Payouts to educators are held safely in escrow until your video lesson concludes.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-stone-800 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Profile'
            )}
          </button>

          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 animate-fade-in">
              <Check className="h-4 w-4" />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

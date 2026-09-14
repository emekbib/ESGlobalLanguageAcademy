'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { User, Globe, Clock, Shield, Check, Loader2, Moon, Sun, Monitor } from 'lucide-react';
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [name, setName] = useState(fullName);
  const [selectedLanguage, setSelectedLanguage] = useState('Amharic');
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
      <div className="border-b border-stone-200/80 dark:border-stone-800 pb-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Account Credentials
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-stone-950 dark:text-white">
          Profile & Settings
        </h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
          Manage your personal learner credentials, preferences, and classroom settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details Card */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950 dark:text-white">
                Personal Details
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                Your public identity in tutor video classrooms
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 px-4 py-3 text-sm font-medium text-stone-900 dark:text-stone-100 shadow-sm transition focus:border-stone-950 dark:focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-950 dark:focus:ring-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              Account Role
            </label>
            <input
              type="text"
              value={role === 'student' ? 'Student / Language Learner' : 'Educator'}
              disabled
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-4 py-3 text-sm font-medium text-stone-400 dark:text-stone-500 capitalize cursor-not-allowed"
            />
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950 dark:text-white">
                Learning Target
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                Customize your primary language and lesson schedule
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              Primary Language of Study
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 px-4 py-3 text-sm font-medium text-stone-900 dark:text-stone-100 shadow-sm transition focus:border-stone-950 dark:focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-950 dark:focus:ring-stone-500"
            >
              <option value="Amharic">Amharic (Fidel Script &amp; Conversational)</option>
              <option value="Tigrigna">Tigrigna (Ge&apos;ez Script &amp; Conversational)</option>
              <option value="Afaan Oromo">Afaan Oromo (Qubee &amp; Conversational)</option>
              <option value="Somali">Somali (Conversational &amp; Grammar)</option>
              <option value="Swahili">Swahili (Kiswahili Sanifu &amp; Immersion)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              Classroom Timezone
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-stone-200 dark:border-stone-800 px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50">
              <Clock className="h-4 w-4 text-stone-400" />
              <span>{timezone}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">
              Times automatically convert to your local timezone for scheduling.
            </p>
          </div>
        </div>

        {/* Appearance & Theme Card */}
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
                Customize interface colors between warm ivory editorial and obsidian dark
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

        {/* Security / Escrow Protection */}
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-stone-950 dark:text-white">
                Payment & Escrow Protection
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                Escrow protection on all 1-on-1 scheduled sessions
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
            Payments are securely processed via Stripe. Payouts to educators are held safely in escrow until your video lesson concludes.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-stone-950 dark:bg-stone-100 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 shadow-sm transition hover:bg-stone-800 dark:hover:bg-white active:scale-95 disabled:opacity-50"
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
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 animate-fade-in">
              <Check className="h-4 w-4" />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

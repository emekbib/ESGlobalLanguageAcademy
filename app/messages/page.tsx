import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ErrorDisplay } from '@/components/ui/page-states';
import DashboardMessagesTab from '@/components/dashboard/dashboard-messages-tab';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const contactId = typeof resolvedParams.contactId === 'string' ? resolvedParams.contactId : undefined;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, role, full_name, avatar_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (profileError) {
    return <ErrorDisplay message="We couldn't load your profile. Please try again." />;
  }
  if (!profile) redirect('/onboarding');
  if (profile.role === 'admin') redirect('/admin');

  return (
    <div className="h-screen w-full overflow-hidden bg-white dark:bg-[#101012]">
      <DashboardMessagesTab
        currentUser={{ id: profile.user_id, role: profile.role }}
        initialContactId={contactId}
      />
    </div>
  );
}

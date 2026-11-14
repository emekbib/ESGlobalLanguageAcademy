import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

function getAuthenticatedClient(request: Request, serverClient: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY || '';

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : null;

  if (bearerToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${bearerToken}` },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return serverClient;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve the teacher profile the signed-in user is allowed to edit.
 * Teachers can only ever edit their OWN profile (looked up by their user id; the
 * client-supplied id is ignored). Admins may target a specific teacher profile id.
 */
async function resolveEditableTeacherProfile(client: any, userId: string, requestedTeacherId?: string) {
  const { data: profile } = await client.from('profiles').select('role').eq('user_id', userId).maybeSingle();
  const isAdmin = profile?.role === 'admin';

  if (isAdmin && requestedTeacherId && UUID_RE.test(requestedTeacherId)) {
    const { data } = await client.from('teacher_profiles').select('id, user_id').eq('id', requestedTeacherId).maybeSingle();
    return data ?? null;
  }

  const { data } = await client.from('teacher_profiles').select('id, user_id').eq('user_id', userId).maybeSingle();
  return data ?? null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'teacherId parameter is required' }, { status: 400 });
    }

    const serverClient = await createSupabaseServerClient();
    const client = getAuthenticatedClient(request, serverClient);

    // Resolve teacher_profile id if teacherId was user_id
    if (!UUID_RE.test(teacherId)) {
      return NextResponse.json({ success: true, data: [] });
    }
    let resolvedTeacherId = teacherId;
    const { data: tp } = await client
      .from('teacher_profiles')
      .select('id')
      .or(`id.eq.${teacherId},user_id.eq.${teacherId}`)
      .limit(1)
      .maybeSingle();

    if (tp?.id) {
      resolvedTeacherId = tp.id;
    }

    const { data, error } = await client
      .from('teacher_availability')
      .select('*')
      .eq('teacher_id', resolvedTeacherId)
      .order('weekday', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const client = getAuthenticatedClient(request, serverClient);
    let effectiveUser = user;

    if (!effectiveUser) {
      const { data: authData } = await client.auth.getUser();
      effectiveUser = authData?.user ?? null;
    }

    if (!effectiveUser) {
      return NextResponse.json({ error: 'Please sign in to save availability.' }, { status: 401 });
    }

    const body = await request.json();
    const { teacherId, weekday, timezone } = body;
    const norm = (t: unknown) => (typeof t === 'string' && /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t);
    const start_time = norm(body.start_time) as string;
    const end_time = norm(body.end_time) as string;

    if (typeof weekday !== 'number' || weekday < 0 || weekday > 6) {
      return NextResponse.json({ error: 'Valid weekday (0-6) is required.' }, { status: 400 });
    }

    if (!start_time || !end_time || end_time <= start_time) {
      return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 });
    }

    const tp = await resolveEditableTeacherProfile(client, effectiveUser.id, teacherId);
    if (!tp) {
      return NextResponse.json(
        { error: 'Finish setting up your teacher profile before adding availability.' },
        { status: 404 },
      );
    }

    // Check overlap with existing windows
    const { data: existingWindows } = await client
      .from('teacher_availability')
      .select('*')
      .eq('teacher_id', tp.id)
      .eq('weekday', weekday);

    const hasOverlap = (existingWindows ?? []).some(
      (w: any) =>
        (start_time >= w.start_time && start_time < w.end_time) ||
        (end_time > w.start_time && end_time <= w.end_time) ||
        (start_time <= w.start_time && end_time >= w.end_time)
    );

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'This window overlaps with an existing availability window for this day.' },
        { status: 400 }
      );
    }

    const safeTz = timezone || 'America/New_York';

    const { data, error: insertError } = await client
      .from('teacher_availability')
      .insert({
        teacher_id: tp.id,
        weekday,
        start_time,
        end_time,
        timezone: safeTz,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Availability insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Availability API error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const client = getAuthenticatedClient(request, serverClient);
    let effectiveUser = user;

    if (!effectiveUser) {
      const { data: authData } = await client.auth.getUser();
      effectiveUser = authData?.user ?? null;
    }

    if (!effectiveUser) {
      return NextResponse.json({ error: 'Please sign in to delete availability.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    // Verify window belongs to this teacher
    const { data: window } = await client
      .from('teacher_availability')
      .select('id, teacher_id')
      .eq('id', id)
      .maybeSingle();

    if (!window) {
      return NextResponse.json({ error: 'Availability window not found.' }, { status: 404 });
    }

    const { data: tp } = await client
      .from('teacher_profiles')
      .select('id, user_id')
      .eq('id', window.teacher_id)
      .maybeSingle();

    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('user_id', effectiveUser.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && tp?.user_id !== effectiveUser.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this window.' }, { status: 403 });
    }

    const { error: deleteError } = await client
      .from('teacher_availability')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const client = getAuthenticatedClient(request, serverClient);
    let effectiveUser = user;

    if (!effectiveUser) {
      const { data: authData } = await client.auth.getUser();
      effectiveUser = authData?.user ?? null;
    }

    if (!effectiveUser) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const { teacherId, timezone } = body;

    if (!timezone) {
      return NextResponse.json({ error: 'timezone is required.' }, { status: 400 });
    }

    const tp = await resolveEditableTeacherProfile(client, effectiveUser.id, teacherId);

    if (!tp) {
      return NextResponse.json({ error: 'Teacher profile not found.' }, { status: 404 });
    }

    const { error: updateError } = await client
      .from('teacher_availability')
      .update({ timezone })
      .eq('teacher_id', tp.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

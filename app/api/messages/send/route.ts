import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY || '';

    // 1. Get session from cookies or Authorization header
    const serverClient = await createSupabaseServerClient();
    const {
      data: { user: cookieUser },
    } = await serverClient.auth.getUser();

    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : null;

    let effectiveUser = cookieUser;
    let authenticatedClient = serverClient;

    if (bearerToken) {
      // Create a direct client with the user's JWT bearer token so that Supabase PostgREST RLS
      // properly evaluates auth.uid() === sender_id
      const bearerClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      const { data: authData } = await bearerClient.auth.getUser(bearerToken);
      if (authData?.user) {
        effectiveUser = authData.user;
        authenticatedClient = bearerClient as any;
      }
    }

    const body = await request.json();
    const { receiver_id, content, sender_id } = body;

    const senderUserId = effectiveUser?.id || sender_id;

    if (!senderUserId) {
      return NextResponse.json(
        { error: 'You must be signed in to send a message.' },
        { status: 401 }
      );
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content cannot be empty.' },
        { status: 400 }
      );
    }

    if (!receiver_id || typeof receiver_id !== 'string') {
      return NextResponse.json(
        { error: 'Recipient ID is required.' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    // 2. Prevent sending a message to oneself
    if (receiver_id === senderUserId) {
      return NextResponse.json(
        { error: 'You cannot send a message to yourself.' },
        { status: 400 }
      );
    }

    // 3. Simulated delivery for non-UUID recipients (e.g. sample educators)
    if (!UUID_REGEX.test(receiver_id)) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message: {
          id: `sim-${Date.now()}`,
          sender_id: senderUserId,
          receiver_id,
          content: trimmedContent,
          created_at: new Date().toISOString(),
        },
      });
    }

    // 4. Resolve receiver_id: If receiver_id is a teacher_profiles.id, map to their user_id
    let targetReceiverId = receiver_id;
    const { data: tp } = await authenticatedClient
      .from('teacher_profiles')
      .select('user_id')
      .eq('id', receiver_id)
      .maybeSingle();

    if (tp?.user_id) {
      targetReceiverId = tp.user_id;
    }

    if (targetReceiverId === senderUserId) {
      return NextResponse.json(
        { error: 'You cannot send a message to yourself.' },
        { status: 400 }
      );
    }

    // 5. Insert message with authenticated client
    const { data: insertedMsg, error: insertError } = await authenticatedClient
      .from('messages')
      .insert({
        sender_id: senderUserId,
        receiver_id: targetReceiverId,
        content: trimmedContent,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Message insertion error:', insertError);

      // If RLS fails because of session state, return clean error
      return NextResponse.json(
        {
          error:
            insertError.code === '42501'
              ? 'Security check failed. Please refresh your session and try again.'
              : insertError.message || 'Failed to send message.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: insertedMsg,
    });
  } catch (err: any) {
    console.error('Error in send message API:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}

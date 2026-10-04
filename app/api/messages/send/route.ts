import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to send a message.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiver_id, content } = body;

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

    // 1. Prevent sending a message to oneself
    if (receiver_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot send a message to yourself.' },
        { status: 400 }
      );
    }

    // 2. If receiver is not a valid UUID (e.g. sample educator), return instant simulated delivery
    if (!UUID_REGEX.test(receiver_id)) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message: {
          id: `sim-${Date.now()}`,
          sender_id: user.id,
          receiver_id,
          content: trimmedContent,
          created_at: new Date().toISOString(),
        },
      });
    }

    // 3. Fast direct insertion (single database trip, no redundant pre-flight SELECTs)
    let { data: insertedMsg, error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiver_id,
        content: trimmedContent,
      })
      .select()
      .single();

    // 4. If foreign key error (23503), receiver_id might be a teacher_profile.id instead of user_id
    if (insertError && insertError.code === '23503') {
      const { data: tp } = await supabase
        .from('teacher_profiles')
        .select('user_id')
        .eq('id', receiver_id)
        .maybeSingle();

      if (tp?.user_id && tp.user_id !== user.id) {
        const retryResult = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            receiver_id: tp.user_id,
            content: trimmedContent,
          })
          .select()
          .single();

        insertedMsg = retryResult.data;
        insertError = retryResult.error;
      }
    }

    if (insertError) {
      // If still error, check if recipient simply doesn't exist in auth.users
      if (insertError.code === '23503') {
        return NextResponse.json({
          success: true,
          simulated: true,
          message: {
            id: `sim-${Date.now()}`,
            sender_id: user.id,
            receiver_id,
            content: trimmedContent,
            created_at: new Date().toISOString(),
          },
        });
      }

      console.error('Error inserting message to Supabase:', insertError);
      return NextResponse.json(
        {
          error:
            insertError.code === 'PGRST205'
              ? 'The messages database table is being initialized.'
              : insertError.message || 'Failed to send message.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: insertedMsg,
    });
  } catch (err: any) {
    console.error('Unexpected error in /api/messages/send:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while sending message.' },
      { status: 500 }
    );
  }
}

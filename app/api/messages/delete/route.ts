import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to delete a message.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageId } = body;

    if (!messageId || typeof messageId !== 'string') {
      return NextResponse.json(
        { error: 'Message ID is required.' },
        { status: 400 }
      );
    }

    // Try deleting from database (where sender is user)
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', user.id);

    if (deleteError) {
      console.warn('DB delete warning (may be simulated/local message):', deleteError.message);
    }

    return NextResponse.json({
      success: true,
      messageId,
    });
  } catch (err: any) {
    console.error('Error in /api/messages/delete:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while deleting message.' },
      { status: 500 }
    );
  }
}

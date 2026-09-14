import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

export async function POST(req: Request) {
  try {
    const { supabase } = await requireAdmin();

    const body = await req.json();
    const { reviewId, action } = body;

    if (!reviewId || !['dismiss', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid parameters. reviewId and valid action (dismiss or delete) are required.' },
        { status: 400 }
      );
    }

    if (action === 'dismiss') {
      const { error } = await supabase
        .from('reviews')
        .update({
          flagged_at: null,
          flag_reason: null,
        })
        .eq('id', reviewId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Review flag dismissed.' });
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Review removed permanently.' });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

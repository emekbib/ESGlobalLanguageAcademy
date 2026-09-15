import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin';

export async function POST(req: Request) {
  try {
    const adminCheck = await requireAdminApi();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { supabase } = adminCheck;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    const { reviewId, action } = body;

    if (!reviewId || !['dismiss', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid parameters. reviewId and valid action (dismiss or delete) are required.' },
        { status: 400 }
      );
    }

    // 1. Try atomic database RPC (SECURITY DEFINER)
    const { error: rpcError } = await supabase.rpc('admin_moderate_review', {
      p_review_id: reviewId,
      p_action: action,
    });

    if (!rpcError) {
      return NextResponse.json({
        success: true,
        message: action === 'dismiss' ? 'Review flag dismissed.' : 'Review removed permanently.',
      });
    }

    // 2. Fallback to direct table operation (utilizing admin RLS policies)
    if (action === 'dismiss') {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          flagged_at: null,
          flag_reason: null,
        })
        .eq('id', reviewId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Review flag dismissed.' });
    }

    if (action === 'delete') {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Review removed permanently.' });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

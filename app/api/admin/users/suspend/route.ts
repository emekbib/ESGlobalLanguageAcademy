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

    const { supabase, user } = adminCheck;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    const { userId, suspended, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Target userId is required.' },
        { status: 400 }
      );
    }

    // Guard: Prevent admin from suspending their own account
    if (user && user.id === userId) {
      return NextResponse.json(
        { error: 'Action not allowed: You cannot suspend your own administrator account.' },
        { status: 403 }
      );
    }

    // Validation: Require reason when suspending
    if (suspended && (!reason || reason.trim().length === 0)) {
      return NextResponse.json(
        { error: 'A specific reason is required to suspend an account for audit compliance.' },
        { status: 400 }
      );
    }

    const trimmedReason = suspended ? reason.trim() : null;

    // 1. Try atomic database RPC (SECURITY DEFINER)
    const { error: rpcError } = await supabase.rpc('admin_set_account_suspension', {
      p_user_id: userId,
      p_suspended: Boolean(suspended),
      p_reason: trimmedReason,
    });

    if (!rpcError) {
      return NextResponse.json({
        success: true,
        suspended: Boolean(suspended),
        message: suspended ? 'Account suspended successfully.' : 'Account unsuspended successfully.',
      });
    }

    // 2. Direct fallback using admin security context
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        suspended_at: suspended ? new Date().toISOString() : null,
        suspension_reason: trimmedReason,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update user suspension state.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suspended: Boolean(suspended),
      message: suspended ? 'Account suspended successfully.' : 'Account unsuspended successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

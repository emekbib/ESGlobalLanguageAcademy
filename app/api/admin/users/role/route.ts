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
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required.' },
        { status: 400 }
      );
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role.' },
        { status: 400 }
      );
    }

    // Guard: Prevent admin from demoting themselves
    if (user && user.id === userId && role !== 'admin') {
      return NextResponse.json(
        { error: 'You cannot remove your own admin privileges.' },
        { status: 403 }
      );
    }

    // Try RPC first
    const { error: rpcError } = await supabase.rpc('admin_set_user_role', {
      p_user_id: userId,
      p_role: role,
    });

    if (rpcError) {
      // Fallback direct update on profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message || 'Failed to update user role.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, userId, role });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error updating role.' },
      { status: 500 }
    );
  }
}

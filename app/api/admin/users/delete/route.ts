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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required.' },
        { status: 400 }
      );
    }

    // Guard: Prevent admin from deleting themselves
    if (user && user.id === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own administrator account.' },
        { status: 403 }
      );
    }

    // Try deleting related teacher_profile first if exists
    await supabase.from('teacher_profiles').delete().eq('user_id', userId);

    // Delete from profiles
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.warn('Notice deleting profile:', deleteError.message);
    }

    return NextResponse.json({
      success: true,
      userId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error deleting user.' },
      { status: 500 }
    );
  }
}

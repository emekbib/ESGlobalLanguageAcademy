import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Lets a student remove a cancelled, unpaid booking from their Lesson History.
 * Only bookings with status 'cancelled' and no payment_intent_id can be deleted
 * — paid bookings are permanent financial records and must not be erased.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    const { bookingId } = await req.json().catch(() => ({}));
    if (typeof bookingId !== 'string') {
      return NextResponse.json({ error: 'Missing booking.' }, { status: 400 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, student_id, status, payment_intent_id')
      .eq('id', bookingId)
      .maybeSingle();
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (booking.student_id !== user.id) {
      return NextResponse.json({ error: 'You can only remove your own bookings.' }, { status: 403 });
    }
    if (booking.status !== 'cancelled' || booking.payment_intent_id) {
      return NextResponse.json({ error: 'Only cancelled, unpaid bookings can be removed.' }, { status: 400 });
    }

    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (error) {
      return NextResponse.json({ error: 'We couldn’t remove this booking. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete booking error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

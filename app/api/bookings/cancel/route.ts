import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { refundableCents, type CancelActor } from '@/lib/payments/refund-policy';

/**
 * Cancels a booking and, when the policy allows, refunds the student through Stripe.
 * The refund is issued BEFORE the booking is marked cancelled, so a lesson is never
 * shown as refunded unless Stripe actually accepted the refund.
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

    // RLS only returns bookings where this user is the student or the teacher.
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, student_id, teacher_id, status, start_time_utc, amount_cents, payment_intent_id')
      .eq('id', bookingId)
      .maybeSingle();
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });

    let actor: CancelActor | null = booking.student_id === user.id ? 'student' : null;
    if (!actor) {
      const { data: tp } = await supabase
        .from('teacher_profiles')
        .select('user_id')
        .eq('id', booking.teacher_id)
        .maybeSingle();
      if (tp?.user_id === user.id) actor = 'teacher';
    }
    if (!actor) return NextResponse.json({ error: 'You cannot cancel this lesson.' }, { status: 403 });

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return NextResponse.json({ error: `This lesson is already ${booking.status}.` }, { status: 400 });
    }
    if (new Date(booking.start_time_utc).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'This lesson has already started and can no longer be cancelled.' }, { status: 400 });
    }

    const paid = booking.status === 'confirmed' && Boolean(booking.payment_intent_id);
    const refundCents = refundableCents({
      actor,
      paid,
      amountCents: booking.amount_cents,
      startUtc: booking.start_time_utc,
    });

    let refundId: string | null = null;
    if (refundCents > 0) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key || key.includes('placeholder')) {
        return NextResponse.json({ error: 'Refunds are not available right now. Please contact support.' }, { status: 503 });
      }
      const stripe = new Stripe(key, { apiVersion: '2024-06-20' as any });
      try {
        const refund = await stripe.refunds.create(
          {
            payment_intent: booking.payment_intent_id as string,
            amount: refundCents,
            metadata: { booking_id: booking.id, cancelled_by: actor },
          },
          { idempotencyKey: `refund-${booking.id}` },
        );
        refundId = refund.id;
      } catch (err: any) {
        console.error('Stripe refund failed:', err?.message);
        return NextResponse.json(
          { error: 'We couldn’t process the refund, so the lesson was not cancelled. Please try again or contact support.' },
          { status: 502 },
        );
      }
    }

    const base = { status: 'cancelled' as const, hold_expires_at: null };
    const withRefund = {
      ...base,
      cancelled_by: actor,
      refund_id: refundId,
      refund_amount_cents: refundCents,
      refunded_at: refundId ? new Date().toISOString() : null,
    };
    let { error } = await supabase.from('bookings').update(withRefund).eq('id', booking.id);
    // If the refund-tracking columns migration hasn't been applied yet, still cancel.
    if (error && /column|schema cache/i.test(error.message)) {
      ({ error } = await supabase.from('bookings').update(base).eq('id', booking.id));
    }
    if (error) {
      console.error('Cancel update failed:', error.message, refundId ? `(refund ${refundId} already issued)` : '');
      return NextResponse.json({ error: 'We couldn’t cancel this lesson. Please contact support.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, refundedCents: refundCents, refundId });
  } catch (err: any) {
    console.error('Cancel booking error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

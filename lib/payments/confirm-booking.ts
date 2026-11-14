import Stripe from 'stripe';

export type ConfirmResult =
  | { ok: true; amountCents: number }
  | { ok: false; reason: 'not_found' | 'not_paid' | 'mismatch' | 'stripe_error' | 'not_configured' };

/**
 * Marks a booking confirmed ONLY after Stripe confirms the Checkout Session was paid for
 * exactly this booking and exactly the amount stored on it. Before this, the booking was
 * confirmed from a URL parameter, so the status could flip without any payment.
 *
 * `db` must be a Supabase client acting as the booking's student (RLS restricts the row).
 */
export async function confirmPaidBooking(
  db: any,
  studentId: string,
  bookingId: string,
  sessionId: string,
): Promise<ConfirmResult> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('placeholder')) return { ok: false, reason: 'not_configured' };

  const { data: booking } = await db
    .from('bookings')
    .select('id, student_id, status, amount_cents, checkout_session_id')
    .eq('id', bookingId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!booking) return { ok: false, reason: 'not_found' };
  if (booking.status === 'confirmed' || booking.status === 'completed') {
    return { ok: true, amountCents: booking.amount_cents };
  }

  let session: Stripe.Checkout.Session;
  try {
    const stripe = new Stripe(key, { apiVersion: '2024-06-20' as any });
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { ok: false, reason: 'stripe_error' };
  }

  if (
    session.metadata?.booking_id !== booking.id ||
    (booking.checkout_session_id && booking.checkout_session_id !== session.id) ||
    session.amount_total !== booking.amount_cents
  ) {
    return { ok: false, reason: 'mismatch' };
  }
  if (session.payment_status !== 'paid') return { ok: false, reason: 'not_paid' };

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;

  // A paid booking is confirmed even if the 15-minute hold lapsed while the student
  // was on the Stripe page (the hold only matters for unpaid bookings).
  const { error } = await db
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_intent_id: paymentIntentId,
      checkout_session_id: session.id,
      hold_expires_at: null,
    })
    .eq('id', booking.id)
    .eq('student_id', studentId);
  if (error) return { ok: false, reason: 'stripe_error' };

  return { ok: true, amountCents: booking.amount_cents };
}

/** Releases an unpaid hold when the student backs out of Stripe Checkout. */
export async function releaseUnpaidHold(db: any, studentId: string, bookingId: string) {
  await db
    .from('bookings')
    .update({ status: 'cancelled', hold_expires_at: null })
    .eq('id', bookingId)
    .eq('student_id', studentId)
    .eq('status', 'pending');
}

import Stripe from 'stripe';

type CancelledPaidBooking = {
  id: string;
  status: string;
  payment_intent_id?: string | null;
  refunded_at?: string | null;
  refund_amount_cents?: number | null;
};

/**
 * For cancelled, paid bookings that don't have refund details stored on the row, ask
 * Stripe how much was actually refunded. Stripe is the source of truth for money, and
 * this keeps the Payments tab accurate even before the refund-tracking columns exist.
 * Returns bookingId -> { refund_amount_cents, refunded_at }.
 */
export async function lookupRefunds(bookings: CancelledPaidBooking[]) {
  const result = new Map<string, { refund_amount_cents: number; refunded_at: string | null }>();
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('placeholder')) return result;

  const targets = bookings.filter(
    (b) => b.status === 'cancelled' && b.payment_intent_id && !b.refunded_at,
  );
  if (!targets.length) return result;

  const stripe = new Stripe(key, { apiVersion: '2024-06-20' as any });
  await Promise.all(
    targets.slice(0, 20).map(async (b) => {
      try {
        const refunds = await stripe.refunds.list({ payment_intent: b.payment_intent_id as string, limit: 10 });
        const ok = refunds.data.filter((r) => r.status === 'succeeded' || r.status === 'pending');
        const cents = ok.reduce((sum, r) => sum + r.amount, 0);
        result.set(b.id, {
          refund_amount_cents: cents,
          refunded_at: cents > 0 ? new Date(Math.max(...ok.map((r) => r.created)) * 1000).toISOString() : null,
        });
      } catch {
        // Leave unknown; the UI will show "refund due" rather than guess.
      }
    }),
  );
  return result;
}

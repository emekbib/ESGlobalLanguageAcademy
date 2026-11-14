/**
 * Cancellation & refund policy — single source of truth for what the student is told
 * in the UI and what /api/bookings/cancel actually does.
 *
 *  - Teacher cancels a paid lesson            → full refund to the student.
 *  - Student cancels ≥ 24h before the start   → full refund.
 *  - Student cancels < 24h before the start   → no refund (matches "Free cancellation
 *                                               up to 24h prior" shown at booking).
 *  - Unpaid (pending) bookings                → nothing to refund; hold is released.
 */
export const FREE_CANCELLATION_HOURS = 24;

export type CancelActor = 'student' | 'teacher';

export function refundableCents(params: {
  actor: CancelActor;
  paid: boolean;
  amountCents: number | null | undefined;
  startUtc: string;
  now?: Date;
}): number {
  const { actor, paid, amountCents, startUtc, now = new Date() } = params;
  if (!paid || !amountCents || amountCents <= 0) return 0;
  if (actor === 'teacher') return amountCents;
  const hoursUntilStart = (new Date(startUtc).getTime() - now.getTime()) / 3_600_000;
  return hoursUntilStart >= FREE_CANCELLATION_HOURS ? amountCents : 0;
}

export function cancellationMessage(params: {
  actor: CancelActor;
  paid: boolean;
  amountCents: number | null | undefined;
  startUtc: string;
}): string {
  if (!params.paid) return 'You have not been charged for this lesson.';
  const refund = refundableCents(params);
  const amount = `$${((params.amountCents ?? 0) / 100).toFixed(2)}`;
  if (params.actor === 'teacher') return `The student will be refunded ${amount} in full.`;
  if (refund > 0) return `You'll be refunded ${amount} in full (5–10 business days to appear).`;
  return `This lesson starts in less than ${FREE_CANCELLATION_HOURS} hours, so it is not refundable.`;
}

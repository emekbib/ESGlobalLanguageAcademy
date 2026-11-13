/**
 * Single source of truth for lesson pricing. Used by the booking card (what the student
 * is quoted) and by /api/checkout (what Stripe charges), so the two can never disagree.
 *
 * A teacher's `hourly_rate` is the price of a standard 50-minute lesson.
 */
export const ALLOWED_LESSON_MINUTES = [30, 50, 60] as const;
export const STANDARD_LESSON_MINUTES = 50;
export const PLATFORM_FEE_RATE = 0.2;

export function lessonPriceCents(ratePer50Min: number, minutes: number): number {
  const rate = Number(ratePer50Min);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('Teacher has no valid lesson rate.');
  return Math.round((rate * 100 * minutes) / STANDARD_LESSON_MINUTES);
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

/** Displays a teacher's per-lesson (50 min) rate consistently, e.g. "$25.00". */
export function formatRate(ratePer50Min: number | string | null | undefined): string {
  const n = Number(ratePer50Min);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return formatUsd(Math.round(n * 100));
}

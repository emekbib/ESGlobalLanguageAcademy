/**
 * Single source of truth for lesson pricing. Used by the booking card (what the student
 * is quoted) and by /api/checkout (what Stripe charges), so the two can never disagree.
 *
 * A teacher's `hourly_rate` is the price of a standard 45-minute lesson.
 */
export const ALLOWED_LESSON_MINUTES = [30, 45, 60] as const;
export const STANDARD_LESSON_MINUTES = 45;
export const PLATFORM_FEE_RATE = 0.2;

export function lessonPriceCents(ratePerStandardLesson: number, minutes: number): number {
  const rate = Number(ratePerStandardLesson);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('Teacher has no valid lesson rate.');
  return Math.round((rate * 100 * minutes) / STANDARD_LESSON_MINUTES);
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

/** Displays a teacher's per-lesson (45 min) rate consistently, e.g. "$25.00". */
export function formatRate(ratePerStandardLesson: number | string | null | undefined): string {
  const n = Number(ratePerStandardLesson);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return formatUsd(Math.round(n * 100));
}

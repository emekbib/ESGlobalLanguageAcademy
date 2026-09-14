'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Star, CheckCircle2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ReviewForm({
  bookingId,
  teacherId,
  existingReview,
}: {
  bookingId: string;
  teacherId: string;
  existingReview: { rating: number; comment: string } | null;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [saved, setSaved] = useState(Boolean(existingReview));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createSupabaseBrowserClient();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please sign in to leave a review.');
      setLoading(false);
      return;
    }

    const payload = {
      booking_id: bookingId,
      student_id: user.id,
      teacher_id: teacherId,
      rating,
      comment: comment.trim(),
    };

    const result = existingReview
      ? await supabase
          .from('reviews')
          .update({ rating, comment: comment.trim() })
          .eq('booking_id', bookingId)
      : await supabase.from('reviews').insert(payload);

    if (result.error) {
      setError(
        result.error.code === '23505'
          ? 'You have already reviewed this lesson.'
          : 'We could not save your review. Please try again.'
      );
    } else {
      setSaved(true);
    }
    setLoading(false);
  }

  if (saved) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Review Submitted</h4>
          <p className="text-xs mt-0.5 opacity-90">
            Thank you for sharing your feedback. Your review helps maintain academy excellence.
          </p>
        </div>
      </div>
    );
  }

  const activeRating = hoverRating ?? rating;

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Rating
        </label>
        <div className="mt-2 flex items-center gap-1.5" aria-label="Choose a rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => setRating(value)}
              aria-label={`${value} stars`}
              className="rounded-lg p-1 transition-transform hover:scale-110 cursor-pointer focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  value <= activeRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300 dark:text-stone-700'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-bold text-stone-700 dark:text-stone-300">
            {activeRating} / 5
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400"
        >
          Your Feedback
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          minLength={3}
          maxLength={1000}
          rows={4}
          placeholder="How was your educator? Share details on their pace, clarity, and teaching style..."
          className="mt-2 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 px-4 py-3 text-sm text-stone-900 dark:text-stone-100 outline-none transition focus:border-stone-950 focus:bg-white dark:focus:border-amber-400 dark:focus:bg-stone-900 placeholder:text-stone-400"
        />
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-stone-800 dark:bg-amber-300 dark:text-stone-950 dark:hover:bg-amber-200 disabled:opacity-60 cursor-pointer"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>Submit Review</span>
      </button>
    </form>
  );
}

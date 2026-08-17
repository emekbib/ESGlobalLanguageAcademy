'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ReviewForm({ bookingId, teacherId, existingReview }: { bookingId: string; teacherId: string; existingReview: { rating: number; comment: string } | null }) {
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [saved, setSaved] = useState(Boolean(existingReview));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createSupabaseBrowserClient();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Please sign in to leave a review.'); setLoading(false); return; }
    const payload = { booking_id: bookingId, student_id: user.id, teacher_id: teacherId, rating, comment: comment.trim() };
    const result = existingReview
      ? await supabase.from('reviews').update({ rating, comment: comment.trim() }).eq('booking_id', bookingId)
      : await supabase.from('reviews').insert(payload);
    if (result.error) {
      setError(result.error.code === '23505' ? 'You have already reviewed this lesson.' : 'We could not save your review. Please try again.');
    } else {
      setSaved(true);
    }
    setLoading(false);
  }

  if (saved) return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">Thanks for sharing your experience. Your review is saved.</div>;

  return (
    <form onSubmit={submit} className="rounded-2xl border bg-background p-5 shadow-sm">
      <h3 className="font-semibold">Share your experience</h3>
      <div className="mt-4 flex gap-1" aria-label="Choose a rating">
        {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`} className="rounded p-1 transition hover:scale-110"><Star className={`h-6 w-6 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} /></button>)}
      </div>
      <textarea value={comment} onChange={(event) => setComment(event.target.value)} required minLength={3} maxLength={1000} rows={4} placeholder="What did you enjoy about the lesson?" className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none ring-primary transition placeholder:text-muted-foreground focus:ring-2" />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={loading} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}Submit review</button>
    </form>
  );
}

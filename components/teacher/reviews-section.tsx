'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  studentName: string;
};

const INITIAL_VISIBLE = 4;

export default function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [showAll, setShowAll] = useState(false);

  if (reviews.length === 0) return null;

  const visible = showAll ? reviews : reviews.slice(0, visibleCount);
  const hasMore = !showAll && visibleCount < reviews.length;

  // Rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <section className="mt-12 border-t border-stone-200/80 dark:border-stone-800 pt-10">
      <h2 className="font-display text-2xl font-bold tracking-tight text-stone-950 dark:text-white">What students say</h2>

      {/* Rating breakdown */}
      <div className="mt-5 flex flex-wrap gap-4">
        {breakdown.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-sm font-medium text-stone-800 dark:text-stone-200">
              {star}
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400">{count}</span>
          </div>
        ))}
      </div>

      {/* Review list */}
      <div className="mt-6 space-y-4">
        {visible.map((review) => (
          <article key={review.id} className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-800 dark:text-stone-200 ring-1 ring-stone-200 dark:ring-stone-700">
                {review.studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-white">{review.studentName}</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  <time className="text-xs text-stone-400 dark:text-stone-500">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(new Date(review.createdAt))}
                  </time>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{review.comment}</p>
          </article>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (visibleCount + INITIAL_VISIBLE >= reviews.length) {
                setShowAll(true);
              } else {
                setVisibleCount((c) => c + INITIAL_VISIBLE);
              }
            }}
            className="rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 transition hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            Load more reviews
          </button>
        </div>
      )}
    </section>
  );
}

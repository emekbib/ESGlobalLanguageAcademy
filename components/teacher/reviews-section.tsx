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
    <section className="mt-12 border-t pt-10">
      <h2 className="font-display text-2xl font-bold">What students say</h2>

      {/* Rating breakdown */}
      <div className="mt-5 flex flex-wrap gap-4">
        {breakdown.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-sm font-medium">
              {star}
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>

      {/* Review list */}
      <div className="mt-6 space-y-4">
        {visible.map((review) => (
          <article key={review.id} className="rounded-2xl border bg-muted/20 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {review.studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{review.studentName}</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(new Date(review.createdAt))}
                  </time>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground">{review.comment}</p>
          </article>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              if (visibleCount + INITIAL_VISIBLE >= reviews.length) {
                setShowAll(true);
              } else {
                setVisibleCount((c) => c + INITIAL_VISIBLE);
              }
            }}
          >
            Load more reviews
          </Button>
        </div>
      )}
    </section>
  );
}

'use client';

import { AlertCircle } from 'lucide-react';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/70 px-6">
      <div className="max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

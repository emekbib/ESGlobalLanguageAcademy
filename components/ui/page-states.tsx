import { Loader2, AlertCircle } from 'lucide-react';

export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}

export function ErrorDisplay({ message }: { message?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/70 px-6">
      <div className="max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {message ?? 'We couldn\u2019t load this page. Please try again.'}
        </p>
      </div>
    </main>
  );
}

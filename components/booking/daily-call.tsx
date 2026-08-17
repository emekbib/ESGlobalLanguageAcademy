'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Video, VideoOff } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function DailyCall({
  roomUrl,
  bookingId,
  canJoin,
}: {
  roomUrl: string | null;
  bookingId: string;
  canJoin: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<{ destroy: () => void; join: (opts: { url: string }) => void } | null>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const ensureRoom = useCallback(async (): Promise<string | null> => {
    if (roomUrl) return roomUrl;
    setCreatingRoom(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-daily-room', { body: { bookingId } });
      if (fnError || !data?.url) {
        setError('Could not start the video room. Please refresh and try again.');
        return null;
      }
      return data.url as string;
    } catch {
      setError('Could not start the video room. Please refresh and try again.');
      return null;
    } finally {
      setCreatingRoom(false);
    }
  }, [roomUrl, bookingId, supabase]);

  const handleJoin = useCallback(async () => {
    setError('');
    const url = await ensureRoom();
    if (!url) return;

    setLoading(true);
    try {
      const DailyIframe = (await import('@daily-co/daily-js')).default;
      const call = DailyIframe.createFrame(containerRef.current!, {
        iframeStyle: { width: '100%', height: '100%', border: '0', borderRadius: '12px' },
      });
      callObjectRef.current = call;
      await call.join({ url });
      setJoined(true);
    } catch (err) {
      console.error('Daily join failed', err);
      setError('Could not join the video call. Please try again.');
      if (callObjectRef.current) {
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  }, [ensureRoom]);

  useEffect(() => {
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }
    };
  }, []);

  if (!canJoin) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-muted/30 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <VideoOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">The lesson room opens 10 minutes before start time</p>
          <p className="mt-1 text-sm text-muted-foreground">Check back closer to your scheduled time.</p>
        </div>
      </div>
    );
  }

  if (joined) {
    return <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-2xl border shadow-lg" />;
  }

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border bg-background px-6 py-16 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Video className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="font-semibold">Ready to join your lesson</p>
        <p className="mt-1 text-sm text-muted-foreground">Click below to enter the video classroom.</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="button"
        onClick={handleJoin}
        disabled={loading || creatingRoom}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-105 disabled:opacity-60"
      >
        {(loading || creatingRoom) && <Loader2 className="h-4 w-4 animate-spin" />}
        {creatingRoom ? 'Preparing room…' : loading ? 'Joining…' : 'Join lesson'}
      </button>
    </div>
  );
}

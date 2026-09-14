'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Video, VideoOff, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

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

  const ensureRoom = useCallback(async (): Promise<string | null> => {
    if (roomUrl) return roomUrl;
    setCreatingRoom(true);
    try {
      const res = await fetch('/api/classroom/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        setError(data?.error || 'Could not start the video classroom. Please refresh and try again.');
        return null;
      }
      return data.url as string;
    } catch {
      setError('Could not start the video classroom. Please check your network and try again.');
      return null;
    } finally {
      setCreatingRoom(false);
    }
  }, [roomUrl, bookingId]);

  const handleJoin = useCallback(async () => {
    setError('');
    const url = await ensureRoom();
    if (!url) return;

    setLoading(true);
    try {
      const DailyIframe = (await import('@daily-co/daily-js')).default;
      const call = DailyIframe.createFrame(containerRef.current!, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '1.5rem',
        },
        showLeaveButton: true,
      });
      callObjectRef.current = call;
      call.on('left-meeting', () => {
        setJoined(false);
      });
      await call.join({ url });
      setJoined(true);
    } catch (err) {
      console.error('Daily join failed', err);
      setError('Could not connect to video session. Please check browser permissions and try again.');
      if (callObjectRef.current) {
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  }, [ensureRoom]);

  const handleLeave = useCallback(() => {
    if (callObjectRef.current) {
      callObjectRef.current.destroy();
      callObjectRef.current = null;
    }
    setJoined(false);
  }, []);

  useEffect(() => {
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-stone-950 shadow-xl transition-all duration-300 ${
          joined ? 'h-[550px] sm:h-[650px]' : 'h-72 sm:h-80'
        }`}
      >
        {!joined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20 shadow-inner">
              <Video className="h-8 w-8 text-amber-300" />
            </div>

            <h3 className="mt-4 font-display text-xl font-bold tracking-tight">
              1-on-1 Encrypted Video Classroom
            </h3>

            <p className="mt-1.5 max-w-md text-xs sm:text-sm text-stone-300 font-medium">
              Powered by Daily.co WebRTC with high-definition audio, screen sharing, and live text chat.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {canJoin ? (
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={loading || creatingRoom}
                  className="inline-flex items-center gap-2.5 rounded-full bg-white dark:bg-stone-100 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 shadow-lg transition hover:bg-stone-100 dark:hover:bg-white disabled:opacity-60 cursor-pointer active:scale-95"
                >
                  {loading || creatingRoom ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-stone-950" />
                      <span>{creatingRoom ? 'Generating Room…' : 'Connecting Call…'}</span>
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 text-emerald-600" />
                      <span>Join Live Lesson</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900/80 px-5 py-2.5 text-xs font-medium text-stone-400">
                  <VideoOff className="h-4 w-4" />
                  <span>Room opens 10 minutes prior to session</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {joined && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Live Session Active
            </span>
          </div>

          <button
            type="button"
            onClick={handleLeave}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 transition cursor-pointer"
          >
            Leave Classroom
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200/80 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-xs font-medium text-red-800 dark:text-red-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

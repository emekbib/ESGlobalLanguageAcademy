'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  Calendar,
  Loader2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { playNotificationChime } from '@/lib/audio';

export type UnifiedNotification = {
  id: string;
  source: 'notification' | 'message';
  booking_id?: string | null;
  type: 'confirmed' | 'cancelled' | 'starting_soon' | 'message' | string;
  title: string;
  message: string;
  sender_id?: string;
  sender_name?: string;
  sender_avatar?: string | null;
  read_at: string | null;
  created_at: string;
};

const TYPE_DOT_COLORS: Record<string, string> = {
  confirmed: 'bg-emerald-500',
  cancelled: 'bg-destructive',
  starting_soon: 'bg-amber-500',
  message: 'bg-amber-400',
};

export default function NotificationBell({
  onNavigateMessages,
  externalUnreadCount,
}: {
  onNavigateMessages?: (senderId?: string) => void;
  externalUnreadCount?: number;
}) {
  const supabase = createSupabaseBrowserClient();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [internalUnreadCount, setInternalUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Trigger brief playful wiggle animation on the bell
  const triggerWiggle = useCallback(() => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 1200);
  }, []);

  // Load all notifications (both system notifications & direct messages)
  const loadAll = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      currentUserIdRef.current = user.id;

      // 1. Fetch system notifications
      const notifsPromise = supabase
        .from('notifications')
        .select('id, booking_id, type, message, read_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25);

      // 2. Fetch direct messages
      const msgsPromise = supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, read_at, created_at')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const [notifsRes, msgsRes] = await Promise.all([notifsPromise, msgsPromise]);

      const systemItems: UnifiedNotification[] = (notifsRes.data ?? []).map((n: any) => ({
        id: `sys-${n.id}`,
        source: 'notification',
        booking_id: n.booking_id,
        type: n.type || 'system',
        title:
          n.type === 'confirmed'
            ? 'Lesson Confirmed'
            : n.type === 'cancelled'
            ? 'Lesson Cancelled'
            : n.type === 'starting_soon'
            ? 'Lesson Starting Soon'
            : 'Notification',
        message: n.message,
        read_at: n.read_at,
        created_at: n.created_at,
      }));

      // Gather sender profiles for direct messages
      const rawMsgs = msgsRes.data ?? [];
      const senderIds = Array.from(new Set(rawMsgs.map((m: any) => m.sender_id)));
      let senderMap = new Map<string, { full_name: string; avatar_url: string | null }>();

      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', senderIds);
        if (profiles) {
          profiles.forEach((p) => {
            senderMap.set(p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url });
          });
        }
      }

      const messageItems: UnifiedNotification[] = rawMsgs.map((m: any) => {
        const sender = senderMap.get(m.sender_id);
        const name = sender?.full_name || 'Member';
        return {
          id: `msg-${m.id}`,
          source: 'message',
          type: 'message',
          sender_id: m.sender_id,
          sender_name: name,
          sender_avatar: sender?.avatar_url ?? null,
          title: `Message from ${name}`,
          message: m.content,
          read_at: m.read_at,
          created_at: m.created_at,
        };
      });

      // Merge and sort newest first
      const combined = [...messageItems, ...systemItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(combined);
      setInternalUnreadCount(combined.filter((item) => !item.read_at).length);
      setLoading(false);
      setLoadError(false);
    } catch (err) {
      console.warn('Notice loading notifications:', err);
      setLoadError(true);
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Periodic polling fallback every 6s so badges remain 100% accurate
  useEffect(() => {
    const interval = setInterval(() => {
      void loadAll();
    }, 6000);
    return () => clearInterval(interval);
  }, [loadAll]);

  // Realtime subscription for notifications and messages
  useEffect(() => {
    const channel = supabase
      .channel(`bell_realtime_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const n = payload.new as any;
          if (currentUserIdRef.current && n.user_id === currentUserIdRef.current) {
            triggerWiggle();
            playNotificationChime();
            void loadAll();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        () => {
          void loadAll();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as any;
          if (currentUserIdRef.current && m.receiver_id === currentUserIdRef.current) {
            triggerWiggle();
            playNotificationChime();
            void loadAll();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => {
          void loadAll();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, triggerWiggle, loadAll]);

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Mark all read (both notifications & direct messages)
  const markAllRead = useCallback(async () => {
    setMarkingAll(true);
    const userId = currentUserIdRef.current;
    if (!userId) {
      setMarkingAll(false);
      return;
    }

    try {
      const nowIso = new Date().toISOString();

      // 1. Mark notifications
      await supabase
        .from('notifications')
        .update({ read_at: nowIso })
        .eq('user_id', userId)
        .is('read_at', null);

      // 2. Mark messages
      await supabase
        .from('messages')
        .update({ read_at: nowIso })
        .eq('receiver_id', userId)
        .is('read_at', null);

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read_at: item.read_at || nowIso }))
      );
      setInternalUnreadCount(0);
    } catch (err) {
      console.warn('Error marking all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  }, [supabase]);

  // Mark a single notification or message as read
  const markSingleRead = async (item: UnifiedNotification, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.read_at) return;

    const nowIso = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read_at: nowIso } : n))
    );
    setInternalUnreadCount((prev) => Math.max(0, prev - 1));

    if (item.source === 'message') {
      const realId = item.id.replace('msg-', '');
      await supabase
        .from('messages')
        .update({ read_at: nowIso })
        .eq('id', realId)
        .is('read_at', null);
    } else {
      const realId = item.id.replace('sys-', '');
      await supabase
        .from('notifications')
        .update({ read_at: nowIso })
        .eq('id', realId)
        .is('read_at', null);
    }
  };

  // Determine display unread count (synchronizes with external unread count if provided)
  const displayUnreadCount = Math.max(
    internalUnreadCount,
    typeof externalUnreadCount === 'number' ? externalUnreadCount : 0
  );

  return (
    <div className="relative" ref={popoverRef}>
      {/* The Visual Notification Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) void loadAll();
        }}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 shadow-xs cursor-pointer ${
          displayUnreadCount > 0
            ? 'border-amber-400/80 dark:border-amber-500/70 bg-amber-500/15 dark:bg-amber-400/15 text-amber-600 dark:text-amber-300 ring-2 ring-amber-400/30 shadow-amber-500/10'
            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
        } ${isWiggling ? 'animate-bounce' : ''}`}
        aria-label={`Notifications ${displayUnreadCount > 0 ? `(${displayUnreadCount} unread)` : ''}`}
      >
        <Bell
          className={`h-4 w-4 transition-all duration-300 ${
            displayUnreadCount > 0 ? 'text-amber-600 dark:text-amber-300 fill-amber-500/20' : ''
          } ${isWiggling ? 'scale-115 rotate-12' : ''}`}
        />

        {/* VISUAL NOTIFICATION BADGE WITH GLOWING PULSE HALO */}
        {displayUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center">
            {/* Animated pulsating halo */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            {/* High-visibility Amber Badge */}
            <span className="relative inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-linear-to-r from-amber-500 to-amber-600 px-1 text-[10px] font-black text-stone-950 shadow-md ring-2 ring-white dark:ring-stone-900 leading-none">
              {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
            </span>
          </span>
        )}
      </button>

      {/* LUXURY NOTIFICATION CENTER DROPDOWN */}
      {open && (
        <div className="absolute right-0 z-50 mt-2.5 w-84 sm:w-96 overflow-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 px-4 py-3 bg-stone-50/80 dark:bg-stone-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-stone-950 dark:text-white">
                Notifications
              </span>
              {displayUnreadCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {displayUnreadCount} new
                </span>
              )}
            </div>

            {displayUnreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                disabled={markingAll}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition hover:underline disabled:opacity-60 cursor-pointer"
              >
                {markingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-96 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-stone-400">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                <span className="text-xs font-medium">Syncing alerts...</span>
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-xs text-red-500">
                <AlertCircle className="h-5 w-5" />
                <p>Notifications are temporarily unavailable.</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 mb-2">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  You&apos;re all caught up!
                </p>
                <p className="mt-0.5 text-[11px] text-stone-400 max-w-[200px]">
                  No new messages or lesson alerts at the moment.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.read_at;
                const isMsg = item.source === 'message';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      void markSingleRead(item);
                      if (isMsg && onNavigateMessages) {
                        onNavigateMessages(item.sender_id);
                        setOpen(false);
                      }
                    }}
                    className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                      isUnread
                        ? 'bg-amber-50/50 dark:bg-amber-950/25 hover:bg-amber-100/50 dark:hover:bg-amber-950/40'
                        : 'bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    {/* Unread Accent Bar */}
                    {isUnread && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r-full" />
                    )}

                    {/* Icon or Avatar */}
                    <div className="shrink-0 mt-0.5">
                      {isMsg ? (
                        item.sender_avatar ? (
                          <img
                            src={item.sender_avatar}
                            alt={item.sender_name || 'Sender'}
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-amber-400/40"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs ring-1 ring-amber-400/30">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                        )
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          <Calendar className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Notification Text */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-xs font-bold text-stone-900 dark:text-white">
                          {item.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-stone-400 font-medium">
                          {timeAgo(item.created_at)}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {/* Message Reply Prompt */}
                      {isMsg && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 group-hover:underline">
                          <span>Reply to message</span>
                          <span>→</span>
                        </div>
                      )}
                    </div>

                    {/* Mark Read Quick Action */}
                    {isUnread && (
                      <button
                        type="button"
                        onClick={(e) => void markSingleRead(item, e)}
                        className="shrink-0 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                        title="Mark as read"
                        aria-label="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

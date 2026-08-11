'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Bell, Check, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Notification = {
  id: string;
  booking_id: string | null;
  type: 'confirmed' | 'cancelled' | 'starting_soon';
  message: string;
  read_at: string | null;
  created_at: string;
};

const TYPE_DOT_COLORS: Record<Notification['type'], string> = {
  confirmed: 'bg-emerald-500',
  cancelled: 'bg-destructive',
  starting_soon: 'bg-amber-500',
};

export default function NotificationBell() {
  const supabase = createSupabaseBrowserClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('notifications')
      .select('id, booking_id, type, message, read_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) { setLoadError(true); setLoading(false); return; }
    const list = (data ?? []) as Notification[];
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.read_at).length);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const n = payload.new as Notification;
        setNotifications((prev) => [n, ...prev].slice(0, 30));
        setUnreadCount((prev) => prev + 1);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, (payload) => {
        const n = payload.new as Notification;
        setNotifications((prev) => prev.map((item) => (item.id === n.id ? n : item)));
        setUnreadCount((prev) => Math.max(0, prev - (n.read_at ? 1 : 0)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications' }, (payload) => {
        const old = payload.old as { id: string };
        setNotifications((prev) => prev.filter((item) => item.id !== old.id));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAllRead = useCallback(async () => {
    setMarkingAll(true);
    const unread = notifications.filter((n) => !n.read_at);
    if (unread.length === 0) { setMarkingAll(false); return; }
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unread.map((n) => n.id))
      .is('read_at', null);
    if (!error) {
      setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } else {
      setLoadError(true);
    }
    setMarkingAll(false);
  }, [supabase, notifications]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground transition hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                disabled={markingAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:underline disabled:opacity-60"
              >
                {markingAll && <Loader2 className="h-3 w-3 animate-spin" />}
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : loadError ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-destructive"><AlertCircle className="h-5 w-5" /><p>Notifications are temporarily unavailable.</p></div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No notifications yet</div>
            ) : (
              <ul className="divide-y">
                {notifications.map((n) => (
                  <li key={n.id} className={`flex items-start gap-3 px-4 py-3 transition ${n.read_at ? 'bg-background' : 'bg-primary/5'}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? 'bg-muted-foreground/30' : TYPE_DOT_COLORS[n.type]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-5">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read_at && (
                      <button
                        type="button"
                        onClick={async () => {
                          const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', n.id);
                          if (!error) {
                            setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item)));
                            setUnreadCount((prev) => Math.max(0, prev - 1));
                          } else {
                            setLoadError(true);
                          }
                        }}
                        className="shrink-0 text-muted-foreground transition hover:text-foreground"
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
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

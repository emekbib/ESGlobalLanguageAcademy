'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { playNotificationChime } from '@/lib/audio';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export function useMessageNotifications({
  userId,
  activeTab,
  onOpenMessages,
}: {
  userId: string;
  activeTab: string;
  onOpenMessages?: (senderId?: string) => void;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  // 1. Initial count of unread messages
  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .is('read_at', null);

      if (!error && typeof count === 'number') {
        setUnreadCount(count);
      }
    } catch {
      // Table might not exist or network unavailable
    }
  }, [userId, supabase]);

  useEffect(() => {
    void loadUnreadCount();
  }, [loadUnreadCount]);

  // Request browser notification permission politely if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const handleFirstClick = () => {
          Notification.requestPermission();
          window.removeEventListener('click', handleFirstClick);
        };
        window.addEventListener('click', handleFirstClick, { once: true });
      }
    }
  }, []);

  // 2. Realtime listener for incoming messages & updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`message_alerts_${userId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            sender_id: string;
            receiver_id: string;
            content: string;
            created_at: string;
          };

          // Only alert if the message was sent to THIS user
          if (newMsg.receiver_id === userId) {
            setUnreadCount((prev) => prev + 1);

            // Play the gentle audio chime
            playNotificationChime();

            // Look up sender's name
            let senderName = 'Someone';
            try {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('user_id', newMsg.sender_id)
                .maybeSingle();

              if (senderProfile?.full_name) {
                senderName = senderProfile.full_name;
              }
            } catch {
              // Ignore profile lookup error
            }

            // If user isn't on messages tab, show toast notification
            if (activeTab !== 'messages') {
              toast({
                title: `New message from ${senderName}`,
                description:
                  newMsg.content.length > 80
                    ? `${newMsg.content.slice(0, 80)}…`
                    : newMsg.content,
                action: onOpenMessages ? (
                  <ToastAction
                    altText="Reply to message"
                    onClick={() => onOpenMessages(newMsg.sender_id)}
                  >
                    Reply
                  </ToastAction>
                ) : undefined,
              });
            }

            // Native desktop notification if page is in background
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                new Notification(`New message from ${senderName}`, {
                  body: newMsg.content.slice(0, 100),
                  icon: '/icon.svg',
                });
              } catch {
                // Ignore
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          void loadUnreadCount();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      void loadUnreadCount();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userId, supabase, toast, activeTab, onOpenMessages, loadUnreadCount]);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return { unreadCount, clearUnread, refreshUnread: loadUnreadCount };
}

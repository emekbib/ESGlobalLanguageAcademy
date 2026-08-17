/*
# Enable Realtime for in-app notifications

1. Realtime publication
- Adds the notifications table to Supabase Realtime so each signed-in
  user's bell receives new, updated, and deleted notification events.
2. Security
- RLS remains enabled and continues to scope rows to the authenticated user.
*/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

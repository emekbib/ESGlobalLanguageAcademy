/*
# Schedule send-booking-reminders via pg_cron

1. Extension
- Enables pg_cron if not already enabled.

2. Cron job
- send-booking-reminders runs every fifteen minutes.
- Uses net.http_post to call the edge function endpoint with the service role
  key for authentication. The edge function is the authoritative sender and is
  idempotent (it checks reminder timestamps before sending).
*/
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-booking-reminders') THEN
    PERFORM cron.unschedule('send-booking-reminders');
  END IF;
END $$;

SELECT cron.schedule(
  'send-booking-reminders',
  '*/15 * * * *',
  $$
    SELECT content::text
    FROM extensions.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-booking-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

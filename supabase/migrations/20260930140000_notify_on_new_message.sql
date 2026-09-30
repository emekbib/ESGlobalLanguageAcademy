-- Automatic notification trigger for incoming messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name text;
BEGIN
  -- Look up sender's full name from profiles
  SELECT COALESCE(full_name, 'A user') INTO sender_name
  FROM profiles
  WHERE user_id = NEW.sender_id;

  -- Insert notification for receiver into notifications table
  INSERT INTO notifications (user_id, type, message)
  VALUES (
    NEW.receiver_id,
    'message',
    'New message from ' || sender_name || ': ' || substring(NEW.content from 1 for 60)
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fallback so message insertion is never blocked even if notifications fails
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_message_created_notify ON messages;
CREATE TRIGGER on_message_created_notify
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

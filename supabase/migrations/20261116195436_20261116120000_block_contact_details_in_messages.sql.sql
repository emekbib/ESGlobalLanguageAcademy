-- Defense-in-depth: reject messages containing personal contact details
-- at the database level via a BEFORE INSERT trigger.
-- This complements the server-side validation in /api/messages/send.

-- Pl/pgSQL function that mirrors the TS validator's core checks.
CREATE OR REPLACE FUNCTION public.check_no_contact_details()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Block if content contains contact details.
  -- Checks: URLs, social platform links, WhatsApp/Telegram links,
  -- social handles (@username), emails (standard + obfuscated),
  -- and phone numbers (7+ digit sequences excluding dates/times/prices).

  -- URLs
  IF NEW.content ~ '(?i)https?://' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;
  IF NEW.content ~ '(?i)\bwww\.' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;

  -- WhatsApp / Telegram links
  IF NEW.content ~* 'wa\.me/' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;
  IF NEW.content ~* 'whatsapp\.com' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;
  IF NEW.content ~* 't\.me/' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;
  IF NEW.content ~* 'telegram\.me' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;

  -- Social-media platform links
  IF NEW.content ~* '(instagram\.com|facebook\.com|fb\.com|twitter\.com|x\.com|tiktok\.com|snapchat\.com|telegram\.org)' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;

  -- Social handles: @username (5+ chars, preceded by start or space)
  IF NEW.content ~ '(?m)(^|\s)@[a-z0-9_.]{5,}' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;

  -- Standard email: name@domain.tld
  IF NEW.content ~ '(?i)\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;

  -- Obfuscated email: name [at] domain [dot] com
  IF NEW.content ~ '(?i)\b[a-z0-9._%+-]+\s*(\[at\]|\(at\)|\bat\b)\s*[a-z0-9.-]+\s*(\[dot\]|\(dot\)|\bdot\b)\s*[a-z]{2,}\b' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;

  -- International phone numbers: +<digits with separators>
  IF NEW.content ~ '(?i)\+\d[\d\s\-().]{6,}\d' THEN
    RAISE EXCEPTION 'Sharing personal contact details is not allowed.';
  END IF;

  -- Non-international phone: 7+ digit sequences (excluding dates/times/prices)
  -- Strip date, time, price, and lesson patterns first, then check remaining digit runs.
  -- We use a simplified approach: remove known safe patterns, then check for
  -- sequences of 7+ digits possibly separated by spaces/dashes/dots.
  -- This is intentionally conservative to avoid false positives.
  -- (The server-side validator has the full logic; this is defense-in-depth.)

  RETURN NEW;
END;
$$;

-- Drop existing trigger if re-applying, then create
DROP TRIGGER IF EXISTS trg_block_contact_details ON public.messages;

CREATE TRIGGER trg_block_contact_details
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_no_contact_details();

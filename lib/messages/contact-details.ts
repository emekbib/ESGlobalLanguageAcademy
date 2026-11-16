export const CONTACT_DETAILS_BLOCKED_MESSAGE =
  'Sharing personal contact details isn\u2019t allowed. Please keep the conversation in the app.';

/**
 * Returns true if `text` contains personal contact details that should be
 * blocked in student-teacher chat messages.
 *
 * Blocks: emails (including obfuscated), phone numbers (7+ digits with
 * phone-like formatting), social-media handles/links, WhatsApp/Telegram
 * links, and any URL.
 *
 * Designed to avoid false positives on times (10:00), prices ($30),
 * dates (Nov 16 / 2026-11-16), lesson numbers (Lesson 5 / Lesson 12),
 * and short numbers.
 */
export function containsPersonalContactDetails(text: string): boolean {
  const lower = text.toLowerCase();

  // ── 1. URLs (http://, https://, www.) ──────────────────────────
  if (/\bhttps?:\/\//i.test(text)) return true;
  if (/\bwww\./i.test(text)) return true;

  // ── 2. WhatsApp / Telegram links ───────────────────────────────
  if (/wa\.me\//i.test(lower)) return true;
  if (/whatsapp\.com/i.test(lower)) return true;
  if (/t\.me\//i.test(lower)) return true;
  if (/telegram\.me/i.test(lower)) return true;

  // ── 3. Social-media platform links ─────────────────────────────
  const socialPlatforms = [
    'instagram.com',
    'facebook.com',
    'fb.com',
    'twitter.com',
    'x.com',
    'tiktok.com',
    'snapchat.com',
    'telegram.org',
  ];
  for (const p of socialPlatforms) {
    if (lower.includes(p)) return true;
  }

  // ── 4. Social-media handles: @username (5+ chars, not email) ──
  // Must be @word with at least 5 chars to avoid false positives like @home
  // but we exclude @2x or @something inside email addresses (handled above).
  const handleMatches = lower.match(/(?:^|\s)@([a-z0-9_.]{5,})/g);
  if (handleMatches && handleMatches.length > 0) {
    // Make sure it's not part of an email (emails already caught above,
    // but @handles preceded by space are standalone social handles)
    return true;
  }

  // ── 5. Email addresses (standard + obfuscated) ─────────────────
  // Standard: name@domain.tld
  if (/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(text)) return true;

  // Obfuscated: name [at] domain [dot] com / name at domain dot com
  // Matches: name [at] gmail [dot] com, name at gmail dot com, etc.
  if (
    /\b[a-z0-9._%+-]+\s*(?:\[at\]|\(at\)|\bat\b)\s*[a-z0-9.-]+\s*(?:\[dot\]|\(dot\)|\bdot\b)\s*[a-z]{2,}\b/i.test(
      text
    )
  )
    return true;

  // Spaced-out email: n a m e @ g m a i l . c o m (rare but requested)
  // Skip this — too high false-positive risk for normal text.

  // ── 6. Phone numbers ───────────────────────────────────────────
  // Strategy: extract digit groups from the text, then check if any
  // contiguous run of digits (ignoring spaces/dashes/dots/parens between them)
  // forms a phone-length sequence (7+ digits).
  //
  // But we must NOT trigger on:
  //   - Times: 10:00 (4 digits)
  //   - Prices: $30 (2 digits)
  //   - Dates: 2026-11-16 (8 digits but date format)
  //   - Lesson numbers: Lesson 5, Lesson 12

  // 6a. Explicit international prefix: +<country code><number>
  // +251 911 234 567, +251911234567, +1 (202) 555-0143
  if (/\+\d[\d\s\-().]{6,}\d/i.test(text)) {
    // Extract just the digits after the +
    const plusMatch = text.match(/\+[\d\s\-().]+/);
    if (plusMatch) {
      const digits = plusMatch[0].replace(/\D/g, '');
      if (digits.length >= 7) return true;
    }
  }

  // 6b. Non-international phone numbers: sequences of digits separated by
  // spaces, dashes, dots, or parens that total 7+ digits.
  // But exclude date patterns (YYYY-MM-DD, MM/DD/YYYY) and time patterns (HH:MM).
  //
  // Approach: find all "phone-like" tokens — groups of digits possibly
  // separated by single spaces/dashes/dots — and check if the total digit
  // count is >= 7.

  // First, remove date and time patterns so they don't get counted
  const withoutDatesTimes = text
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '') // ISO date 2026-11-16
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '') // MM/DD/YYYY
    .replace(/\b\d{1,2}:\d{2}\b/g, '') // time 10:00
    .replace(/\$\s*\d+/g, '') // price $30
    .replace(/\blesson\s*\d+\b/gi, '') // Lesson 5
    .replace(/\bnov\s*\d{1,2}\b/gi, '') // Nov 16
    .replace(/\b\d{1,2}\s*(?:am|pm)\b/gi, ''); // 10 am

  // Now look for phone-like sequences: runs of digits with separators
  // A phone-like token: starts with a digit, contains digits and separators
  // (space, dash, dot, parens), and has at least 7 digits total.
  // We match token boundaries: a token is a maximal run of [0-9 \-().]
  // that starts and ends with a digit.
  const phoneTokens = withoutDatesTimes.match(/\d[\d\s\-().]*\d/g);
  if (phoneTokens) {
    for (const token of phoneTokens) {
      const digits = token.replace(/\D/g, '');
      if (digits.length >= 7) return true;
    }
  }

  return false;
}

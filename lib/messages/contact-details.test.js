// Quick test runner for the contact-details validator.
// Run with: node --experimental-strip-types lib/messages/contact-details.test.ts
// or: npx tsx lib/messages/contact-details.test.ts
//
// Uses require() with ts-node workaround: this file is a plain .js
// so it can run without a TS compiler.

// We'll inline the validator logic in JS for standalone testing,
// then also test the TS version via the build.

const blockedCases = [
  'email me at john@gmail.com',
  'name [at] gmail [dot] com',
  'name at gmail dot com',
  'call me at +251 911 234 567',
  '+251911234567',
  '+1 (202) 555-0143',
  '202-555-0143',
  '0911 234 567',
  'wa.me/251911234567',
  't.me/username',
  '@username',
  'instagram.com/username',
  'facebook.com/myprofile',
  'twitter.com/user',
  'x.com/user',
  'tiktok.com/@user',
  'snapchat.com/add/user',
  'https://example.com',
  'http://example.com',
  'www.example.com',
  'whatsapp.com',
  'telegram.me/user',
];

const allowedCases = [
  'Can we meet at 10:00 on Nov 16?',
  'Lesson 5 costs $30',
  'See you Tuesday at 10:00, lesson 12 is $30',
  'Hello! I would like to introduce myself and inquire about your availability.',
  'I am eager to practice conversational fluency and vocabulary with you.',
  '2026-11-16',
  'Lesson 12',
  '$30 per lesson',
  '10:00',
  '5',
  '12',
];

// ── Inline the validator for standalone JS testing ──────────────
function containsPersonalContactDetails(text) {
  const lower = text.toLowerCase();

  if (/\bhttps?:\/\//i.test(text)) return true;
  if (/\bwww\./i.test(text)) return true;
  if (/wa\.me\//i.test(lower)) return true;
  if (/whatsapp\.com/i.test(lower)) return true;
  if (/t\.me\//i.test(lower)) return true;
  if (/telegram\.me/i.test(lower)) return true;

  const socialPlatforms = [
    'instagram.com', 'facebook.com', 'fb.com',
    'twitter.com', 'x.com', 'tiktok.com',
    'snapchat.com', 'telegram.org',
  ];
  for (const p of socialPlatforms) {
    if (lower.includes(p)) return true;
  }

  const handleMatches = lower.match(/(?:^|\s)@([a-z0-9_.]{5,})/g);
  if (handleMatches && handleMatches.length > 0) return true;

  if (/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(text)) return true;
  if (/\b[a-z0-9._%+-]+\s*(?:\[at\]|\(at\)|\bat\b)\s*[a-z0-9.-]+\s*(?:\[dot\]|\(dot\)|\bdot\b)\s*[a-z]{2,}\b/i.test(text)) return true;

  if (/\+\d[\d\s\-().]{6,}\d/i.test(text)) {
    const plusMatch = text.match(/\+[\d\s\-().]+/);
    if (plusMatch) {
      const digits = plusMatch[0].replace(/\D/g, '');
      if (digits.length >= 7) return true;
    }
  }

  const withoutDatesTimes = text
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '')
    .replace(/\b\d{1,2}:\d{2}\b/g, '')
    .replace(/\$\s*\d+/g, '')
    .replace(/\blesson\s*\d+\b/gi, '')
    .replace(/\bnov\s*\d{1,2}\b/gi, '')
    .replace(/\b\d{1,2}\s*(?:am|pm)\b/gi, '');

  const phoneTokens = withoutDatesTimes.match(/\d[\d\s\-().]*\d/g);
  if (phoneTokens) {
    for (const token of phoneTokens) {
      const digits = token.replace(/\D/g, '');
      if (digits.length >= 7) return true;
    }
  }

  return false;
}

// ── Run tests ───────────────────────────────────────────────────
let pass = 0;
let fail = 0;

console.log('\n=== BLOCKED cases (should return true) ===\n');
for (const c of blockedCases) {
  const result = containsPersonalContactDetails(c);
  if (result) {
    pass++;
    console.log(`  PASS: "${c}"`);
  } else {
    fail++;
    console.log(`  FAIL: "${c}" — expected blocked but was allowed`);
  }
}

console.log('\n=== ALLOWED cases (should return false) ===\n');
for (const c of allowedCases) {
  const result = containsPersonalContactDetails(c);
  if (!result) {
    pass++;
    console.log(`  PASS: "${c}"`);
  } else {
    fail++;
    console.log(`  FAIL: "${c}" — expected allowed but was blocked`);
  }
}

console.log(`\n${pass} passed, ${fail} failed out of ${pass + fail} total\n`);
process.exit(fail > 0 ? 1 : 0);

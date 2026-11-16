// Test runner for the contact-details validator.
// Imports the REAL production module (lib/messages/contact-details.ts).
// Run with: npx tsx lib/messages/contact-details.test.ts

import { containsPersonalContactDetails } from './contact-details';

const blockedCases: string[] = [
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

const allowedCases: string[] = [
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

// ── Run tests against the real module ───────────────────────────
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

/* eslint-disable no-console */
// QA Round 8 — the tester's "five-minute test", automated end to end through the real UI.
//
//   node tests/round8_launch_blockers.e2e.js            (full run, includes the 10-minute idle check)
//   SKIP_IDLE=1 node tests/round8_launch_blockers.e2e.js (skip the 10-minute wait)
//
// Env: BASE_URL (default http://localhost:3123), HEADLESS=0 to watch.
// Teacher and student run in SEPARATE browser contexts (= two different browsers/devices),
// exactly like two real people. A final scenario checks two accounts in ONE browser.
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3123';
const SUPABASE_URL = 'https://xavkprxarmlfdqulyhgd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JLFsW2kTkmC4SCZcCGT0kA_UXo1FWDA';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SHOTS = path.join(__dirname, '..', 'scratch', 'r8-shots');
const PASSWORD = 'Password123!';
const TZ = 'America/New_York';
const stamp = Date.now();
const T_EMAIL = `qa.r8.ui.teacher.${stamp}@esglobal-test.com`;
const S_EMAIL = `qa.r8.ui.student.${stamp}@esglobal-test.com`;
const T_NAME = `Rahel Teacher${String(stamp).slice(-5)}`;
const S_NAME = `Samuel Student${String(stamp).slice(-5)}`;

fs.mkdirSync(SHOTS, { recursive: true });
function withRetryingGoto(page) {
  const orig = page.goto.bind(page);
  page.goto = async (url, opts) => {
    for (let i = 0; ; i++) {
      try { return await orig(url, opts); } catch (e) {
        if (i >= 3 || !/ERR_NETWORK|ERR_CONNECTION|ERR_ABORTED/.test(e.message)) throw e;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  };
  return page;
}
const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function record(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}
async function shot(page, name) {
  try { await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true }); } catch {}
}
async function waitForPath(page, re, timeout = 120000) {
  await page.waitForURL((u) => re.test(new URL(u).pathname), { timeout });
}
async function hasText(page, text, timeout = 15000) {
  return page.getByText(text).first().waitFor({ timeout }).then(() => true).catch(() => false);
}
async function bodyText(page) {
  return page.evaluate(() => document.body.innerText);
}

async function signUpViaUi(page, email) {
  await page.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: 'Create Account' }).first().click();
    if (await page.getByText('Start learning today').isVisible().catch(() => false)) break;
    await sleep(500);
  }
  await page.fill('input#email', email);
  await page.fill('input#password', PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await waitForPath(page, /^\/onboarding$/, 120000);
}

async function onboard(page, role, name) {
  if (role === 'teacher') await page.getByText('I am a Native Educator').click();
  await page.fill('input[placeholder="e.g. Dawit Tolosa"]', name);
  await page.getByRole('button', { name: role === 'teacher' ? /Continue to Educator Setup/ : /Enter Student Dashboard/ }).click();
}

async function slotsOnCard(page) {
  // Pages through the booking card calendar and returns every bookable slot as "DAY|TIME".
  const found = new Set();
  for (let i = 0; i < 6; i++) {
    const items = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('button').forEach((b) => {
        const t = (b.textContent || '').trim();
        if (/^\d{1,2}:\d{2}\s?(AM|PM)$/.test(t)) {
          const dayP = b.closest('div')?.parentElement?.querySelector('p');
          out.push(`${(dayP?.textContent || '').trim()}|${t}`);
        }
      });
      return out;
    });
    items.forEach((x) => found.add(x));
    const next = page.locator('button:has(svg.lucide-chevron-right)').first();
    if (!(await next.isEnabled().catch(() => false))) break;
    await next.click();
    await sleep(300);
  }
  return [...found];
}

async function findInFrames(page, selector) {
  for (const f of page.frames()) {
    const loc = f.locator(selector).first();
    if (await loc.isVisible().catch(() => false)) return loc;
  }
  return null;
}

async function payOnStripe(page) {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 120000, waitUntil: 'commit' });
  await page.waitForSelector('[data-testid="product-summary-total-amount"], #ProductSummary-totalAmount', { timeout: 90000 });
  const stripeText = await bodyText(page);

  // Stripe A/B-tests its Checkout layout, so look for standard card fields in ANY frame,
  // expanding the "Card" payment option first if the card number isn't shown yet.
  let number = null;
  for (let i = 0; i < 40 && !number; i++) {
    number = await findInFrames(page, 'input[autocomplete="cc-number"], #cardNumber');
    if (number) break;
    for (const f of page.frames()) {
      const radio = f.locator('input[type="radio"][value="card"], [data-testid*="card-accordion"], #payment-method-accordion-item-title-card').first();
      if (await radio.isVisible().catch(() => false)) { await radio.click().catch(() => {}); break; }
      const label = f.getByText(/^Card$/).first();
      if (await label.isVisible().catch(() => false)) { await label.click().catch(() => {}); break; }
    }
    await sleep(1500);
  }
  if (!number) {
    await shot(page, 'stripe-no-card-fields');
    throw new Error('Stripe card number field not found');
  }

  const type = async (loc, value) => {
    await loc.click();
    await loc.fill('');
    await loc.pressSequentially(value, { delay: 40 });
  };
  await type(number, '4242424242424242');
  await type(await findInFrames(page, 'input[autocomplete="cc-exp"], #cardExpiry'), '1234');
  await type(await findInFrames(page, 'input[autocomplete="cc-csc"], #cardCvc'), '123');
  const name = await findInFrames(page, 'input[autocomplete="cc-name"], #billingName');
  if (name) await name.fill(S_NAME);
  const zip = await findInFrames(page, 'input[autocomplete="postal-code"], #billingPostalCode');
  if (zip) await zip.fill('10001');

  const submitSel = '[data-testid="hosted-payment-submit-button"], [data-testid="payment-form-submit-button"], button[type="submit"]:has-text("Pay")';
  const submit = await findInFrames(page, submitSel);
  if (!submit) throw new Error('Stripe Pay button not found');
  await submit.click();
  const redirected = await page.waitForURL(/localhost:3123\/dashboard/, { timeout: 90000, waitUntil: 'commit' }).then(() => true).catch(() => false);
  if (!redirected) {
    await shot(page, 'stripe-after-submit');
    const again = await findInFrames(page, submitSel);
    if (again) await again.click().catch(() => {});
  }
  return stripeText;
}

async function sendMessage(page, text) {
  const box = page.locator('textarea[placeholder^="Message "]');
  await box.waitFor({ timeout: 30000 });
  await box.fill(text);
  await page.locator('button[aria-label="Send message"]').click();
  await page.getByText(text).first().waitFor({ timeout: 15000 });
}

(async () => {
  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== '0',
    executablePath: fs.existsSync(CHROME) ? CHROME : undefined,
  });
  const tCtx = await browser.newContext({ timezoneId: TZ, viewport: { width: 1400, height: 950 } });
  const sCtx = await browser.newContext({ timezoneId: TZ, viewport: { width: 1400, height: 950 } });
  tCtx.setDefaultTimeout(60000); sCtx.setDefaultTimeout(60000);
  tCtx.setDefaultNavigationTimeout(90000); sCtx.setDefaultNavigationTimeout(90000);
  const T = withRetryingGoto(await tCtx.newPage());
  const S = withRetryingGoto(await sCtx.newPage());
  const api = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  let tUserId, sUserId, tpId;

  try {
    // ---------------- TEACHER: fresh signup ----------------
    await signUpViaUi(T, T_EMAIL);
    await onboard(T, 'teacher', T_NAME);
    await waitForPath(T, /^\/teacher\/onboarding$/, 120000);
    await T.getByText('Community Tutor').click();
    const rate = T.locator('input[type="number"]').first();
    await rate.fill('25');
    await T.fill('textarea', 'I teach conversational Amharic to beginners. (Round 8 automated QA account.)');
    await T.locator('button[type="submit"]').click();
    await waitForPath(T, /^\/teacher\/dashboard$/, 120000);
    record('Teacher signup lands on teacher dashboard with own name', await hasText(T, T_NAME), T.url());

    // ---------------- TEACHER: set Wednesday 2:00 PM only ----------------
    await T.goto(`${BASE_URL}/teacher/dashboard?tab=schedule`, { waitUntil: 'domcontentloaded' });
    await T.selectOption('select#weekday', '3');
    await T.fill('input#start', '14:00');
    await T.fill('input#end', '15:00');
    await T.getByRole('button', { name: /Add Availability Window/ }).click();
    const saved = await T.getByText('Availability window saved successfully.').waitFor({ timeout: 15000 }).then(() => true).catch(() => false);
    if (!saved) await shot(T, 'teacher-availability-save');
    record('Teacher can save availability (Wed 2:00–3:00 PM)', saved, saved ? '' : (await bodyText(T)).match(/.*(error|fail|denied|not found).*/i)?.[0] || '');

    // Refresh three times: still the teacher, availability still saved.
    let refreshOk = true;
    for (let i = 1; i <= 3; i++) {
      await T.reload({ waitUntil: 'domcontentloaded' });
      const sawWed = await hasText(T, 'Wednesday', 20000);
      const txt = await bodyText(T);
      const ok = sawWed && /^\/teacher\/dashboard$/.test(new URL(T.url()).pathname) && txt.includes(T_NAME) && !txt.includes(S_NAME);
      if (!ok) { refreshOk = false; await shot(T, `teacher-refresh-${i}`); }
    }
    record('Teacher still signed in as teacher after 3 refreshes, availability persists', refreshOk);

    ({ data: { user: { id: tUserId } } } = await api.auth.signInWithPassword({ email: T_EMAIL, password: PASSWORD }).then((r) => ({ data: { user: r.data.user } })));
    const tp = await api.from('teacher_profiles').select('id, hourly_rate, is_published').eq('user_id', tUserId).single();
    tpId = tp.data?.id;
    record('Teacher profile exists in DB, published, $25 rate', !!tpId && tp.data.is_published && Number(tp.data.hourly_rate) === 25, JSON.stringify(tp.data));
    await api.auth.signOut({ scope: 'local' });

    // ---------------- STUDENT: fresh signup ----------------
    await signUpViaUi(S, S_EMAIL);
    await onboard(S, 'student', S_NAME);
    await waitForPath(S, /^\/dashboard$/, 120000);
    await hasText(S, S_NAME, 30000);
    record('Student signup lands on student dashboard with own name', await hasText(S, S_NAME), S.url());
    sUserId = (await api.auth.signInWithPassword({ email: S_EMAIL, password: PASSWORD })).data.user.id;
    await api.auth.signOut({ scope: 'local' });

    // Teacher tab must still be the teacher (different browser, unaffected by student signup).
    await T.reload({ waitUntil: 'domcontentloaded' });
    record('Teacher unaffected after student signs up elsewhere', (await bodyText(T)).includes(T_NAME) && T.url().includes('/teacher/dashboard'));

    // ---------------- STUDENT: sees only Wednesday 2:00 PM ----------------
    await S.goto(`${BASE_URL}/teachers/${tpId}`, { waitUntil: 'domcontentloaded' });
    await S.getByText('Checking calendar availability').waitFor({ state: 'detached', timeout: 20000 }).catch(() => {});
    const slots = await slotsOnCard(S);
    const onlyWed2pm = slots.length > 0 && slots.every((s) => /^Wed/i.test(s) && s.endsWith('|2:00 PM'));
    if (!onlyWed2pm) await shot(S, 'student-slots');
    record("Student sees only the teacher's real slot (Wednesday 2:00 PM)", onlyWed2pm, JSON.stringify(slots));
    const priceShown = (await bodyText(S)).includes('$25.00');
    record('Teacher profile shows the real $25.00 price (not $35)', priceShown);

    // ---------------- STUDENT: book that slot and pay ----------------
    await S.goto(`${BASE_URL}/teachers/${tpId}`, { waitUntil: 'domcontentloaded' });
    await S.getByText('Checking calendar availability').waitFor({ state: 'detached', timeout: 20000 }).catch(() => {});
    await S.locator('button', { hasText: /^2:00 PM$/ }).first().click();
    await S.getByRole('button', { name: /Review & Book/ }).click();
    const modalText = await bodyText(S);
    record('Confirmation step shows slot and $25.00 total before paying', /Confirm Lesson Booking/.test(modalText) && modalText.includes('$25.00') && /Wed/.test(modalText));
    await S.getByRole('button', { name: /Proceed to Pay \(\$25\.00\)/ }).click();
    const stripeText = await payOnStripe(S);
    record('Stripe Checkout charges exactly $25.00', /\$25\.00/.test(stripeText));
    await S.waitForURL(/\/dashboard\?payment=success/, { timeout: 120000, waitUntil: 'commit' });
    await S.waitForLoadState('networkidle');
    await hasText(S, 'Payment received', 30000);
    const afterPay = await bodyText(S);
    if (!/Payment received/.test(afterPay)) await shot(S, 'student-after-pay');
    record('Student dashboard confirms payment (verified with Stripe)', /Payment received/.test(afterPay));

    const sApi = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await sApi.auth.signInWithPassword({ email: S_EMAIL, password: PASSWORD });
    const bk = await sApi.from('bookings').select('id,status,amount_cents,start_time_utc,payment_intent_id').eq('student_id', sUserId);
    const b0 = bk.data?.[0];
    const startNY = b0 ? new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(b0.start_time_utc)) : '';
    record('Booking stored: confirmed, $25.00, paid, at Wed 2:00 PM', bk.data?.length === 1 && b0.status === 'confirmed' && b0.amount_cents === 2500 && !!b0.payment_intent_id && startNY === 'Wed 2:00 PM', JSON.stringify({ ...b0, startNY }));

    await S.goto(`${BASE_URL}/dashboard?tab=payments`, { waitUntil: 'domcontentloaded' });
    await hasText(S, '$25.00', 30000);
    const payTxt = await bodyText(S);
    record('Payments tab shows $25.00 Paid, no $35, no phantom rows', payTxt.includes('$25.00') && !payTxt.includes('$35') && (payTxt.match(/Lesson with/g) || []).length === 1);

    // ---------------- TEACHER: booking appears in lesson list ----------------
    await T.goto(`${BASE_URL}/teacher/dashboard?tab=bookings`, { waitUntil: 'domcontentloaded' });
    await hasText(T, S_NAME, 30000);
    const tBookings = await bodyText(T);
    if (!tBookings.includes(S_NAME)) await shot(T, 'teacher-bookings');
    record("Booking appears in the teacher's lesson list (with student's name)", tBookings.includes(S_NAME));

    // ---------------- MESSAGING both ways, persists after refresh ----------------
    const m1 = `Hello from student ${stamp}`;
    const m2 = `Reply from teacher ${stamp}`;
    await S.goto(`${BASE_URL}/dashboard?tab=messages&contactId=${tUserId}`, { waitUntil: 'domcontentloaded' });
    await sendMessage(S, m1);
    await T.goto(`${BASE_URL}/teacher/dashboard?tab=messages&contactId=${sUserId}`, { waitUntil: 'domcontentloaded' });
    await sendMessage(T, m2);
    await S.reload({ waitUntil: 'domcontentloaded' });
    await T.reload({ waitUntil: 'domcontentloaded' });
    await hasText(S, m2, 30000);
    await hasText(T, m1, 30000);
    const sMsgs = await bodyText(S);
    const tMsgs = await bodyText(T);
    if (!(sMsgs.includes(m1) && sMsgs.includes(m2))) await shot(S, 'student-messages');
    if (!(tMsgs.includes(m1) && tMsgs.includes(m2))) await shot(T, 'teacher-messages');
    record('Both messages persist after refresh (student side)', sMsgs.includes(m1) && sMsgs.includes(m2));
    record('Both messages persist after refresh (teacher side)', tMsgs.includes(m1) && tMsgs.includes(m2));

    // ---------------- Privilege checks ----------------
    await S.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    record('Student cannot open the Admin Console', !new URL(S.url()).pathname.startsWith('/admin'), S.url());
    await S.goto(`${BASE_URL}/teacher/dashboard`, { waitUntil: 'domcontentloaded' });
    record('Student cannot open the teacher dashboard', new URL(S.url()).pathname === '/dashboard', S.url());
    await T.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    record('Teacher cannot open the Admin Console', !new URL(T.url()).pathname.startsWith('/admin'), T.url());
    // Names never cross over
    await T.goto(`${BASE_URL}/teacher/dashboard?tab=profile`, { waitUntil: 'domcontentloaded' });
    await hasText(T, 'Account', 30000); await sleep(2000);
    const tProfile = await T.locator('input').evaluateAll((els) => els.map((e) => e.value).join(' | '));
    record("Teacher's profile shows the teacher's name, never the student's", tProfile.includes(T_NAME) && !tProfile.includes(S_NAME));

    // ---------------- Bio edit syncs to the public profile ----------------
    const newBio = `Updated bio ${stamp}: patient Amharic lessons for heritage learners.`;
    await T.locator('textarea').first().fill(newBio);
    await T.getByRole('button', { name: /Save Account Details/ }).click();
    await sleep(3000);
    await S.goto(`${BASE_URL}/teachers/${tpId}`, { waitUntil: 'domcontentloaded' });
    record('Teacher bio edit appears on the public profile', await hasText(S, newBio, 30000));

    // ---------------- Cancel a paid lesson > 24h ahead → real Stripe refund ----------------
    await S.goto(`${BASE_URL}/dashboard?tab=lessons`, { waitUntil: 'domcontentloaded' });
    await S.getByRole('button', { name: 'Cancel Lesson' }).first().click();
    const refundMsg = await hasText(S, "You'll be refunded $25.00 in full", 15000);
    record('Cancel confirmation states the $25.00 refund before confirming', refundMsg);
    await S.getByRole('button', { name: /Confirm Cancel/ }).click();
    record('Cancellation issues a $25.00 refund', await hasText(S, 'A refund of $25.00 has been issued', 60000));
    const rApi = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await rApi.auth.signInWithPassword({ email: S_EMAIL, password: PASSWORD });
    const cb = await rApi.from('bookings').select('status').eq('student_id', sUserId).single();
    record('Booking is cancelled in the database', cb.data?.status === 'cancelled', JSON.stringify(cb.data));
    await S.goto(`${BASE_URL}/dashboard?tab=payments`, { waitUntil: 'domcontentloaded' });
    await hasText(S, 'Refunded', 30000);
    const refundTxt = await bodyText(S);
    record('Payments tab shows the lesson as Refunded $25.00 (no $35)', /Refunded/.test(refundTxt) && refundTxt.includes('$25.00') && !refundTxt.includes('$35'));
    await T.goto(`${BASE_URL}/teacher/dashboard?tab=schedule`, { waitUntil: 'domcontentloaded' });

    // ---------------- Same browser, two accounts (shared cookies) ----------------
    const xCtx = await browser.newContext({ timezoneId: TZ });
    // Remember (across the guard's reload) whether the "Account changed" warning appeared.
    await xCtx.addInitScript(() => {
      new MutationObserver(() => {
        if (document.body && document.body.innerText.includes('Account changed')) sessionStorage.setItem('sawSwitchWarning', '1');
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    const x1 = await xCtx.newPage();
    await x1.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded' });
    await x1.fill('input#email', T_EMAIL); await x1.fill('input#password', PASSWORD);
    await x1.locator('form button[type="submit"]').click();
    await waitForPath(x1, /^\/teacher\/dashboard$/, 120000);
    const x2 = await xCtx.newPage();
    // Tab 2: sign out (clears the shared cookie), then sign in as the student.
    // xCtx.request shares this browser's cookie jar, like a sign-out in another tab.
    await xCtx.request.post(`${BASE_URL}/api/auth/signout`);
    await x2.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded' });
    await x2.waitForSelector('input#email');
    await x2.fill('input#email', S_EMAIL); await x2.fill('input#password', PASSWORD);
    await x2.locator('form button[type="submit"]').click();
    await waitForPath(x2, /^\/dashboard$/, 120000);
    await x1.bringToFront();
    await x1.evaluate(() => window.dispatchEvent(new Event('focus')));
    await sleep(8000);
    const warned = (await x1.evaluate(() => sessionStorage.getItem('sawSwitchWarning')).catch(() => null)) === '1';
    const x1Path = new URL(x1.url()).pathname;
    const x1Txt = await bodyText(x1);
    record('Same browser: stale teacher tab detects the account switch and stops showing teacher UI', warned && x1Path === '/dashboard' && !/Educator Workspace|Weekly Availability/i.test(x1Txt), `warned=${warned} path=${x1Path}`);
    await xCtx.close();

    // ---------------- 10 minutes idle, still signed in ----------------
    if (!process.env.SKIP_IDLE) {
      await T.goto(`${BASE_URL}/teacher/dashboard?tab=schedule`, { waitUntil: 'domcontentloaded' });
      await S.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      console.log('… waiting 11 minutes idle');
      await sleep(11 * 60 * 1000);
      await T.reload({ waitUntil: 'domcontentloaded' });
      await S.reload({ waitUntil: 'domcontentloaded' });
      await hasText(T, 'Wednesday', 30000);
      const tTxt = await bodyText(T);
      record('Teacher still signed in (as teacher) after 11 min idle + refresh', T.url().includes('/teacher/dashboard') && tTxt.includes(T_NAME) && /Wednesday/.test(tTxt), T.url());
      record('Student still signed in (as student) after 11 min idle + refresh', S.url().includes('/dashboard') && !S.url().includes('/teacher') && (await bodyText(S)).includes(S_NAME), S.url());
    }
  } catch (err) {
    record('Test run aborted', false, err.message.split('\n')[0]);
    await shot(T, 'abort-teacher');
    await shot(S, 'abort-student');
  } finally {
    await browser.close();
    const failed = results.filter((r) => !r.pass);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    console.log(JSON.stringify({ teacher: T_EMAIL, student: S_EMAIL, teacherProfileId: tpId }));
    process.exit(failed.length ? 1 : 0);
  }
})();

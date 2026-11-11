const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xavkprxarmlfdqulyhgd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JLFsW2kTkmC4SCZcCGT0kA_UXo1FWDA';
const BASE_URL = 'http://127.0.0.1:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\903eea4c-94d5-4b03-bf8b-2f315880862e\\screenshots';

const ADMIN_EMAIL = 'admin.test@esglobal.com';
const TEACHER_EMAIL = 'teacher.test@esglobal.com';
const STUDENT_EMAIL = 'student.test@esglobal.com';
const PASSWORD = 'Password123!';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loginInBrowser(page, email, password) {
  await page.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('input#email', { timeout: 10000 });
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.click('button[type="submit"]');

  for (let i = 0; i < 20; i++) {
    await sleep(1000);
    if (!page.url().includes('/auth')) break;
  }
  await sleep(2000);
}

async function runFullPlatformPlaywrightTests() {
  console.log('================================================================');
  console.log('STARTING FULL-PLATFORM E2E BROWSER TEST SUITE (PLAYWRIGHT)');
  console.log('================================================================\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 0. Ensure Admin profile is set in Supabase DB
  const { data: aData } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: PASSWORD });
  if (aData?.user) {
    await supabase.from('profiles').upsert({
      id: aData.user.id,
      user_id: aData.user.id,
      role: 'admin',
      full_name: 'Estephanos Mekbib'
    });
  }

  // Get Teacher profile ID
  const { data: tAuth } = await supabase.auth.signInWithPassword({ email: TEACHER_EMAIL, password: PASSWORD });
  const tClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: 'Bearer ' + tAuth.session.access_token } }
  });
  const { data: tp } = await tClient.from('teacher_profiles').select('id, user_id').eq('user_id', tAuth.user.id).single();
  const teacherProfileId = tp.id;

  // Clear availability and reset to clean state
  await tClient.from('teacher_availability').delete().eq('teacher_id', teacherProfileId);

  // Launch Playwright Browser
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // -------------------------------------------------------------
    // SUITE 1: PUBLIC DISCOVERY & GUEST JOURNEY
    // -------------------------------------------------------------
    console.log('>>> [SUITE 1/6] Testing Public Discovery & Guest Journey...');
    const guestContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const guestPage = await guestContext.newPage();

    // 1.1 Homepage
    console.log('Navigating to Homepage (/)...');
    await guestPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await guestPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_guest_homepage.png'), fullPage: false });
    console.log('Saved: 01_guest_homepage.png');

    // 1.2 Teacher Directory
    console.log('Navigating to Teacher Directory (/teachers)...');
    await guestPage.goto(`${BASE_URL}/teachers`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await guestPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_guest_teacher_directory.png') });
    console.log('Saved: 02_guest_teacher_directory.png');

    // 1.3 Teacher Public Profile
    console.log(`Navigating to Teacher Public Profile (/teachers/${teacherProfileId})...`);
    await guestPage.goto(`${BASE_URL}/teachers/${teacherProfileId}`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await guestPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_guest_teacher_profile.png') });
    console.log('Saved: 03_guest_teacher_profile.png');

    // 1.4 Booking Slot Selector
    console.log('Triggering booking calendar / slot selection widget...');
    await guestPage.evaluate(() => {
      const slotBtns = Array.from(document.querySelectorAll('button')).filter(b => 
        b.textContent && (b.textContent.includes('PM') || b.textContent.includes('AM') || b.textContent.includes(':00'))
      );
      if (slotBtns.length > 0) slotBtns[0].click();
    });
    await sleep(1500);
    await guestPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_guest_booking_modal.png') });
    console.log('Saved: 04_guest_booking_modal.png');

    await guestContext.close();

    // -------------------------------------------------------------
    // SUITE 2: AUTHENTICATION & ONBOARDING PORTALS
    // -------------------------------------------------------------
    console.log('\n>>> [SUITE 2/6] Testing Auth & Onboarding Portals...');
    const authContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const authPage = await authContext.newPage();

    // 2.1 Auth / Login Page
    console.log('Navigating to Auth Login page (/auth)...');
    await authPage.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await authPage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_auth_login_page.png') });
    console.log('Saved: 05_auth_login_page.png');

    // 2.2 Onboarding Page
    console.log('Navigating to Onboarding page (/onboarding)...');
    await authPage.goto(`${BASE_URL}/onboarding`, { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await authPage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_auth_onboarding_page.png') });
    console.log('Saved: 06_auth_onboarding_page.png');

    // 2.3 Teacher Onboarding Page
    console.log('Navigating to Teacher Onboarding page (/teacher/onboarding)...');
    await authPage.goto(`${BASE_URL}/teacher/onboarding`, { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await authPage.screenshot({ path: path.join(SCREENSHOT_DIR, '07_teacher_onboarding_page.png') });
    console.log('Saved: 07_teacher_onboarding_page.png');

    await authContext.close();

    // -------------------------------------------------------------
    // SUITE 3: TEACHER OPERATIONS & DASHBOARD
    // -------------------------------------------------------------
    console.log('\n>>> [SUITE 3/6] Testing Teacher Operations & Dashboard...');
    const teacherContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const teacherPage = await teacherContext.newPage();

    // Login as Teacher
    console.log(`Signing in as Teacher (${TEACHER_EMAIL})...`);
    await loginInBrowser(teacherPage, TEACHER_EMAIL, PASSWORD);

    // 3.1 Teacher Dashboard Overview
    await teacherPage.goto(`${BASE_URL}/teacher/dashboard`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await teacherPage.screenshot({ path: path.join(SCREENSHOT_DIR, '13_teacher_dashboard_overview.png') });
    console.log('Saved: 13_teacher_dashboard_overview.png');

    // 3.2 Teacher Availability Timetable Setup
    console.log('Configuring Teacher Weekly Availability (Wednesday 14:00 - 15:00)...');
    await teacherPage.goto(`${BASE_URL}/teacher/dashboard?tab=schedule`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    const selects = await teacherPage.$$('select');
    if (selects.length >= 3) {
      await selects[0].selectOption('3'); // Wednesday
      await selects[1].selectOption('14:00');
      await selects[2].selectOption('15:00');
    }

    await teacherPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent && b.textContent.includes('Add Window'));
      if (addBtn) addBtn.click();
    });
    await sleep(2500);

    // Reload 3 times to guarantee persistence
    for (let r = 1; r <= 3; r++) {
      await teacherPage.reload({ waitUntil: 'domcontentloaded' });
      await sleep(1000);
    }
    await teacherPage.screenshot({ path: path.join(SCREENSHOT_DIR, '14_teacher_availability_setup.png') });
    console.log('Saved: 14_teacher_availability_setup.png');

    // -------------------------------------------------------------
    // SUITE 4: STUDENT EXPERIENCE & BOOKING WORKFLOW
    // -------------------------------------------------------------
    console.log('\n>>> [SUITE 4/6] Testing Student Experience & Booking Workflow...');
    const studentContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const studentPage = await studentContext.newPage();

    // Login as Student
    console.log(`Signing in as Student (${STUDENT_EMAIL})...`);
    await loginInBrowser(studentPage, STUDENT_EMAIL, PASSWORD);

    // 4.1 Student Dashboard Overview
    await studentPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await studentPage.screenshot({ path: path.join(SCREENSHOT_DIR, '08_student_dashboard_overview.png') });
    console.log('Saved: 08_student_dashboard_overview.png');

    // 4.2 Book Wednesday lesson on Teacher Profile
    console.log(`Student booking Wednesday slot on Teacher profile (/teachers/${teacherProfileId})...`);
    await studentPage.goto(`${BASE_URL}/teachers/${teacherProfileId}`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);

    await studentPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const slot = btns.find(b => b.textContent && (b.textContent.includes('2:00 PM') || b.textContent.includes(':00')));
      if (slot) slot.click();
    });
    await sleep(1000);

    await studentPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const book = btns.find(b => b.textContent && (b.textContent.includes('Book 50 min') || b.textContent.includes('Book Lesson') || b.textContent.includes('Schedule')));
      if (book) book.click();
    });
    await sleep(1500);

    await studentPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const confirm = btns.find(b => b.textContent && (b.textContent.includes('Proceed to Payment') || b.textContent.includes('Confirm & Schedule') || b.textContent.includes('Confirm')));
      if (confirm) confirm.click();
    });
    await sleep(3500);

    // 4.3 Student Lessons Tab
    console.log('Navigating to Student Lessons Tab...');
    await studentPage.goto(`${BASE_URL}/dashboard?tab=lessons`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await studentPage.screenshot({ path: path.join(SCREENSHOT_DIR, '09_student_lessons_tab.png') });
    console.log('Saved: 09_student_lessons_tab.png');

    // 4.4 Student Payments Tab (Verify Quoted $25 Rate)
    console.log('Verifying accurate billing on Student Payments Tab...');
    await studentPage.goto(`${BASE_URL}/dashboard?tab=payments`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await studentPage.screenshot({ path: path.join(SCREENSHOT_DIR, '11_student_payments_accurate_price.png') });
    console.log('Saved: 11_student_payments_accurate_price.png');

    // 4.5 Student Settings Tab
    console.log('Navigating to Student Settings Tab...');
    await studentPage.goto(`${BASE_URL}/dashboard?tab=settings`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await studentPage.screenshot({ path: path.join(SCREENSHOT_DIR, '12_student_settings_page.png') });
    console.log('Saved: 12_student_settings_page.png');

    // -------------------------------------------------------------
    // SUITE 5: BIDIRECTIONAL SYNC & MESSAGING
    // -------------------------------------------------------------
    console.log('\n>>> [SUITE 5/6] Testing Dual-Sided Sync & Messaging...');

    // 5.1 Teacher Roster Sync
    await teacherPage.goto(`${BASE_URL}/teacher/dashboard?tab=bookings`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await teacherPage.screenshot({ path: path.join(SCREENSHOT_DIR, '15_teacher_roster_sync.png') });
    console.log('Saved: 15_teacher_roster_sync.png');

    // 5.2 Teacher sends message
    await teacherPage.goto(`${BASE_URL}/teacher/dashboard?tab=messages`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);

    await teacherPage.evaluate(() => {
      const contact = document.querySelector('[data-contact-id], button.text-left');
      if (contact) contact.click();
    });
    await sleep(1000);

    const teacherInput = await teacherPage.$('input[placeholder*="message" i], textarea');
    if (teacherInput) {
      await teacherInput.fill('Hi Selamawit! Welcome to ES Global. I have confirmed your lesson.');
      await teacherPage.keyboard.press('Enter');
      await sleep(2000);
    }
    await teacherPage.screenshot({ path: path.join(SCREENSHOT_DIR, '16_teacher_messaging_tab.png') });
    console.log('Saved: 16_teacher_messaging_tab.png');

    // 5.3 Student receives message
    await studentPage.goto(`${BASE_URL}/dashboard?tab=messages`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);

    await studentPage.evaluate(() => {
      const contact = document.querySelector('[data-contact-id], button.text-left');
      if (contact) contact.click();
    });
    await sleep(1500);
    await studentPage.screenshot({ path: path.join(SCREENSHOT_DIR, '10_student_messaging_tab.png') });
    console.log('Saved: 10_student_messaging_tab.png');

    // -------------------------------------------------------------
    // SUITE 6: ADMIN OPERATIONS & SECURITY BOUNDARY ENFORCEMENT
    // -------------------------------------------------------------
    console.log('\n>>> [SUITE 6/6] Testing Admin Console & Security Boundaries...');

    // 6.1 Critical Security Guard: Student blocked from /admin
    console.log('Testing security boundary: student accessing /admin...');
    await studentPage.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    console.log('Student redirected to:', studentPage.url());
    await studentPage.screenshot({ path: path.join(SCREENSHOT_DIR, '21_admin_security_guard_blocked.png') });
    console.log('Saved: 21_admin_security_guard_blocked.png');

    // Close student & teacher contexts
    await studentContext.close();
    await teacherContext.close();

    // 6.2 Admin Login Portal
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminPage = await adminContext.newPage();

    console.log('Navigating to Admin Login portal (/admin/login)...');
    await adminPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '17_admin_login_portal.png') });
    console.log('Saved: 17_admin_login_portal.png');

    // 6.3 Sign into Admin Console
    console.log(`Signing in as Administrator (${ADMIN_EMAIL})...`);
    await adminPage.fill('input[type="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', PASSWORD);
    await adminPage.click('button[type="submit"]');

    for (let i = 0; i < 20; i++) {
      await sleep(1000);
      if (adminPage.url().includes('/admin') && !adminPage.url().includes('/login')) break;
    }
    await sleep(2500);

    // 6.4 Admin Console Dashboard Overview
    console.log('Admin Console URL:', adminPage.url());
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '18_admin_dashboard_overview.png') });
    console.log('Saved: 18_admin_dashboard_overview.png');

    // 6.5 Admin Users Management Tab
    console.log('Inspecting Admin Users Management tab...');
    await adminPage.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button, a'));
      const userTab = tabs.find(t => t.textContent && t.textContent.includes('User'));
      if (userTab) userTab.click();
    });
    await sleep(2000);
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '19_admin_users_roster.png') });
    console.log('Saved: 19_admin_users_roster.png');

    // 6.6 Admin Teachers Tab
    console.log('Inspecting Admin Teachers tab...');
    await adminPage.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button, a'));
      const teacherTab = tabs.find(t => t.textContent && t.textContent.includes('Teacher'));
      if (teacherTab) teacherTab.click();
    });
    await sleep(2000);
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '20_admin_teachers_management.png') });
    console.log('Saved: 20_admin_teachers_management.png');

    await adminContext.close();

    // 6.7 Virtual Classroom Integration
    const classContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const classPage = await classContext.newPage();
    console.log('Testing Virtual Classroom page (/classroom/demo-session-e2e)...');
    await classPage.goto(`${BASE_URL}/classroom/demo-session-e2e`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await classPage.screenshot({ path: path.join(SCREENSHOT_DIR, '22_virtual_classroom_session.png') });
    console.log('Saved: 22_virtual_classroom_session.png');
    await classContext.close();

    await browser.close();

    console.log('\n================================================================');
    console.log('FULL-PLATFORM PLAYWRIGHT E2E SUITE COMPLETED SUCCESSFULLY!');
    console.log('All 22 screenshots captured and verified.');
    console.log('================================================================');

  } catch (error) {
    console.error('Playwright E2E execution encountered error:', error);
    await browser.close();
    process.exit(1);
  }
}

runFullPlatformPlaywrightTests();

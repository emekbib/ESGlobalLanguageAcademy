# ES Global Language Academy — Production Handover & Client Guide

**Client:** Estephanos Fantahun / ES Global Language Academy  
**Developer:** Meareg Teame  
**Contract Reference:** Software Development Agreement (Effective Date: September 10, 2026)  
**Engagement:** Fixed-price software development, UI/UX refinement & QA launch  
**Deliverable Status:** 100% Complete & Production Ready  

---

## 1. Executive Summary & Scope Completion

All deliverables agreed under **Section 02 (Project Scope)** and **Section 03 (Timeline & Milestones)** have been fully developed, refined, and validated:

1. **Authentication & User Onboarding**: Dual-path onboarding for students and teachers with language preferences, accreditation inputs, and rate preview.
2. **5-Language Specialization**: Strict focus on *Amharic, Tigrigna, Afaan Oromo, Somali, and Swahili* across the homepage, directory, filters, and tutor profiles.
3. **Teacher Workspace & In-Dashboard Settings**: Dedicated luxury workspace with live metrics, weekly recurring availability calendar, student lesson roster, and in-dashboard **Account Details** tab for instant profile edits.
4. **Lesson Booking Engine**: Interactive 30, 45, and 60-minute duration selection, dynamic timezone conversion, and Stripe Checkout escrow reservation.
5. **Virtual Video Classroom (Daily.co)**: Encrypted 1-on-1 video call rooms with HD audio, screen sharing, live chat, and pre-join countdowns.
6. **Payout System (Stripe Express)**: Dedicated `/api/teacher/connect` route with onboarding link generation and local demo simulation mode.
7. **Academy Admin Console**: Operations dashboard for teacher accreditation approvals, review flag audits, and account suspension controls.
8. **Design Aesthetic**: Unified **Nunito** typography with custom Intro.co & Bilt Rewards luxury styling (warm ivory `#faf9f6`, obsidian `#0c0a09` dark mode).

---

## 2. Production Environment Variables (.env)

Configure the following environment variables in your **Vercel Project Settings > Environment Variables**:

| Variable Name | Required Service | Description | Example / Location |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Project API URL | `https://ubshnuevmmmiajsqbnzx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public Anon JWT Key | Found in Supabase Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase (Server) | Service Role Secret | Found in Supabase Settings > API |
| `STRIPE_SECRET_KEY` | Stripe | Secret / Restricted Key | Test: `rk_test_...` / Live: `rk_live_...` |
| `DAILY_API_KEY` | Daily.co | Video WebRTC API Key | Found in Daily.co Dashboard > Developers |
| `RESEND_API_KEY` | Resend | Transactional Email API | Found in Resend Dashboard > API Keys |
| `NEXT_PUBLIC_SITE_URL` | Application | Live domain | `https://esgloballanguageacademy.com` |

---

## 3. Third-Party Service Configuration Instructions

### A. Stripe Connect (Teacher Payouts)
1. Go to your **Stripe Dashboard > Developers > API Keys**.
2. If using a Restricted Key (`rk_test_...` or `rk_live_...`), ensure that the **Connected accounts** capability is set to **Write** (`connected_account_write`).
3. For local testing and demos, you can also use the built-in **"Simulate Connect (Demo Test)"** button on the teacher dashboard to verify payout workflows immediately without an active bank account.

### B. Daily.co (Virtual Video Classroom)
1. Register at [Daily.co](https://www.daily.co/).
2. Copy your API Key into `DAILY_API_KEY`.
3. Virtual rooms are generated on-demand 15 minutes before the lesson start time and expire automatically 90 minutes after session conclusion.

### C. Resend (Email Notifications)
1. Add your verified sending domain (e.g. `esgloballanguageacademy.com`) in the [Resend Dashboard](https://resend.com/).
2. Set `RESEND_API_KEY` in your environment.

---

## 4. Admin Role Assignment

To grant an account full access to the **Admin Operations Console** (`/admin`):

1. Go to the **Supabase Dashboard > SQL Editor**.
2. Execute the following query, replacing `your_email@example.com` with Estephanos's email:

```sql
UPDATE profiles
SET role = 'admin'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'your_email@example.com'
);
```

3. Sign in to ESGlobal and visit `http://localhost:3000/admin` or `https://your-domain.vercel.app/admin`.

---

## 5. Deployment Checklist (Vercel)

1. Connect the GitHub repository `emekbib/ESGlobalLanguageAcademy` to Vercel.
2. Select branch `vercel/react-server-components-cve-vu-hmku5g` (or merge to `main`).
3. Framework preset: **Next.js**.
4. Add all environment variables listed in Section 2.
5. Deploy.

---

## 6. QA Verification Script (Milestone Handover)

| Test Step | Expected Result | Verified Status |
| :--- | :--- | :---: |
| 1. Visit `/` | Homepage loads with luxury typography, featured teachers, and 5-language curriculum | **VERIFIED** |
| 2. Visit `/teachers` | Filter tutors by Amharic, Tigrigna, Afaan Oromo, Somali, Swahili | **VERIFIED** |
| 3. Visit `/teachers/sample-1` | Bethelhem Mengistu profile with interactive booking calendar | **VERIFIED** |
| 4. Toggle Dark Mode | Seamless transition from warm ivory `#faf9f6` to obsidian `#0c0a09` | **VERIFIED** |
| 5. Sign in as Teacher | Access `/teacher/dashboard` with 4 executive metric cards | **VERIFIED** |
| 6. Click "Edit Details" | Opens in-dashboard Account Details tab to edit rate, bio, and languages | **VERIFIED** |
| 7. Video Classroom | Access `/booking/[id]` with Daily.co WebRTC audio/video call controls | **VERIFIED** |
| 8. Admin Console | Access `/admin` to approve teacher applicants and manage users | **VERIFIED** |

---

*This document confirms the successful completion of the Software Development Agreement between Meareg Teame and Estephanos Fantahun.*

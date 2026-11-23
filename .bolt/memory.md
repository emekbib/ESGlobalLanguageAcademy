# Project memory

## Product intent & audience

- Next.js web app for Ethiopian/Eritrean language learning and cultural heritage reconnection.
- Homepage (`app/page.tsx`) includes multiple content sections, e.g. "Heritage & Family Reconnection" with checkmark bullet lists.
- Languages/scripts referenced: Amharic, Tigrigna, Geez, Oromo (Qubee), Fidel script.
- Platform features include Stripe payments, checkout, auth, messaging, availability, pricing, and directory logic.
- Teacher dashboard includes earnings/payouts management via Wise.

## Brand personality & voice

- Heritage-focused, culturally precise; specific spellings and scripts matter to the audience (e.g. "Tigrigna" not "Tigrinya").

## Visual design & UX direction

- Stack: Tailwind CSS, shadcn/ui, Lucide React icons.
- Content uses checkmark bullet lists within themed sections.
- Production-quality, non-cookie-cutter UI expected per global instructions.

## Decisions, constraints & rationale

- User frequently requests surgical, single-change edits; avoid touching unrelated text, logic, payments, auth, messaging, availability, pricing, or directory code.
- Preserve exact spellings and HTML entities (e.g. `&amp;`) as specified.
- Run `npm run build` to confirm changes compile.
- **No bank details in app**: Owner explicitly does not want sensitive bank data typed into or stored in the app. Wise payouts are email-only — academy sends pay to tutor's email, tutor enters bank details on Wise's site.
- Wise payouts section uses single `payout_email` field (replaces former account holder / bank name / account number fields).
- Teacher profile update path: `payout_email` saved/loaded via same Supabase `teacher_profiles` update path the old bank form used.
- `getSameUser(supabase, userId)` must receive real `profile.user_id` threaded through from both WisePayoutForm usages in `components/teacher/teacher-dashboard-shell.tsx` — never pass `undefined`.
- Migration files in `supabase/migrations/`: `20261123120000_add_wise_payout_columns.sql` (history, left as-is); `20261123130000_switch_wise_payouts_to_email_only.sql` (adds `payout_email text`, drops `payout_account_holder`, `payout_bank_name`, `payout_account_number`). Do NOT apply migrations to production DB; create file only.
- Do NOT deploy to Vercel; do NOT touch student checkout/Stripe, payment processing, auth/session, messaging, availability, or pricing.
- Git commit attempted to branch `vercel/react-server-components-cve-vu-hmku5g`; Bolt environment likely has no git repo / cannot produce commit SHA.

## Open questions & assumptions

- Assuming app is a monolithic `app/page.tsx` homepage with inline section content; no separate content/CMS layer confirmed yet.
- Full scope of sections and feature pages beyond homepage not yet mapped.
- Git commit capability in this environment unconfirmed; previous runs indicate no SHA available.
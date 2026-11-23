# Project memory

## Product intent & audience

- Next.js web app for Ethiopian/Eritrean language learning and cultural heritage reconnection.
- Homepage (`app/page.tsx`) includes multiple content sections, e.g. "Heritage & Family Reconnection" with checkmark bullet lists.
- Languages/scripts referenced: Amharic, Tigrigna, Geez, Oromo (Qubee), Fidel script.
- Platform features include Stripe payments, checkout, auth, messaging, availability, pricing, and directory logic.

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

## Open questions & assumptions

- Assuming app is a monolithic `app/page.tsx` homepage with inline section content; no separate content/CMS layer confirmed yet.
- Full scope of sections and feature pages beyond homepage not yet mapped.
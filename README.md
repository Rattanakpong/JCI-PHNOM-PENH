# JCI Phnom Penh Web Platform

Bilingual (EN/KM) public site + internal admin dashboard for JCI Phnom Penh.
Fully functional locally: real database, working membership/sponsor/event
registration, working admin login, CMS editing, payment verification, and
.xlsx/.csv export — all on a zero-setup local SQLite database.

## Getting started

```bash
npm install
npx prisma migrate dev   # creates/updates prisma/dev.db (already run once; re-run after pulling schema changes)
npx prisma db seed       # (re)loads demo data — 3 admin accounts, events, news, projects, board, impact stats
npm run dev
```

Open http://localhost:3000/en (or `/km`). No external accounts or API keys
are required — `.env` already points `DATABASE_URL` at `file:./dev.db`.

**Admin login** at http://localhost:3000/admin/login — password `demo1234` for all:

| Email | Role |
|---|---|
| `dara@jcipp.org` | Super Admin |
| `sopheak@jcipp.org` | Board Admin |
| `lina@jcipp.org` | Event Organizer |

## What's actually working

- **Public site**: landing page with live impact-counter stats, About/board
  roster, Projects, News, and Events — all read from the real database, not
  hardcoded arrays.
- **Event registration**: the 4-step ABA KHQR funnel (`/en/events` → Register)
  creates a real `Registration`+`Payment` row, renders a scannable QR, accepts
  a payment-proof upload (saved to `public/uploads/`), and reveals the
  event's Telegram link on submission.
- **Join / Sponsor forms**: persist to `MembershipApplication` /
  `SponsorInquiry` and show up in the admin Inquiries page immediately.
- **Admin dashboard**: real counts (upcoming events, 30-day registrations,
  pending payments, active projects, new inquiries).
- **Events & Registrations**: live registration list with Verify/Reject
  payment actions (writes `AuditLog`), plus working `.xlsx`/`.csv` export
  (`exceljs`, streamed from `/api/admin/export`).
- **Content (CMS)**: edit the 4 hero impact numbers, and create news posts /
  projects / board members — all through real server actions
  (`src/lib/actions/content-actions.ts`), no page reload needed.
- **Inquiries**: review and change the status of membership/sponsor
  submissions.
- **Users & Roles**: Super Admin can change any other user's role live.
- **Audit Log**: every verify/reject, role change, and content edit is
  recorded and shown here.
- **RBAC**: every admin route re-checks the signed-in user's role server-side
  (not just hidden nav links) — direct URL access to a page outside your
  role 404s.

## Local auth (instead of Supabase, for zero-setup)

Admin login uses a simple local email+password system
(`src/lib/session.ts` + `bcryptjs`, signed cookie via `jose`) backed by the
same `User` table, rather than Supabase Auth — so you can run and demo the
whole app without creating any external account. `src/lib/auth.ts`'s
`getCurrentUser()` checks this local session first and falls back to
Supabase Auth automatically once `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set — no code changes needed to switch.

## Switching to Postgres/Supabase for production

1. In `prisma/schema.prisma`, set `datasource db { provider = "postgresql" }`
   and point `DATABASE_URL` at your Supabase connection string.
2. Promote the fields SQLite couldn't express natively back to their real
   types (search the schema for the inline comments marking each one):
   - `Role`, `RegistrationStatus`, `PaymentStatus` → real Prisma `enum`s
     instead of plain `String` (drop `src/lib/enums.ts`'s runtime checks, or
     keep them as a convenience import).
   - `TicketTier.priceUsd`, `Payment.amountUsd` → `Decimal @db.Decimal(10, 2)`
     instead of `Float`, for exact currency math.
   - `Project.galleryUrls` / `partnerLogos` → native `String[]` instead of a
     JSON-encoded `String`; and every other JSON-encoded field (`Event.title`,
     `NewsPost.body`, etc.) → native `Json`. Drop the `parseLocalizedText`/
     `toJsonField` calls in `src/lib/json-field.ts` once that's done.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` — `getCurrentUser()` picks these up
   automatically.
4. Swap `src/lib/uploads.ts`'s call from the local `/api/uploads` route to
   `uploadPaymentProof` in `src/lib/supabase/storage.ts`.
5. Swap `src/lib/khqr.ts`'s local payload builder for a call to ABA PayWay's
   API, which additionally returns a transaction reference you can poll
   server-side for real payment verification instead of trusting the
   uploaded screenshot alone.
6. Run `npx prisma migrate dev` against the new database and re-seed (or
   migrate real data over).

## Stack

- **Next.js 14** (App Router, TypeScript) + **Tailwind CSS**
- **next-intl** for EN/KM routing (`/en/...`, `/km/...`) and translations
- **Prisma** on **SQLite** locally (zero setup); swap to **Postgres/Supabase**
  for production — see above
- **ABA Pay / KHQR** dynamic QR generation for event payments
- shadcn-style UI primitives built on Radix (`src/components/ui`)

## Structure

```
src/
  app/
    [locale]/            # public, bilingual site — layout defines <html lang>
      page.tsx           # landing: hero, mission/vision/creed, live impact counters
      about/  projects/  news/  events/  join/  sponsor/
    admin/
      layout.tsx         # shell root layout (English-only, separate from [locale])
      login/              # public — local email+password sign-in
      (dashboard)/        # auth-guarded route group — adds the sidebar
        page.tsx          # dashboard home (live stats)
        events/           # registrations list, payment verify/reject, exports
        content/          # CMS: impact stats, news, projects, board roster
        inquiries/        # membership + sponsor inquiries
        users/            # role management (Super Admin only)
        audit-log/        # audit trail (Super Admin only)
        guide/            # admin operation guide
    api/
      registrations/                      # POST: create registration + KHQR payload
      registrations/[id]/confirm/         # POST: payment proof -> reveal Telegram link
      membership-applications/, sponsor-inquiries/
      uploads/                             # local-disk file upload (dev stand-in for Supabase Storage)
      admin/export/                        # .xlsx / .csv registration export
      auth/login/, auth/logout/
  components/
    ui/                   # button, card, dialog, input, select, badge, stepper...
    layout/, admin/, registration/
  lib/
    khqr.ts               # EMVCo/KHQR payload + CRC16 builder
    auth.ts, session.ts   # local auth + Supabase fallback
    enums.ts               # Role/RegistrationStatus/PaymentStatus as string unions (SQLite has no enum type)
    json-field.ts          # encode/decode JSON-in-String fields (SQLite has no Json/array type)
    actions/               # server actions: content, users, payments, inquiries
    prisma.ts, uploads.ts, supabase/
  i18n/                   # next-intl routing/navigation/request config
  messages/{en,km}.json   # translation catalogs
prisma/
  schema.prisma           # User/Role, Event/TicketTier, Registration/Payment, CMS, AuditLog
  seed.ts                 # demo data (3 users, 2 events, news, projects, board, impact stats)
```

Two root layouts exist on purpose (`[locale]/layout.tsx` and `admin/layout.tsx`) —
Next's "multiple root layouts" pattern — since the admin tool is a separate,
non-localized surface from the public bilingual site. Within `admin/`, the
`(dashboard)` route group adds the sidebar + auth redirect without affecting
URLs, so `/admin/login` stays outside the guard.

## Brand tokens (`tailwind.config.ts`)

| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#0088CE` | Primary CTA, links, active states |
| `brand-navy` | `#0B132B` | Headings, dark surfaces/footer |
| `brand-teal` | `#4ECDC4` | Secondary accents, badges |
| `brand-gold` | `#F4C430` | Rare emphasis moments only (not routine CTAs) |
| `background` | `#F8FAFC` | Page background |
| `surface` | `#FFFFFF` | Cards, modals |

Design is intentionally restrained: one filled color per view (`brand-blue`),
everything else recedes (outline/ghost/text), so no page shows two competing
bright buttons side by side. Cards use a soft border + subtle shadow rather
than heavy drop shadows.

## ABA QR registration flow

`src/components/registration/registration-modal.tsx` implements the funnel as
3 UI steps (the 4th — admin sync — happens automatically server-side):

1. **Details** — visitor picks a ticket tier and fills in contact info.
   `POST /api/registrations` creates the `Registration` + `Payment` rows and
   returns a KHQR payload pre-filled with the exact amount (`src/lib/khqr.ts`).
2. **Payment** — the modal renders that payload as a QR (`qr-code.tsx`) and
   lets the visitor upload a screenshot once paid (`src/lib/uploads.ts` →
   `/api/uploads`, saved under `public/uploads/`).
3. **Confirmation** — `POST /api/registrations/[id]/confirm` stores the proof,
   marks the payment `SUBMITTED`, and returns the event's private Telegram
   link, which the modal then surfaces immediately.
4. **Admin tracking** — because step 1 already wrote the `Registration`/
   `Payment` rows, the admin dashboard (`/admin/events`) sees every
   registration and its payment status in real time; Super/Event-Organizer
   admins then click Verify/Reject on a `SUBMITTED` payment, which writes an
   `AuditLog` row.

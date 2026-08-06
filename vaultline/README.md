# SABC VAULT

A records management, archiving and tracking prototype for the South African
Broadcasting Corporation, built for a live tender demonstration
(RFQ/COP/2026/10251403/11) to a public-sector evaluation panel over Microsoft
Teams.

The application covers all 26 evaluation elements in the tender across ten
modules: capture & indexing, file plan management, barcodes & labels,
tracking & circulation, search & retrieval, audit & compliance, reporting &
configuration, security & user administration, data migration & exit, and
system/licensing/continuity. A **Demo checklist** page (`/checklist`) lists
every element in the tender's own wording, the module where it is proven, and
links straight to it.

## What is simulated

This is a **UI prototype with in-memory data and no backend.**

- There is no server, no database, no API, and no authentication provider.
  Everything you see — the ~96 seeded index entries, the movement history,
  the audit log, the user list — lives in `src/data/*.ts` and is loaded into
  a single React context (`src/context/VaultStore.tsx`) on page load.
- Actions that look like they write to a system (capture an entry, issue a
  file, approve a deletion, authorise a user, publish a field) mutate that
  in-memory state and add a line to the in-memory audit log. Refresh the page
  and everything resets to the seed data.
- Barcodes are drawn with CSS (`repeating-linear-gradient` stripes in
  `src/components/Barcode.tsx`), not a real Code 128 encoder. They are a
  faithful visual representation, not something a real scanner can read.
- The document viewer, the scanner import, SharePoint links, scheduled
  email reports, and the SQL Server migration run are all dramatised: the
  screens show real interaction states (progress, success, a receipt) but
  there is no file store, no scanner, no mail server and no SQL Server behind
  them.
- The role switcher in the top bar signs you in as a different demo user
  (N. Mahlangu, P. Sithole, T. van Wyk or M. Dlamini) and re-evaluates every
  permission check client-side. There is no real session or token.

Headline figures (418 662 indexed entries, 27 900 boxes, 34 active users,
etc.) are stated constants in `src/data/lookups.ts`, not derived from the
seed data, so they stay consistent with the tender narrative even though the
working set loaded into the browser is smaller (needed for the grids,
filters and pagination to have something real to do).

## Running it

```bash
npm install
npm run dev       # starts Vite on http://localhost:5173
```

```bash
npm run build      # type-checks (tsc -b) then builds a static bundle to dist/
npm run preview    # serve the production build locally
```

Everything is client-side and static — there are no environment variables to
set.

## Deploying it

The build output in `dist/` is a plain static site. It deploys to any static
host with no server-side configuration:

- **Netlify / Vercel** — point either at this repository. `public/_redirects`
  (Netlify) and `vercel.json` (Vercel) are both included so a deep link like
  `/audit` resolves instead of 404ing.
- **GitHub Pages** — if deploying under a sub-path (e.g.
  `you.github.io/vaultline/`), build with
  `BASE_PATH=/vaultline/ npm run build` (read by `vite.config.ts`), then
  publish `dist/`. React Router is initialised with `basename={import.meta.env.BASE_URL}`
  so routes resolve correctly under the sub-path too.

## Demo running order

A little over two hours, keyed to the 26 elements. Use the role switcher in
the top bar throughout — switching to Clerk or Reader is the fastest way to
show elements 6–8 and 25 live rather than describing them.

1. **Vault overview** (`/`) — orient the panel: four stat cards, movements
   today, the three queues that need an administrator, six months of capture
   volume, retrieval performance against the four-hour commitment.
2. **M1 Capture & indexing** (`/capture`) — elements 3, 12, 14, 15, 19, 21.
   Fill in a new entry against series 9/1/3 to trigger the duplicate flag
   against `DOC-2025-118440`, compare the two, mark it not a duplicate, then
   capture a clean entry: import from the scanner, save, watch the barcode
   generate on submit. Try reusing an existing reference number to show it
   rejected.
3. **M2 File plan management** (`/file-plans`) — element 2. Both active
   plans plus the superseded 2011 plan; expand the Corporate 2019 series
   tree down to sub-type folders.
4. **M3 Barcodes & labels** (`/barcodes`) — elements 3, 4, 5, 12. Scan the
   document reference just captured, then the box barcode, then the
   location barcode, to show all three resolve the same chain. Open the
   print dialog and print the label sheet.
5. **M4 Tracking & circulation** (`/tracking`) — elements 9, 18. Issue the
   captured entry, show the issue receipt, then scan the return and show the
   return receipt was empty until that point. Filter the movement register
   by division and date range.
6. **M5 Search & retrieval** (`/search`) — elements 11, 17. Run a search,
   point out the result count and elapsed time, open a document, then
   request an off-site record to start the four-hour retrieval clock.
7. **M6 Audit & compliance** (`/audit`) — elements 13, 16, 20, and a callback
   to element 8. Switch role to Clerk, attempt to approve a deletion —
   blocked snackbar, blocked audit line. Switch back to Administrator,
   approve a real deletion request, and show the entry is gone and the audit
   line cannot be removed.
8. **M7 Reporting & configuration** (`/reports`) — elements 10, 11, 20, 24.
   Publish a new field as Administrator, then jump back to Capture to show
   it on the form immediately. Run a report and show the rendered chart and
   table. Show the lookup-table manager.
9. **M8 Security & user administration** (`/users`) — elements 6, 7, 8, 25.
   Authorise L. Botha, reinstate the locked M. Dlamini account, then walk
   the role permission matrix with the role switcher.
10. **M9 Data migration & exit** (`/migration`) — element 1. Walk the
    staged progress, the reconciliation panel at variance 0, the field
    mapping table, and the exit & data handback card.
11. **M10 System, licensing & continuity** (`/system`) — elements 22, 23,
    26. Platform card, licence terms (not subscription-based), the backup
    regime and the three evidenced restores.
12. **Demo checklist** (`/checklist`) — close by scrolling the full 26-row
    table with the panel, in the tender's own wording, every row Functional
    YES.

## Project structure

```
src/
  main.tsx, App.tsx, theme.ts, types.ts, vite-env.d.ts
  layout/      AppShell, Sidebar, TopBar, RoleSwitcher
  components/  Barcode, LabelSheet, StatCard, SectionCard, PageHeader,
               MovementTimeline, TransactionReceipt, ElementBadge, print.ts
  context/     VaultStore.tsx — all state and mutations
  data/        entries, movements, auditLog, users, filePlans, lookups,
               migration, reports, checklist
  pages/       Overview, Capture, FilePlans, Barcodes, Tracking, Search,
               Audit, Reports, Users, Migration, System, Checklist
```

`src/data/checklist.ts` is the single source of truth for the 26 evaluation
elements and their module mapping. The sidebar's element badges and the
`/checklist` page both read from the same `CHECKLIST` array, so they cannot
drift apart.

## Quality notes

- Every file compiles under `strict: true` (`npm run build` runs `tsc -b`
  first and fails the build on any type error).
- Responsive down to 375px; the app shell collapses to a temporary drawer
  under the `md` breakpoint.
- Keyboard-focusable navigation with a visible gold focus ring
  (`*:focus-visible` in `theme.ts`).
- `prefers-reduced-motion: reduce` disables animation and transition
  duration globally.
- A print stylesheet (`theme.ts` `@media print` rules plus
  `components/print.ts`) scopes printing to one region at a time — labels,
  receipts, and the demo checklist all print cleanly without the app shell.

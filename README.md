# RapidKL Companion

A mobile-first Next.js (App Router) + Tailwind CSS rail companion for Klang
Valley transit, with three views: **RapidKL Hub**, **KTM Live Map**, and
**Alerts**.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build && npm run start   # production build
```

## Layout

- **Mobile (< md):** a fixed bottom navigation bar (Hub / Map / Alerts) with
  a slim top header showing the current page title.
- **Desktop (≥ md):** a persistent left sidebar replaces the bottom nav; the
  main content gets more breathing room and switches to multi-column grids.

## Design system

Dark-only, high-contrast theme, defined as tokens in `tailwind.config.ts`:

- **Surfaces:** `base` → `surface` → `elevated` (three steps of dark navy,
  no gradients or shadows for contrast — just elevation).
- **Ink:** `ink.primary` / `secondary` / `tertiary` for high-contrast text
  hierarchy.
- **Line colors** (`line.*`): each rail line has one fixed color used
  consistently for its badge, status dot, and left-edge accent bar across
  every view — color is wayfinding, not decoration.
- **Accent** (`accent`, teal): reserved for anything *live* — the pulsing
  train indicator on the map, active nav state, and focus rings. It's the
  one recurring "this is active" signal in the app.
- **Type:** Space Grotesk for display/numeric text (headings, ETA counters,
  line codes), Inter for body and UI text. Live countdown numbers use
  `tabular-nums` so digits stay aligned, echoing a real departure board.

## Structure

```
app/
  layout.tsx        Root layout, fonts, metadata
  page.tsx           RapidKL Hub
  map/page.tsx        KTM Live Map
  alerts/page.tsx      Alerts
components/
  AppShell.tsx        Composes Sidebar + BottomNav + content frame
  Sidebar.tsx          Desktop nav
  BottomNav.tsx        Mobile nav
  LineBadge.tsx        Shared line-color badge
lib/
  types.ts, lines.ts, data.ts, nav.ts   Types, design tokens lookup, mock data
```

All data in `lib/data.ts` is mock data — swap it for real RapidKL/KTM feeds
when you wire up an API.

## GTFS schedules and departures API

Create a PostgreSQL database and set its connection string before importing a
GTFS feed. Apply the Prisma schema first, then import an extracted GTFS
directory containing `stops.txt`, `routes.txt`, `trips.txt`, `stop_times.txt`,
and `calendar.txt`. `agency.txt` is optional.

```bash
export DATABASE_URL='postgres://USER:PASSWORD@localhost:5432/rapidkl_companion'
npx prisma db push
npm run gtfs:seed -- /path/to/extracted-gtfs --replace
```

`--replace` clears the previously imported GTFS records. The importer streams
large input files and writes batches of 1,000 rows; tune that with
`GTFS_BATCH_SIZE` if needed.

With `DATABASE_URL` set, run the app and request the next five scheduled
departures for a GTFS `stop_id`:

```text
GET /api/transit/next-trains?station_id={stop_id}
```

For example: `http://localhost:3000/api/transit/next-trains?station_id=MR1`.
Results use the server's current local date/time and GTFS weekly calendar.

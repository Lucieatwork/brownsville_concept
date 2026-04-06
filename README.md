# Brownsville command center concept

This repository contains a Brownsville permit intelligence and command center concept built in Next.js. The current codebase is an implementation-first demo of a map-based operational surface, not a production application.

The project currently includes one fully built concept screen, shared mock permit data, map overlays, filters, KPI layers, and concept AI panels. It does not include live data, authentication, or production workflows.

## Read this first

If you are picking this project up later, start with these documents in this order:

1. `docs/prd-command-center-handoff.md`
2. `docs/prd-permit-intelligence.md`
3. `docs/context/style-guide.md`
4. `docs/btx_design_tokens_reference.html`

These files together explain:

- What is actually built today
- What the original concept intended
- Which design references matter
- Where current code and older product assumptions diverge

## Current project status

This repository currently ships:

- `/` -> same experience as `/concept/1`
- `/concept` -> redirects to `/concept/1`
- `/concept/1` -> the only implemented concept screen
- `/concept/2` through `/concept/6` -> placeholder screens

The implemented screen already includes:

- Mapbox-backed basemap
- Heat layer
- Search and filters
- Site markers with permit health scores
- Rich permit detail overlays
- AI brief and AI chat demo panels
- Bottom KPI strip with multiple modes
- Regional summary callouts

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript
- `mapbox-gl`

This project uses a newer Next.js version than many older examples. If framework behavior is unclear, check the local Next.js docs in `node_modules/next/dist/docs/`.

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment setup

The map experience currently depends on a public Mapbox token.

Create `.env.local` with:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
```

If the token is missing, the app shows a visible token-required message instead of silently failing.

## Important routes and files

### Routes

- `app/page.tsx`: home route that mirrors `/concept/1`
- `app/concept/page.tsx`: redirects `/concept` to `/concept/1`
- `app/concept/[screen]/page.tsx`: validates screen routes and renders placeholders for unfinished screens

### Main UI entry point

- `components/command-center/screens/screen-1.tsx`

### Main supporting areas

- `components/command-center/`: map, chrome, overlays, filters, AI surfaces, KPI layers
- `lib/inactive-sites.ts`: marker positions and map-facing site metadata
- `lib/permit-intelligence-dataset.ts`: rich permit records used by overlays
- `lib/city-map-metrics.ts`: KPI and regional summary mock data

## Working model

This is a concept demo, so some things are intentionally mocked:

- Permit data
- AI insights and chat behavior
- KPI values
- Role and workflow states

At the same time, the current build is more than a static mockup. It already has meaningful structure, reusable patterns, and interaction logic that future screens should likely build on instead of replacing.

## Design references

Use these assets when continuing the concept:

- `docs/prd-command-center-handoff.md`: implementation-first handoff guide
- `docs/prd-permit-intelligence.md`: original concept PRD
- `docs/context/style-guide.md`: typography, color roles, and Figma links
- `docs/btx_design_tokens_reference.html`: token reference with concrete values

## Continuation guidance

Before building more screens, confirm these decisions:

- Whether Mapbox remains the long-term map strategy
- Whether the current multi-permit mock dataset is now canonical
- Whether future screens should extend the richer built implementation or realign to the earlier, simpler concept PRD

The most important thing for future contributors is to work from the current implementation state, not assume the older concept PRD still describes the repo exactly.

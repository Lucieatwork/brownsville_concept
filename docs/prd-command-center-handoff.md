# Product requirements document — Command center handoff

## 1. Purpose of this document

This document is the implementation-first handoff for the Brownsville command center concept. It is meant to help a future contributor understand what is already built, how the current codebase is organized, what is still concept-only, and what should happen next.

Use this document as the practical source of truth for continuation work.

Use `docs/prd-permit-intelligence.md` as the earlier concept narrative and screen-spec reference. That file is still useful, but it does **not** fully match the current implementation.

---

## 2. Project summary

The product concept is a city command center focused on permits, operational risk, and actions. The intended story is:

**Signals -> insight -> action**

The interface is designed to feel like a live operating surface over a city map rather than a traditional dashboard. In the current repository, that idea is represented by one implemented screen with:

- A full-screen city map
- Heat zones
- Search and filters
- Site markers with permit health scores
- Rich permit detail overlays
- AI brief and AI chat concept panels
- A bottom KPI strip with multiple views
- Regional summary callouts on the map

This is still a concept demo. It does **not** use real back-end data, real AI, or production permit workflows.

---

## 3. Relationship to the older concept PRD

`docs/prd-permit-intelligence.md` describes a six-screen concept sequence for `/concept/1` through `/concept/6`, plus a shared fictional permit narrative and a static-map assumption.

The current codebase only partially matches that document.

The biggest differences are:

- Only `/concept/1` is implemented today
- `/concept/2` through `/concept/6` are placeholders
- The app uses Mapbox instead of a static `/brownsville_map.png` background
- The mock permit data in code is richer and different from the single-thread permit story in the older PRD
- The built screen includes filters, KPI mode switching, regional map callouts, and an AI chat panel that go beyond the simpler screen-1 definition in the older PRD

Future contributors should treat the older PRD as **design intent**, not as an exact description of the shipped code.

---

## 4. Current implementation snapshot

### Routes

| Route | Status | Notes |
|------|--------|-------|
| `/` | Built | Mirrors `/concept/1` directly for preview reliability |
| `/concept` | Built | Redirects to `/concept/1` |
| `/concept/1` | Built | Main implemented concept screen |
| `/concept/2` | Placeholder | Displays not-built-yet message |
| `/concept/3` | Placeholder | Displays not-built-yet message |
| `/concept/4` | Placeholder | Displays not-built-yet message |
| `/concept/5` | Placeholder | Displays not-built-yet message |
| `/concept/6` | Placeholder | Displays not-built-yet message |

### Route behavior notes

- Invalid screen values redirect to `/concept/1`
- The home page intentionally renders the same UI as `/concept/1`
- `/concept` redirects to the first concept screen so the route is easy to share

### What screen 1 currently includes

`/concept/1` is the only full implementation and currently combines:

- `MapCanvas` with a Mapbox basemap slot
- `HeatLayer`
- `MapKpiLayer`
- `InactiveSiteMarkers`
- `CommandCenterTopBar`
- `PermitFilterProvider`
- `MapChromeBoundsProvider`
- `MapZoomProvider`

This means screen 1 is already more than a static composition. It is a lightweight interactive demo surface with mocked state and map interactions.

---

## 5. Architecture at a glance

```mermaid
flowchart TD
  AppRoot[app layout and routes]
  HomeRoute[app/page.tsx]
  ConceptRoute[app/concept/[screen]/page.tsx]
  Screen1[components/command-center/screens/screen-1.tsx]
  Providers[shared context providers]
  MapStack[map and overlay stack]
  TopChrome[top bar and AI surfaces]
  MockData[mock data libraries]

  AppRoot --> HomeRoute
  AppRoot --> ConceptRoute
  HomeRoute --> Screen1
  ConceptRoute --> Screen1
  Screen1 --> Providers
  Screen1 --> MapStack
  Screen1 --> TopChrome
  MapStack --> MockData
  TopChrome --> MockData
```

### Core application files

| File | Role |
|------|------|
| `app/layout.tsx` | Root layout, metadata, font setup, global shell |
| `app/page.tsx` | Home route that renders the same view as `/concept/1` |
| `app/concept/page.tsx` | Redirect from `/concept` to `/concept/1` |
| `app/concept/[screen]/page.tsx` | Screen validation and placeholder handling for screens 2 to 6 |
| `components/command-center/screens/screen-1.tsx` | Main composition for the built command center screen |

### Key command-center components

| File | Role |
|------|------|
| `components/command-center/map-canvas.tsx` | Basemap slot, token-required fallback, overlay shell |
| `components/command-center/mapbox-basemap.tsx` | Mapbox GL basemap implementation |
| `components/command-center/heat-layer.tsx` | Heat blobs over the map |
| `components/command-center/inactive-site-markers.tsx` | Marker layer plus detailed permit overlay interactions |
| `components/command-center/map-kpi-layer.tsx` | Bottom KPI strip, KPI mode cycle, regional callouts |
| `components/command-center/command-center-top-bar.tsx` | Top-left filters and top-right AI surfaces |
| `components/command-center/permit-filter-panel.tsx` | Search plus faceted filters |
| `components/command-center/ai-brief-chip.tsx` | AI brief summary panel |
| `components/command-center/map-ai-chat-panel.tsx` | Demo AI chat panel |
| `components/command-center/map-manual-pan-surface.tsx` | Manual map panning surface |
| `components/command-center/map-zoom-context.tsx` | Zoom/pan coordination and permit-card avoidance logic |
| `components/command-center/map-chrome-bounds-context.tsx` | Measures top and bottom chrome for layout coordination |
| `components/command-center/permit-filter-context.tsx` | Shared filter state for the map experience |

### Important implementation characteristic

The current build is not just a static mockup. Several components coordinate layout and interaction:

- Filters change which sites remain visible
- Permit overlays can open from markers
- The map can pan to keep an open permit card visible
- KPI content can cycle between different city-level narratives
- Regional summary callouts can be toggled on the map

That makes the current implementation a demo application shell, not just a screenshot-quality concept.

---

## 6. Built experience inventory

### Map and geographic layer

- The app uses `mapbox-gl`
- The basemap is loaded through `MapboxBasemap`
- If `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is missing, the app shows a visible token-required state instead of silently failing
- Heat zones are drawn separately from the basemap so overlays remain stable and legible

### Top chrome

- The left side contains search and filters
- The right side contains the AI brief and AI chat panels
- Both AI surfaces can collapse into compact floating buttons

### Site markers and permit overlays

- Markers use permit health scores from mock data
- Color communicates health band, but the score value is always shown numerically
- Some markers open rich permit overlays powered by the permit dataset
- Permit overlays include journey, health score factors, reviews, inspections, documents, and recommended actions

### KPI layer

- A fixed bottom KPI strip is already implemented
- The strip currently supports multiple KPI modes:
  - Operational summary
  - Investment trends
  - Risk exposure
  - Intervention priority
- A second control toggles animated regional map summaries for west, south, and east areas

### AI surfaces

- The AI brief is a summary-style concept component
- The AI chat panel is explicitly a demo preview and does not call a live model
- Chat responses are mocked and intentionally visible as placeholder behavior

---

## 7. Mock data and content model

The concept is driven by local mock data files rather than a real API.

### Primary mock-data files

| File | Contents |
|------|----------|
| `lib/inactive-sites.ts` | Site marker positions, permit numbers, addresses, statuses, permit types, districts, stages, and links to rich permit detail records |
| `lib/permit-intelligence-dataset.ts` | Rich permit records for overlays, including health score factors, journey steps, reviews, inspections, documents, AI insight, and primary action labels |
| `lib/city-map-metrics.ts` | City totals, regional snapshots, and alternate KPI view datasets |
| `lib/permit-filters.ts` | Shared filter options such as status, type, district, zip code, and stage |

### Current data shape

The data model in code is more detailed than the original concept PRD. It already includes:

- Permit health composites and factor weighting
- Permit journey stages
- Review and inspection rows
- Document lists
- Rich AI insight text
- Per-site metadata for filtering and map storytelling

### Current narrative reality

The current repo does **not** center on one canonical fictional permit story. Instead, it uses multiple mock permits such as:

- `BP-0441` — Boca Chica logistics annex
- `BP-0501` — 12th St Bistro
- `BP-0298` — Resaca cold storage
- `BP-0463` — Encanto Terrace

This is important because the older concept PRD assumes one shared permit thread, while the current implementation is already organized around a broader mock dataset.

---

## 8. Design system and visual references

### Primary references

| Asset | Purpose |
|------|---------|
| `docs/context/style-guide.md` | Typography, semantic color roles, and Figma references |
| `docs/btx_design_tokens_reference.html` | Concrete token export with hex values and CSS-style reference material |
| `docs/prd-permit-intelligence.md` | Original screen-by-screen product concept and copy direction |

### Figma

The linked Figma source is **BTX — Digital Twin PoC** with file key `MiRWzAqwyE3YqDfq6RkQSc`.

Use Figma for:

- Exact visual values
- Component-level design interpretation
- Token verification
- Screen references that are not yet implemented in code

### Fonts and visual implementation notes

- The root layout uses Geist, Geist Mono, and Montserrat
- Montserrat is explicitly scoped to the permit and command-center surfaces in code
- The visual system leans on glass panels, elevated overlays, semantic risk colors, and dark-shell map presentation

---

## 9. Environment, stack, and dependencies

### Stack

- Next.js `16.2.1`
- React `19.2.4`
- Tailwind CSS `4`
- TypeScript `5`
- ESLint `9`

### Key dependency

- `mapbox-gl`

### Required environment detail

The current map experience depends on:

- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

If the token is not present, the app intentionally shows a visible fallback message telling the contributor what is missing.

### Operational note

The current `README.md` is still the default Next.js starter content. It does not explain:

- What this project is
- Which routes matter
- That `/` mirrors `/concept/1`
- That Mapbox is required for the full map experience
- Which docs future contributors should read first

Because of that gap, this handoff PRD currently acts as the main contributor orientation document.

---

## 10. Concept vs code reconciliation

This section is the most important thing for a future contributor to understand.

### What the older concept PRD says

The older PRD describes:

- Six concept screens at `/concept/1` through `/concept/6`
- A static map asset at `/brownsville_map.png`
- A single consistent fictional permit thread
- Screen-specific component patterns such as a dedicated right-side detail card, a role-based split view, and future-signal ghost pills

### What the code actually does today

The code currently ships:

- One implemented concept screen
- Placeholder screens for 2 to 6
- A Mapbox-backed live basemap layer
- A broader mock permit dataset with several projects
- A richer screen-1 experience with filters, chat, multiple KPI views, and regional overlays

### Practical guidance

When continuing the project:

1. Do **not** assume the older PRD matches the shipped UI one-to-one.
2. Do **not** remove current implementation detail just to force it back into the older PRD shape unless that decision is intentional.
3. Decide explicitly whether future work should:
   - Extend the current richer implementation pattern, or
   - Realign the codebase to the simpler six-screen concept spec

### Known mismatches to resolve intentionally

| Topic | Older concept PRD | Current codebase | Why it matters |
|------|-------------------|------------------|----------------|
| Screen coverage | Six concept screens | Only screen 1 is implemented | Scope and backlog are unclear without documentation |
| Map approach | Static `/brownsville_map.png` | Mapbox implementation with token requirement | Demo reliability, licensing, and env setup differ |
| Narrative content | One canonical permit thread | Multiple mock permits and datasets | Copy, UX story, and future screens may diverge |
| Screen-1 complexity | Mostly instant-read composition | Interactive filters, AI chat, KPI views, regional summaries | Future screens may inherit a richer interaction model than originally planned |
| Reusable abstractions | Distinct conceptual components in PRD | Some behaviors exist inside larger implementation files | Refactor choices affect how quickly screens 2 to 6 can be built |

---

## 11. Continuation backlog

The next phase should focus on making the concept easier to extend without losing what is already working.

### Priority 1 — decide the foundation

- Confirm whether Mapbox remains the long-term concept map strategy
- Decide whether the current multi-permit dataset is now canonical
- Confirm whether `/` should remain a mirror of `/concept/1`
- Decide whether future screens should reuse the richer screen-1 interaction style or stay closer to the earlier static PRD layouts

### Priority 2 — extract reusable building blocks

Before building all remaining screens, consider extracting clearer standalone components from the current implementation where that reduces duplication:

- Permit detail card shell
- Permit health summary module
- Journey module
- Action section
- KPI strip presets
- Regional summary card
- Role view layout shell
- Future-signal filter bar / ghost pill pattern

This does **not** mean rebuilding everything. Reuse as much of the current implementation as possible and only extract the pieces that will clearly help screens 2 to 6.

### Priority 3 — build the missing screens

#### Screen 2

Goal: map -> selected pin -> detail clarity

Needed work:

- Build a dedicated screen composition for `/concept/2`
- Reuse existing marker and permit-detail logic
- Make live site status and AI insight the visual focus

#### Screen 3

Goal: insight -> action clarity

Needed work:

- Build `/concept/3`
- Add a clearer action-focused detail composition
- Make the primary CTA the strongest control on the page
- Add a visible signal -> insight -> action thread

#### Screen 4

Goal: city-scale intelligence

Needed work:

- Build `/concept/4`
- Reuse heat and KPI patterns from the existing KPI layer
- Simplify the view so city signal + scale story is immediate

#### Screen 5

Goal: role-based storytelling

Needed work:

- Build `/concept/5`
- Decide between split-screen and toggle interaction
- Reuse current operational data on the planner side
- Add a more executive narrative for the mayor side

#### Screen 6

Goal: show scale without clutter

Needed work:

- Build `/concept/6`
- Add future-signal affordances such as ghost pills
- Show how additional signal types join the same operating surface

### Priority 4 — improve contributor clarity

- Add a short project-oriented `README.md`
- Link the README to this handoff PRD, the older concept PRD, and the style guide
- Document required environment variables and the intended entry routes

---

## 12. Risks and open decisions

### Product decisions still open

- Is the project still telling one permit-thread story, or has it evolved into a broader operational map concept?
- Should future screens reuse the current richer data model or the older PRD's simplified copy?
- Is the AI chat panel part of the intended product story, or only a demo embellishment?

### Technical decisions still open

- Should the project keep Mapbox as the active map implementation?
- If Mapbox stays, should there also be a screenshot-safe static fallback for environments without a token?
- Should the large `inactive-site-markers.tsx` implementation be split into smaller reusable components before new screen work starts?

### Documentation risks

- A future contributor could incorrectly assume all six screens already exist because the older PRD is very complete
- A future contributor could also assume the static map requirement is still active even though the code now depends on Mapbox
- Without this handoff context, a contributor may not realize that the current mock dataset is broader and more structurally useful than the older single-thread PRD copy

---

## 13. Recommended contributor workflow

When picking this project up later, start in this order:

1. Read `docs/prd-command-center-handoff.md`
2. Read `docs/prd-permit-intelligence.md`
3. Read `docs/context/style-guide.md`
4. Check `app/concept/[screen]/page.tsx` to confirm current route status
5. Check `components/command-center/screens/screen-1.tsx` to understand the built composition
6. Review `lib/inactive-sites.ts`, `lib/permit-intelligence-dataset.ts`, and `lib/city-map-metrics.ts`
7. Confirm whether `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is available before evaluating the full experience

---

## 14. Key takeaways

This repo currently represents:

- One strong implemented command-center screen
- A richer mock data model than the older concept PRD
- A partially documented shift from static concept spec to interactive demo shell

The most important continuation task is not just building screens 2 to 6. It is making sure future work is based on the **actual current implementation** and not on outdated assumptions about the earlier concept-only spec.

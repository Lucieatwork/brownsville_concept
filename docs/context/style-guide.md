# BTX digital twin PoC — style guide (draft)

This document captures typography, color, and state tokens from the Figma file **BTX — Digital Twin PoC**. Use it as the **starting point** for implementation; **Figma remains the source of truth** for font families, weights, and exact color values (hex / variables).

---

## Figma references

Open these frames or nodes in Figma when you need full specs, components, or updated tokens.

| Area | Link |
|------|------|
| Screen / frame (node `263-10111`) | [Open in Figma](https://www.figma.com/design/MiRWzAqwyE3YqDfq6RkQSc/BTX---Digital-Twin-PoC?node-id=263-10111&t=Lq6qSdVxqUWrXjLW-4) |
| Screen / frame (node `192-2698`) | [Open in Figma](https://www.figma.com/design/MiRWzAqwyE3YqDfq6RkQSc/BTX---Digital-Twin-PoC?node-id=192-2698&t=Lq6qSdVxqUWrXjLW-4) |
| Screen / frame (node `193-3790`) | [Open in Figma](https://www.figma.com/design/MiRWzAqwyE3YqDfq6RkQSc/BTX---Digital-Twin-PoC?node-id=193-3790&t=Lq6qSdVxqUWrXjLW-4) |
| Screen / frame (node `263-10245`) | [Open in Figma](https://www.figma.com/design/MiRWzAqwyE3YqDfq6RkQSc/BTX---Digital-Twin-PoC?node-id=263-10245&t=Lq6qSdVxqUWrXjLW-4) |

**File key:** `MiRWzAqwyE3YqDfq6RkQSc` — [File root](https://www.figma.com/design/MiRWzAqwyE3YqDfq6RkQSc/BTX---Digital-Twin-PoC)

---

## Typography

Values are **font size / line height** in **pixels** (as shown in Figma text styles).

### Display

Large type for heroes and prominent titles. The same size pairs may appear with different weights in Figma; match weight per component there.

| Style name | Font size (px) | Line height (px) |
|------------|----------------|------------------|
| Hero | 56 | 64 |
| Title | 40 | 48 |
| Subtitle | 28 | 36 |

### Heading

Section headers. Figma lists these as numeric names (`1`, `2`, `3`) and as **H1 / H2 / H3** with the same metrics.

| Style name | Font size (px) | Line height (px) |
|------------|----------------|------------------|
| H1 (also named `1`) | 24 | 32 |
| H2 (also named `2`) | 20 | 28 |
| H3 (also named `3`) | 16 | 24 |

### Body

Default reading and UI copy.

| Style name | Font size (px) | Line height (px) | Notes |
|------------|----------------|------------------|--------|
| Default | 14 | 22 | Base body text |
| Strong | 14 | 22 | Same metrics as Default; **bolder font weight** |
| Small | 12 | 18 | Secondary or compact text |

### UI (interface typography)

| Style name | Font size (px) | Line height (px) |
|------------|----------------|------------------|
| Label | 12 | 16 |
| Label large | 14 | 20 |
| Overline | 11 | 14 |

*Figma may show “Label — Large”; treat it as the same as Label large.*

### Data (numbers and stats)

| Style name | Font size (px) | Line height (px) |
|------------|----------------|------------------|
| Number | 32 | 40 |
| Stat | 20 | 28 |

---

## Color — brand

Semantic names from Figma. **Pull exact fills from Figma** (or design tokens) when coding—this list does not replace measured hex values.

| Token name | Role |
|------------|------|
| Primary — electric blue | Primary brand / actions |
| Secondary — mint | Secondary emphasis |
| Tertiary — crimson (LM) | Tertiary; light mode variant |
| Tertiary — crimson (DM) | Tertiary; dark mode variant |
| Accent — gold (LM) | Accent; light mode variant |
| Accent — gold (DM) | Accent; dark mode variant |

**LM** = light mode, **DM** = dark mode.

---

## Color — neutral

Used for backgrounds, surfaces, borders, and secondary text.

| Token name | Role |
|------------|------|
| Page BG (LM) | Page background, light mode |
| Surface (LM) | Cards / panels, light mode |
| Border (LM) | Dividers and outlines, light mode |
| 500 — secondary text | Muted body / supporting text |
| Page BG (DM) | Page background, dark mode |
| Surface (DM) | Cards / panels, dark mode |
| Border (DM) | Dividers and outlines, dark mode |
| Pure white | `#FFFFFF` |
| Pure black | `#000000` |

---

## Color — state (semantic UI)

Use for alerts, badges, validation, and system feedback. **Map to exact palette swatches in Figma** so success / warning / danger / info stay consistent with the file.

| State | Description (from design) |
|-------|---------------------------|
| Success | Teal-green |
| Warning | Mustard / gold |
| Danger | Bright red / rose |
| Info | Medium blue |

---

## How to use this in Cursor

- Reference this file with `@docs/context/style-guide.md` in chat when you want typography and color rules applied.
- When implementing CSS or components, **verify colors and fonts in Figma** (or exported variables) so light/dark and weights match production design.

---

## Changelog

- **2026-03-25** — Initial draft from Figma text styles, color styles, state styles, and linked screens.

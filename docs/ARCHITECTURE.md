# algorithm-playground Architecture

## Overview

algorithm-playground is structured as a frontend-only Next.js App Router project with typed placeholder data and UI scaffolding.
This phase focuses on maintainable composition and future algorithm integration points.

## Routes

- `/`: Library page
  - Centered search interface with placeholder algorithm catalog.
  - Results navigate to algorithm detail pages.
- `/algorithms/[slug]`: Algorithm shell page
  - Placeholder visualizer panel.
  - Placeholder parameter panel.
  - Placeholder playback controls.
  - Returns Next.js 404 when slug is not in the catalog.

## Component Structure

- `src/components/library/`
  - `library-search.tsx`: command-style searchable list.
  - `algorithm-result-item.tsx`: reusable result row.
  - `theme-toggle.tsx`: light/dark toggle.
- `src/components/algorithm/`
  - `algorithm-page-shell.tsx`: page-level composition and responsive shell.
  - `visualizer-panel.tsx`: renderer placeholder.
  - `params-panel.tsx`: parameter placeholder controls.
  - `playback-controls.tsx`: bottom sticky playback placeholder.
- `src/components/layout/`
  - `page-transition.tsx`: subtle Framer Motion wrapper for page transitions.

## Data and State

- `src/data/algorithms.ts`
  - Placeholder dataset and `AlgorithmDefinition` type.
  - Source of truth for available algorithm slugs and display metadata.
- `src/store/app-store.ts`
  - Zustand state for:
    - `selectedAlgorithmSlug`
    - playback status/speed
    - generic params object

## Future Integration Model

Planned high-level flow for real algorithm support:

1. **Algorithm modules emit steps**
   - Each algorithm will generate a typed sequence of step events from input + params.
2. **Renderer modules consume steps**
   - Renderer components will consume step events and derive visual frame state.
3. **Playback layer orchestrates time**
   - Playback controls will coordinate stepping, speed, pause, and reset across renderer state.
4. **Param schema drives controls**
   - Each algorithm module will define a params schema used to generate and validate controls.

## Design System Notes

- Tailwind + shadcn tokens in `src/app/globals.css`.
- Utility classes such as `.container-page` and `.surface-card` keep layout and surfaces consistent.
- Accessibility basics are preserved via focus-visible styles, semantic labels, and contrast-safe colors.

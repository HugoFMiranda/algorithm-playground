# algorithm-playground Architecture

## Objective

`algorithm-playground` is a frontend-first hub for exploring algorithm behavior through interactive visual playback.

Primary goals:
- Consistent UX across algorithm families.
- Deterministic step-by-step simulation.
- Reusable architecture that scales from simple sorting to advanced graph/tree algorithms.

## Current State

- App routes:
  - `/` library page with search and algorithm list.
  - `/algorithms/[slug]` algorithm shell with Binary Search runtime integration.
- Core UI:
  - search, algorithm cards, visualizer panel, params panel, playback controls, implementation examples panel.
- Data:
  - `src/data/algorithms.ts` now contains roadmap metadata (category, difficulty, planned phase).
- State:
  - `src/store/app-store.ts` holds selected algorithm, raw params, normalized run snapshots, playback cursor, and speed.

## Implemented Runtime Layer

- `src/types/engine.ts`
  - Shared algorithm engine contracts and step-event envelope.
- `src/algorithms/registry.ts`
  - Central typed runtime registry by slug.
- `src/algorithms/binary-search/*`
  - First complete engine/spec implementation.
- `src/algorithms/examples/*`
  - Per-algorithm abstracted code examples (pseudocode + TypeScript).

## Target Architecture (Roadmap)

## Route Layer

- `src/app/page.tsx`
  - Catalog and discovery.
- `src/app/algorithms/[slug]/page.tsx`
  - Algorithm execution shell.
- Future:
  - `src/app/compare` for side-by-side algorithm comparisons.

## Algorithm Layer (in progress)

- `src/algorithms/<slug>/spec.ts`
  - Metadata, input/params schema, defaults, presets.
- `src/algorithms/<slug>/engine.ts`
  - Pure step generation logic.

## Renderer Layer (planned)

- `src/renderers/array/`
- `src/renderers/grid/`
- `src/renderers/graph/`
- `src/renderers/tree/`

Each renderer consumes step events and produces view state for UI components.

## Engine Contracts (in progress)

- Shared step event types in `src/types/engine.ts`.
- Determinism: same normalized inputs must yield same event streams.
- Playback consumes precomputed events and controls cursor progression.

## Store Design Direction

Current store now supports:
- cursor index and completed state,
- per-run metadata (normalized params + result),
- playback speed scaling and reset semantics.

Planned expansion:
- loop/step-backward behavior,
- run ids and timeline scrub,
- worker-backed heavy-step generation.

## Documentation Contracts

- Roadmap: `docs/ROADMAP.md`
- Engine details: `docs/ENGINE.md`
- Per-algorithm plans: `docs/ALGORITHM_SPECS.md`
- Governance source of truth: `AGENTS.md`

Any architecture/process change must be reflected in `AGENTS.md` and the relevant docs file.

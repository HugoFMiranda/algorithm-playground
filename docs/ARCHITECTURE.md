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
  - `/algorithms/[slug]` algorithm shell with all 22 shipped algorithm runtimes.
  - `/compare` side-by-side comparison route for default deterministic runs within the same renderer family, including normalized metrics overlays, synchronized shared-input controls for compatible pairs, and local shared-cursor playback controls with per-side active-step inspectors.
- Core UI:
  - search, algorithm cards, visualizer panel, renderer mode toggle, params panel, playback controls, implementation examples panel.
- Data:
  - `src/data/algorithms.ts` now contains roadmap metadata (category, difficulty, planned phase).
- State:
  - `src/store/app-store.ts` holds selected algorithm, raw params, normalized run snapshots, playback cursor, and speed.

## Implemented Runtime Layer

- `src/types/engine.ts`
  - Shared algorithm engine contracts and step-event envelope.
- `src/algorithms/registry.ts`
  - Central typed runtime registry by slug across the shipped algorithm backlog.
- `src/lib/compare.ts`
  - Comparison helpers for renderer-family filtering, default-run summaries, normalized metrics overlays, and synchronized shared-input snapshots.
- `src/lib/compare-playback.ts`
  - Local comparison playback state helpers for shared cursor progression, reset semantics, and speed normalization.
- `src/algorithms/examples/*`
  - Per-algorithm abstracted code examples (pseudocode + TypeScript).

## Active Renderer Direction

- Algorithm pages support two presentation tracks:
  - `Advanced`: the existing detailed, algorithm-specific educational visualizers.
  - `Simple`: a new abstract, clip-friendly renderer mode.
- The first `Simple` rollout applies only to:
  - array algorithms via animated bar renderers,
  - pathfinding/grid algorithms via abstract square-canvas renderers.
- Graph and tree families remain advanced-only during the first rollout.

## Target Architecture (Roadmap)

## Route Layer

- `src/app/page.tsx`
  - Catalog and discovery.
- `src/app/algorithms/[slug]/page.tsx`
  - Algorithm execution shell.
- Current:
  - `src/app/compare` for side-by-side default-run comparisons.

## Algorithm Layer (in progress)

- `src/algorithms/<slug>/spec.ts`
  - Metadata, input/params schema, defaults, presets.
- `src/algorithms/<slug>/engine.ts`
  - Pure step generation logic.

## Renderer Layer (active refactor)

- `src/renderers/array/`
  - shared array frame derivation and `Simple` renderer surfaces.
- `src/renderers/grid/`
  - shared grid frame derivation and `Simple` renderer surfaces.
- `src/renderers/graph/`
  - reserved for future graph-family modularization.
- `src/renderers/tree/`
  - reserved for future tree-family modularization.

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
- worker-backed heavy-step generation,
- renderer-level side-by-side visual playback for comparison mode after simple-mode rollout stabilizes.

## Documentation Contracts

- Roadmap: `docs/ROADMAP.md`
- Engine details: `docs/ENGINE.md`
- Per-algorithm plans: `docs/ALGORITHM_SPECS.md`
- Governance source of truth: `AGENTS.md`

Any architecture/process change must be reflected in `AGENTS.md` and the relevant docs file.

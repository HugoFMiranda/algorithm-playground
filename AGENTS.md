# algorithm-playground Governance and Working Agreement

This file is the strict source of truth for product direction, architecture guardrails, and contribution rules.

## Product Mission

Build a professional algorithm visualization hub where users can:
- discover algorithms by category and complexity,
- understand execution through deterministic step playback,
- inspect parameter effects and compare behavior between algorithms.

## Current Scope

- Frontend-only Next.js App Router application.
- No backend requirements in the current roadmap window.
- Focus on reusable engine and renderer architecture before advanced features.
- Current implementation checkpoint: Binary Search, BFS, DFS, Dijkstra, A*, Bubble Sort, Quick Sort, Heap Sort, Topological Sort, Union-Find, Kruskal MST, Prim MST, Selection Sort, Insertion Sort, Merge Sort, and Invert Binary Tree are fully integrated algorithm slices (engine, playback, renderer, params, and code examples).
- Every algorithm must ship with an easy-to-understand explanation surfaced on its algorithm page.

## Source-of-Truth Policy

Any material change to process, roadmap, architecture, or algorithm priority must update:
1. `AGENTS.md` (this file).
2. The relevant document in `docs/`.

Changes that skip documentation sync are not considered complete.

## Core Technical Stack

- Next.js + TypeScript (App Router)
- Tailwind CSS + shadcn/ui
- Zustand for app state
- Framer Motion for subtle transitions

## Project Structure Rules

- `src/app/`: route entrypoints, layout, global styles.
- `src/components/ui/`: shadcn-style primitives.
- `src/components/library/`: catalog/discovery components.
- `src/components/algorithm/`: algorithm shell components.
- `src/data/`: typed catalog metadata.
- `src/store/`: global state scaffolding.
- `src/lib/`: shared utilities.
- `docs/`: roadmap and architecture plans.

Use `@/*` absolute imports.

## Documentation Map

- `docs/ROADMAP.md`: phase planning and algorithm ordering.
- `docs/ENGINE.md`: event/playback architecture.
- `docs/ENGINE_TECHNICAL_GUIDE.md`: implementation-level engine details, usage patterns, and extension workflow.
- `docs/ALGORITHM_SPECS.md`: per-algorithm implementation plan.
- `docs/ARCHITECTURE.md`: current and target architecture.
- `docs/CONTRIBUTING.md`: workflow and PR expectations.

## Algorithm Taxonomy and Difficulty

Categories:
- Sorting
- Pathfinding
- Graph Theory
- Trees & Search

Difficulty:
- `D1`: straightforward implementation and renderer coupling.
- `D2`: moderate invariants and event complexity.
- `D3`: advanced invariants, branching logic, and complex visuals.

Roadmap horizon is 3 phases with 21 planned algorithms.

## Delivery Sequence

1. Phase 1: foundational sorting + pathfinding + binary search.
2. Phase 2: graph breadth and additional sorting/tree structures, with Trie Operations prioritized next.
3. Phase 3: advanced algorithms and comparison tooling.

Canonical order and algorithm list are maintained in `docs/ROADMAP.md` and `src/data/algorithms.ts`.

## Definition of Done (Algorithm Implementation)

For each implemented algorithm:
- Typed metadata exists in `src/data/algorithms.ts`.
- Easy explanation copy exists in `src/data/easy-explanations.ts`.
- Algorithm spec is documented in `docs/ALGORITHM_SPECS.md`.
- Engine emits deterministic step streams for fixed input+params.
- Algorithm renders correctly in its target renderer family.
- Playback controls function correctly (play/pause/step/reset/speed).
- `npm run lint` and `npm run build` pass.

## Coding and Quality Rules

- Strict TypeScript, avoid `any`.
- Keep ESLint enabled; avoid broad suppression.
- Prefer small composable components and pure algorithm engines.
- Keep shadcn-first UI usage for consistency.

## Commit and PR Rules

- Conventional Commits required.
- Keep commits focused by concern (`feat(engine)`, `feat(algorithms)`, `docs(roadmap)`, etc.).
- PR summary must include:
  - what changed,
  - validation run (`lint`, `build`),
  - docs synchronized (`AGENTS.md` + relevant `docs/*`).

## Release Management

- Release management is automated with Release Please and Conventional Commits.
- CI quality checks run in GitHub Actions on PRs and pushes to `main`/`develop`:
  - `npm run test`
  - `npm run lint`
  - `npm run build`
- Versioning follows pre-1.0 SemVer (`0.x.y`):
  - `feat(...)` bumps minor.
  - `fix(...)` bumps patch.
  - Breaking changes before `1.0.0` are treated as minor bumps.
- Each release must include:
  - Git tag in `v0.x.y` format.
  - GitHub Release notes.
  - `CHANGELOG.md` updates with `Added`, `Changed`, and `Fixed` sections.
- Release PRs must pass:
  - `npm run test`
  - `npm run lint`
  - `npm run build`
- Release Please PRs target `main` and have auto-merge enabled by workflow after required checks pass.

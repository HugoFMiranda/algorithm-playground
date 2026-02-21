# Contributing

## Workflow

1. Pick roadmap-scoped work from `docs/ROADMAP.md`.
2. Verify associated algorithm spec in `docs/ALGORITHM_SPECS.md`.
3. Implement in small commits with Conventional Commits.
4. Run validation before opening PR.

## Branch Naming

- `feat/<scope>-<short-topic>`
- `fix/<scope>-<short-topic>`
- `chore/<scope>-<short-topic>`
- `docs/<scope>-<short-topic>`

Examples:
- `feat/engine-step-schema-v1`
- `feat/pathfinding-dijkstra-engine`
- `docs/roadmap-phase2-refinement`

## Commit Rules

Use Conventional Commits.

Examples:
- `feat(engine): add deterministic step event contract`
- `feat(algorithms): implement bubble sort step generator`
- `feat(renderer): add grid frontier state renderer`
- `docs(agents): update governance for roadmap scope`

## Release Workflow

- Releases are automated with Release Please on pushes to `main`.
- Release Please opens/updates a release PR with:
  - proposed version bump,
  - `CHANGELOG.md` updates,
  - release metadata for GitHub Releases.
- Merge release PRs only after validation passes:

```bash
npm run test
npm run lint
npm run build
```

- Patch notes are grouped under:
  - `Added`
  - `Changed`
  - `Fixed`
- Use Conventional Commits consistently so automated notes stay accurate and useful.

## Code and Architecture Rules

- Keep TypeScript strict and avoid `any`.
- Keep ESLint enabled; do not broadly suppress rules.
- Use absolute imports via `@/*`.
- Prefer pure algorithm engines and typed event payloads.
- Keep renderers decoupled from algorithm internals.

## Mandatory Documentation Sync

`AGENTS.md` is the strict governance source of truth.

For any material change to architecture, process, roadmap, or algorithm priorities:
- Update `AGENTS.md`.
- Update relevant docs in `docs/`.
- Mention those updates in the PR summary.

PRs that change implementation direction without docs sync are incomplete.

## Algorithm Implementation Checklist

Before merging a new algorithm implementation:
- Add/update entry in `src/data/algorithms.ts`.
- Add/update algorithm spec section in `docs/ALGORITHM_SPECS.md`.
- Implement engine module with deterministic event output.
- Verify renderer compatibility and playback controls.
- Add/adjust tests for determinism and edge cases.
- Run:

```bash
npm run test
npm run lint
npm run build
```

# Visualization Engine Plan

## Core Data Flow

`Algorithm Engine -> Step Events -> Store Playback Cursor -> Renderer View State -> UI`

## Implemented v1 Boundaries

- `src/types/engine.ts`
  - Shared event envelope and algorithm engine interfaces.
  - Hybrid schema: generic base event + typed family/event unions.
- `src/algorithms/binary-search/spec.ts`
  - Parameter normalization and input shaping.
- `src/algorithms/binary-search/engine.ts`
  - Pure deterministic step generation for Binary Search.
- `src/algorithms/registry.ts`
  - Central runtime registry (`slug -> defaults + run creation`).
- `src/store/app-store.ts`
  - Playback cursor, run snapshots, speed control, and deterministic stepping.

## Step Event Model (v1 implemented)

```ts
type StepEventBase = {
  id: string;
  index: number;
  family: string;
  type: string;
  payload: Record<string, string | number | boolean | null>;
};
```

Hybrid typing:
- generic `StepEventBase` for registry/store interoperability,
- typed family event wrappers (currently search-family events for Binary Search).

## Determinism Rules

- Equal normalized input + params produce equal ordered step streams.
- Playback speed changes only timing, never output semantics.
- Reset returns cursor to `-1` (pre-step state).

## Playback Lifecycle (v1)

- `idle` -> `playing` -> `paused` -> `completed`
- Required controls implemented:
  - play/pause
  - step forward
  - reset
  - speed scaling

## Performance and Robustness Targets

- Engines remain pure and precompute steps synchronously.
- Payloads stay minimal and renderer-oriented.
- Worker-backed generation remains planned for heavy algorithms in later phases.

## Validation Strategy

- Unit: determinism and normalization tests (Binary Search engine).
- Unit: playback transition tests in store.
- Gate checks: `npm run lint`, `npm run build`, `npm run test`.

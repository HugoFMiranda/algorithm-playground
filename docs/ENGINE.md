# Visualization Engine Plan

## Core Data Flow

`Algorithm Engine -> Step Events -> Renderer State -> Playback Controller -> UI`

## Planned Module Boundaries

- `src/algorithms/<slug>/engine.ts`
  - Pure algorithm logic.
  - Emits typed step events.
- `src/algorithms/<slug>/spec.ts`
  - Metadata, params schema, presets.
- `src/renderers/`
  - `array`, `grid`, `graph`, `tree` renderer implementations.
- `src/store/`
  - Global playback and params state (Zustand).
- `src/types/engine.ts` (planned)
  - Shared engine/step contracts.

## Step Event Model (v1 target)

```ts
type StepEvent = {
  id: string;
  index: number;
  type: string;
  payload: Record<string, string | number | boolean | null>;
};
```

Event families (planned):
- Array: compare, swap, write, pivot-set.
- Grid: frontier-push, node-visit, path-finalize.
- Graph: edge-relax, node-select, cycle-detected.
- Tree: insert, search-hit, rotate-left, rotate-right.

## Determinism Rules

- Equal input + params must produce equal ordered step streams.
- Playback speed changes must not alter final state.
- Reset must return to initial renderer state and cursor `0`.

## Playback Lifecycle

- `idle` -> `playing` -> `paused` -> `completed` (planned).
- Required controls:
  - play/pause
  - step forward
  - reset
  - speed scaling
- Optional controls (later phases):
  - step backward
  - loop
  - timeline scrub

## Performance and Robustness Targets

- Avoid main-thread blocking during heavy step generation.
- Introduce worker-backed generation in later phases for heavy algorithms.
- Keep event payloads minimal and renderer-friendly.

## Validation Strategy

- Unit: engine determinism snapshots.
- Integration: playback cursor and renderer consistency.
- Regression: step schema compatibility checks across versions.

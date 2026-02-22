# Engine Technical Guide

This guide explains how the engine is built, why it is structured this way, and how to use or extend it with code-level examples.

## 1. Architecture in Practice

The runtime flow is:

`spec normalization -> engine step generation -> registry lookup -> store playback cursor -> renderer UI`

Core files:

- `src/types/engine.ts`: shared contracts for params, steps, and engine interfaces.
- `src/algorithms/binary-search/spec.ts`: binary search defaults, validation, and normalization.
- `src/algorithms/binary-search/engine.ts`: deterministic step-stream generation.
- `src/algorithms/bubble-sort/spec.ts`: bubble sort defaults, validation, and normalization.
- `src/algorithms/bubble-sort/engine.ts`: deterministic step-stream generation.
- `src/algorithms/registry.ts`: algorithm slug to runtime binding.
- `src/store/app-store.ts`: playback lifecycle, cursor control, and run snapshots.

## 2. Why This Engine Was Built This Way

The v1 implementation uses three explicit design decisions:

1. Pure engines:
   Engine functions never mutate UI state and always return deterministic output for the same normalized input.
2. Precomputed step streams:
   The full step array is generated before playback starts, so play speed only affects timing, not algorithm behavior.
3. Hybrid event typing:
   A generic step envelope works across algorithms, while typed unions keep payloads safe for each algorithm family.

## 3. Core Type Contracts

The shared engine contract is in `src/types/engine.ts`.

```ts
export interface AlgorithmEngine<TInput, TParams, TStep, TResult> {
  normalizeParams: (rawParams: RawParams) => TParams;
  normalizeInput: (rawInput: unknown, params: TParams) => TInput;
  generate: (input: TInput, params: TParams) => {
    steps: TStep[];
    result: TResult;
  };
}
```

Step events always include:

- `id`: stable per run.
- `index`: ordered cursor position.
- `family`: broad renderer grouping (`search`, later `array`, `grid`, etc.).
- `type`: event name (for example `midpoint`).
- `payload`: event-specific primitives.

## 4. Implemented Engine Walkthroughs

Binary Search lives in:

- `src/algorithms/binary-search/spec.ts`
- `src/algorithms/binary-search/engine.ts`

The engine emits the following event sequence:

1. `bounds-init`
2. `midpoint`
3. `bound-update` (left or right)
4. repeat until terminal event:
   `found` or `not-found`

Minimal generation pattern:

```ts
const normalizedParams = binarySearchEngine.normalizeParams(rawParams);
const input = binarySearchEngine.normalizeInput(undefined, normalizedParams);
const { steps, result } = binarySearchEngine.generate(input, normalizedParams);
```

Determinism guarantee:

- same normalized array and target -> same `steps` order and same `result`.

Bubble Sort lives in:

- `src/algorithms/bubble-sort/spec.ts`
- `src/algorithms/bubble-sort/engine.ts`

The engine emits the following event sequence:

1. `compare`
2. `swap` (conditional)
3. `pass-complete`
4. terminal `complete`

Determinism guarantee:

- same normalized array and optimization flag -> same `steps` order and same `result`.

## 5. How to Use the Engine (Runtime)

Use the registry to resolve by slug instead of importing engines directly in UI code.

```ts
import { getAlgorithmRuntime } from "@/algorithms/registry";

const runtime = getAlgorithmRuntime("binary-search");
if (!runtime) throw new Error("Algorithm not implemented");

const run = runtime.createRun({
  arrayValues: "2, 5, 8, 12, 17, 21, 29, 34, 40, 47, 53, 61, 72, 88, 95",
  target: 72,
});
```

`run` contains:

- `input`
- `normalizedParams`
- `steps`
- `result`

## 6. How Playback Uses Engine Output

Playback state is managed in `src/store/app-store.ts`.

Important behavior:

1. `initializeAlgorithm(slug)` loads default params and creates a fresh run.
2. `setParam` and `setParams` regenerate the run and reset cursor to pre-step (`-1`).
3. `stepForward` moves cursor by one and sets `completed` at the final step.
4. `setPlaybackSpeed` clamps to an algorithm-aware range from `src/lib/playback-config.ts`.
5. Pathfinding grid edits (start/target/blocked/heavy/weight controls) write through `setParams`, so edits are deterministic and always regenerate from normalized params.
6. Grid editing is disabled while playback status is `playing` to avoid live run mutation.

Minimal usage:

```ts
const store = useAppStore.getState();
store.initializeAlgorithm("binary-search");
store.setPlaybackStatus("playing");
store.stepForward({ keepStatus: true });
```

## 7. Adding a New Algorithm

To add a new algorithm, follow this exact sequence.

1. Add `src/algorithms/<slug>/spec.ts`.
2. Add `src/algorithms/<slug>/engine.ts` implementing `AlgorithmEngine`.
3. Register it in `src/algorithms/registry.ts` with `defaultParams` and `createRun`.
4. Add or adapt renderer behavior in `src/components/algorithm/visualizer-panel.tsx`.
5. Add parameter controls in `src/components/algorithm/params-panel.tsx`.
6. Add implementation examples in `src/algorithms/examples/<slug>.ts`.
7. Add tests under `tests/engine` and `tests/store` as needed.

Example registry entry:

```ts
const ALGORITHM_RUNTIME_REGISTRY: Record<string, AlgorithmRuntimeDefinition> = {
  "my-algo": {
    slug: "my-algo",
    rendererFamily: "array",
    defaultParams: { size: 24, seed: 42 },
    createRun: createMyAlgoRun,
  },
};
```

## 8. Testing and Validation

Engine quality gate commands:

```bash
npm run test
npm run lint
npm run build
```

Current tests validate:

- engine determinism and fallback behavior,
- runtime registry resolution,
- playback cursor and lifecycle transitions,
- example registry coverage.

## 9. Current Limits and Next Steps

Current implementation is full for Binary Search, BFS, DFS, Dijkstra, A*, Bubble Sort, Quick Sort, Heap Sort, Topological Sort, Selection Sort, Insertion Sort, Merge Sort, and Invert Binary Tree. Remaining algorithms keep scaffolded UI placeholders until their engines are integrated.

Planned next extensions:

1. continue phase-ordered algorithm integrations from `docs/ROADMAP.md`,
2. keep expanding deterministic grid/graph renderer behavior,
3. split renderer logic into dedicated `src/renderers/*` modules as algorithm count increases.

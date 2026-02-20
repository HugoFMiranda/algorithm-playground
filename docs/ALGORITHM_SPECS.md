# Algorithm Specs and Implementation Template

This document defines the per-algorithm plan format and the 20-roadmap backlog.

## Required Spec Template

Each algorithm must define:
1. Learning objective.
2. Input model and constraints.
3. Parameter schema and defaults.
4. Human-friendly explanation copy (plain language).
5. Step event contract (types and payload shape).
6. Renderer requirements.
7. Metrics tracked.
8. Edge cases and invalid-state handling.
9. Acceptance tests.

## Acceptance Test Baseline (all algorithms)

- Deterministic step stream for repeated runs.
- Parameter validation and fallback/default behavior.
- Playback actions preserve expected state transitions.
- Visual completion state matches algorithm output.

## Backlog With Per-Algorithm Plan

## Sorting

### Bubble Sort (`D1`, Phase 1)
- Objective: teach adjacent comparisons, swaps, and pass-level convergence of the sorted suffix.
- Input model:
  - Numeric list provided as comma/space-separated text.
  - Engine preserves normalized numeric order from input (no pre-sort).
  - Empty/invalid arrays fallback to default seed values.
- Params:
  - `arrayValues` (string, default: `37, 12, 29, 8, 44, 19, 3, 25`)
  - `optimizeEarlyExit` (boolean, default: `true`)
- Step event contract:
  - `compare`: adjacent pair comparison for current pass.
  - `swap`: emitted when adjacent elements are out of ascending order.
  - `pass-complete`: summarizes per-pass comparisons/swaps and sorted suffix boundary.
  - `complete`: terminal aggregate metrics and sorted-state flag.
- Renderer requirements:
  - Highlight actively compared pair.
  - Distinct styling when a swap occurs.
  - Persistently mark sorted suffix after each pass.
  - Step status message derived from event payload.
- Metrics tracked:
  - Total comparisons.
  - Total swaps.
  - Total passes executed.
- Edge cases:
  - Already sorted arrays with `optimizeEarlyExit=true` terminate after first pass.
  - Duplicate and negative values preserve deterministic swap ordering.
  - Single-element arrays emit terminal completion state.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed input and flags.
  - Early-exit optimization behavior is toggleable and deterministic.
  - Renderer completion state matches final sorted output.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### Selection Sort (`D1`, Phase 1)
- Objective: teach sorted-prefix growth by scanning for a minimum candidate in the unsorted suffix.
- Input model:
  - Numeric list provided as comma/space-separated text.
  - Engine preserves normalized numeric order from input (no pre-sort).
  - Empty/invalid arrays fallback to default seed values.
- Params:
  - `arrayValues` (string, default: `31, 14, 5, 23, 8, 17, 42, 9`)
  - `swapOnlyWhenNeeded` (boolean, default: `true`)
- Step event contract:
  - `candidate-min`: emits initial pass candidate and deterministic candidate updates.
  - `compare`: compares current candidate against a suffix element.
  - `swap`: emits final pass swap (or forced self-swap when configured).
  - `pass-complete`: summarizes pass-level comparisons, selected minimum index, and sorted-prefix boundary.
  - `complete`: terminal aggregate metrics and sorted-state flag.
- Renderer requirements:
  - Highlight sorted prefix (`[0, pass]`) after each completed pass.
  - Distinct styling for current minimum candidate and currently compared element.
  - Distinct styling when a swap occurs.
  - Step status message derived from event payload.
- Metrics tracked:
  - Total comparisons.
  - Total swaps.
  - Total passes executed.
- Edge cases:
  - Already sorted arrays still perform full comparison schedule.
  - Duplicate and negative values preserve deterministic minimum-selection behavior.
  - `swapOnlyWhenNeeded=false` forces one swap event per pass, including self-swaps.
  - Single-element arrays emit terminal completion state.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed input and flags.
  - Swap-behavior toggle (`swapOnlyWhenNeeded`) remains deterministic.
  - Renderer completion state matches final sorted output.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### Insertion Sort (`D1`, Phase 1)
- Objective: teach local shifting and insertion-point placement while growing a sorted prefix.
- Input model:
  - Numeric list provided as comma/space-separated text.
  - Engine preserves normalized numeric order from input (no pre-sort).
  - Empty/invalid arrays fallback to default seed values.
- Params:
  - `arrayValues` (string, default: `22, 9, 31, 14, 6, 27, 18, 11`)
  - `allowEarlyPlacement` (boolean, default: `true`)
- Step event contract:
  - `select-key`: selects the key value from current pass boundary.
  - `compare`: compares key against a prefix element.
  - `shift-right`: shifts larger prefix value one index to the right.
  - `insert`: places key at its resolved insertion index.
  - `pass-complete`: summarizes pass-level comparisons/shifts and insertion index.
  - `complete`: terminal aggregate metrics and sorted-state flag.
- Renderer requirements:
  - Highlight sorted prefix after each completed pass.
  - Distinct styling for key selection, current compare index, and shift target.
  - Distinct styling when key placement occurs.
  - Step status message derived from event payload.
- Metrics tracked:
  - Total comparisons.
  - Total shifts.
  - Total passes executed.
- Edge cases:
  - Already sorted arrays achieve linear best-case only when `allowEarlyPlacement=true`.
  - Duplicate and negative values preserve deterministic stable insertion behavior.
  - `allowEarlyPlacement=false` continues full-prefix scan per pass for deterministic comparison inflation.
  - Single-element arrays emit terminal completion state.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed input and flags.
  - Early-placement toggle (`allowEarlyPlacement`) remains deterministic.
  - Renderer completion state matches final sorted output.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### Merge Sort (`D2`, Phase 1)
- Objective: teach divide-and-conquer splitting and deterministic merge composition into sorted ranges.
- Input model:
  - Numeric list provided as comma/space-separated text.
  - Engine preserves normalized numeric order from input (no pre-sort).
  - Empty/invalid arrays fallback to default seed values.
- Params:
  - `arrayValues` (string, default: `38, 12, 27, 9, 43, 3, 21, 15`)
  - `preferLeftOnEqual` (boolean, default: `true`)
- Step event contract:
  - `split-range`: recursive split boundary with `start`, `mid`, `end`, and `depth`.
  - `merge-start`: announces merge operation for adjacent sorted halves.
  - `merge-compare`: compares current left/right candidate values for merge output.
  - `write-back`: writes chosen value into merged target index.
  - `merge-complete`: summarizes completed merge span and writes used.
  - `complete`: terminal aggregate metrics and sorted-state flag.
- Renderer requirements:
  - Highlight active merge range and recursion depth context.
  - Distinct styling for left/right pointers and write target.
  - Distinct styling for source index used in each write.
  - Step status message derived from event payload.
- Metrics tracked:
  - Total comparisons.
  - Total write-back operations.
  - Total merges executed.
  - Maximum recursion depth reached.
- Edge cases:
  - Duplicate values use deterministic tie behavior controlled by `preferLeftOnEqual`.
  - Negative values and repeated values preserve deterministic stable merge decisions.
  - Single-element arrays emit terminal completion state without split/merge events.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed input and flags.
  - Tie-behavior toggle (`preferLeftOnEqual`) remains deterministic.
  - Renderer completion state matches final sorted output.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### Quick Sort (`D2`, Phase 2)
- Objective: teach partition strategy and pivot semantics.
- Renderer: array.
- Key events: pivot-set, compare, partition-swap.

### Heap Sort (`D3`, Phase 2)
- Objective: teach heap build and extraction cycles.
- Renderer: array (heap-index overlay).
- Key events: heapify, sift-down, root-swap.

## Pathfinding

### BFS (`D1`, Phase 1)
- Objective: teach level-by-level frontier expansion and shortest-path discovery in unweighted grids.
- Input model:
  - Grid dimensions (`rows`, `cols`) define cell indexing from `0` to `(rows * cols - 1)`.
  - `startCell` and `targetCell` are normalized into valid range.
  - `blockedCells` is parsed from comma/space-separated indices and excludes start/target.
  - Optional diagonal movement is controlled by a boolean parameter.
- Params:
  - `rows` (number, default: `6`)
  - `cols` (number, default: `8`)
  - `startCell` (number, default: `0`)
  - `targetCell` (number, default: `47`)
  - `blockedCells` (string, default: `10, 11, 12, 20, 28, 36, 37`)
  - `allowDiagonal` (boolean, default: `false`)
- Human-friendly explanation:
  - BFS explores all nodes one step away, then two steps away, and so on, so the first target hit is the shortest unweighted path.
- Step event contract:
  - `enqueue`: cell pushed into queue with depth and queue size.
  - `visit`: dequeued active cell visit event.
  - `inspect-neighbor`: neighbor classification (`blocked`, `visited`, `enqueue`).
  - `frontier-layer-complete`: layer summary with queue carry-over count.
  - `found`: terminal hit with depth/path metadata.
  - `not-found`: terminal miss summary.
- Renderer requirements:
  - Render deterministic grid state from normalized input.
  - Distinct cell styling for blocked, queued, visited, current, and final path cells.
  - Highlight neighbor-inspection outcomes on current step.
  - Step status text derived from event payload.
- Metrics tracked:
  - Visited count.
  - Enqueued count.
  - Layer count.
  - Shortest distance (if found).
- Edge cases:
  - `startCell === targetCell` immediately emits deterministic found state.
  - Fully blocked traversal emits deterministic `not-found` terminal state.
  - Diagonal toggle changes neighbor set deterministically.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed index/boolean input.
  - Playback transition correctness (`idle`, `playing`, `paused`, `completed`).
  - Renderer completion state matches result payload.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### DFS (`D1`, Phase 1)
- Objective: teach deep-branch exploration, stack discipline, and explicit backtracking behavior.
- Input model:
  - Grid dimensions (`rows`, `cols`) define cell indexing from `0` to `(rows * cols - 1)`.
  - `startCell` and `targetCell` are normalized into valid range.
  - `blockedCells` is parsed from comma/space-separated indices and excludes start/target.
  - Optional diagonal movement and neighbor-order policy are controlled by booleans.
- Params:
  - `rows` (number, default: `6`)
  - `cols` (number, default: `8`)
  - `startCell` (number, default: `0`)
  - `targetCell` (number, default: `47`)
  - `blockedCells` (string, default: `9, 10, 18, 26, 27, 35, 36`)
  - `allowDiagonal` (boolean, default: `false`)
  - `preferClockwise` (boolean, default: `true`)
- Human-friendly explanation:
  - DFS keeps moving forward as far as possible; when it gets stuck, it backs up and tries the next option.
- Step event contract:
  - `push-stack`: node pushed onto traversal stack.
  - `visit`: active stack-top visitation event.
  - `inspect-neighbor`: neighbor classification (`blocked`, `visited`, `push`).
  - `backtrack`: pop and return to parent/top stack state.
  - `found`: terminal hit with depth/path metadata.
  - `not-found`: terminal miss summary.
- Renderer requirements:
  - Render deterministic grid state from normalized input.
  - Distinct cell styling for blocked, stacked, visited, current, and final path cells.
  - Highlight neighbor-inspection outcomes and backtrack transitions on current step.
  - Step status text derived from event payload.
- Metrics tracked:
  - Visited count.
  - Stack pushes.
  - Backtrack count.
  - Found depth (if found).
- Edge cases:
  - `startCell === targetCell` immediately emits deterministic found state.
  - Fully blocked traversal emits deterministic `not-found` terminal state.
  - Diagonal and clockwise toggles change neighbor order deterministically.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed index/boolean input.
  - Playback transition correctness (`idle`, `playing`, `paused`, `completed`).
  - Renderer completion state matches result payload.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### Dijkstra (`D2`, Phase 1)
- Objective: teach weighted shortest-path discovery through repeated minimum extraction and edge relaxation.
- Input model:
  - Grid dimensions (`rows`, `cols`) define cell indexing from `0` to `(rows * cols - 1)`.
  - `startCell` and `targetCell` are normalized into valid range.
  - `blockedCells` and `heavyCells` are parsed from comma/space-separated indices and exclude start/target.
  - Cell entry weights are generated deterministically from `weightSeed`, with heavy cells receiving higher costs.
  - Optional diagonal movement is controlled by a boolean parameter.
- Params:
  - `rows` (number, default: `6`)
  - `cols` (number, default: `8`)
  - `startCell` (number, default: `0`)
  - `targetCell` (number, default: `47`)
  - `blockedCells` (string, default: `10, 11, 19, 27, 35`)
  - `heavyCells` (string, default: `14, 15, 22, 23, 30, 31`)
  - `allowDiagonal` (boolean, default: `false`)
  - `weightSeed` (number, default: `3`)
- Human-friendly explanation:
  - Dijkstra always expands the currently cheapest known position first, so when it reaches the target that path cost is optimal.
- Step event contract:
  - `extract-min`: frontier node with smallest known distance is settled.
  - `relax-edge`: evaluates outgoing edge and classifies outcome (`blocked`, `visited`, `skip`, `update`).
  - `distance-update`: records improved shortest-known distance and parent pointer.
  - `found`: terminal hit with final distance and path metadata.
  - `not-found`: terminal miss summary.
  - `complete`: terminal aggregate run summary.
- Renderer requirements:
  - Render deterministic weighted grid state from normalized input.
  - Distinct styling for blocked, heavy, frontier, settled, current, and final path cells.
  - Display per-cell weight and best-known distance overlays.
  - Highlight relaxation outcome for inspected neighbor on current step.
  - Step status text derived from event payload.
- Metrics tracked:
  - Visited (settled) count.
  - Successful relaxations.
  - Final shortest distance (if found).
  - Final path cells.
- Edge cases:
  - `startCell === targetCell` emits deterministic zero-distance found state.
  - Unreachable targets emit deterministic `not-found` terminal state.
  - Diagonal toggle and weight seed change traversal deterministically.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed index/boolean input.
  - Playback transition correctness (`idle`, `playing`, `paused`, `completed`).
  - Renderer completion state matches result payload.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### A* Search (`D2`, Phase 1)
- Objective: heuristic-guided exploration.
- Renderer: weighted grid.
- Key events: score-update, open-set-push, path-reconstruct.

### Bidirectional BFS (`D3`, Phase 3)
- Objective: two-frontier convergence behavior.
- Renderer: grid/graph.
- Key events: forward-visit, backward-visit, meet-detected.

## Graph Theory

### Topological Sort (`D2`, Phase 2)
- Objective: DAG ordering constraints.
- Renderer: directed graph.
- Key events: indegree-decrement, queue-push, node-output.

### Union-Find (`D2`, Phase 2)
- Objective: disjoint set operations and compression.
- Renderer: component clusters.
- Key events: find-root, compress-path, union.

### Kruskal MST (`D2`, Phase 2)
- Objective: greedy edge selection with cycle prevention.
- Renderer: weighted graph.
- Key events: edge-consider, union-check, edge-accept.

### Prim MST (`D2`, Phase 2)
- Objective: grow MST from frontier edges.
- Renderer: weighted graph.
- Key events: candidate-edge, node-add, edge-lock.

### Bellman-Ford (`D3`, Phase 3)
- Objective: repeated relaxations and negative cycle detection.
- Renderer: directed weighted graph.
- Key events: relaxation-round, distance-update, negative-cycle-flag.

## Trees and Search

### Binary Search (`D1`, Phase 1)
- Objective: interval halving and boundary update.
- Input model:
  - Numeric list provided as comma/space-separated text.
  - Engine normalizes to ascending numeric array; invalid tokens are dropped.
  - Empty/invalid arrays fallback to default seed values.
- Params:
  - `arrayValues` (string, default: `2, 5, 8, 12, 17, 21, 29, 34, 40, 47, 53, 61, 72, 88, 95`)
  - `target` (number, default: `72`)
- Step event contract:
  - `bounds-init`: initial `low`/`high`
  - `midpoint`: active interval + midpoint value comparison context
  - `bound-update`: left/right interval contraction
  - `found`: terminal match metadata
  - `not-found`: terminal miss with insert position
- Renderer requirements:
  - Highlight active `[low, high]` interval.
  - Distinct midpoint and found-node styling.
  - Step status message derived from current event payload.
- Metrics tracked:
  - Iteration count.
  - Final found index or miss.
- Edge cases:
  - Duplicate values (deterministic midpoint match behavior).
  - Target outside min/max bounds.
  - Single-element array hit/miss.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed input.
  - Playback transition correctness (`idle`, `playing`, `paused`, `completed`).
  - Renderer completion state matches result payload.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### BST Operations (`D2`, Phase 3)
- Objective: structural changes for insert/search/delete.
- Renderer: tree.
- Key events: traverse, insert-node, delete-case.

### AVL Rotations (`D3`, Phase 3)
- Objective: balance factor and rotation cases.
- Renderer: tree.
- Key events: imbalance-detected, rotate-left, rotate-right.

### Trie Operations (`D2`, Phase 2)
- Objective: prefix-sharing and branching lookup.
- Renderer: trie tree.
- Key events: node-create, traverse-char, word-terminal-set.

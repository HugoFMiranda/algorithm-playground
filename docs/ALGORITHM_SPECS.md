# Algorithm Specs and Implementation Template

This document defines the per-algorithm plan format and the 21-roadmap backlog.

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
- Objective: teach partitioning behavior, pivot strategy, and recursive divide-and-conquer sorting.
- Input model:
  - Numeric list provided as comma/space-separated text.
  - Engine preserves normalized numeric order from input (no pre-sort).
  - Empty/invalid arrays fallback to default seed values.
- Params:
  - `arrayValues` (string, default: `29, 10, 14, 37, 13, 5, 22, 31`)
  - `pivotStrategy` (string enum: `last | middle`, default: `last`)
- Human-friendly explanation:
  - Quick Sort picks a pivot, partitions smaller values to the left and larger values to the right, then repeats on both sides.
- Step event contract:
  - `pivot-set`: chosen pivot metadata for active partition range.
  - `compare`: compares current element with pivot value.
  - `partition-swap`: swap event for pivot-move, partition swap, or pivot placement.
  - `partition-complete`: partition summary with pivot final index and side sizes.
  - `complete`: terminal aggregate metrics and sorted-state flag.
- Renderer requirements:
  - Highlight active partition range, pivot index, compared index, and swap pair.
  - Distinct styling for finalized pivot positions after partition completion.
  - Step status message derived from event payload.
- Metrics tracked:
  - Total comparisons.
  - Total swaps.
  - Total partitions executed.
  - Maximum recursion depth reached.
- Edge cases:
  - Duplicate and negative values preserve deterministic partition behavior.
  - `pivotStrategy` controls deterministic pivot selection (`last` vs midpoint index).
  - Single-element arrays emit terminal completion state without partition events.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed input and pivot strategy values.
  - Pivot strategy toggle remains deterministic.
  - Renderer completion state matches final sorted output.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### Heap Sort (`D3`, Phase 2)
- Objective: teach max-heap construction and repeated extraction of the largest element into a growing sorted suffix.
- Input model:
  - Numeric list provided as comma/space-separated text.
  - Engine preserves normalized numeric order from input (no pre-sort).
  - Empty/invalid arrays fallback to default seed values.
- Params:
  - `arrayValues` (string, default: `41, 17, 33, 5, 12, 29, 8, 50`)
- Human-friendly explanation:
  - Heap Sort first organizes values into a max heap so the biggest value is always at the root, then swaps that root to the end and rebuilds the heap until everything is sorted.
- Step event contract:
  - `heapify-start`: begins a sift-down operation at a root index for current heap size.
  - `compare`: compares the current candidate node against a child during sift-down.
  - `swap`: swap event for either `sift-down` or `extract-root`.
  - `heapify-complete`: confirms current heapify call is complete.
  - `complete`: terminal aggregate metrics and sorted-state flag.
- Renderer requirements:
  - Highlight active heap region (`[0, heapSize)`), compared pair, active root, and swap pair.
  - Distinct styling for sorted suffix after each root extraction.
  - Step status message derived from event payload.
- Metrics tracked:
  - Total comparisons.
  - Total swaps.
  - Total heapify calls.
  - Total extraction steps.
- Edge cases:
  - Duplicate and negative values preserve deterministic heapify and extraction ordering.
  - Arrays of length `0` or `1` emit terminal completion state without heapify/extract loops.
  - Invalid array input falls back to deterministic default seed values.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed array input.
  - Result metrics and completion event are emitted consistently.
  - Renderer completion state matches final sorted output.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

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
  - Provide direct grid editing tools for start, target, blocked paint, and blocked erase.
  - Support click + drag paint for blocked and erase tools.
  - Disable grid editing while playback status is `playing`.
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
  - Provide direct grid editing tools for start, target, blocked paint, and blocked erase.
  - Support click + drag paint for blocked and erase tools.
  - Disable grid editing while playback status is `playing`.
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
  - `weightOverrides` (string, default: `""`, format: `cell:weight`)
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
  - Provide direct grid editing tools for start, target, blocked paint/erase, heavy paint/erase, and weight edit.
  - Support click + drag paint for blocked/heavy edits.
  - Disable grid editing while playback status is `playing`.
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
  - Weight overrides on blocked/start/target cells are ignored during normalization.
  - Diagonal toggle and weight seed change traversal deterministically.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed index/boolean input.
  - Playback transition correctness (`idle`, `playing`, `paused`, `completed`).
  - Renderer completion state matches result payload.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### A* Search (`D2`, Phase 1)
- Objective: teach heuristic-guided shortest path search on weighted grids.
- Input model:
  - Grid dimensions (`rows`, `cols`) define cell indexing from `0` to `(rows * cols - 1)`.
  - `startCell` and `targetCell` are normalized into valid range.
  - `blockedCells` and `heavyCells` are parsed from comma/space-separated indices and exclude start/target.
  - Cell entry weights are generated deterministically from `weightSeed`, with heavy cells receiving higher costs.
  - `weightOverrides` supports manual `cell:weight` overrides after deterministic generation.
  - Heuristic estimate uses Manhattan (4-direction) or Chebyshev (8-direction), scaled by `heuristicWeight`.
- Params:
  - `rows` (number, default: `6`)
  - `cols` (number, default: `8`)
  - `startCell` (number, default: `0`)
  - `targetCell` (number, default: `47`)
  - `blockedCells` (string, default: `9, 10, 11, 19, 27, 35`)
  - `heavyCells` (string, default: `14, 15, 22, 23, 30, 31`)
  - `allowDiagonal` (boolean, default: `false`)
  - `weightSeed` (number, default: `5`)
  - `weightOverrides` (string, default: `""`, format: `cell:weight`)
  - `heuristicWeight` (number, default: `1`)
- Human-friendly explanation:
  - A* scores each candidate by travel cost so far plus an estimate to the target, so it usually reaches goals faster than uninformed search.
- Step event contract:
  - `open-select`: selects the open-set node with smallest `f = g + h`.
  - `inspect-neighbor`: neighbor classification (`blocked`, `closed`, `skip`, `update`).
  - `score-update`: records improved `g` and derived `f` values plus parent pointer.
  - `found`: terminal hit with final distance and path metadata.
  - `not-found`: terminal miss summary.
  - `complete`: terminal aggregate run summary.
- Renderer requirements:
  - Render deterministic weighted grid state from normalized input.
  - Distinct styling for blocked, heavy, open, closed, current, and final path cells.
  - Provide direct grid editing tools for start, target, blocked paint/erase, heavy paint/erase, and weight edit.
  - Support click + drag paint for blocked/heavy edits.
  - Disable grid editing while playback status is `playing`.
  - Display per-cell weight and current `g`/`f` overlays.
  - Step status text derived from event payload.
- Metrics tracked:
  - Expanded (closed-set) count.
  - Successful score updates.
  - Final shortest distance (if found).
  - Final path cells.
- Edge cases:
  - `startCell === targetCell` emits deterministic zero-distance found state.
  - Unreachable targets emit deterministic `not-found` terminal state.
  - Weight overrides on blocked/start/target cells are ignored during normalization.
  - Heuristic weight and diagonal toggle change exploration deterministically.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed index/boolean/number input.
  - Playback transition correctness (`idle`, `playing`, `paused`, `completed`).
  - Renderer completion state matches result payload.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

### Bidirectional BFS (`D3`, Phase 3)
- Objective: two-frontier convergence behavior.
- Renderer: grid/graph.
- Key events: forward-visit, backward-visit, meet-detected.

## Graph Theory

### Topological Sort (`D2`, Phase 2)
- Objective: teach dependency-safe ordering in directed acyclic graphs using indegree tracking and queue-driven output.
- Input model:
  - Node set is indexed from `0` to `nodeCount - 1`.
  - Directed edges are provided as string pairs (`from>to`, `from->to`, or `from:to`).
  - Invalid, duplicate, out-of-range, and self-loop edges are ignored during normalization.
  - Empty/invalid edge input falls back to deterministic default DAG edges.
- Params:
  - `nodeCount` (number, default: `10`)
  - `edges` (string, default: `0>4, 1>4, 1>5, 2>5, 2>6, 3>6, 4>7, 5>7, 6>8, 7>9, 8>9`)
  - `preferLowerIndex` (boolean, default: `true`)
- Human-friendly explanation:
  - Topological Sort repeatedly takes any node with no remaining prerequisites, outputs it, and removes its outgoing edges. If nodes remain but none can be chosen, a cycle exists.
- Step event contract:
  - `queue-push`: node enters zero-indegree queue (`initial-zero` or `indegree-zero`).
  - `node-output`: queue pop and append to output ordering.
  - `indegree-decrement`: processes an outgoing edge and updates target indegree.
  - `complete`: terminal summary with output length and cycle status.
- Renderer requirements:
  - Highlight queued nodes, current output node, and processed order.
  - Show live indegree value for each node.
  - Highlight currently processed directed edge.
  - Distinct completion state for valid ordering vs cycle-detected run.
  - Step status message derived from event payload.
- Metrics tracked:
  - Output order length.
  - Total edge relaxations (indegree decrements).
  - Initial zero-indegree node count.
  - Cycle detected flag and remaining unresolved nodes.
- Edge cases:
  - Multiple valid orders are resolved deterministically via `preferLowerIndex`.
  - Cyclic graphs terminate with `cycleDetected=true` and partial output order.
  - Disconnected DAG components remain valid and are emitted in deterministic queue order.
- Acceptance tests:
  - Deterministic output snapshots for fixed params.
  - Param fallback behavior for malformed node count / edge text / boolean values.
  - Valid DAG run emits full order with `cycleDetected=false`.
  - Cyclic run emits partial order with `cycleDetected=true`.
- Code examples:
  - Algorithm page includes abstracted pseudocode and TypeScript reference snippets, maintained in per-algorithm example source files.

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

### Invert Binary Tree (`D1`, Phase 2)
- Objective: teach structural tree transformation by mirroring each subtree.
- Input model:
  - Binary tree provided from level-order input with `null` placeholders for missing children.
  - Empty input produces an empty tree result with deterministic no-op step stream.
- Params:
  - `treeValues` (string, default: `4, 2, 7, 1, 3, 6, 9`)
  - `traversalMode` (string enum: `dfs | bfs`, default: `dfs`)
- Human-friendly explanation:
  - Invert Binary Tree mirrors the tree by swapping each node's left and right children.
- Step event contract:
  - `visit-node`: active node selected for inversion.
  - `swap-children`: node children swapped (`left <-> right`).
  - `complete`: terminal summary including total visited nodes and root snapshot.
- Renderer requirements:
  - Tree renderer with clear left/right edge orientation.
  - Highlight current node and animate child-swap direction.
  - Step status message derived from event payload.
- Metrics tracked:
  - Visited node count.
  - Swap count.
- Edge cases:
  - Empty tree returns immediately.
  - Single-node tree emits deterministic visit + complete without structural change.
  - Sparse trees preserve `null` structure while swapping existing children.
- Acceptance tests:
  - Deterministic output snapshots for fixed trees and traversal mode.
  - Param fallback behavior for malformed tree/traversal input.
  - Renderer completion state matches final inverted tree output.

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

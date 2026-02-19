# Algorithm Specs and Implementation Template

This document defines the per-algorithm plan format and the 20-roadmap backlog.

## Required Spec Template

Each algorithm must define:
1. Learning objective.
2. Input model and constraints.
3. Parameter schema and defaults.
4. Step event contract (types and payload shape).
5. Renderer requirements.
6. Metrics tracked.
7. Edge cases and invalid-state handling.
8. Acceptance tests.

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
- Objective: teach boundary between sorted/unsorted regions.
- Renderer: array.
- Key events: candidate-min, compare, swap.

### Insertion Sort (`D1`, Phase 1)
- Objective: teach local shifting and insertion point.
- Renderer: array.
- Key events: compare, shift-right, insert.

### Merge Sort (`D2`, Phase 1)
- Objective: teach divide-and-conquer merge phases.
- Renderer: array.
- Key events: split-range, merge-compare, write-back.

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
- Objective: frontier expansion by depth.
- Renderer: grid.
- Key events: enqueue, visit, frontier-layer-complete.

### DFS (`D1`, Phase 1)
- Objective: depth-first traversal dynamics.
- Renderer: grid/graph.
- Key events: push-stack, visit, backtrack.

### Dijkstra (`D2`, Phase 1)
- Objective: weighted shortest path via relaxation.
- Renderer: weighted grid/graph.
- Key events: extract-min, relax-edge, distance-update.

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

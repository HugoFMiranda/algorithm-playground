# algorithm-playground Technical Roadmap

## Mission

Build `algorithm-playground` into a hub for algorithm visualizations with:
- discoverability (library-first UX),
- deterministic playback and inspection,
- reusable visualization infrastructure across algorithm families.

Audience target is broad: learners, interview preparation users, and engineering practitioners.

## Planning Horizon

- Phase window: 3 phases over approximately 3 months.
- Current status: UI scaffold completed; Binary Search and Bubble Sort shipped as engine-backed vertical slices, with remaining engines pending.

## Difficulty Rubric

- `D1` Easy: simple state transitions and renderer flow.
- `D2` Moderate: multi-step invariants and richer state events.
- `D3` Hard: complex invariants, branching, and heavy renderer/state coordination.

## Phase Goals

## Phase 1 (Weeks 1-4): Visual Core MVP

Goals:
- Ship first complete simulation loop (`algorithm -> steps -> renderer -> playback`).
- Deliver high-clarity visuals for foundational sorting and pathfinding.

Algorithms:
- Bubble Sort (`D1`)
- Selection Sort (`D1`)
- Insertion Sort (`D1`)
- Merge Sort (`D2`)
- BFS (`D1`)
- DFS (`D1`)
- Dijkstra (`D2`)
- A* (`D2`)
- Binary Search (`D1`)

Core infra milestones:
- Step event schema v1.
- Array + grid renderer v1.
- Deterministic playback (play/pause/step/reset/speed).
- Params validation and defaults.

## Phase 2 (Weeks 5-8): Breadth and Graph Maturity

Goals:
- Expand category coverage and harden shared rendering infrastructure.
- Introduce richer graph/tree interaction patterns.

Algorithms:
- Quick Sort (`D2`)
- Heap Sort (`D3`)
- Topological Sort (`D2`)
- Union-Find (`D2`)
- Kruskal MST (`D2`)
- Prim MST (`D2`)
- Trie Operations (`D2`)

Core infra milestones:
- Graph renderer v2 (weighted/directed cues).
- Schema-driven parameter controls.
- URL-state sharing for reproducible runs.

## Phase 3 (Weeks 9-12): Advanced Correctness and Comparison

Goals:
- Deliver advanced algorithms requiring stronger invariants and diagnostics.
- Add comparison-focused tooling.

Algorithms:
- Bidirectional BFS (`D3`)
- Bellman-Ford (`D3`)
- BST Operations (`D2`)
- AVL Rotations (`D3`)

Core infra milestones:
- Side-by-side comparison mode.
- Expanded metrics overlays.
- Worker-backed step generation for heavy workloads.

## Algorithm Portfolio (20)

| Algorithm | Category | Difficulty | Planned Phase |
| --- | --- | --- | --- |
| Bubble Sort | Sorting | D1 | Phase 1 |
| Selection Sort | Sorting | D1 | Phase 1 |
| Insertion Sort | Sorting | D1 | Phase 1 |
| Merge Sort | Sorting | D2 | Phase 1 |
| Quick Sort | Sorting | D2 | Phase 2 |
| Heap Sort | Sorting | D3 | Phase 2 |
| BFS | Pathfinding | D1 | Phase 1 |
| DFS | Pathfinding | D1 | Phase 1 |
| Dijkstra | Pathfinding | D2 | Phase 1 |
| A* Search | Pathfinding | D2 | Phase 1 |
| Bidirectional BFS | Pathfinding | D3 | Phase 3 |
| Topological Sort | Graph Theory | D2 | Phase 2 |
| Union-Find | Graph Theory | D2 | Phase 2 |
| Kruskal MST | Graph Theory | D2 | Phase 2 |
| Prim MST | Graph Theory | D2 | Phase 2 |
| Bellman-Ford | Graph Theory | D3 | Phase 3 |
| Binary Search | Trees & Search | D1 | Phase 1 |
| BST Operations | Trees & Search | D2 | Phase 3 |
| AVL Rotations | Trees & Search | D3 | Phase 3 |
| Trie Operations | Trees & Search | D2 | Phase 2 |

## Release Gates

Each phase closes only when:
- `npm run lint` and `npm run build` pass.
- New algorithm entries include docs and typed metadata.
- Step streams are deterministic for identical inputs.
- `AGENTS.md` and `docs/*` are synchronized for changed process/architecture decisions.

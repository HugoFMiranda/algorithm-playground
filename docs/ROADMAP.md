# algorithm-playground Technical Roadmap

## Mission

Build `algorithm-playground` into a hub for algorithm visualizations with:
- discoverability (library-first UX),
- deterministic playback and inspection,
- reusable visualization infrastructure across algorithm families.

Audience target is broad: learners, interview preparation users, and engineering practitioners.

## Planning Horizon

- Phase window: 3 phases over approximately 3 months.
- Current status: UI scaffold completed; Binary Search, BFS, Bidirectional BFS, DFS, Dijkstra, A*, Bubble Sort, Quick Sort, Heap Sort, Topological Sort, Union-Find, Kruskal MST, Prim MST, Bellman-Ford, Trie Operations, Selection Sort, Counting Sort, Insertion Sort, Merge Sort, Invert Binary Tree, BST Operations, and AVL Rotations shipped as engine-backed vertical slices, completing the current algorithm backlog. The `/compare` route now ships side-by-side default-run summaries with normalized metrics overlays, synchronized shared inputs for compatible algorithms that share a renderer family, local playback parity with shared cursor controls and per-side step inspection, and synchronized visual playback for array and pathfinding/grid simple renderer families. Algorithm pages now also ship per-page `Simple` / `Advanced` renderer modes, with `Simple` active for array and pathfinding/grid algorithms.
- Next implementation target: tighten compare-mode renderer coverage and family-specific visual accuracy, starting with unsupported graph/tree comparison families and any remaining simple-view polish.

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
- Invert Binary Tree (`D1`)
- Quick Sort (`D2`)
- Heap Sort (`D3`)
- Counting Sort (`D2`)
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

## Post-Backlog Renderer Rollout

Goals:
- Add a short-form-friendly simple renderer track without replacing the current detailed educational views.
- Keep playback deterministic by reusing existing step streams and controls.
- Start modularizing renderer code by family instead of continuing to grow a single visualizer surface.

Implementation order:
1. Documentation sync and stale-plan cleanup.
2. Renderer-mode architecture split (`Simple` / `Advanced`).
3. Per-page mode toggle with persistent local UI state.
4. Array-family simple renderer rollout.
   - Bubble Sort
   - Selection Sort
   - Insertion Sort
   - Binary Search
   - Merge Sort
   - Quick Sort
   - Heap Sort
   - Counting Sort
5. Grid/pathfinding simple renderer rollout.
   - BFS
   - DFS
   - Dijkstra
   - A*
   - Bidirectional BFS
6. Renderer hardening pass:
   - persistent `Simple` / `Advanced` preference,
   - clearer legends and state cues,
   - family-level polish before compare-mode visuals resume.
7. Compare-mode visual playback rollout:
   - reuse simple array/grid renderers in `/compare`,
   - keep graph/tree pairs on metrics-only fallback until dedicated compare visuals exist,
   - evaluate compare-specific renderer controls after the first visual pass stabilizes.

Out of scope for this rollout:
- graph-family simple renderers,
- tree-family simple renderers,
- autoplay/demo-mode playback,
- a separate short-video route.

## Algorithm Portfolio (22)

| Algorithm | Category | Difficulty | Planned Phase |
| --- | --- | --- | --- |
| Bubble Sort | Sorting | D1 | Phase 1 |
| Selection Sort | Sorting | D1 | Phase 1 |
| Insertion Sort | Sorting | D1 | Phase 1 |
| Merge Sort | Sorting | D2 | Phase 1 |
| Counting Sort | Sorting | D2 | Phase 2 |
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
| Invert Binary Tree | Trees & Search | D1 | Phase 2 |
| BST Operations | Trees & Search | D2 | Phase 3 |
| AVL Rotations | Trees & Search | D3 | Phase 3 |
| Trie Operations | Trees & Search | D2 | Phase 2 |

## Release Gates

Each phase closes only when:
- `npm run test`, `npm run lint`, and `npm run build` pass.
- CI workflow checks are green on the release PR.
- New algorithm entries include docs and typed metadata.
- Step streams are deterministic for identical inputs.
- `AGENTS.md` and `docs/*` are synchronized for changed process/architecture decisions.
- Release Please release PR is up to date and mergeable.
- `CHANGELOG.md` has curated `Added`, `Changed`, and `Fixed` entries for the checkpoint.
- A version tag (`v0.x.y`) and GitHub Release are published for phase-level milestones.

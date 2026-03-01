# algorithm-playground

`algorithm-playground` is a frontend-only algorithm visualization hub built with Next.js and TypeScript.
It focuses on deterministic step playback, reusable renderer patterns, and clear algorithm explanations.

## Disclaimer 

This is a personal project that im doing to save and study some algorithms. Some implementations may not be perfect or in 100% accordance with the math.

## Current Scope

- Library-first discovery UI with command-style search and implemented-state tagging.
- Dynamic algorithm pages at `/algorithms/[slug]`.
- Deterministic playback controls: play, pause, step, reset, speed.
- Algorithm-specific parameter controls with normalization/randomization.
- Complexity panel with best/average/worst and run-context complexity.
- Easy explanation + pseudocode/TypeScript examples per implemented algorithm.

## Implemented Algorithms

- Binary Search
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort
- Breadth-First Search (BFS)
- Depth-First Search (DFS)
- Dijkstra
- A* Search
- Topological Sort
- Union-Find
- Invert Binary Tree

## Planned (Roadmap)

- Bidirectional BFS
- Kruskal MST
- Prim MST
- Bellman-Ford
- BST Operations
- AVL Rotations
- Trie Operations

Roadmap and ordering are maintained in `docs/ROADMAP.md`.

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand
- Framer Motion
- Vitest + ESLint + TypeScript checks

## Local Development

```bash
npm install
npm run dev
```

App URL: `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run test
npm run lint
npm run build
```

## Quality Gates

- `npm run test`
- `npm run lint`
- `npm run build`

All three are expected to pass before merging or releasing.

## Releases

- Conventional Commits are required.
- Release management is automated with Release Please.
- CI runs on PRs and pushes to `main`/`develop`.
- Versioning uses pre-1.0 SemVer (`0.x.y`), where `feat(...)` bumps minor and `fix(...)` bumps patch.

## Deployment

Deploy as a standard Next.js app on Vercel.
No required runtime environment variables in the current scope.

## Documentation

- `AGENTS.md`: governance, guardrails, and definition of done.
- `docs/ROADMAP.md`: phase planning and algorithm ordering.
- `docs/ENGINE.md`: playback engine architecture.
- `docs/ENGINE_TECHNICAL_GUIDE.md`: engine implementation details.
- `docs/ALGORITHM_SPECS.md`: per-algorithm implementation plans.
- `docs/ARCHITECTURE.md`: current/target architecture.
- `docs/CONTRIBUTING.md`: workflow and PR expectations.

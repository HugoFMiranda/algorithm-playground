# algorithm-playground

algorithm-playground is a polished, minimalist web application scaffold for algorithm visualization.
The project now includes the first fully implemented engine-backed algorithm slice, with additional algorithms planned in the roadmap docs.

## What This Project Includes

- Premium library home page at `/` with command-palette-style search.
- Dynamic algorithm route at `/algorithms/[slug]` with algorithm-specific runtime integration.
- Deterministic playback controls (play/pause/step/reset/speed) for implemented algorithms.
- Parameter controls with normalization and randomization support for Binary Search.
- Abstracted algorithm code examples panel (pseudocode + TypeScript).
- Zustand state for selected algorithm, run snapshots, playback cursor, and params.
- Subtle Framer Motion page transitions.
- shadcn/ui + Tailwind CSS design system setup.

## Non-Goals for This Phase

- No canvas renderer implementations.
- No backend or persistence layer.
- Most roadmap algorithms are still pending implementation.

## Algorithm Implementation Status

- [x] Binary Search
- [ ] Bubble Sort
- [ ] Selection Sort
- [ ] Insertion Sort
- [ ] Merge Sort
- [ ] Quick Sort
- [ ] Heap Sort
- [ ] BFS
- [ ] DFS
- [ ] Dijkstra
- [ ] A* Search
- [ ] Bidirectional BFS
- [ ] Topological Sort
- [ ] Union-Find
- [ ] Kruskal MST
- [ ] Prim MST
- [ ] Bellman-Ford
- [ ] BST Operations
- [ ] AVL Rotations
- [ ] Trie Operations

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS (v4)
- shadcn/ui component primitives
- Zustand
- Framer Motion
- Deploy target: Vercel

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run test
npm run lint
npm run build
```

## Deployment (Vercel)

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Keep defaults for a Next.js app.
4. Deploy.

The current project has no required runtime environment variables.

## Repo Conventions

- Use Conventional Commits for all commits.
- Prefer scoped subjects when useful.

Examples:

- `feat(ui): add library command search`
- `feat(algorithms): scaffold dynamic algorithm shell route`
- `chore(docs): add architecture and contribution guides`

## Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Roadmap: `docs/ROADMAP.md`
- Engine plan: `docs/ENGINE.md`
- Engine technical guide: `docs/ENGINE_TECHNICAL_GUIDE.md`
- Algorithm specs: `docs/ALGORITHM_SPECS.md`
- Contribution guide: `docs/CONTRIBUTING.md`

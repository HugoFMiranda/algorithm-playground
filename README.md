# algorithm-playground

algorithm-playground is a polished, minimalist web application scaffold for algorithm visualization.
This phase intentionally ships only UI and architecture foundations, with no algorithm execution logic yet.

## What This Project Includes

- Premium library home page at `/` with command-palette-style search.
- Dynamic algorithm route at `/algorithms/[slug]` with a visualizer shell.
- Placeholder UI for visualizer, parameter controls, and playback controls.
- State scaffolding with Zustand for selected algorithm, playback, and params.
- Subtle Framer Motion page transitions.
- shadcn/ui + Tailwind CSS design system setup.

## Non-Goals for This Phase

- No algorithm step engines.
- No canvas renderer implementations.
- No backend or persistence layer.

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
- Contribution guide: `docs/CONTRIBUTING.md`

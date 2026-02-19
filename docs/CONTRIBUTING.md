# Contributing

## Branch Naming

Suggested branch naming:

- `feat/<short-feature-name>`
- `fix/<short-fix-name>`
- `chore/<short-task-name>`
- `docs/<short-doc-topic>`

Examples:

- `feat/library-command-search`
- `feat/algorithm-shell-layout`
- `docs/architecture-guide`

## Commit Style

Use Conventional Commits for every commit.

Examples:

- `feat(ui): add command-style library search`
- `feat(store): scaffold playback and parameter state`
- `fix(routing): return 404 for unknown algorithm slugs`
- `docs(architecture): document future step/renderer model`
- `chore(tooling): update lint scripts`

## Code Style Rules

- TypeScript strict mode only; avoid `any`.
- Keep ESLint enabled and fix issues instead of disabling rules broadly.
- Use absolute imports via `@/*`.
- Prefer small composable components.
- Use shadcn/ui primitives before adding custom or external UI patterns.
- Keep Tailwind class lists readable and grouped.

## How To Add a New Algorithm Entry (Placeholder Phase)

1. Open `src/data/algorithms.ts`.
2. Add a new object to `ALGORITHMS` with:
   - `name`
   - `slug`
   - `category`
   - `tags`
   - `shortDescription`
3. Ensure the slug is unique.
4. Run:

```bash
npm run lint
npm run build
```

5. Verify:
   - The new entry appears on `/`.
   - Selecting it navigates to `/algorithms/<slug>`.
   - The algorithm shell page renders correctly.

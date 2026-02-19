# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js (App Router) TypeScript app.

- `src/app/`: route entrypoints, layout, and global styles (`globals.css`).
- `src/components/ui/`: reusable UI primitives (Radix/shadcn-style components).
- `src/lib/`: shared utilities (for example `cn()` in `src/lib/utils.ts`).
- `public/`: static assets served at `/`.
- Root config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`.

Use the `@/*` alias (configured in `tsconfig.json`) for imports from `src`.

## Build, Test, and Development Commands
- `npm run dev`: start local dev server on `http://localhost:3000`.
- `npm run build`: create production build.
- `npm run start`: run the production server after build.
- `npm run lint`: run all quality checks.
- `npm run lint:types`: strict TypeScript check (`tsc --noEmit`).
- `npm run lint:eslint`: ESLint with zero warnings allowed.

Use `npm run lint && npm run build` before opening a PR.

## Coding Style & Naming Conventions
- Language: TypeScript + React function components.
- Indentation: 2 spaces; keep imports grouped and sorted consistently.
- Components: PascalCase export names; UI primitive filenames are lowercase (for example `button.tsx`).
- Utilities/hooks: camelCase function names.
- Styling: Tailwind utility classes in JSX; keep class strings readable and grouped by layout -> spacing -> color/state.

## Testing Guidelines
There is currently no dedicated test runner or `npm test` script in this repo. For now:

- Treat `npm run lint` as the required baseline check.
- Verify behavior manually in `npm run dev`.
- If adding tests, prefer colocated `*.test.ts` / `*.test.tsx` files near the source or under `src/__tests__/`.

## Commit & Pull Request Guidelines
Git history is currently minimal (`Initial commit`), so keep commit subjects short, imperative, and specific.

- Good example: `feat(ui): add algorithm input dialog`
- Keep commits focused (one logical change per commit).
- PRs should include: summary, key files changed, validation steps (`lint`, `build`, manual checks), and screenshots for UI changes.

## Security & Configuration Tips
- Do not commit secrets; use environment variables via local `.env*` files.
- Validate external input before rendering or processing.
- Prefer `rel="noopener noreferrer"` on external links opened with `target="_blank"`.

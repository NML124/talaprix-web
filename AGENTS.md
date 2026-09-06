# Repository Guidelines

## Project Structure & Module Organization

TalaPrix is an Nx 23 / Angular 22 monorepo. `apps/web` is the public SSR price-comparison app; `apps/admin` is the private SPA. Business code lives under `libs/<scope>/<type>`. Pure contracts belong in `domain`, HTTP and Signal stores in `data-access`, presentational components in `ui`, and routed orchestration in `feature-*`. Keep app projects limited to bootstrap, providers, and lazy routes. `tools/generators` contains local Nx generators.

Nx tags enforce three independent boundaries in `eslint.config.mjs`: `scope:*`, `type:*`, and `platform:*`. Preserve all three when creating a project. Public code must never depend on `platform:admin`; domain libraries must remain Angular-free.

## Build, Test, and Development Commands

- `npm start`: serve the public app on port 4200.
- `npm run start:admin`: serve admin on port 4300.
- `npm run build`: build all buildable projects.
- `npm test`: run all Vitest targets.
- `npx nx test <project>`: test one project, for example `npx nx test products-domain`.
- `npm run lint`: lint the workspace and enforce module boundaries.
- `npm run format:check`: verify Prettier formatting.
- `npm run generate:ui -- <name> --project=<ui-lib>`: create an exported standalone UI component.

## Coding Style & Naming Conventions

Prettier uses single quotes. TypeScript strict mode, strict Angular templates, standalone components, Signal inputs/outputs, `inject()`, and `ChangeDetectionStrategy.OnPush` are the defaults. Every component keeps its template in a separate `.html` file through `templateUrl`; inline templates are not allowed. Use concise kebab-case files such as `product.ts`, `product.html`, `product-service.ts`, and `product-store.ts`; do not use `.component.ts`, `.service.ts`, or `.store.ts` suffixes. Tooling files such as `app.config.ts`, `app.routes.ts`, and `*.spec.ts` keep their standard names. Use `@Service()` for root singletons and `@Service({ autoProvided: false })` plus an explicit provider for scoped services. Avoid `any`, constructor injection, framework imports in domain libraries, hard-coded secrets, and unsafe HTML bypasses.

The UI is Tailwind-first. Components use utility classes in templates and do not get dedicated CSS/SCSS files. Use daisyUI for shared primitives, Flowbite only for DOM-driven complex interactions, and `@lucide/angular` for icons. Reusable tokens and the single global stylesheet belong in `libs/shared/ui-kit/src/styles/tailwind.css`. Flowbite must be initialized browser-side through `FlowbiteService` in SSR code.

Use `loadComponent` for standalone leaf pages. A route still needs `path` to define its URL; reserve `loadChildren` for a feature that genuinely owns several child routes.

## Testing Guidelines

Vitest covers apps and libraries; Playwright covers `web-e2e` and `admin-e2e`. Keep tests beside source as `*.spec.ts`. Update generated placeholder tests when replacing a scaffold.

## Commit & Pull Request Guidelines

History uses Conventional Commits such as `chore(root): ...`. Use `type(scope): summary`. PRs should identify affected Nx projects and report lint, test, and build results.

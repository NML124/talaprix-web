# Repository Guidelines

## Project Structure & Module Organization

TalaPrix is an Nx 23 / Angular 22 monorepo. `apps/web` is the public SSR price-comparison app; `apps/admin` is the private SPA. Business code is grouped by domain in `libs/shared`, `libs/products`, `libs/users`, and `libs/scrapers`. Each domain exposes one public facade (`@talaprix/shared`, `@talaprix/products`, `@talaprix/users`, `@talaprix/scrapers`); its internal `domain`, `data-access`, `ui`, and `feature-*` folders separate responsibilities without adding import paths for every layer. Keep app projects limited to bootstrap, providers, and lazy routes. `tools/generators` contains local Nx generators.

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

## Agent Decision Protocol

Do not make architectural, structural, naming, dependency, or UI decisions on
the user's behalf. Before any non-trivial change, explain the proposed option,
its impact, and alternatives; ask for confirmation when the choice changes the
architecture or workflow. Never replace a requested modular implementation
with a temporary monolithic file merely to make a build pass or demonstrate a
screen. Preserve the user's conventions, including separate HTML templates,
concise filenames, and explicit Angular composition.

For product and UI work, translate the requested user journey before coding.
Never merge distinct concepts into one control: country, language, and currency,
for example, require independent state and independent selection. Complete the
interaction contract, including open/close behavior, outside click, Escape,
loading or empty states when relevant, keyboard accessibility, and responsive
behavior. Inspect the supplied visual references at their original resolution,
reuse the approved design language and assets, and verify the finished interface
in a real browser at desktop and mobile sizes before presenting it as complete.

# TalaPrix Web

Monorepo Nx du comparateur de prix TalaPrix. Il contient l’application publique SSR (`web`) et le panneau privé (`admin`), avec des bibliothèques organisées par domaine métier.

## Prérequis

- Node.js 22 LTS recommandé (Node 24 fonctionne, mais Nx 23 est principalement aligné sur les versions LTS)
- npm 11+

```bash
npm ci
npm start
npm run start:admin
```

L’application publique écoute par défaut sur `http://localhost:4200`; l’admin sur `http://localhost:4300`.

## Architecture

- `apps/web` : comparateur public, rendu serveur et hydratation.
- `apps/admin` : application privée, SPA et routes métier lazy-loaded.
- `libs/shared` : contrats, utilitaires purs et design system.
- `libs/products` : catalogue, offres et comparaison.
- `libs/users` : identité, session et authentification.
- `libs/scrapers` : pilotage interne des collecteurs de prix.
- `tools/generators` : générateurs Nx locaux, équivalents aux bricks Mason.

Les tags Nx `scope:*`, `type:*` et `platform:*` sont vérifiés par ESLint. Par exemple, une bibliothèque `domain` ne peut pas dépendre d’Angular, et le code `platform:web` ne peut pas importer le code `platform:admin`.

## Commandes

```bash
npm run build
npm test
npm run lint
npm run format:check
npm run graph
```

Pour créer un composant UI conforme aux conventions TalaPrix :

```bash
npm run generate:ui -- price-badge --project=shared-ui-kit
```

Le générateur impose standalone, OnPush, SCSS, test Vitest, export public et vérifie que la cible porte le tag `type:ui`.

Voir [docs/architecture.md](docs/architecture.md) et [SECURITY.md](SECURITY.md) avant d’ajouter un domaine ou une authentification réelle.

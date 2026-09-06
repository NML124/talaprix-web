# TalaPrix — Frontend Web

> Comparateur de prix public et panneau d’administration, réunis dans un monorepo Angular modulaire.

**Angular 22 · Nx 23 · TypeScript 6 · Tailwind CSS 4 · daisyUI · Flowbite · Lucide**

## Sommaire

- [Présentation](#présentation)
- [État actuel du projet](#état-actuel-du-projet)
- [Principes structurants](#principes-structurants)
- [Stack technique](#stack-technique)
- [Architecture du monorepo](#architecture-du-monorepo)
- [Anatomie d’une fonctionnalité](#anatomie-dune-fonctionnalité)
- [Injection de dépendances et services](#injection-de-dépendances-et-services)
- [Routage et composition des applications](#routage-et-composition-des-applications)
- [Cycle d’une donnée](#cycle-dune-donnée)
- [Installation](#installation)
- [Lancer les applications](#lancer-les-applications)
- [Design system](#design-system)
- [Qualité et tests](#qualité-et-tests)
- [Génération de code](#génération-de-code)
- [Sécurité](#sécurité)
- [Documentation](#documentation)

## Présentation

TalaPrix aide un utilisateur à comparer les offres d’un même produit. Le frontend est séparé en deux applications qui partagent les contrats, les composants et les règles métier sans mélanger leurs responsabilités :

- `web` : expérience publique du comparateur, rendue côté serveur pour le référencement et le premier affichage ;
- `admin` : interface privée de gestion des produits et de supervision des scrapers.

Le socle est volontairement organisé par domaines métier. Un écran produit public et un écran produit admin peuvent ainsi partager le modèle `Product`, les accès aux données et certains composants, tout en gardant des parcours indépendants.

### Objectifs fonctionnels

Le produit est appelé à couvrir quatre grands besoins :

1. rechercher et consulter des produits depuis l’application publique ;
2. comparer leurs offres, prix, marchands et disponibilités ;
3. administrer le catalogue et ses données depuis une application privée ;
4. superviser les boutiques et scrapers qui alimentent les prix.

Cette séparation explique la présence de deux applications et de trois domaines principaux : `products`, `users` et `scrapers`.

## État actuel du projet

Le dépôt contient pour le moment le **socle architectural initial**. Il ne faut pas confondre structure prête et fonctionnalité métier terminée.

| Élément                                      | État                                |
| -------------------------------------------- | ----------------------------------- |
| Applications `web` et `admin`                | Créées et compilables               |
| SSR et hydratation de `web`                  | Configurés                          |
| Routes métier lazy-loaded                    | Configurées                         |
| Domaines Nx et frontières ESLint             | Configurés                          |
| Modèles Produit, Utilisateur et API partagée | Premiers contrats présents          |
| Store de session et guard admin              | Squelette fonctionnel présent       |
| Tailwind, daisyUI, Flowbite et Lucide        | Installés et compilés               |
| Clients HTTP métier réels                    | À connecter aux contrats du backend |
| Authentification réelle                      | À implémenter avec l’API            |
| Catalogue, recherche et comparaison complets | À implémenter                       |
| Dashboard et pilotage réel des scrapers      | À implémenter                       |

Les DTOs, endpoints et comportements non fournis ne doivent pas être inventés. Ils sont ajoutés à partir d’un contrat backend vérifié, puis couverts par des tests.

## Principes structurants

- **Une responsabilité par couche** : la page orchestre, le store porte l’état, le client parle à l’API et le composant UI affiche.
- **Dépendances tournées vers le métier** : les couches techniques dépendent des contrats, jamais l’inverse.
- **Applications minces** : `apps/*` ne contient que le bootstrap, les providers globaux et le routage.
- **Plateformes étanches** : le code admin ne fuite pas dans le bundle public.
- **Contrats explicites** : les réponses API sont adaptées à l’entrée de `data-access`, pas propagées telles quelles dans les templates.
- **Design centralisé** : les couleurs, rayons et comportements communs viennent du design system, jamais de valeurs dispersées.
- **Accessibilité et sécurité par défaut** : HTML sémantique, navigation clavier, libellés accessibles et autorisations revérifiées côté serveur.

## Stack technique

| Domaine      | Technologie           | Rôle                                                |
| ------------ | --------------------- | --------------------------------------------------- |
| Framework    | Angular 22.1          | Composants standalone, Signals, routage et SSR      |
| Monorepo     | Nx 23.2               | Projets, cache, graphe et frontières de dépendances |
| Langage      | TypeScript 6          | Typage strict du frontend et des contrats           |
| Styles       | Tailwind CSS 4.3      | Utilitaires et tokens visuels                       |
| Composants   | daisyUI 5.7           | Primitives sémantiques communes                     |
| Interactions | Flowbite 4.0          | Composants complexes pilotés par `data-*`           |
| Icônes       | Lucide Angular 1.41   | Icônes SVG standalone et tree-shakables             |
| Tests        | Vitest 4 + Playwright | Tests unitaires et parcours navigateur              |

## Architecture du monorepo

```text
talaprix-web/
├── apps/
│   ├── web/                     # Comparateur public avec SSR
│   ├── web-e2e/                 # Parcours Playwright publics
│   ├── admin/                   # Panneau privé SPA
│   └── admin-e2e/               # Parcours Playwright admin
├── libs/
│   ├── shared/
│   │   ├── ui-kit/              # Design system et intégration UI
│   │   ├── models/              # Contrats transversaux
│   │   └── utils/               # Fonctions TypeScript pures
│   ├── products/
│   │   ├── domain/              # Modèles et règles Produit
│   │   ├── data-access/         # API et état Produit
│   │   ├── ui/                  # Cartes et vues de présentation
│   │   ├── feature-web/         # Parcours Produit public
│   │   └── feature-admin/       # Gestion Produit admin
│   ├── users/
│   │   ├── domain/              # Utilisateur, rôle et auth
│   │   ├── data-access/         # Session, guards et futur client auth
│   │   └── feature-auth/        # Pages d’authentification
│   └── scrapers/
│       ├── data-access/         # API de supervision
│       └── feature-admin/       # Écrans réservés à l’admin
├── tools/generators/            # Générateurs Nx locaux
├── docs/architecture.md         # Règles de dépendance détaillées
├── DEV.md                       # Guide de travail pas à pas
└── SECURITY.md                  # Garde-fous sécurité
```

Le flux attendu est :

```text
app → feature → data-access → domain
              ↘ ui          → domain
```

Les tags Nx `scope:*`, `type:*` et `platform:*` rendent ces limites exécutables via ESLint. Une bibliothèque `domain` reste du TypeScript pur et le code public ne peut pas importer une feature réservée à l’admin.

### Les trois axes de classification Nx

Chaque projet possède trois tags complémentaires :

| Axe          | Valeurs utilisées                                       | Question à laquelle il répond                |
| ------------ | ------------------------------------------------------- | -------------------------------------------- |
| `scope:*`    | `shared`, `products`, `users`, `scrapers`, `app`        | À quel domaine appartient ce code ?          |
| `type:*`     | `domain`, `util`, `data-access`, `ui`, `feature`, `app` | Quelle responsabilité porte-t-il ?           |
| `platform:*` | `shared`, `web`, `admin`                                | Dans quelle application peut-il être livré ? |

Exemple : `products-feature-web` est classé `scope:products`, `type:feature`, `platform:web`. Il peut consommer les bibliothèques partagées du domaine Produit, mais ne peut pas importer `products-feature-admin`.

### Règles de dépendance

| Source           | Dépendances autorisées                    |
| ---------------- | ----------------------------------------- |
| `domain`         | `domain`, `util`                          |
| `util`           | `domain`, `util`                          |
| `data-access`    | `domain`, `util`, `data-access`           |
| `ui`             | `domain`, `util`, `ui`                    |
| `feature`        | `domain`, `util`, `data-access`, `ui`     |
| `shared`         | uniquement `shared`                       |
| `products`       | `products`, `shared`                      |
| `users`          | `users`, `shared`                         |
| `scrapers`       | `scrapers`, `products`, `users`, `shared` |
| `platform:web`   | `web`, `shared`                           |
| `platform:admin` | `admin`, `shared`                         |

Ces règles sont définies dans `eslint.config.mjs`. Une violation fait échouer `npm run lint` : ce ne sont donc pas de simples recommandations.

## Anatomie d’une fonctionnalité

Prenons le futur affichage d’une liste de produits :

```text
products/domain
    ProductSummary, Money, PriceOffer
             ↑
products/data-access
    ProductsApi + ProductsStore Signals
             ↑
products/feature-web
    charge les produits, traite loading/error/empty
             ↓
products/ui
    ProductCard reçoit un ProductSummary et l’affiche
             ↑
apps/web
    charge la route de la feature
```

### 1. `domain` — la vérité métier

Cette couche contient les types et règles qui décrivent TalaPrix : produit, offre, marchand, monnaie, utilisateur ou rôle. Elle ne connaît ni Angular, ni HTTP, ni le navigateur.

### 2. `data-access` — la frontière technique

Cette couche :

- appelle l’API ;
- transforme les DTOs réseau en modèles du domaine ;
- gère l’état avec des Signals ;
- expose des états explicites de chargement, succès, vide et erreur ;
- centralise le cache, la session et les politiques de nouvelle tentative.

Une faute historique du backend comme `adress` doit être absorbée ici par un DTO/adaptateur. Le reste de l’application manipule un nom propre comme `address`.

### 3. `ui` — la présentation réutilisable

Un composant UI reçoit ses données avec `input()`, émet une intention avec `output()` et ne déclenche pas directement de requête HTTP. `ProductCardComponent` est un exemple de cette couche.

### 4. `feature-*` — le cas d’usage

La feature compose le store et les composants UI pour produire une page routée. Elle décide quoi afficher pendant le chargement, en cas d’erreur et lorsqu’aucun résultat n’existe.

### 5. `app` — le point de composition

L’application choisit les routes, l’hydratation, les providers globaux et la plateforme. Elle ne réimplémente pas un cas d’usage métier.

Cette lecture correspond à un découpage `modèles → services/implémentations → contrôleur/état → page/widgets`, mais adapté aux conventions Angular et Nx.

## Injection de dépendances et services

Angular 22 introduit `@Service` comme forme moderne et explicite pour les services basés sur `inject()`.

```ts
import { inject, Service } from '@angular/core';

@Service()
export class ProductsApi {
  readonly #http = inject(HttpClient);
}
```

`@Service()` signifie ici :

- une instance singleton à l’injecteur racine ;
- aucune déclaration manuelle dans `providers` ;
- suppression du bundle si le service n’est jamais utilisé ;
- dépendances obtenues avec `inject()`, pas par constructeur.

Pour un état dont le scope doit être contrôlé :

```ts
@Service({ autoProvided: false })
export class AuthSessionStore {}
```

La classe doit alors être ajoutée explicitement à un provider d’application, de route ou de composant. C’est le choix actuel de `AuthSessionStore`, fourni par `provideAuthDataAccess()`.

Conservez `@Injectable` lorsque vous avez besoin :

- d’une injection par constructeur ;
- de `providedIn: 'platform'` ou d’un autre scope non-root ;
- d’une configuration avancée `useClass`, `useValue`, `useExisting` ou `useFactory`.

Une factory simple de singleton peut toutefois être définie directement avec `@Service({ factory: ... })`. Le choix dépend donc de la durée de vie et du mode de création du service, pas d’une préférence esthétique.

## Routage et composition des applications

### Application publique `web`

```text
/       → products/feature-web
/auth   → users/feature-auth
```

`web` utilise le rendu serveur, l’hydratation cliente et l’event replay. Les accès au DOM doivent être repoussés après le rendu navigateur. C’est pourquoi Flowbite est chargé dynamiquement par `FlowbiteService`.

### Application privée `admin`

```text
/auth       → users/feature-auth
/products   → products/feature-admin + adminGuard
/scrapers   → scrapers/feature-admin + adminGuard
/            redirige vers /products
```

Les routes sont lazy-loaded afin de découper les bundles et de ne charger une feature que lorsqu’elle est visitée. `adminGuard` protège la navigation côté client, mais l’API doit toujours refaire le contrôle du rôle et des permissions.

## Cycle d’une donnée

Une réponse backend ne doit jamais traverser toutes les couches sans contrôle :

```text
API JSON
  ↓ validation/adaptation
DTO réseau dans data-access
  ↓ mapping
modèle stable du domain
  ↓ stockage Signals
feature : loading | success | empty | error
  ↓ inputs typés
composant ui
  ↓ output utilisateur
feature puis data-access
```

Ce flux apporte trois garanties :

1. une variation de payload backend se corrige dans un adaptateur précis ;
2. les composants n’ont pas à comprendre la structure HTTP ;
3. le domaine conserve des noms et types cohérents même si plusieurs APIs alimentent TalaPrix.

Les états asynchrones doivent être explicites. Une page ne doit pas déduire arbitrairement qu’un tableau vide signifie encore « chargement » : `loading`, `error`, `empty` et `ready` sont des situations différentes.

## Installation

### Prérequis

- Node.js 22 LTS recommandé ;
- npm 11 ou une version compatible avec le `package-lock.json` ;
- Git.

```bash
git clone <url-du-depot>
cd talaprix-web
npm ci
```

Le projet n’a pas encore de contrat de variables d’environnement public. N’ajoutez jamais de secret dans une application Angular : toute valeur livrée au navigateur doit être considérée publique.

## Lancer les applications

```bash
# Comparateur public : http://localhost:4200
npm start

# Administration : http://localhost:4300
npm run start:admin
```

Les routes métier sont chargées paresseusement. `web` conserve le SSR et l’hydratation ; `admin` fonctionne en SPA.

## Design system

Le frontend est **Tailwind-first**. Les composants ne possèdent pas de fichiers `.scss` ou `.css` dédiés : leurs styles sont exprimés avec des classes utilitaires dans les templates.

Un seul point d’entrée global, `libs/shared/ui-kit/src/styles/tailwind.css`, contient :

- l’import Tailwind et les sources du monorepo à analyser ;
- les plugins Flowbite et daisyUI ;
- les thèmes clair/sombre ;
- les tokens TalaPrix (`brand`, rayons, police système) ;
- le strict minimum de styles de base globaux.

Règle d’usage : Tailwind pour la composition, daisyUI pour les primitives communes, Flowbite seulement lorsqu’un composant interactif en a réellement besoin, et Lucide pour les icônes. Cela évite d’empiler plusieurs abstractions sur un même composant.

### Ordre de décision visuel

1. utiliser une classe Tailwind standard pour la mise en page ;
2. utiliser une primitive daisyUI si elle correspond au besoin ;
3. encapsuler la primitive dans `shared/ui-kit` lorsqu’elle est répétée ou porte une convention TalaPrix ;
4. utiliser Flowbite lorsqu’une interaction DOM plus complexe est nécessaire ;
5. ajouter un token global seulement si la valeur représente réellement le langage visuel du produit.

Les composants métier ne doivent pas contenir de couleurs hexadécimales isolées. Ils utilisent les tokens `brand`, les couleurs sémantiques daisyUI et les variantes clair/sombre. Un changement de thème ne doit donc pas demander de modifier chaque card séparément.

### Convention de composants

- HTML sémantique avant les composants génériques ;
- `ChangeDetectionStrategy.OnPush` partout ;
- `input()` et `output()` plutôt que les décorateurs historiques ;
- classes responsive pensées mobile-first ;
- états focus visibles et zones tactiles suffisantes ;
- icône décorative avec `aria-hidden="true"` ;
- bouton composé uniquement d’une icône avec un `aria-label` ;
- animations désactivables via `motion-reduce:*`.

Flowbite accédant au DOM, l’application SSR passe par `FlowbiteService` et `afterNextRender()`. Aucun import de runtime Flowbite ne doit être exécuté directement pendant le rendu serveur.

## Qualité et tests

```bash
npm run format:check
npm run lint
npm test
npm run build

# Tests end-to-end
npx nx run web-e2e:e2e
npx nx run admin-e2e:e2e
```

Vitest couvre les applications et bibliothèques. Playwright valide les parcours dans un vrai navigateur. Avant une pull request, exécutez au minimum format, lint, tests et builds des projets affectés.

| Commande                             | Utilisation                                  |
| ------------------------------------ | -------------------------------------------- |
| `npm start`                          | développement du comparateur public          |
| `npm run start:admin`                | développement du panneau admin               |
| `npm run graph`                      | visualisation des dépendances Nx             |
| `npx nx test <projet>`               | test ciblé d’une bibliothèque ou application |
| `npx nx lint <projet>`               | lint ciblé et frontières d’architecture      |
| `npx nx affected -t lint,test,build` | validation des projets affectés              |
| `npm run format`                     | application du formatage Prettier            |

## Génération de code

Nx joue ici le rôle de Mason dans Flutter. Le générateur local crée un composant UI conforme : standalone, OnPush, testé, exporté et sans feuille de style.

```bash
npm run generate:ui -- price-badge --project=shared-ui-kit
```

Le générateur refuse une cible qui ne porte pas le tag `type:ui`. Les prochains générateurs pourront couvrir une feature routée ou une ressource API lorsque leurs contrats seront stabilisés.

## Sécurité

- l’admin est une frontière d’interface, pas une frontière de sécurité serveur ;
- chaque autorisation doit être vérifiée à nouveau par l’API ;
- aucun token ou secret ne doit être versionné ou exposé dans le bundle ;
- les URL marchandes et contenus externes doivent être validés avant affichage ;
- l’usage de contournements de sanitization Angular est interdit sans revue dédiée.

Consultez [SECURITY.md](SECURITY.md) avant de brancher l’authentification ou les APIs réelles.

## Documentation

- [DEV.md](DEV.md) : installation, workflow quotidien, exemples et conventions ;
- [docs/architecture.md](docs/architecture.md) : couches, scopes et sens des dépendances ;
- [AGENTS.md](AGENTS.md) : consignes synthétiques pour les contributeurs et agents ;
- [SECURITY.md](SECURITY.md) : exigences de sécurité.

## Licence

MIT — voir le champ `license` du `package.json`.

# Guide développeur TalaPrix

Ce document explique comment démarrer, où placer le code et comment réutiliser les briques du monorepo sans casser ses frontières.

## 1. Première installation

```bash
git clone <url-du-depot>
cd talaprix-web
npm ci
npm run format:check
npm run lint
npm test
npm run build
```

Utilisez `npm ci` après un clone : il installe exactement les versions du `package-lock.json`. Utilisez `npm install <package>` seulement lorsque vous ajoutez volontairement une dépendance.

Pour développer :

```bash
# Terminal 1 : application publique
npm start

# Terminal 2 : panneau admin
npm run start:admin
```

| Application | URL                     | Mode              |
| ----------- | ----------------------- | ----------------- |
| Web         | `http://localhost:4200` | SSR + hydratation |
| Admin       | `http://localhost:4300` | SPA               |

## 2. Commencer une journée de travail

1. Synchroniser sa branche avec l’équipe.
2. Relancer `npm ci` si `package-lock.json` a changé.
3. Créer une branche typée, par exemple `feat/product-search`.
4. Visualiser les dépendances si le changement touche plusieurs libs : `npm run graph`.
5. Lancer uniquement l’application et les tests du domaine concerné.
6. Avant le commit, exécuter `npm run format`, puis les contrôles de la section 10.

Pour contrôler seulement les projets affectés par la branche :

```bash
npx nx affected -t lint,test,build
```

### Convention des branches et commits

Le nom d’une branche suit la forme `type/description-courte`. Le type annonce pourquoi la branche existe :

| Type       | Quand l’utiliser                             | Exemple de branche          | Exemple de commit                         |
| ---------- | -------------------------------------------- | --------------------------- | ----------------------------------------- |
| `feat`     | nouvelle capacité visible ou métier          | `feat/product-search`       | `feat(products): add product search`      |
| `fix`      | correction d’un comportement défectueux      | `fix/auth-expired-session`  | `fix(auth): clear expired session`        |
| `chore`    | maintenance sans comportement métier         | `chore/update-dependencies` | `chore(deps): update Angular packages`    |
| `ci`       | pipeline, cache, automatisation de livraison | `ci/nx-affected`            | `ci(nx): run affected projects`           |
| `docs`     | documentation uniquement                     | `docs/data-access-guide`    | `docs(architecture): explain data flow`   |
| `refactor` | restructuration sans changement fonctionnel  | `refactor/products-store`   | `refactor(products): split store effects` |
| `test`     | ajout ou correction de tests                 | `test/product-card`         | `test(products): cover empty price state` |
| `perf`     | amélioration mesurable des performances      | `perf/search-results`       | `perf(products): defer product images`    |
| `build`    | outils de build ou packaging                 | `build/tailwind-config`     | `build(ui): configure Tailwind plugin`    |

Les commits suivent **Conventional Commits** : `type(scope): description`. Les parenthèses contiennent le scope, pas le type. Par exemple, utilisez `feat(products): add offer filters`, et non `(feat): add offer filters`.

Le scope désigne généralement un domaine (`products`, `users`, `scrapers`, `shared`), une application (`web`, `admin`) ou l’outillage (`nx`, `deps`, `release`). Gardez une branche centrée sur un seul objectif et évitez les noms vagues comme `changes`, `update` ou `correction`.

## 3. Comprendre l’architecture

Une application (`apps/*`) assemble des routes et des providers. Elle ne contient pas la logique métier.

### La règle simple à retenir

Travaillez d’abord dans le domaine concerné, puis exposez ce qui doit être
réutilisé depuis son index public :

```text
apps/web ou apps/admin
        ↓ importe uniquement
@talaprix/products | @talaprix/users | @talaprix/shared | @talaprix/scrapers
        ↓ façade publique
libs/<domaine>/src/lib/...
        ├── modèles et règles pures
        ├── services/stores et providers
        ├── composants UI
        └── pages routées
```

Vous n’avez donc pas à choisir entre cinq bibliothèques Nx pour une même
fonctionnalité. Les sous-dossiers restent une organisation interne claire et
peuvent être séparés plus tard si le domaine devient très volumineux.

```text
app
└── feature               page routée et orchestration
    ├── data-access       HTTP, cache et état Signals
    │   └── domain        types et règles métier pures
    └── ui                composants de présentation
        └── domain
```

| Type          | Contient                                     | Ne contient pas                      |
| ------------- | -------------------------------------------- | ------------------------------------ |
| `domain`      | types, value objects, règles pures           | Angular, HTTP, DOM                   |
| `data-access` | clients API, stores Signals, providers       | mise en page métier                  |
| `ui`          | composants réutilisables avec inputs/outputs | appel HTTP, routage métier           |
| `feature-*`   | pages routées, composition et cas d’usage    | primitives globales du design system |
| `shared`      | éléments réellement transversaux             | logique spécifique à un domaine      |

Le mot `shared` ne signifie pas « endroit pratique où déposer du code ». Un élément reste dans son domaine tant qu’au moins une règle métier lui est propre.

### Convention de nommage des fichiers

TalaPrix utilise des noms courts en kebab-case. Le rôle secondaire est séparé par un tiret, jamais par un suffixe Angular comme `.component` :

| Élément           | Noms attendus                                     |
| ----------------- | ------------------------------------------------- |
| Page ou composant | `product.ts`, `product.html`, `product.spec.ts`   |
| Service HTTP      | `product-service.ts`, `product-service.spec.ts`   |
| Store Signals     | `product-store.ts`, `product-store.spec.ts`       |
| Guard             | `auth-guard.ts`, `auth-guard.spec.ts`             |
| Interceptor       | `auth-interceptor.ts`, `auth-interceptor.spec.ts` |
| Modèles regroupés | `product-models.ts`, `product-models.spec.ts`     |
| Adaptateur        | `product-adapter.ts`, `product-adapter.spec.ts`   |

Les fichiers réservés à la configuration de l’outillage gardent leurs noms conventionnels : `app.config.ts`, `app.routes.ts`, `vite.config.mts`, `eslint.config.mjs` et `project.json`.

### Deux niveaux d’organisation : commencer simple, grandir proprement

Il existe deux formes valides dans ce dépôt. Elles ne se contredisent pas : la
première est le point de départ d’un nouveau module ; la seconde est la forme
à adopter quand le module devient important.

#### Niveau 1 — petit module (recommandé au début)

Pour commencer un panier, une wishlist ou une préférence utilisateur, garde un
seul projet de domaine et quelques fichiers lisibles :

```text
libs/cart/
└── src/
    ├── index.ts                 # porte publique @talaprix/cart
    └── lib/
        ├── cart-models.ts       # interfaces et types
        ├── cart-store.ts        # état Signals et actions locales
        ├── cart-service.ts      # appels HTTP (si l’API existe)
        └── cart-page/
            ├── cart-page.ts     # page Angular standalone
            └── cart-page.html   # template externe
```

Ce niveau est volontairement simple : chaque fichier a une responsabilité et
tu peux comprendre le module en quelques minutes. N’ajoute pas de dossiers
vides uniquement parce qu’un schéma DDD les mentionne.

#### Niveau 2 — domaine mature

Quand le module possède plusieurs pages, plusieurs composants ou plusieurs
équipes, déplace les fichiers dans des sous-couches :

```text
libs/cart/
└── src/lib/
    ├── domain/                  # types et règles sans Angular
    ├── data-access/             # services HTTP, stores, providers
    ├── ui/                      # composants visuels réutilisables
    └── feature-web/             # pages et parcours publics
```

La migration est mécanique : `cart-models.ts` va dans `domain`, le store et le
service vont dans `data-access`, les composants vont dans `ui`, et la page va
dans `feature-web`. L’index `src/index.ts` continue d’exposer une seule façade.

#### Exemple pas à pas : faire apparaître `CartPage` dans `web`

1. Créer `libs/cart/src/lib/cart-page/cart-page.ts` et son fichier
   `cart-page.html`.
2. Exporter la page depuis `libs/cart/src/index.ts` :

   ```ts
   export * from './lib/cart-page/cart-page';
   ```

3. Ajouter l’alias `@talaprix/cart` dans `tsconfig.base.json`.
4. Ajouter la route dans `apps/web/src/app/app.routes.ts` :

   ```ts
   {
     path: 'cart',
     loadComponent: () =>
       import('@talaprix/cart').then(({ CartPage }) => CartPage),
   }
   ```

5. Ajouter `provideCart()` dans `apps/web/src/app/app.config.ts` uniquement si
   le store doit être partagé au niveau de toute l’application.
6. Démarrer avec `npm run start`, puis ouvrir `http://localhost:4200/cart`.

`apps/web` ne contient donc pas le code du panier : il déclare seulement son
URL et ses providers globaux. La page, les règles, l’état et les appels API
restent dans `libs/cart`.

### Exemple réel : la home du comparateur

La home actuelle applique cette composition dans
`libs/home/feature-web/src/lib/home/` :

```text
home/
├── home.ts              # conteneur de la page
├── home.html            # assemble les composants enfants
├── navbar/
├── hero/
├── categories/
├── offers/
├── trust/
└── footer/
```

`home.html` ne contient pas le détail de la navbar ou du hero. Il compose
simplement :

```html
<lib-home-navbar />
<lib-home-hero />
<lib-home-categories />
<lib-home-offers />
<lib-home-trust />
<lib-home-footer />
```

Chaque dossier possède son fichier TypeScript et son template HTML. La route
de `apps/web` ne charge que `Home` avec `loadComponent`; `Home` assemble les
composants, et chaque composant garde son propre rendu.

#### Comment choisir le bon niveau ?

- Une seule page et peu de logique : Niveau 1.
- Plusieurs pages publiques : ajouter `feature-web`.
- Plusieurs composants partagés : ajouter `ui`.
- Règles métier testables sans Angular : ajouter `domain`.
- API, cache ou état complexe : ajouter `data-access`.

Commence toujours au niveau le plus petit qui reste clair. La robustesse vient
de responsabilités bien séparées, pas du nombre de dossiers.

### Détail de `apps/web`

```text
apps/web/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── app.ts
│   │   ├── app.html
│   │   ├── app.spec.ts
│   │   ├── app.config.ts
│   │   ├── app.config.server.ts
│   │   ├── app.routes.ts
│   │   └── app.routes.server.ts
│   ├── index.html
│   ├── main.ts
│   ├── main.server.ts
│   └── server.ts
├── eslint.config.mjs
├── project.json
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.spec.json
```

#### `public/`

Contient les fichiers copiés tels quels dans le build : favicon, manifeste, robots.txt ou images purement statiques. N’y placez pas un secret ni un fichier métier TypeScript.

#### `src/index.html`

Document HTML hôte. Il contient la balise racine Angular et les métadonnées globales. Les métadonnées propres à une page produit devront être gérées par Angular, pas écrites en dur ici.

#### `src/main.ts`

Point d’entrée navigateur. Il démarre `App` avec `appConfig`. Il ne doit contenir aucun service métier ni logique d’authentification.

#### `src/main.server.ts`

Point d’entrée Angular utilisé pendant le rendu serveur. Il fusionne la configuration commune et la configuration SSR.

#### `src/server.ts`

Serveur Node/Express qui héberge le rendu SSR. On y traite uniquement les préoccupations serveur de rendu et de fichiers statiques, pas les règles Produit ou Utilisateur.

#### `src/app/app.ts` et `app.html`

Composant racine et template racine. `app.ts` déclare les imports Angular ; `app.html` contient généralement le shell global et `<router-outlet />`. Même le composant racine conserve son HTML dans un fichier séparé.

#### `src/app/app.config.ts`

Point de composition des providers navigateur : routeur, hydratation, client HTTP, intercepteurs et providers globaux. Lorsqu’un domaine expose `provideAuthDataAccess()`, c’est ici que l’application web l’active globalement.

#### `src/app/app.config.server.ts`

Ajoute uniquement les providers spécifiques au SSR. Une configuration commune doit rester dans `app.config.ts` pour éviter un comportement différent entre serveur et navigateur.

#### `src/app/app.routes.ts`

Table des URL publiques. Une page standalone est chargée avec `loadComponent`. Ce fichier choisit la feature à afficher, mais ne contient pas son formulaire ni sa logique métier.

#### `src/app/app.routes.server.ts`

Décrit le mode de rendu des routes côté serveur : rendu serveur, prérendu éventuel ou comportement spécifique. Il complète `app.routes.ts`, il ne le remplace pas.

#### `project.json`

Configuration Nx de l’application : build, serveur de développement, tests, assets, styles globaux, budgets de bundle et dossiers de sortie.

#### Fichiers TypeScript et ESLint

- `tsconfig.json` : configuration TypeScript du projet ;
- `tsconfig.app.json` : compilation de l’application ;
- `tsconfig.spec.json` : compilation des tests ;
- `eslint.config.mjs` : règles lint propres à l’application, en complément des règles racine.

La règle essentielle est : `apps/web` assemble les fonctionnalités, mais le code réutilisable et métier reste dans `libs/`.

## 4. Exemple complet : afficher un produit

### Étape A — définir le contrat métier

Dans `products/domain`, le modèle reste indépendant d’Angular :

```ts
export interface ProductSummary {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly lowestPrice: Money | null;
  readonly offerCount: number;
}
```

### Étape B — accéder aux données

Un client API partagé par toute l’application est un vrai singleton :

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import type { ProductSummary } from '@talaprix/products';

@Service()
export class ProductsApi {
  readonly #http = inject(HttpClient);

  list() {
    return this.#http.get<readonly ProductSummary[]>('/api/products');
  }
}
```

### Étape C — créer un composant de présentation

Le composant reçoit ses données, émet les intentions de l’utilisateur et ne connaît pas l’API :

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideHeart } from '@lucide/angular';
import type { ProductSummary } from '@talaprix/products';

@Component({
  selector: 'tpx-product-tile',
  imports: [LucideHeart],
  templateUrl: './product-tile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTile {
  readonly product = input.required<ProductSummary>();
  readonly favorite = output<string>();
}
```

Le template reste toujours dans `product-tile.html` :

```html
<article class="card rounded-card bg-base-100 shadow-sm">
  <div class="card-body">
    <h2 class="card-title">{{ product().name }}</h2>
    <button class="btn btn-ghost btn-square" type="button" aria-label="Ajouter aux favoris" (click)="favorite.emit(product().id)">
      <svg lucideHeart class="size-5" aria-hidden="true"></svg>
    </button>
  </div>
</article>
```

### Étape D — orchestrer dans une feature

La feature injecte le data-access, gère les états chargement/erreur et passe des données prêtes à afficher au composant UI. C’est également elle qui réagit à l’événement `favorite`.

### Étape E — charger la feature depuis l’application

```ts
export const appRoutes: Route[] = [
  {
    path: 'products',
    loadComponent: () => import('@talaprix/products').then(({ ProductsFeatureWeb }) => ProductsFeatureWeb),
  },
];
```

`path` définit l’URL ; `loadComponent` définit ce qui sera téléchargé et affiché quand cette URL est visitée. Ils sont complémentaires. Pour une page standalone sans sous-routes, TalaPrix utilise `loadComponent` afin de créer directement un chunk lazy sans fichier de routes intermédiaire. `loadChildren` reste réservé à une future feature qui posséderait plusieurs routes enfants.

L’application connaît la feature ; la feature ne connaît jamais l’application.

## 5. `@Service` ou `@Injectable` ?

Angular 22 fournit `@Service`, plus explicite pour les classes de service. TalaPrix l’utilise désormais par défaut.

| Besoin                                       | Décorateur                          | Résultat                               |
| -------------------------------------------- | ----------------------------------- | -------------------------------------- |
| Singleton global sans configuration          | `@Service()`                        | fourni automatiquement à la racine     |
| Service avec factory Angular                 | `@Service({ factory: ... })`        | création personnalisée                 |
| Instance fournie manuellement                | `@Service({ autoProvided: false })` | scope contrôlé par un provider         |
| Compatibilité ou configuration DI historique | `@Injectable(...)`                  | API Angular classique, toujours valide |

Exemple d’un store qui doit être isolé par application ou par route :

```ts
import { makeEnvironmentProviders, Service, signal } from '@angular/core';

@Service({ autoProvided: false })
export class AuthSessionStore {
  readonly #authenticated = signal(false);
  readonly authenticated = this.#authenticated.asReadonly();
}

export function provideAuthDataAccess() {
  return makeEnvironmentProviders([AuthSessionStore]);
}
```

Puis dans `app.config.ts` ou dans les `providers` d’une route :

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideAuthDataAccess()],
};
```

Le point important n’est pas seulement le décorateur : c’est **la durée de vie souhaitée**. N’utilisez pas `@Service()` par réflexe pour un état qui doit être recréé à chaque feature.

`@Service` impose l’injection avec `inject()`. Gardez `@Injectable` lorsqu’un code existant utilise encore l’injection par constructeur, lorsqu’il faut un scope comme `providedIn: 'platform'`, ou lorsqu’une configuration `useClass`, `useValue`, `useExisting` ou `useFactory` est nécessaire. La propriété `factory` de `@Service` couvre uniquement la création personnalisée du singleton lui-même.

L’injection se fait avec `inject()` et les champs privés modernes :

```ts
readonly #api = inject(ProductsApi);
```

## 6. Tailwind, daisyUI, Flowbite et Lucide

### Répartition des responsabilités

- **Tailwind** : layout, responsive, espacements, typographie et états visuels ;
- **daisyUI** : primitives telles que `btn`, `card`, `alert`, `modal` ;
- **Flowbite** : interactions plus riches basées sur des attributs `data-*` ;
- **Lucide** : toutes les icônes d’interface.

N’utilisez pas daisyUI et Flowbite pour construire deux versions concurrentes du même composant dans `shared/ui-kit`. Choisissez une implémentation et masquez-la derrière un composant TalaPrix lorsque le composant est réutilisé.

### Ajouter des styles

Écrivez les classes directement dans le template :

```html
<section class="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-2 xl:grid-cols-4">
  <!-- contenu -->
</section>
```

Évitez les chaînes générées comme `` `bg-${color}-600` `` : Tailwind ne peut pas garantir leur détection statique. Utilisez une table dont toutes les classes sont écrites entièrement :

```ts
const toneClasses = {
  success: 'bg-success text-success-content',
  error: 'bg-error text-error-content',
} as const;
```

Les tokens globaux se trouvent dans `libs/shared/ui-kit/src/styles/tailwind.css`. N’ajoutez un token que s’il est réutilisé ; sinon, utilisez une classe Tailwind standard.

### Utiliser Flowbite avec le SSR

Flowbite accède au DOM. Dans l’application publique SSR, initialisez-le seulement après le rendu navigateur :

```ts
import { afterNextRender, Component, inject } from '@angular/core';
import { FlowbiteService } from '@talaprix/shared';

@Component({
  /* ... */
})
export class ProductFilters {
  readonly #flowbite = inject(FlowbiteService);

  constructor() {
    afterNextRender(() => void this.#flowbite.init());
  }
}
```

Le service utilise un import dynamique et vérifie la plateforme ; le code navigateur de Flowbite n’est donc pas exécuté pendant le rendu serveur. Réinitialisez-le après l’apparition de nouveaux éléments `data-*` chargés paresseusement.

### Utiliser une icône Lucide

Importez uniquement le composant d’icône utilisé :

```ts
import { LucideSearch } from '@lucide/angular';

@Component({
  imports: [LucideSearch],
  templateUrl: './search-icon-example.html',
})
export class SearchIconExample {}
```

```html
<!-- search-icon-example.html -->
<svg lucideSearch class="size-5" aria-hidden="true"></svg>
```

Une icône décorative porte `aria-hidden="true"`. Un bouton composé uniquement d’une icône doit toujours avoir un `aria-label` explicite.

## 7. Générer et réutiliser un composant UI

```bash
npm run generate:ui -- price-badge --project=shared-ui-kit
```

Le générateur :

1. vérifie le tag Nx `type:ui` ;
2. crée un composant standalone OnPush ;
3. ne crée aucun fichier CSS/SCSS ;
4. ajoute un test Vitest ;
5. exporte le composant depuis le point d’entrée public de la bibliothèque.

Chaque composant possède au minimum deux fichiers :

```text
product-card/
├── product-card.ts       # logique, inputs, outputs et imports
├── product-card.html     # structure et classes Tailwind
└── product-card.spec.ts  # tests
```

Les templates inline sont interdits, même pour un composant très court. Cette séparation garde le TypeScript lisible, facilite la revue du HTML et offre à Tailwind un fichier source explicite à analyser. Il n’y a pas de fichier `.css` ou `.scss` par composant.

Pour le réutiliser dans une feature :

```ts
import { PriceBadgeComponent } from '@talaprix/shared';

@Component({
  imports: [PriceBadgeComponent],
  // ...
})
export class ProductsPage {}
```

Importez toujours depuis l’alias public (`@talaprix/...`), jamais depuis un chemin profond vers `src/lib`.

## 8. Ajouter une nouvelle feature

Avant de générer du code, répondez à trois questions :

1. À quel domaine appartient le besoin ?
2. Est-il public, admin ou partagé ?
3. A-t-il besoin d’un nouveau contrat métier, d’un accès aux données ou seulement d’un écran ?

La séquence habituelle est : modèle dans `domain`, client/store dans `data-access`, composants passifs dans `ui`, orchestration dans `feature-*`, puis route lazy dans l’application.

Ajoutez les tags `scope:*`, `type:*` et `platform:*` dès la création de la bibliothèque. `npm run lint` vérifiera les imports interdits.

### Exemple complet : construire l’authentification web

L’authentification traverse plusieurs couches. Ne créez pas un énorme `login.ts` qui contient le formulaire, l’appel HTTP, le stockage du token et la navigation.

#### Étape 1 — confirmer le contrat backend

Avant de coder, obtenez pour chaque endpoint : méthode, URL, body, réponse de succès, erreurs, mode de session et règles CSRF. Par exemple, ne supposez pas que `/api/login` renvoie un token si le backend utilise un cookie de session.

#### Étape 2 — créer la branche

```bash
git switch -c feat/web-authentication
```

#### Étape 3 — définir le domaine

Dans `libs/users/domain/src/lib/user-models.ts`, conservez uniquement les contrats métier stables :

```ts
export interface LoginCommand {
  readonly email: string;
  readonly password: string;
}

export interface UserIdentity {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly roles: readonly UserRole[];
}
```

Le domaine ne sait pas si l’authentification utilise HTTP, un cookie ou un token.

#### Étape 4 — créer le service HTTP

Structure proposée :

```text
libs/users/data-access/src/lib/
├── auth-service.ts
├── auth-service.spec.ts
├── auth-adapter.ts
├── auth-adapter.spec.ts
├── auth-store.ts
├── auth-store.spec.ts
├── auth-interceptor.ts
├── auth-guard.ts
└── provide-auth.ts
```

`auth-service.ts` parle uniquement au backend :

```ts
@Service()
export class AuthService {
  readonly #http = inject(HttpClient);

  login(command: LoginCommand) {
    return this.#http
      .post<AuthResponseDto>('/api/auth/login', command, {
        withCredentials: true,
      })
      .pipe(map(mapAuthResponse));
  }
}
```

`AuthResponseDto` et `mapAuthResponse` restent dans `data-access`. Ils absorbent les noms et formats propres au backend puis renvoient un `UserIdentity` propre.

#### Étape 5 — créer le store de session

`auth-store.ts` conserve l’état visible par l’application :

```ts
type AuthState = { readonly status: 'anonymous'; readonly user: null } | { readonly status: 'loading'; readonly user: null } | { readonly status: 'authenticated'; readonly user: UserIdentity } | { readonly status: 'error'; readonly user: null; readonly message: string };

@Service({ autoProvided: false })
export class AuthStore {
  readonly #authService = inject(AuthService);
  readonly #state = signal<AuthState>({ status: 'anonymous', user: null });

  readonly state = this.#state.asReadonly();
  readonly user = computed(() => this.#state().user);
  readonly authenticated = computed(() => this.#state().status === 'authenticated');
}
```

Le service HTTP effectue une opération ; le store représente la session et ses transitions. Cette séparation facilite les tests et évite que chaque page réimplémente la connexion.

#### Étape 6 — fournir l’authentification à `web`

Exposez une fonction `provideAuth()` depuis `users/data-access`, puis activez-la dans `apps/web/src/app/app.config.ts` :

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor])), provideRouter(appRoutes), provideAuth()],
};
```

L’intercepteur ne doit pas connaître le formulaire. Il applique seulement la politique technique confirmée avec le backend : credentials, en-têtes autorisés, traitement d’une réponse `401`, etc.

#### Étape 7 — créer la page de connexion

```text
libs/users/feature-auth/src/lib/login/
├── login.ts
├── login.html
└── login.spec.ts
```

`login.ts` gère le formulaire et délègue au store :

```ts
@Component({
  selector: 'tpx-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  readonly #formBuilder = inject(FormBuilder);
  readonly auth = inject(AuthStore);

  readonly form = this.#formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.login(this.form.getRawValue());
  }
}
```

Le template se trouve exclusivement dans `login.html` :

```html
<form class="mx-auto grid max-w-md gap-4" [formGroup]="form" (ngSubmit)="submit()">
  <label class="form-control">
    <span class="label-text">Adresse e-mail</span>
    <input class="input input-bordered" type="email" formControlName="email" autocomplete="email" />
  </label>

  <label class="form-control">
    <span class="label-text">Mot de passe</span>
    <input class="input input-bordered" type="password" formControlName="password" autocomplete="current-password" />
  </label>

  <button class="btn btn-primary" type="submit" [disabled]="auth.state().status === 'loading'">Se connecter</button>
</form>
```

#### Étape 8 — exporter et router la page

Exportez `Login` depuis `libs/users/feature-auth/src/index.ts`, puis ajoutez dans `apps/web/src/app/app.routes.ts` :

```ts
{
  path: 'login',
  loadComponent: () =>
    import('@talaprix/users').then(({ Login }) => Login),
}
```

Ici, `/login` est l’URL et `loadComponent` télécharge la page standalone au premier accès.

#### Étape 9 — protéger une page utilisateur

Un `auth-guard.ts` peut empêcher la navigation vers une page privée et conserver un `returnUrl`. Ce guard améliore l’expérience utilisateur, mais ne remplace jamais l’autorisation backend.

#### Étape 10 — tester le parcours

- `user-models.spec.ts` : règles et contrats purs ;
- `auth-adapter.spec.ts` : conversion des réponses backend ;
- `auth-service.spec.ts` : méthode, URL, body et erreurs HTTP ;
- `auth-store.spec.ts` : transitions anonymous/loading/authenticated/error ;
- `login.spec.ts` : validation du formulaire et délégation au store ;
- Playwright : connexion réussie, erreur, redirection et déconnexion.

Pour la sécurité, préférez une session gérée par cookie `HttpOnly`, `Secure` et `SameSite` lorsque le backend le permet. Ne stockez pas un secret dans le bundle Angular et ne choisissez pas le stockage du token avant d’avoir confirmé le contrat serveur.

## 9. Sécurité pendant le développement

- Ne placez jamais un secret dans `environment.ts`, le HTML ou un fichier préfixé `VITE_` : le navigateur peut le lire.
- Stockez de préférence la session dans un cookie `HttpOnly`, `Secure` et `SameSite` géré par l’API.
- Ne considérez jamais un guard Angular comme une autorisation suffisante ; l’API doit refaire le contrôle.
- Validez les URL provenant des boutiques et n’utilisez pas `bypassSecurityTrustHtml` pour afficher leur contenu.
- Évitez de journaliser tokens, mots de passe, données personnelles ou payloads complets.
- Consultez `SECURITY.md` avant toute modification de l’authentification.

## 10. Tests et validation avant commit

Pendant le développement :

```bash
npx nx test products-domain
npx nx lint products-feature-web
npx nx build web --configuration=development
```

Avant une pull request :

```bash
npm run format:check
npm run lint
npm test
npm run build
npx nx affected -t e2e
```

Une PR doit expliquer le comportement modifié, citer les projets Nx affectés et donner les résultats des contrôles. Son titre suit lui aussi `type(scope): description`, par exemple `feat(products): add offer sorting`.

## 11. Problèmes courants

### Une classe Tailwind n’apparaît pas

Vérifiez qu’elle est écrite en entier dans un fichier `.html` ou `.ts` sous `apps/` ou `libs/`, puis redémarrez le serveur si la configuration globale vient de changer.

### `@angular/core`, `typescript`, `tslib` ou `@types/node` est introuvable

Ces messages signifient généralement que `node_modules` est incomplet, que la commande n’est pas lancée depuis la racine du dépôt, ou qu’une installation a été interrompue. Les erreurs secondaires comme `Property 'url' does not exist on type '{}'`, `Cannot find name 'process'` et `Cannot find name 'console'` viennent du même problème de résolution des types ; ne modifiez pas `apps/web/src/server.ts` pour les masquer.

Depuis la racine `talaprix-web`, exécutez :

```bash
npm ci
npm start
```

`npm ci` restaure les versions exactes du lockfile, notamment `@types/node`, `typescript`, `tslib` et les paquets Angular. Vérifiez ensuite que `node_modules/.bin/nx` existe et que le serveur affiche `http://localhost:4200`.

Si l’erreur ne concerne que le sandbox ou un terminal intégré, relancez la commande dans un terminal ayant accès au dossier du workspace. Le build de production et le serveur de développement doivent être testés depuis `C:\Users\YOGA\Documents\Projets\young-solver\talaprix\talaprix-web`, pas depuis `apps/web`.

### Une dépendance Nx est refusée

Exécutez `npm run graph`, vérifiez les trois tags du projet et déplacez la responsabilité dans la bonne couche. Ne contournez pas la règle avec un import relatif profond.

### Flowbite provoque `document is not defined`

Un import ou une initialisation s’exécute côté serveur. Passez par `FlowbiteService` dans un callback `afterNextRender`.

### Le build fonctionne mais pas l’admin

Vérifiez séparément `npx nx build admin` : `web` et `admin` ont des cibles et des environnements de rendu différents.

### `nx reset` échoue avec `EPERM` sous Windows

Le dossier `.nx/workspace-data` est encore verrouillé par un daemon Nx ou un
serveur de développement ouvert. Arrêtez d’abord les terminaux qui exécutent
`nx serve`, puis lancez :

```powershell
npx nx daemon --stop
npx nx reset
```

Si Windows conserve le verrou, fermez VS Code/Codex et les autres terminaux du
projet, puis relancez `npx nx reset`. Il n’est pas nécessaire de supprimer le
dossier à la main tant qu’un processus Node l’utilise.

Pour vider uniquement le cache des tâches sans toucher aux métadonnées
verrouillées, utilisez la variante sûre :

```powershell
npx nx reset --onlyCache
```

### `transport invoke timed out` pendant `nx serve web`

Le premier démarrage SSR peut dépasser 60 secondes pendant que Vite optimise
les dépendances. Attendez la fin de `bundling dependencies`, puis rechargez
`http://localhost:4200`. Si le timeout revient après un arrêt forcé, arrêtez le
daemon Nx, supprimez uniquement `.angular/cache`, puis relancez `npx nx serve
web` depuis la racine du dépôt. Le build de production reste le contrôle de
référence : `npx nx build web --configuration=production`.

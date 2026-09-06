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
3. Créer une branche courte, par exemple `feature/product-search`.
4. Visualiser les dépendances si le changement touche plusieurs libs : `npm run graph`.
5. Lancer uniquement l’application et les tests du domaine concerné.
6. Avant le commit, exécuter `npm run format`, puis les contrôles de la section 10.

Pour contrôler seulement les projets affectés par la branche :

```bash
npx nx affected -t lint,test,build
```

## 3. Comprendre l’architecture

Une application (`apps/*`) assemble des routes et des providers. Elle ne contient pas la logique métier.

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
import type { ProductSummary } from '@talaprix/products/domain';

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
import type { ProductSummary } from '@talaprix/products/domain';

@Component({
  selector: 'tpx-product-tile',
  imports: [LucideHeart],
  template: `
    <article class="card rounded-card bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">{{ product().name }}</h2>
        <button class="btn btn-ghost btn-square" type="button" aria-label="Ajouter aux favoris" (click)="favorite.emit(product().id)">
          <svg lucideHeart class="size-5" aria-hidden="true"></svg>
        </button>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTile {
  readonly product = input.required<ProductSummary>();
  readonly favorite = output<string>();
}
```

### Étape D — orchestrer dans une feature

La feature injecte le data-access, gère les états chargement/erreur et passe des données prêtes à afficher au composant UI. C’est également elle qui réagit à l’événement `favorite`.

### Étape E — charger la feature depuis l’application

```ts
export const appRoutes: Route[] = [
  {
    path: 'products',
    loadChildren: () => import('@talaprix/products/feature-web').then(({ productsFeatureWebRoutes }) => productsFeatureWebRoutes),
  },
];
```

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
import { FlowbiteService } from '@talaprix/shared/ui-kit';

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
  template: `<svg lucideSearch class="size-5" aria-hidden="true"></svg>`,
})
export class SearchIconExample {}
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

Pour le réutiliser dans une feature :

```ts
import { PriceBadgeComponent } from '@talaprix/shared/ui-kit';

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

Une PR doit expliquer le comportement modifié, citer les projets Nx affectés et donner les résultats des contrôles. Utilisez des commits du type `feat(products): add offer sorting` ou `fix(auth): clear expired session`.

## 11. Problèmes courants

### Une classe Tailwind n’apparaît pas

Vérifiez qu’elle est écrite en entier dans un fichier `.html` ou `.ts` sous `apps/` ou `libs/`, puis redémarrez le serveur si la configuration globale vient de changer.

### Une dépendance Nx est refusée

Exécutez `npm run graph`, vérifiez les trois tags du projet et déplacez la responsabilité dans la bonne couche. Ne contournez pas la règle avec un import relatif profond.

### Flowbite provoque `document is not defined`

Un import ou une initialisation s’exécute côté serveur. Passez par `FlowbiteService` dans un callback `afterNextRender`.

### Le build fonctionne mais pas l’admin

Vérifiez séparément `npx nx build admin` : `web` et `admin` ont des cibles et des environnements de rendu différents.

# Architecture TalaPrix

## Sens des dépendances

Chaque domaine suit la direction suivante :

```text
app -> feature -> data-access -> domain
               -> ui          -> domain
shared/utils -----------------> shared/models
```

`domain` contient uniquement la vérité métier TypeScript. `data-access` adapte HTTP, stockage et état Signals. `ui` expose des composants de présentation sans accès réseau. `feature` orchestre une route et compose les trois couches. Les apps ne contiennent que le bootstrap, la configuration globale et le routage.

Les contraintes sont encodées dans `eslint.config.mjs`, pas seulement documentées. Trois axes se combinent :

| Axe        | Exemples                                                | But                                     |
| ---------- | ------------------------------------------------------- | --------------------------------------- |
| `scope`    | `shared`, `products`, `users`, `scrapers`, `app`        | Frontière de domaine                    |
| `type`     | `domain`, `util`, `data-access`, `ui`, `feature`, `app` | Direction des couches                   |
| `platform` | `shared`, `web`, `admin`                                | Empêcher une fuite admin vers le public |

## Composition des applications

`web` charge `products/feature-web` à la racine et conserve SSR/hydratation pour le référencement du comparateur. `admin` reste une SPA et charge séparément les features produits et scrapers. Les routes admin utilisent un guard fonctionnel ; l’autorisation finale doit néanmoins toujours être appliquée par l’API.

## Génération

`@talaprix/generators:ui-component` est le premier générateur local. Il remplace l’usage de Mason pour les composants Angular :

```bash
npx nx g @talaprix/generators:ui-component button --project=shared-ui-kit
```

Les prochains générateurs pertinents seront `feature-page` et `data-access-resource`, une fois les conventions d’API stabilisées. Il vaut mieux les écrire à partir de contrats réels que figer prématurément des endpoints ou DTOs supposés.

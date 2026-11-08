# SEO technique TalaPrix — 8 novembre 2026

## Périmètre et constat initial

Le travail concerne le client web Angular SSR et conserve les URL métier et le
design approuvé. Aucun changement de schéma, publication de catalogue, push ou
déploiement n'est nécessaire pour exécuter les tests locaux.

Le diagnostic HTTP public initial a constaté : absence de canonique sur l'accueil,
les résultats et le panier ; absence de liens produit dans leur HTML initial ;
une URL inconnue renvoyait l'accueil avec HTTP 200. Le sitemap ne contenait que
cinq pages fixes. Le JSON-LD produit inférait `InStock` et comptait des devises
différentes dans un seul agrégat.

## Comportement livré

- Le catalogue principal, les catégories, les boutiques et les produits sont
  rendus à la requête. Les documents éditoriaux/légaux restent prérendus.
- `PendingTasks` fait attendre les appels API nécessaires au HTML initial.
  `TransferState` réutilise les seules réponses GET anonymes d'une liste fermée
  d'API publiques à l'hydratation. Les réponses authentifiées, favoris, comptes,
  requêtes POST et jetons utilisateur ne sont pas sérialisés dans ce cache.
- Chaque page reçoit un titre, une description, une canonique absolue et les
  métadonnées Open Graph/Twitter correspondantes. Les images sociales sont des
  URL HTTPS absolues. L'origine canonique reste `https://talaprix.com`.
- Les paramètres de suivi sont retirés des canoniques. Chaque page paginée
  conserve sa propre canonique ; `page=1` est normalisé. Les liens numérotés
  du catalogue sont de vrais liens HTML, tout en préservant la navigation SPA
  et l'ouverture dans un autre onglet.
- Les recherches internes, combinaisons de filtres non éditoriaux, paramètres
  invalides, pages personnelles et pages inconnues sont `noindex`. Une catégorie
  valide et une pagination simple peuvent être indexées si elles contiennent
  effectivement des résultats.
- Staging et localhost restent `noindex` dans le HTML et/ou l'en-tête HTTP.
  L'admin possède déjà un en-tête nginx `noindex, nofollow`, conservé.
- Les anciennes routes ont une redirection HTTP permanente 308. Les URL
  inconnues et produits réellement introuvables renvoient 404. Les pannes
  temporaires de consultation renvoient 503 et `Retry-After`, sans transformer
  une panne en suppression définitive du produit. Les cartes déjà disponibles
  sont conservées lorsqu'un nouveau tri échoue.
- Les données structurées `WebSite`, `Organization`, `Product` et
  `BreadcrumbList` reflètent les données publiques et les liens visibles.
  Les prix restent dans leur devise native : un agrégat par devise, avec son
  propre compte d'offres. Les doublons et prix invalides sont exclus.
  Aucun stock, avis, note, GTIN, date de validité ni adresse n'est inventé.
  Le JSON est inséré comme données et les `<` sont échappés.
- Le HTML n'est pas mis dans un cache partagé. Les assets hashés peuvent être
  gardés un an ; les fichiers non versionnés ont un cache court.
- La sonde Docker utilise `/healthz`, sans attendre le catalogue : une panne
  de l’API ne suffit pas à provoquer des redémarrages du serveur web.

## Sitemaps et robots

`/sitemap.xml` devient un index, avec `/sitemaps/pages.xml` et
`/sitemaps/products-1.xml`, etc. Les références proviennent exclusivement de
`get-offer-references`, l'API publique existante, avec la clé publique.
Seules les références UUID avec produit, nom et au moins une boutique sont
retenues ; aucune table privée ni donnée de scraping n'est consultée.

Les lectures sont bornées à 100 références par page, 500 pages et huit secondes
par appel ; le cache de cinq minutes déduplique les requêtes simultanées et
reste borné à 100 entrées. Si la limite ou le contrat est dépassé, le serveur
renvoie 503 plutôt que publier silencieusement un sitemap tronqué. Les URL de
partitions invalides renvoient 404. XML échappé, ETag et réponses 304 sont pris
en charge. Aucune date `lastmod` n'est inventée.

L'API publique a été contrôlée en lecture seule : 1 615 références, soit
17 pages de 100, lors du diagnostic. Ce nombre de références n'est pas un
décompte de produits distincts ou de vendeurs certifiés.

`robots.txt` permet de lire les pages portant `noindex`, plutôt que les bloquer
avant que Google puisse voir cette directive. Les canoniques, liens internes
et sitemaps utilisent la même origine. Aucun renommage des URL produit UUID
n'est imposé, afin de préserver les liens existants.

## Vérification locale et CI

```powershell
npm run format:check
npm run lint
npm test -- --output-style=stream
npm run build -- --skip-nx-cache
node tools/scripts/check-seo-ssr.mjs
```

Le dernier contrôle démarre un processus SSR compilé isolé sur localhost:4900
et simule l'API publique via `tools/scripts/seo-fixture.mjs`. Il n'appelle pas
la production et bloque les écritures. Il contrôle le HTML avant JavaScript,
les métadonnées, la pagination, les devises, le JSON-LD, les statuts HTTP,
staging, les sitemaps, les indisponibilités et les limites. La fixture n'est
jamais importée par le serveur de production.

Les builds de vérification CI utilisent une URL et une clé publiques fictives.
Le cache Nx est désactivé pour ces builds afin de ne pas réutiliser une
configuration publique précédente. Le job image reconstruit séparément le site
avec sa configuration habituelle ; son Dockerfile désactive déjà ce cache.
Ce contrôle s'exécute après le build dans la CI des PR et dans la vérification
du workflow web. Les tests unitaires couvrent les règles d'URL, l'échappement
JSON, les métadonnées de navigation et l'exclusion des données privées du cache.

La navigation a aussi été vérifiée dans Edge headless en 1 440 × 1 000 et
390 × 844 : pagination aller-retour, fiche produit, panier, accueil et page
absente ; titres, canoniques et directives restent cohérents après navigation
SPA. Aucune erreur JavaScript d’hydratation n’a été observée sur ce parcours.
Les images externes étaient bloquées dans cet environnement de test isolé.

## Mise en ligne et suivi

1. Pousser la branche `codex/seo-technical-20261108` et ouvrir une PR vers
   `master`. Attendre tous les contrôles verts avant fusion.
2. La fusion déclenche staging, pas la promotion web en production. Contrôler
   le HTTPS, la navigation, l'authentification, le panier et les prix affichés.
   Comparer aussi les temps de réponse et les erreurs API : le catalogue
   attend désormais réellement ses données pendant le SSR.
3. Inspecter sur staging les pages publiques, privées et absentes ; vérifier
   `X-Robots-Tag: noindex` et les canoniques de production. Ne pas supprimer la
   protection de staging pour tester le référencement.
4. Après validation, lancer la promotion web habituelle avec
   `promote_to_production=true` et conserver le digest précédent pour rollback.
   Aucune migration SQL ou modification backend n'est requise pour ce lot SEO.
5. En production, vérifier les en-têtes et HTML brut, soumettre
   `https://talaprix.com/sitemap.xml` dans Search Console, inspecter une page
   produit et utiliser le test de résultats enrichis. Suivre les erreurs
   d'indexation, les canoniques choisies, les données structurées et les Core
   Web Vitals réels. Un test local ne prédit pas le classement ni l'apparition
   d'un résultat enrichi.

## Références

- [Google : URL et canoniques e-commerce](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites)
- [Google : pagination et chargement incrémental](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google : produit et agrégats d'offres](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Google : création des sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google : noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Angular : SSR et réponses HTTP](https://angular.dev/guide/ssr)

# Interfaces publiques TalaPrix — première livraison

Le choix validé est de terminer et revoir les interfaces avant de connecter Supabase. Tous les écrans publics utilisent actuellement les données de démonstration du dossier fourni. Les actions de connexion, formulaire commerçant, favoris, alertes et optimisation sont locales à la session. Aucun e-mail, demande commerçant, prix ou produit n'est envoyé au serveur.

## Parcours et écrans

| URL                                | Écran                                                               |
| ---------------------------------- | ------------------------------------------------------------------- |
| /                                  | Accueil, catégories, offres, carte et présentation de l'application |
| /recherche                         | Recherche mobile dédiée                                             |
| /resultats?q=hp                    | Catalogue, tri, prix et filtres mobiles                             |
| /produit/samsung-galaxy-s24-128-go | Fiche de référence, états et comparaison d'offres                   |
| /boutiques                         | Carte illustrée et liste des boutiques                              |
| /boutiques?position=refusee        | État sans localisation                                              |
| /panier                            | Groupement des achats et deux plans simulés                         |
| /compte                            | Favoris, recherches récentes et alertes                             |
| /categories                        | Catalogue de catégories                                             |
| /commercants                       | Présentation, formulaire et FAQ                                     |

La maquette de détail disponible est celle du Samsung Galaxy S24 : les liens de produits pointent encore sur cet exemple. Le catalogue complet, les vraies variantes et les stocks seront traités avec le branchement de données. La carte est une illustration locale ; elle ne demande pas la position et ne calcule pas d'itinéraire réel. Les liens externes non fournis (WhatsApp, réseaux, conditions et stores) restent à renseigner. Les textes de succès sont des états de démonstration.

## Architecture

Les applications gardent leur rôle de bootstrap et de routage. Les pages standalone, OnPush et templates HTML externes résident dans les bibliothèques feature-web existantes : home pour le shell et l'accueil, products pour le catalogue, la fiche, les catégories et les panneaux du compte, shops pour la carte et l'inscription commerçant, cart pour le panier. Les stores Preview des bibliothèques data-access centralisent les signals de présentation. Ils ne remplacent pas les clients Supabase existants.

PreviewPreferences fournit la devise, les overlays et le bus d'ajout au panier. CatalogPreviewStore gère les filtres, favoris et alertes. CartPreviewStore calcule les regroupements et totaux à partir des seules alternatives présentes dans mock-data.json. ShopPreviewStore synchronise la liste et la sélection. AuthPreviewStore démontre les deux étapes de connexion sans créer de session réelle.

Les éléments SVG et les fontes Plus Jakarta Sans sont locaux. SvgVisual, PriceTag et ShopAvatar se trouvent dans shared/ui-kit. Les classes du design sont préfixées client- pour éviter les collisions avec daisyUI ; les règles sont limitées au shell .tpx-public afin de préserver l'administration. Les domaines restent indépendants de l'API privée de scraping.

## Vérifications reproductibles

Depuis la racine : npm start puis, dans un autre terminal, node tools/scripts/client-visual-qa.mjs. Le script crée les captures desktop 1440 px et mobile 390 px à densité 2, contrôle les parcours et bloque les requêtes externes. CLIENT_QA_URL permet de changer l'origine locale. Les captures et le rapport sont dans dist/client-visual-qa. Une erreur d'interface ou une tentative de requête Supabase fait échouer le contrôle.

Les captures ne constituent pas une validation pixel parfaite. Les rapports de comparaison indiquent les dimensions et les pixels différents dans la surface commune ; ils ne masquent pas les différences de contenu ou de hauteur. Les contrôles détaillés et leurs résultats sont consignés dans CLIENT-VALIDATION.md.

## Références Angular consultées

- [Style guide](https://angular.dev/style-guide)
- [Signals](https://angular.dev/guide/signals)
- [Routage](https://angular.dev/guide/routing/define-routes)
- [SSR](https://angular.dev/guide/ssr)
- [Accessibilité](https://angular.dev/best-practices/a11y)

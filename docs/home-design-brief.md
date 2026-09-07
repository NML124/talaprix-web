# TalaPrix home — brief d’implémentation

## Objectif

Créer la page d’accueil publique du comparateur TalaPrix dans `apps/web`, en
respectant la maquette `assets/plans/layout.jpg` pour la hiérarchie responsive
desktop/mobile et `assets/plans/mon_design.png` pour l’identité visuelle.

## Direction visuelle

Itération fidèle à la capture utilisateur : interface plate et nette, presque
aucune ombre (uniquement une séparation légère), fond blanc, texte anthracite,
vert TalaPrix et accent bleu de l’identité. Charger réellement Lato comme
police principale avec fallback système. La bannière commence sous le header,
présente des coins arrondis marqués (environ 24 px), un overlay sombre modéré,
un titre blanc avec l’accent turquoise sur la promesse, et le panier/logo à
droite sur desktop.

## Structure attendue

1. Header desktop avec logo, recherche, téléchargement de l’application,
   localisation/devise, panier et profil.
2. Header mobile compact avec logo, recherche et actions essentielles.
3. Hero pleine largeur avec `assets/images/bg-banner.jpg`, coins arrondis,
   overlay lisible, promesse de comparaison et deux badges noirs App Store /
   Google Play compacts (pas des boutons Tailwind génériques).
4. Section catégories/populaires sous forme de cartes horizontales.
5. Section produits récemment comparés / meilleures offres.
6. Bloc de confiance et appel à l’action.
7. Footer multi-colonnes desktop, empilé mobile.

## Contraintes techniques

- Angular standalone dans la feature web existante.
- HTML séparé dans `*.html`, aucun template inline.
- Tailwind/daisyUI uniquement pour le style local ; pas de CSS/SCSS de
  composant.
- Icônes via `@lucide/angular`.
- Utiliser `loadComponent` et les façades `@talaprix/*` existantes.
- Prévoir les états responsive sans dépendre de données backend réelles : les
  cartes peuvent utiliser des données statiques typées dans la page.

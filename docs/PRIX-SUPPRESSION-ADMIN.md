# Historique des prix et suppression admin

Le détail d’une offre affiche un graphique de prix datés. Toucher, survoler ou
sélectionner au clavier un point affiche son prix et sa date. Le prix actuel porte
un repère distinct. Une date de source antérieure à un historique est conservée :
elle n’est pas remplacée par la date de l’historique. Si sa date manque, elle est
signalée comme non renseignée. Un historique vide ou invalide ne crée pas de courbe.

La corbeille des listes admin ouvre un aperçu de suppression définitive : nombres
de lignes supprimées, liens actualisés et dépendances protégées. La case de
confirmation est obligatoire. Un changement après l’aperçu impose une nouvelle
vérification. Le bouton ne bascule jamais vers un archivage si la suppression échoue.

## Dépendance backend

Fusionner d’abord `feat/TP-20261127-admin-delete-impact` dans `main` du dépôt
`Merdi-dev12/talaprix-supabase-api` et appliquer les deux migrations datées
`20261127010000` et `20261127020000`, conformément à sa documentation.
Cette branche frontend cible `master` du dépôt `NML124/talaprix-web`.

## Vérification manuelle

- Scraping → Préparer une collecte : les trois champs de la carte ont un rayon
  de 12 px. Le calendrier reste ancré à « Publications depuis le » ; sélection,
  fermeture extérieure et Échap sont disponibles.
- Catalogue : vérifier les suppressions et les liens indiqués avant de cocher.
  Les essais de confirmation ont utilisé des données fictives locales.
- Offre → Détails : sélectionner un prix historique puis le prix actuel ; comparer
  les dates aux données affichées. Vérification sur bureau et mobile de 390 px.

Le scénario visuel fictif n’est pas livré dans l’application. Aucune donnée réelle
n’a été supprimée pendant ces vérifications.

# Validation des interfaces publiques

Date du contrôle : 2026-10-29T01:42:25.876Z. Version locale compilée en production, SSR actif, origine localhost autorisée explicitement par NG_ALLOWED_HOSTS. Aucun déploiement.

## Résultats

- Compilation production web : réussie, 9 routes prérendues et fiche dynamique en rendu serveur.
- Lint : les 13 projets concernés passent ; home et products ont été revérifiés après le dernier ajustement.
- Test existant products-data-access : 1 test passé.
- Playwright : 34 contrôles passés, 34 captures, aucune erreur JavaScript et aucune requête Supabase observée. Les requêtes externes sont bloquées pendant ces essais.
- Les nouveaux fichiers de production TypeScript et HTML restent sous 300 lignes après Prettier ; git diff --check passe.

Le test navigateur couvre l'absence de débordement horizontal sur les pages, les filtres de prix et l'état vide, les plans du panier et le retrait d'un produit, la sélection d'une boutique, la conversion USD/CDF, les onglets du compte et la désactivation d'une alerte, le contrôle du téléphone commerçant, les étapes e-mail/code et Échap, le menu mobile et les suggestions de recherche au clavier. Il ne valide pas une connexion réelle, des prix réels, un envoi de formulaire ou un calcul géographique.

## Comparaison aux PNG fournis

Les captures desktop utilisent 1440 × 900, les mobiles 390 × 844 avec densité 2. La comparaison ci-dessous porte sur la surface commune, sans redimensionner l'image. Un pixel est différent si au moins un canal RGB varie de plus de 24. La différence de hauteur est conservée dans le tableau. Ce pourcentage est un indicateur de décalage, pas un score de qualité ou une certification de fidélité.

| Écran                                   | Référence (px) | Capture (px) | Pixels différents, zone commune |
| --------------------------------------- | -------------- | ------------ | ------------------------------- |
| desktop/01-accueil.png                  | 1440 × 3374    | 1440 × 3370  | 5.46 %                          |
| desktop/01b-accueil-popup-connexion.png | 1440 × 900     | 1440 × 900   | 1.16 %                          |
| desktop/01c-accueil-popup-code.png      | 1440 × 900     | 1440 × 900   | 2.43 %                          |
| desktop/02-recherche-ouverte.png        | 1440 × 1424    | 1440 × 3370  | 44.29 %                         |
| desktop/03-resultats.png                | 1440 × 1750    | 1440 × 1750  | 3.02 %                          |
| desktop/04-fiche-produit.png            | 1440 × 2116    | 1440 × 2116  | 3.43 %                          |
| desktop/05-boutiques-carte.png          | 1440 × 1309    | 1440 × 1308  | 5.05 %                          |
| desktop/06-carte-sans-position.png      | 1440 × 1309    | 1440 × 1308  | 4.31 %                          |
| desktop/07-panier.png                   | 1440 × 1142    | 1440 × 1138  | 6.04 %                          |
| desktop/07b-panier-optimise.png         | 1440 × 1303    | 1440 × 1297  | 6.46 %                          |
| desktop/08-compte-favoris.png           | 1440 × 1525    | 1440 × 1525  | 4.01 %                          |
| desktop/09-categories.png               | 1440 × 1753    | 1440 × 1753  | 2.09 %                          |
| desktop/10-commercants.png              | 1440 × 2842    | 1440 × 2840  | 4.37 %                          |
| desktop/11-connexion-popup.png          | 1440 × 900     | 1440 × 900   | 8.77 %                          |
| desktop/composant-footer.png            | 1440 × 379     | 1440 × 380   | 3.51 %                          |
| desktop/composant-header.png            | 1440 × 169     | 1440 × 169   | 6.91 %                          |
| desktop/design-system.png               | —              | —            | Non capturé                     |
| mobile/composant-m-header.png           | 780 × 356      | 780 × 356    | 3.91 %                          |
| mobile/composant-m-pied.png             | 780 × 1418     | 780 × 1422   | 5.34 %                          |
| mobile/composant-m-tabbar.png           | 780 × 148      | 780 × 148    | 4.8 %                           |
| mobile/m01-accueil.png                  | 780 × 6878     | 780 × 6878   | 2.57 %                          |
| mobile/m02-recherche-ouverte.png        | 780 × 1688     | 780 × 1688   | 3.11 %                          |
| mobile/m03-resultats.png                | 780 × 5284     | 780 × 5260   | 8.41 %                          |
| mobile/m03b-filtres.png                 | 780 × 1688     | 780 × 1688   | 7.96 %                          |
| mobile/m04-fiche-produit.png            | 780 × 5000     | 780 × 4844   | 7.68 %                          |
| mobile/m05-boutiques-carte.png          | 780 × 4130     | 780 × 4130   | 3.01 %                          |
| mobile/m06-carte-sans-position.png      | 780 × 4044     | 780 × 4044   | 3.74 %                          |
| mobile/m07-panier.png                   | 780 × 2992     | 780 × 2964   | 16.2 %                          |
| mobile/m07b-panier-optimise.png         | 780 × 3416     | 780 × 3410   | 14.28 %                         |
| mobile/m08-compte-favoris.png           | 780 × 4280     | 780 × 4274   | 4.49 %                          |
| mobile/m09-categories.png               | 780 × 3924     | 780 × 3924   | 3.03 %                          |
| mobile/m10-commercants.png              | 780 × 6656     | 780 × 6668   | 10.79 %                         |
| mobile/m11-connexion.png                | 780 × 1688     | 780 × 1688   | 25.22 %                         |
| mobile/m11b-connexion-code.png          | 780 × 1688     | 780 × 1688   | 30.03 %                         |
| mobile/m12-menu.png                     | 780 × 1688     | 780 × 1688   | 5.34 %                          |

La planche design-system est une référence de composants et de tokens ; aucune route de production dédiée n'a été ajoutée. Les captures de composants isolés n'ont pas forcément le même cadrage que les planches originales. Le contrôle ne conclut donc pas à une équivalence pixel parfaite des 35 PNG.

Les écarts les plus importants concernent les fonds de démonstration des overlays (la recherche fournie montre des blocs simplifiés derrière le panneau), les rangées dynamiques du panier et la navigation mobile désormais fixée au viewport. Les favoris préchargés, le focus du champ e-mail, le code vide et les états interactifs produisent aussi des différences visibles. Les principales pages conservent les visuels et les proportions de la source ; les écarts restent à revoir avec l'utilisateur avant intégration API.

## Avertissements de compilation

Le bundle initial fait environ 839 Ko bruts : il dépasse l'avertissement de 500 Ko, reste sous la limite d'erreur de 1 Mo. Le module qrcode de l'ancienne navigation est CommonJS et reste entraîné par les exports existants. Le générateur de CSS critique signale deux sélecteurs ignorés. Ces avertissements ne sont pas présentés comme résolus ; la réduction des exports historiques et du CSS global mérite une passe de performance avant publication.

## Limites de la démonstration

Les états sont en mémoire et se réinitialisent au rechargement. Les fiches pointent sur l'exemple Samsung fourni. La carte et les plans sont des données de maquette ; le téléphone vendeur, la navigation réelle, les alertes persistées et les variantes nécessitent les contrats décrits dans CLIENT-API-MAPPING.md. Les actions sans destination fournie, dont certains liens légaux et sociaux, restent à renseigner. Le formulaire confirme uniquement un état visuel local.

Lancer npm start puis node tools/scripts/client-visual-qa.mjs pour reproduire les vérifications. Le script accepte CLIENT_QA_URL. Les captures sont exportées dans dist/client-visual-qa ; le JSON de cette livraison est conservé dans client-ui-validation.json.

## Révision après revue du 29 octobre 2026

Header sticky sur ordinateur et mobile ; recherche à 13 px ; action de profil après le panier (icône seule sur petit écran). Les menus natifs des interfaces publiques sont remplacés par SelectCard : carte blanche, sélection visible, navigation au clavier, Échap et fermeture au clic extérieur. Le panneau de recherche utilise deux colonnes et des produits présentés en lignes avec vignette, nom tronqué et prix.

Les textes secondaires et le lien de création de compte de la carte de bienvenue ont été retirés, ainsi que Français dans la ligne supérieure. Les champs et boutons de newsletter font 40 px. La bande Retour en haut est remplacée par une flèche flottante apparaissant au défilement. Les noms des cartes sont sur une ligne avec ellipsis et titre complet au survol. Les liens Voir plus utilisent le même chevron SVG ; les mosaïques ont un lien et une flèche dans leur titre, sans lien supplémentaire en bas.

Compilation production SSR réussie. Lint des cinq projets modifiés validé. Dernier contrôle navigateur : **36 contrôles réussis**, 37 captures, aucune erreur JavaScript et aucune requête Supabase observée. Les contrôles supplémentaires vérifient les menus, la taille effective de recherche, la newsletter, la troncature, le header au scroll et le bouton flottant. Les chiffres de comparaison PNG présentés plus haut concernent la première livraison ; les modifications ci-dessus suivent les nouveaux choix de l'utilisateur.

Rapport courant : client-ui-refinements-validation.json.

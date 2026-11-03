# Déploiement du web Angular

Le dépôt produit une application Angular SSR servie par Node sur le port 4000.
Sur le VPS, les services Swarm existants sont `talaprix-web-staging_talaprix-web-staging`
(`staging.talaprix.com`) et `talaprix-web-production_talaprix-web-production`
(`talaprix.com` et `www.talaprix.com`). Le workflow met à jour ces services en place :
il ne supprime ni leurs réseaux ni leurs volumes.

## Préparer GitHub Actions

- Variables du dépôt : `SUPABASE_URL` (URL publique de Supabase),
  `MAPBOX_PUBLIC_TOKEN` (jeton public `pk.`, facultatif),
  `WEB_ANALYTICS_TOKEN` (identifiant public Cloudflare Web Analytics, requis
  pour activer les statistiques après consentement ; sans cette variable,
  aucune mesure n'est envoyée), `VPS_HOST`,
  `GHCR_READ_USER`.
- Secrets du dépôt ou de l'environnement staging : `SUPABASE_ANON_KEY`
  (clé publique), `VPS_SSH_PRIVATE_KEY` (clé de déploiement dédiée),
  `VPS_SSH_KNOWN_HOST` (ligne `known_hosts` vérifiée hors bande),
  `GHCR_READ_TOKEN` (jeton GitHub avec lecture du package).
- Créer les environnements GitHub `staging` et `production`. Protéger
  `production` par des approbateurs obligatoires et restreindre la branche à
  `master`. La promotion est en plus limitée au lancement manuel avec
  `promote_to_production=true`.
- Le compte SSH de déploiement doit pouvoir exécuter `docker login` et
  `docker service update` sur ces deux services. Ne mettre aucune clé privée
  dans le dépôt ou l'image.
- Le GoTrue auto hébergé doit autoriser les retours OAuth exacts
  `https://staging.talaprix.com` et `https://talaprix.com` en plus de
  `https://www.talaprix.com` et du développement local. Vérifier la valeur
  effective de `GOTRUE_URI_ALLOW_LIST` avant de tester Google sur staging.
- Dans Cloudflare Web Analytics, `Manage site` doit proposer **Install JS
  Snippet**. Vérifier aussi dans le HTML public que Cloudflare n'injecte pas
  déjà le beacon avant consentement. Le jeton public du site est fourni par la
  variable GitHub `WEB_ANALYTICS_TOKEN` au build ; le script ne se charge qu'après
  accord sur `talaprix.com` ou `www.talaprix.com`. Sur staging,
  aucune mesure n'est envoyée ; `localhost` est autorisé pour le test local.

## Parcours

Un push autorisé sur `master` lance format, lint, tests et build, puis publie
une image par digest et met à jour **staging uniquement**. Vérifier sur staging
la connexion Google, la recherche, les favoris, le panier, les pages catégories,
les routes SSR et le choix de confidentialité sur desktop et mobile. Vérifier
dans l'onglet Réseau du navigateur qu'aucune requête vers
`static.cloudflareinsights.com` ne part avant accord ou après refus. La production
requiert ensuite un lancement manuel du workflow et l'approbation de
l'environnement `production`. Le workflow repasse par staging et promeut le
même digest. Il ne faut pas exécuter de `docker stack rm`.

Les labels Traefik actuels pointent vers le port 80 de l'ancien web. Le
workflow les passe à 4000 avec l'image SSR. La première bascule en production
peut provoquer une courte interruption pendant cette transition de port ;
planifier cette opération après validation de staging. Conserver le digest
précédent pour pouvoir utiliser `docker service rollback` si la vérification
post-déploiement échoue.

Ce workflow ne déploie pas l'application admin. Son authentification et ses
API privées demandent une chaîne distincte et une validation séparée.

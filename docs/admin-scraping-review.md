# Connexion de la page admin Scraping

La page utilise l’API privée de revue du projet `talaprix-scraping`, au travers de la fonction Supabase `admin-scraping-review`.

## Configuration du panel

Le panel utilise exclusivement `ADMIN_SUPABASE_URL` et `ADMIN_SUPABASE_ANON_KEY`. Ces variables sont séparées des variables `SUPABASE_URL` et `SUPABASE_ANON_KEY` du site client afin d’éviter de diriger l’admin vers l’ancien projet cloud.

Pour le VPS, `ADMIN_SUPABASE_URL` doit être `https://api-main.talaprix.com` et `ADMIN_SUPABASE_ANON_KEY` la clé publique du Supabase self-hosted. Ajouter ces deux valeurs au `.env` local ou aux variables de build du déploiement admin. Ne jamais y mettre la clé interne scraping, la clé `service_role`, le mot de passe PostgreSQL ou une clé R2.

## Accès et décisions

- Le navigateur envoie la clé publique et la session de l’administrateur à Supabase.
- Le dispatcher exige le rôle admin avant d’exécuter `admin-scraping-review`.
- Le secret HTTP interne FastAPI reste dans un Docker Secret monté seulement au service Edge Functions.
- L’API privée vérifie encore la session et le rôle pour les décisions et les URL photo signées.
- Chaque décision utilise la version lue du candidat et un conflit retourne HTTP 409.
- Approuver ou rejeter ne publie rien au catalogue ; la décision reste auditée dans le schéma privé.

La migration `011_admin_review_observations.sql` du dépôt scraping doit être appliquée au PostgreSQL du VPS avant le déploiement de la version FastAPI qui renvoie l’observation Apify brute. Voir [la référence du contrat et de la migration](../../talaprix-scraping/docs/ADMIN-REVIEW-DATA.md) si le dépôt frère est disponible localement.

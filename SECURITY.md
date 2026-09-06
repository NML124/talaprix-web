# Politique de sécurité

## Authentification

- Préférer une session serveur dans un cookie `HttpOnly`, `Secure` et `SameSite` à un JWT persistant dans `localStorage`.
- Ne jamais considérer un guard Angular comme une autorisation : l’API doit contrôler rôle, ressource et action à chaque requête.
- Charger la session depuis un endpoint dédié et invalider l’état local sur `401`/`403`.
- Garder les secrets exclusivement côté serveur. Les fichiers d’environnement frontend ne sont pas secrets.

## Frontend

- Ne pas utiliser `bypassSecurityTrust*` ni injecter du HTML non maîtrisé.
- Valider les URL externes avant navigation et conserver les bindings Angular standards.
- Déployer une Content Security Policy restrictive, HSTS et des en-têtes anti-framing au niveau du proxy/CDN.
- Éviter les données personnelles dans logs, analytics, erreurs et stockage navigateur.

## Admin et scrapers

- Isoler les endpoints admin sous une politique d’autorisation serveur explicite.
- Journaliser les actions sensibles sans journaliser les identifiants, cookies ou payloads secrets.
- Protéger le déclenchement des scrapers par contrôle de rôle, limitation de débit, idempotence et audit.
- Traiter les contenus collectés comme non fiables avant affichage ou indexation.

`AuthSessionStore` démarre volontairement en état anonyme. Il ne stocke aucun jeton ; l’intégration backend devra hydrater cet état depuis la session serveur.

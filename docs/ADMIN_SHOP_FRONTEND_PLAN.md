# Administration et espace boutique TalaPrix

## Décision produit

Le panneau web `/admin` sert aux décisions qui touchent toute la plateforme. Le tableau de bord boutique Flutter sert aux offres et aux performances d'une boutique. L'espace boutique web `/shop` reprend les mêmes cas d'usage dans une navigation séparée. Le mobile conserve ses outils admin actuels pour les opérations courantes, sans devenir une seconde console complète.

Cette répartition évite de confondre trois identités : un client de l'application, un membre du personnel TalaPrix et le responsable d'une boutique. Une personne peut posséder plusieurs affiliations, mais chaque session active doit annoncer son contexte et ses capacités.

## Carte des écrans

| Domaine                       | Admin web   | Admin mobile actuel | Boutique mobile actuelle | Suite                                               |
| ----------------------------- | ----------- | ------------------- | ------------------------ | --------------------------------------------------- |
| Catalogue, catégories, offres | Oui         | Oui                 | Ses propres offres       | Contrats API communs, droits selon le contexte      |
| Boutiques et positions        | Toutes      | Toutes              | Sa boutique              | Séparer fiche partenaire et gestion du propriétaire |
| Scraping et revue             | Oui         | Non                 | Non                      | Réservé au personnel habilité                       |
| Modération et avis            | Oui         | Partiel             | Ses avis et réputation   | File de décision auditée                            |
| Rapports globaux              | Oui         | Aperçu              | Non                      | Mesures agrégées, sans données privées superflues   |
| Réductions d'offre            | Vue globale | Non                 | Oui, liées à `offerId`   | Distinguer des placements publicitaires             |
| Placements et messages        | Oui         | Publications        | Vue de sa diffusion      | Consentement et état de livraison explicites        |
| Communauté                    | Oui         | Oui                 | Non                      | Nom autorisé, contact masqué par défaut             |
| Personnel, rôles, audit       | Oui         | Non                 | Non                      | Super-admin et capacités serveur                    |

## Navigation cible

1. **Administration web** : Vue d'ensemble, Catalogue, Boutiques, Modération, Scraping, Marketing, Communauté, Rapports, puis « Équipe & accès » et « Rôles » sous une section réservée au Super-admin. Les écrans de décision affichent auteur, état, motif et historique.
2. **Boutique** : Tableau de bord, Offres, Réductions, Visibilité, Analyses, Avis, Paramètres. Chaque écran est scellé à la boutique active ; si un vendeur gère plusieurs boutiques, le sélecteur change le contexte avant de charger les données.
3. **Communauté** : profils clients séparés de l'équipe admin. Le nom et l'activité utile sont visibles ; téléphone et adresse sont masqués. Une procédure d'accès exceptionnel aux coordonnées devra avoir un motif, un droit dédié et une trace d'audit.

## Accès et authentification à préparer

| Parcours            | Écran et état attendu                                          | Règle métier                                                                   |
| ------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Connexion admin     | Email, méthode autorisée, attente MFA, succès, erreur          | Personnel actif uniquement ; MFA exigée côté serveur avant la session admin    |
| Invitation admin    | Email, rôle, périmètre, expiration, réémission, révocation     | Super-admin uniquement ; invitation à usage unique, auditée                    |
| Connexion boutique  | Identité, choix de boutique si nécessaire                      | Membre actif de la boutique ; aucune donnée d'une autre boutique               |
| Mot de passe oublié | Demande neutre, lien/code reçu, nouveau mot de passe, succès   | Réponse identique que l'adresse existe ou non ; jeton limité et à usage unique |
| MFA                 | Inscription, vérification, codes de secours, récupération      | État réel fourni par Auth ; ne jamais simuler « protégée » sans preuve         |
| Sessions            | Appareils actifs, fermeture d'une session, déconnexion globale | Révocation appliquée côté serveur                                              |

Le parcours OTP/Google/Apple existant dans Flutter reste disponible selon le compte. Les écrans de mot de passe n'apparaissent que si cette méthode est activée pour le compte. Le panneau web ne doit jamais fabriquer de session admin à partir d'un rôle affiché dans le client.

Dans le panel actuel, `/auth` refuse la création automatique de comptes par OTP et renvoie une session admin vers `/admin` ou une session vendeur vers `/shop` après résolution du rôle par le profil. L'inscription publique du site client garde son comportement propre. La récupération de mot de passe, la MFA, la gestion des sessions et les invitations sécurisées demandent encore les contrats et contrôles serveur correspondants ; les éléments de prévisualisation de l'équipe ne prouvent aucun droit réel.

## Modèle de droits

Le rôle est un ensemble de capacités, puis un périmètre limite les objets concernés. Exemples : `catalogue.read`, `catalogue.write`, `offer.review`, `scraping.review`, `marketing.publish`, `community.read_masked`, `community.contact_reveal`, `staff.invite`, `staff.role_assign`, `audit.read`. Le Super-admin est le seul rôle pouvant inviter le personnel, attribuer les rôles et modifier le périmètre. Il ne peut pas retirer son propre dernier accès Super-admin.

Chaque API vérifie l'identité, la capacité et la portée sur l'objet. Une route masquée dans Angular ou Flutter améliore l'expérience mais n'accorde aucun droit. Les mutations sensibles portent un motif, un identifiant de requête et une entrée d'audit. Les boutiques utilisent leurs propres capacités `shop.offer.*`, `shop.discount.*`, `shop.analytics.read` et la portée `shop_id`.

## Contrats de présentation indépendants du fournisseur

Les composants reçoivent des modèles typés par domaine, fournis par des interfaces de repository. Les adaptateurs mock et Supabase implémenteront les mêmes interfaces. États communs : `loading`, `ready`, `empty`, `error`, `forbidden`; les mutations ont aussi `pending` et `conflict`.

| Vue                       | Données minimales                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Utilisateur communautaire | `id`, `displayName`, `phoneMasked`, `commune`, `status`, activité agrégée ; aucune adresse brute |
| Membre du personnel       | `id`, `name`, `email`, `role`, `capabilities`, `scope`, `mfaStatus`, `lastActivity`              |
| Boutique                  | `shopId`, `name`, `status`, `addressDisplay`, `ownerId`, `updatedAt`                             |
| Offre boutique            | `offerId`, `shopId`, `productId`, `price`, `currency`, `availability`, `updatedAt`               |
| Réduction d'offre         | `discountId`, `offerId`, `oldPrice`, `newPrice`, `startsAt`, `endsAt`, `status`                  |
| Mise en avant             | `placementId`, `target`, `surface`, `creative`, `period`, `status`                               |
| Message client            | `campaignId`, `channel`, `audienceRule`, `consentRule`, `schedule`, `deliveryMetrics`            |

Le serveur renvoie directement les champs masqués aux vues qui n'ont pas la capacité de dévoilement. Ne pas envoyer les coordonnées complètes pour ensuite les cacher uniquement avec CSS ou un pipe Angular.

## Ordre de réalisation et critères de sortie

1. **Assainir l'interface existante** : confidentialité communauté, libellé « Offres de la boutique », Marketing séparé en réductions, mises en avant et messages. Compiler, contrôler les thèmes clair/sombre et vérifier les états vides.
2. **Préparer l'espace boutique** : sept écrans web sous `/shop`, avec modèles et fixtures propres à la boutique. Les fixtures sont disponibles uniquement en développement ; en production, le magasin de données refuse de les servir tant que l'API réelle n'est pas raccordée. Le changement de boutique et l'isolation des données réelles restent à faire.
3. **Préparer Auth et RBAC** : écrans connexion/invitation/récupération/MFA/sessions, guards UX, capacités et périmètres simulés. Tous les états restent explicitement simulés tant que l'API n'est pas raccordée.
4. **Raccorder le VPS** : adapter les repositories, activer les contrôles serveur et RLS/Edge, puis vérifier avec comptes client, vendeur, admin et Super-admin. Tester refus, périmètre, expiration, MFA, audit et révocation avant publication.

La CI doit exécuter formatage, lint, tests et build sans mode watch. Une démonstration visuelle sur écran étroit et bureau précède le raccordement des données réelles.

# Charte de Développement & Architecture — TalaPrix

## 1. Les Règles d'Or 
* **Modularité Stricte (Limite de 300 lignes)** : Aucun fichier ne doit dépasser **300 lignes**. Si un fichier approche les 250 lignes, il doit être immédiatement découpé en sous-composants (UI/Smart), en services spécialisés ou en utilitaires.
* **Vérification Systématique** : Toujours consulter et respecter les documentations officielles récentes (**Angular Standalone/Signals**, **Tailwind CSS**, **Lucide**) avant toute implémentation.
* **Validation & Refactoring Proactif** : Face à une demande contenant une incohérence, une mauvaise pratique ou un risque architectural/sécuritaire, l'IA doit **bloquer l'exécution** et soumettre une proposition d'amélioration argumentée.
* **Interdiction des Valeurs en Dur** : Aucune clé (API, configuration), couleur magique, ou texte utilisateur ne doit être écrit en dur. Tout doit être centralisé (fichiers d'environnement, dictionnaires I18n, ou constantes injectées).

---

## 2. Stack Technique & Design System (Apple Aesthetic) 
* **Framework Core** : **Angular (v17+)** utilisant exclusivement les **Standalone Components**, le pattern **Signals** (`signal`, `computed`, `effect`) et la nouvelle syntaxe du flux de contrôle (`@if`, `@for`, `@switch`).
* **Design System & Tailwind CSS** : Style épuré et premium inspiré d'Apple.
  * *Bords* : `rounded-2xl` (16px) pour les cartes, `rounded-3xl` (24px) pour les conteneurs majeurs.
  * *Effets* : Glassmorphism maîtrisé (`bg-white/70 backdrop-blur-md`).
  * *Ombres* : `shadow-sm` pour l'état normal, `shadow-md` ou `shadow-lg` uniquement lors du survol/focus.
  * *Animations* : Transitions fluides et naturelles (`transition-all duration-300 ease-in-out`).
* **Iconographie & Visuels** : Utilisation exclusive de **Lucide Angular** (`@ng-icons/core` ou wrapper officiel), configuré de manière globale pour éviter les imports redondants.

---

## 3. Architecture des Services & Injection de Dépendances 
* **Pattern `inject()` Mandataire** : Interdiction formelle d'utiliser l'injection par constructeur (`constructor(private x: Service)`). Utiliser exclusivement la fonction `inject(MyService)`.
* **Scope & Encapsulation des Services** :
  * Ne **jamais** utiliser systématiquement `{ providedIn: 'root' }` sur tous les services.
  * Les services d'état local, de gestion de formulaires spécifiques ou de flux de données propres à une fonctionnalité doivent être déclarés dans le tableau `providers: [...]` du composant parent ou de la route concernée.
  * Les services globaux (Authentification, Thème, HTTP Client) restent à la racine mais via une configuration centralisée dans l'application.

---

## 4. Sécurité & Robustesse du Code 
* **Protection XSS & Injection** : Ne jamais contourner le mécanisme de sécurité d'Angular (`DomSanitizer`) sans une revue stricte. Utiliser les liaisons de propriétés standards (`[innerHTML]` à proscrire sauf sanitization explicite).
* **Gestion des Données Sensibles** : Les tokens d'authentification (JWT) et données sensibles ne doivent pas être manipulés directement en clair. Utiliser des services d'encapsulation sécurisés avec expiration et gestion du cycle de vie (ex: HttpInterceptor sécurisé).
* **Contrôle d'Accès Typé** : Toutes les routes doivent être protégées par des **Functional Guards** (`canActivate`) basés sur des Signals d'état d'authentification.
* **Strong Typing Obligatoire** : Le type `any` est strictement **interdit**. Tout type de données provenant d'une API doit posséder son `interface` ou son `type` immuable (`readonly`).

---

## 5. Réutilisabilité, Performance & Automatisation 
* **Séparation Smart/Dumb Components** :
  * *Smart Components* : Gèrent la logique, injectent les services, lisent les Signals d'état.
  * *Dumb (UI) Components* : Pur affichage, reçoivent des données via des signaux d'entrée `input()` (ou `input.required()`) et émettent des événements via `output()`.
* **Performance native** : Stratégie de détection des changements configurée par défaut sur `ChangeDetectionStrategy.OnPush` pour maximiser l'efficacité du tracking des Signals.
* **Lazy Loading systématique** : Toutes les routes majeures de fonctionnalités doivent être chargées via `loadComponent` ou `loadChildren`.

# Navbar TalaPrix — reproduction de référence

Modifier exclusivement le premier `<header>` de
`libs/products/feature-web/src/lib/products-feature-web/products-feature-web.html`
et les imports TypeScript strictement nécessaires. Ne pas modifier le hero ni
les sections suivantes.

La capture `C:/Users/YOGA/Pictures/Screenshots/Capture d'écran 2026-09-06 232715.png`
est la référence de rendu desktop, à reproduire le plus fidèlement possible.

## Géométrie et style desktop

- Barre blanche très légèrement cassée, hauteur 74 px, sans ombre, séparateur
  bas gris très clair. Contenu pleine largeur, avec 32 px de marge latérale.
- Logo carré 48 px, séparateur vertical gris de 44 px juste après, mot-symbole
  `Talaprix` en Lato bold noir à 22 px, puis un espace généreux.
- Recherche centrée et prioritaire : largeur environ 365 px, hauteur 29 px,
  bord 1 px gris clair, rayon pilule. Placeholder Lato 10 px gris. Le bouton
  de recherche turquoise est intégré dans son extrémité droite, largeur 51 px,
  même hauteur, sans ombre, avec icône blanche petite.
- Après la recherche, bloc téléchargement : icône QR noire à gauche, deux
  lignes compactes `Télécharger` / `l'application`, gris foncé, aucune carte.
- Ensuite, petit drapeau RDC créé en CSS (bleu, diagonale rouge bordée jaune),
  puis texte `FR/` et `CDF` avec chevron bas. Ne pas employer une icône avion.
- Panier noir avec badge turquoise `2` placé au-dessus à droite.
- Profil : disque/avatar gris pâle de 39 px, deux lignes `Se connecter` et
  `Profil`, compactes et sans contour de bouton.

## Mobile

Conserver logo + action menu + panier ; faire passer la recherche sous la
première ligne. Les contrôles desktop secondaires sont masqués, sans changer
le reste de la page.

## Contraintes

- Lato doit être réellement chargée dans le stylesheet global.
- Utiliser uniquement Tailwind et `@lucide/angular` (API standalone moderne).
- Aucun `btn`, `badge`, ombre, bordure de carte ou style daisyUI par défaut
  sur les contrôles de cette navbar : chaque contrôle doit être précisément
  stylé avec des utilitaires Tailwind.
- HTML dans le fichier `.html` existant, pas de template inline.

## Ajustement demandé après validation

- Augmenter l’inset desktop gauche : logo et nom ne doivent plus paraître
  collés au bord.
- Allonger la recherche et porter sa hauteur légèrement au-dessus des 29 px,
  tout en gardant son bouton turquoise intégré.
- Déplacer légèrement les groupes téléchargement, langue/devise, panier et
  profil vers l’intérieur ; augmenter leur taille de texte. `Télécharger` et
  `l'application` restent gris foncé et lisibles ; `CDF` est gras.
- Le libellé profil est typographiquement différencié : `Se connecter` gris,
  `Profil` noir et gras.
- Augmenter la hauteur du hero afin que la photographie respire et soit plus
  visible, puis augmenter légèrement la taille du titre principal. Ne pas
  modifier le reste des sections.

# Mascotte (version actuelle pour Parafe : Léa, petite flamme duveteuse)

Référence fournie par l'utilisateur : une petite boule de poils en forme de flamme (corps jaune crème → pêche, pointes de flamme rose/corail, grands yeux noirs brillants très écartés, petit sourire). Si une image de référence plus récente existe dans `references/`, elle PRIME sur cette description.
Historique : rectangle (v1) → triangle → flamme duveteuse (actuelle), à la demande de l'utilisateur.

## Forme et rendu
- Silhouette : goutte arrondie avec une crête de 3 à 4 flammes sur le dessus (la plus haute décalée à droite).
- Corps = **image WebP transparente** (`parafe/assets/lea-body.webp`, ≈ 20 Ko, 384×420), fabriquée une fois avec un SVG filtré (bruit + déplacement pour les bords flous, dégradé radial crème→pêche→corail, dégradé vertical rose en haut) puis capturée avec Playwright (fond transparent) et convertie en WebP (Pillow).
- Yeux, sourire et ombre restent en **SVG vectoriel par-dessus**, pour pouvoir les animer : yeux ellipses `#1B1412` avec 2 reflets blancs, sourire `#2B1A14` en trait arrondi, ombre au sol ellipse claire.
- Pourquoi pas l'effet de poils en direct dans le navigateur : un filtre SVG animé coûte cher sur mobile. On fige le rendu en image.
- Palette chaude de la mascotte = seule exception à la règle « un seul style » : le personnage est le point de couleur sur le fond crème/vert. Ne pas réutiliser ces couleurs ailleurs dans l'interface.
- Limite honnête : c'est un rendu « duveteux » stylisé, pas un rendu 3D photoréaliste. Pour un rendu 3D réel, il faudrait générer une image avec un outil d'image IA (payant) puis découper les yeux séparément.

## États (pas plus de 5)
1. **Repos** : léger « souffle » (échelle 1 → 1,02, 4 s) + clignement des yeux toutes les 4–7 s.
2. **Rebond** : petit saut (≈ 12 px) avec écrasement/étirement, 900 ms, une fois à l'arrivée.
3. **Succès** : rebond (écran « signé »).
4. **Attente** : yeux qui regardent à gauche/droite lentement (non implémenté).
5. **Erreur** : petit mouvement latéral, sobre (non implémenté).

## Où elle apparaît
- Animée : accueil de la vitrine, écran « signé » de la démo.
- Avatar **fixe** (petit) : bouton et panneau de l'assistante Léa.
- Jamais sur : écrans de signature/saisie sensibles, paiement, pages légales.

## Technique
- Animations CSS `@keyframes` (`hop`, `breathe`, `blink`, `shadow-hop`), sans bibliothèque.
- Respecter `prefers-reduced-motion: reduce` : personnage statique.
- Poids total (image + SVG) < 25 Ko. Image chargée avec un chemin relatif (`assets/…` depuis la vitrine, `../assets/…` depuis `app/`).

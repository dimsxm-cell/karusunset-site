# Mascotte (version actuelle pour Parafe : Léa, petite flamme duveteuse aux couleurs du logo)

Référence fournie par l'utilisateur : une petite boule de poils en forme de flamme (forme, bords flous, petit sourire ; les couleurs d'origine jaune/rose ont été remplacées par celles du logo à la demande de l'utilisateur). Si une image de référence plus récente existe dans `references/`, elle PRIME sur cette description.
Historique : rectangle (v1) → triangle → flamme duveteuse (actuelle), à la demande de l'utilisateur.

## Forme et rendu
- Silhouette : goutte arrondie avec une crête de 3 à 4 flammes sur le dessus (la plus haute décalée à droite).
- Corps = **image WebP transparente** (`parafe/assets/lea-body.webp`, ≈ 20 Ko, 384×420), fabriquée une fois avec un SVG filtré (bruit + déplacement pour les bords flous, dégradé du logo + reflet clair) puis capturée avec Playwright (fond transparent) et convertie en WebP (Pillow).
- Yeux, sourire et ombre restent en **SVG vectoriel par-dessus**, pour pouvoir les animer : yeux blancs + pupille `#12172B` + reflet, sourire blanc en trait arrondi, ombre au sol ellipse claire.
- Pourquoi pas l'effet de poils en direct dans le navigateur : un filtre SVG animé coûte cher sur mobile. On fige le rendu en image.
- **Couleurs = celles du logo Parafe** (relevées dans https://parafe.net/assets/logo/parafe-logo.svg) : dégradé indigo `#4F46E5` → violet `#A435D6` (52 %) → corail `#FF7A59`, orienté haut-gauche vers bas-droite, avec un reflet blanc doux en haut à gauche pour le volume.
- Yeux **blancs** avec pupille encre `#12172B` et reflet, sourire **blanc** (lisibles sur le dégradé, comme le « P » blanc du favicon).
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

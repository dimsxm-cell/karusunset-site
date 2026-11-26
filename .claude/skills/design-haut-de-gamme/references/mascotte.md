# Mascotte (version de départ pour Parafe)

Description donnée par l'utilisateur : petit personnage **en triangle** (il était rectangulaire dans la première version, changé à sa demande), **deux yeux**, qui **rebondit**. Contexte business : sobre, pas de blague, quelques animations de temps en temps sur certaines pages. L'utilisateur peut fournir une image de référence : si elle existe dans `references/`, elle PRIME sur cette description.

## Forme
- SVG inline, triangle aux coins arrondis (polygone + contour de même couleur, `stroke-linejoin: round`), pointe en haut, base large.
- Deux yeux ronds simples (pas de bouche, ou un trait minimal). Couleur = accent du style choisi, yeux en blanc/neutre foncé.
- Ombre au sol ellipse, légère, qui s'écrase quand le personnage retombe.

## États (pas plus de 5)
1. **Repos** : léger « souffle » (échelle 1 → 1,02, 3 s) + clignement des yeux toutes les 4–7 s.
2. **Rebond** : petit saut (≈ 12 px) avec écrasement/étirement, 500 ms. Sert à saluer ou à attirer l'œil.
3. **Succès** : rebond + yeux qui se plissent (document signé, envoi réussi).
4. **Attente** : yeux qui regardent à gauche/droite lentement (chargement, en attente de signature).
5. **Erreur** : petit mouvement latéral, sobre (pas de panique).

## Où il apparaît (sobre)
- Accueil (arrivée), état « envoi réussi », état « signature terminée », écrans vides, page 404.
- **Jamais** sur : écrans de signature/saisie, paiement, pages légales.
- Une apparition animée par page maximum.

## Technique
- CSS `@keyframes` ou animation SVG simple, sans bibliothèque.
- Respecter `prefers-reduced-motion: reduce` : personnage statique.
- Déclencher à l'entrée dans le viewport (IntersectionObserver), une seule fois.
- Poids < 10 Ko.

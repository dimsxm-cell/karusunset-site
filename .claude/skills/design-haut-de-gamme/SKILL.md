---
name: design-haut-de-gamme
description: Produit une application ou un site web au design très haut de gamme à partir d'UN seul prompt (ex. "/design-haut-de-gamme Parafe : signature à distance pour commerciaux"). Écrit un mini-PRD, explore de vraies références (Mobbin, One Page Love), propose 3 styles, s'arrête UNE fois pour que l'utilisateur choisisse, puis construit, vérifie sur captures d'écran et livre un lien en ligne. À utiliser quand l'utilisateur veut créer ou refaire une appli/landing/interface "premium", "haut de gamme", "animée", ou nomme Parafe, Soinely, Pasvio ou karusunset.
---

# Design haut de gamme, en un prompt

Origine : workflow de la vidéo « Turn Claude Into A Design Genius With This One Connection » (Wyatt Feaster, 23 nov. 2026). Idée centrale : sans référence réelle, Claude produit du design « IA générique ». Avec des références réelles + UN seul style, le rendu change complètement.

## Règles d'or (non négociables)

1. **Explorer large, exécuter étroit.** On regarde beaucoup de références pour comprendre l'expérience. On construit avec UN SEUL style. Jamais de mélange de 3 esthétiques.
2. **Un seul arrêt** : le choix du style (étape 3). Pas d'autre question à l'utilisateur, sauf blocage réel. Tout le reste, tu décides.
3. **Jamais inventer** : un chiffre, un témoignage, un logo client, une fonctionnalité qui n'existe pas. Si une donnée manque, mets un texte neutre ou demande dans l'arrêt de l'étape 3.
4. **Prouver par captures d'écran** : tu ne dis « terminé » qu'après avoir regardé le rendu réel (mobile + bureau).
5. **Ne pas parler jargon** à l'utilisateur : il est vendeur, novice en code, il veut du concret. Français, tutoiement, court.

## Étapes

### 0. Cadrer (sans question)
Depuis le prompt, déduis : produit, cible, action principale (ex. « envoyer un document et obtenir une signature »), langue (français par défaut), ton (business, sobre, rassurant). Lis le dossier du projet (CLAUDE.md, fichiers existants, `references/`) pour réutiliser logo, couleurs, textes déjà validés.

### 1. Mini-PRD (1 écran max)
Écris `PRD.md` à la racine : problème, cible, 3 parcours clés, liste des pages/écrans, contenu réel disponible, ce qui est hors périmètre. Pas de blabla.

### 2. Explorer des références réelles
- **Web / landing / SaaS** : `mcp__one_page_love__search_inspiration` et `search_sections`.
- **Écrans d'appli et flows** (inscription, envoi, signature, paiement, confirmation) : `mcp__Mobbin__search_flows`, `search_screens`, `search_sections`. (Charge les schémas avec ToolSearch d'abord.)
- Rassemble 8 à 15 références pertinentes. Note pour chacune : ce qui marche (hiérarchie, densité, rythme, micro-interactions) en 1 ligne.
- **Mobbin exige un abonnement payant** (testé : l'appel renvoie « requires a paid plan »). Si c'est le cas, dis-le en une ligne, n'insiste pas, et continue avec One Page Love seul. Ne recommande jamais de payer Mobbin sauf si le projet le justifie.
- Fais plusieurs recherches One Page Love avec des filtres différents (genre, style, couleur) : une seule recherche donne des résultats génériques.
- Si un outil est indisponible, dis-le en une ligne et continue avec l'autre. N'invente jamais une référence.

### 3. Proposer 3 styles, puis S'ARRÊTER (l'unique arrêt)
Propose **3 directions distinctes**, chacune = UN style cohérent :
- Nom court, ambiance en une phrase.
- Police titre + police texte (Google Fonts), 1 couleur d'accent + neutres, rayon des coins, densité.
- 2 références de l'étape 2 qui l'incarnent.
- Comment la mascotte (si demandée) s'y intègre.
Marque ta **recommandation** (une seule) et pourquoi, pour ce public. Utilise AskUserQuestion pour le choix. L'utilisateur peut aussi coller sa propre référence : si oui, c'est elle le style.
**Après sa réponse, plus aucune question.**

### 4. Construire (un seul style)
**Stack par défaut : HTML + CSS + JS simples, sans build**, déployable tel quel sur Vercel. Passe à un framework seulement si le produit exige un vrai backend ; dans ce cas Supabase pour les données. Ne choisis pas une techno compliquée pour impressionner.

Poser d'abord les **tokens** dans `:root` (couleurs, typo, espacements, rayons, ombres, durées d'animation), puis les composants, puis les pages. Tout le style vient des tokens.

#### Barème « haut de gamme »
- **Typographie** : 2 familles max. Échelle claire (ex. 14/16/20/28/40/64). Titres serrés (interlettrage légèrement négatif), texte courant 16–18 px, interligne 1,5. Pas de police système par défaut.
- **Couleur** : 1 accent maîtrisé + neutres bien dosés. Pas de dégradé violet/bleu générique, pas de tout-en-dégradé. Contraste texte conforme (≥ 4,5:1). Mode sombre seulement si utile.
- **Espace** : grille de 8 px, grandes marges, sections qui respirent. Le vide est un signe de qualité.
- **Hiérarchie** : un seul message fort par écran, un seul bouton principal visible.
- **Détails** : ombres douces et cohérentes, bordures fines, états survol/focus/désactivé/chargement/erreur/vide soignés, pas de lorem ipsum, pas d'emoji décoratif.
- **Mouvement** : animations courtes (150–400 ms), courbes douces, entrées au scroll discrètes. Uniquement ce qui aide à comprendre ou rassure. Respecte `prefers-reduced-motion` (animations coupées).
- **Preuve sobre** : section confiance (sécurité, valeur juridique, hébergement) uniquement avec des faits vérifiables fournis par l'utilisateur.
- **Mobile d'abord** : le public est sur téléphone, souvent en déplacement. Boutons ≥ 44 px, pas de défilement horizontal.
- **Accessibilité** : navigation clavier, `alt`, labels de formulaire, structure de titres propre.
- **Performance** : images compressées (WebP/AVIF), polices limitées, pas de bibliothèque lourde sans raison.

#### Mascotte (si demandée)
Voir `references/mascotte.md` : personnage rectangulaire à deux yeux, sobre, qui apparaît de temps en temps sur certaines pages. Jamais sur les écrans de saisie sensibles.

### 4 bis. Mode application (plusieurs écrans)
Si l'utilisateur veut « une petite appli / un SaaS / une web app » (comme une planche Figma de flow avec écrans numérotés), ne fais PAS une page vitrine : construis une **maquette interactive cliquable**.

1. **Carte du flow d'abord** (dans le PRD) : numérote les écrans (E1, E2…), 6 à 9 écrans, un parcours principal bout en bout. Modèle : liste → créer (2-3 étapes) → envoyer/partager → suivi → vue du client → succès (notification qui met la liste à jour).
2. **Une seule appli, plusieurs écrans** : `app/index.html` + `app.css` + `app.js`, routage par `#/écran`, sans build. Réutilise les variables et boutons du CSS de la vitrine (`../style.css`).
3. **Données d'exemple, étiquetées** : bandeau « Maquette interactive, rien n'est réellement envoyé ». Noms du type « Client exemple A », e-mails en `example.com`. Les boutons qui ne font rien de réel le disent dans un message (« Démo : … n'est pas actif »). Jamais de faux témoignage ni de faux chiffre.
4. **État partagé entre écrans** (sessionStorage dans try/catch) : ce que l'utilisateur crée à l'écran 2 apparaît dans la liste, signer à l'écran 6 passe le statut à « Signé ».
5. **Sécurité de base** : tout texte saisi par l'utilisateur qui est réaffiché passe par une fonction d'échappement HTML. Teste-le avec `<b>Test</b>`.
6. **Navigation** : barre latérale sur bureau, barre d'onglets en bas sur mobile ; `aria-current`, focus sur le titre à chaque changement d'écran, feuille de partage fermable à Échap, `aria-live` pour les messages.
7. **Interactions réelles quand c'est possible** : par ex. un vrai cadre de signature au doigt (canvas, événements pointeur) plutôt qu'une image.
8. **Mascotte** : uniquement sur l'écran de succès (et l'accueil de la vitrine).
9. Relie la vitrine à la démo (bouton « Essayer la démo »).

### 5. Vérifier (obligatoire)
En mode application, teste le **parcours complet avec Playwright** (clics, formulaire vide puis rempli, dessin sur le canvas, retour à la liste) et vérifie : zéro erreur JS, zéro débordement horizontal, statut mis à jour, saisie échappée.
Avec Playwright (déjà installé, ne pas le réinstaller) :
- Capture chaque page en 390 px (mobile) et 1440 px (bureau).
- Regarde les images. Corrige : débordements, contrastes faibles, texte coupé, espacements incohérents, animation qui gêne.
- Contrôle : un seul style respecté, aucun élément générique de gabarit, aucune donnée inventée.
- Liste ce que tu as corrigé.

### 6. Livrer
- Déploie avec le skill `vercel:deploy` (aperçu par défaut) si l'utilisateur a un compte Vercel connecté ; sinon donne les fichiers et la commande pour ouvrir en local.
- Commit sur la branche de travail demandée par la session. Pas de PR sans demande.
- Réponse finale : lien, 3 captures, ce qui reste à fournir (vraies photos, textes, logo), une seule prochaine étape recommandée.

## Ce que tu NE fais PAS
- Pas 15 références mélangées dans le rendu final.
- Pas de questions en cascade.
- Pas de promesse « conforme eIDAS / valeur légale » ou autre claim juridique sans source fournie par l'utilisateur.
- Pas de génération d'images « réalistes » de personnes : demande de vraies photos, sinon initiales/illustration sobre.

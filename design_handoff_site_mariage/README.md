# Handoff : site de mariage Grace & Ouss

## Vue d'ensemble
Site d'invitation one-page pour le mariage de Grace et Ouss :
- **Mariage civil** : samedi 27 mars 2027, 14h00, Mairie de Pantin (84-88 avenue du Général Leclerc, 93500 Pantin).
- **Cérémonie et soirée** : samedi 1er mai 2027, Château de Cabezac (23 Hameau de Cabezac, 11120 Bize-Minervois). Cérémonie 16h30, vin d'honneur 18h00 (à confirmer), dîner et soirée 20h00.

Les invités y trouvent le programme, les lieux et l'itinéraire, le dress code, un formulaire RSVP, un livre d'or, la participation (cagnotte) et une FAQ.

## À propos des fichiers
Les fichiers de `design/` sont des **références de design en HTML** : des prototypes qui montrent le rendu et le comportement attendus, pas du code de production à copier. Il faut **recréer ce design** dans la stack choisie. Sans contrainte existante, on recommande un site statique (Astro ou Next.js en export statique) avec un petit backend pour le RSVP et le livre d'or (Supabase, Firebase ou une Google Sheet via API).

Pour visualiser la référence : ouvrir `design/Grace et Ouss v4.dc.html` dans un navigateur (il charge `support.js` et `img/` à côté de lui).

## Fidélité
**Haute fidélité.** Couleurs, typographie, espacements et interactions sont définitifs. À reproduire au pixel près.

## Structure de la page (de haut en bas)

Conteneur de contenu : `max-width: 1180px`, centré, padding horizontal `clamp(18px, 5vw, 26px)`. Padding vertical des sections : `clamp(60px, 10vw, 110px)`. Les sections sont séparées par un filet `1px solid rgba(242,230,220,.14)`.

1. **Header fixe** : fond `rgba(46,29,21,.72)` + `backdrop-filter: blur(14px)`, filet bas. Logo texte « G & O » (14px, 600, letter-spacing .28em). Nav ≥ 860px : Le jour J, Le lieu, Tenue, Livre d'or, Infos + bouton contour « Répondre ». < 860px : bouton « Répondre » + burger 46×46 qui ouvre un panneau déroulant (liens 17px, cibles de 46px minimum, fermeture au clic sur un lien).
2. **Hero** (`#home`) : `min-height: 100svh`, photo `hero-etreinte.jpg` en `object-fit: cover`, `object-position: 52% 28%`. Dégradé `linear-gradient(180deg, rgba(46,29,21,.62) 0%, rgba(46,29,21,.18) 34%, rgba(46,29,21,.86) 82%, #2E1D15 100%)`. Contenu en bas à gauche : surtitre en capitales, H1 « Grace & Ouss » (`clamp(52px,10vw,112px)`, 600, « & » en 300 et #CFA184), filet de 64px, paragraphe 20/28, 2 CTA. Animation d'entrée fadeUp (opacité et translateY 14px → 0, 1,1s ease).
3. **Compte à rebours** : 4 colonnes (jours, heures, minutes, secondes), chiffres `clamp(30px,7vw,40px)` en 300. Cible : **27 mars 2027 à 14h00, Europe/Paris** (mairie). Rafraîchi chaque seconde.
4. **L'invitation** : texte centré, citation `clamp(24px,3.2vw,32px)` 300, max 24ch. *Texte à fournir par les mariés.*
5. **Programme** (`#jour`) : **lignes empilées, une par moment** (demande explicite des mariés, pas de colonnes côte à côte). Deux groupes datés :
   - En-tête de groupe : date (20px, 600) à gauche, lieu en capitales #CFA184 à droite.
   - Ligne : filet haut, padding 26px 0, grille `repeat(auto-fit, minmax(min(100%,200px), 1fr))` : heure (`clamp(40px,6vw,56px)`, 300, #CFA184), titre (22/30), description (16/24, 78 % d'opacité). La dernière ligne du groupe a aussi un filet bas.
6. **Lieux** (`#lieu`) :
   - Château : grille 2 colonnes (photo 4/5 `etreinte.jpg` en `object-position: 50% 92%`, cadrée sur les mains et la bague, tons bruns accordés au fond), puis label, **picto château** SVG 88px (trait #CFA184 2,4px, remplissage #2E1D15), H2, sous-titre « Cérémonie & soirée · 1er mai 2027 », description, adresse et accueil, panneau « Y aller » (Google Maps, Waze, Plans), repères pratiques.
   - Mairie de Pantin : séparée par un filet, 2 colonnes : infos (adresse, rendez-vous, transports) et panneau « Y aller » avec ses 3 liens.
   - Panneau « Y aller » : bordure 1px `rgba(242,230,220,.18)`, lignes de 18px × 22px, icône 18px, libellé, flèche →, survol `rgba(207,161,132,.1)`.
7. **Tenue** (`#tenue`) : texte, encadré « Ni blanc, ni noir. » (bordure 1px #CFA184), palette 3×3 de pastilles carrées séparées par des filets de 1px, codes hex en légende.
8. **RSVP** (`#rsvp`) : **fond clair #F2E6DC**, texte #2E1D15, max 760px. Champs avec soulignement seul (pas de boîte). Voir « Formulaires » plus bas.
9. **Livre d'or** (`#mots`) : formulaire (nom et message) à gauche, liste de messages à droite (cartes à bordure 1px, guillemet « " » #CFA184, texte 18/28 en 300, nom en capitales).
10. **Participation** (`#participation`) : texte centré, bouton « Cagnotte en ligne ». *Le texte sera revu par les mariés, lien de cagnotte à fournir.*
11. **Infos** (`#infos`) : accordéon `<details>` (Où dormir, Comment venir, Les enfants), flèche qui tourne de 90° à l'ouverture.
12. **Footer** : noms en grand, filet, dates et villes, crédit photo « Diana Le Photography ».

## Formulaires et comportements

### RSVP
Champs : prénom et nom, e-mail, réponse (« Avec joie » / « Empêché(e) »), accompagnant(e), allergies ou mot libre.
- **Accompagnant : une seule personne en plus maximum par invité** (exigence des mariés). Deux boutons à bascule : « Je viens seul(e) » / « Avec un(e) accompagnant(e) ». Si le second est choisi, afficher le champ « Nom de votre accompagnant(e) ». Total possible : 1 ou 2 personnes.
- Boutons à bascule : état actif fond #2E1D15 et texte #F2E6DC, état inactif contour `rgba(46,29,21,.3)`.
- À l'envoi, remplacer le formulaire par « Merci. » et un message de confirmation.
- À implémenter : validation (nom, e-mail valide et réponse obligatoires ; nom de l'accompagnant obligatoire si l'option est choisie), stockage côté serveur, protection anti-spam (honeypot), idéalement un e-mail de confirmation.
- Date limite affichée : « avant le 15 février 2027 », **à confirmer par les mariés**.
- Point ouvert : faut-il distinguer la présence à la mairie et au château ? Non prévu pour l'instant.

### Livre d'or
- Ajout en direct en haut de la liste (nom facultatif, « Un invité » par défaut ; message obligatoire).
- Les 3 messages d'exemple sont à supprimer en production.
- À implémenter : persistance, modération (validation des messages par les mariés avant publication recommandée).

### Responsive
- Breakpoint de la nav : 860px.
- Toutes les grilles : `repeat(auto-fit, minmax(min(100%, Npx), 1fr))`, pour éviter tout débordement horizontal jusqu'à 320px.
- Fond soie : `background-attachment: fixed` sur desktop, `scroll` sous 820px (iOS).
- Hero en `100svh`.

## Design tokens

### Couleurs
| Rôle | Hex |
|---|---|
| Fond brun profond | `#2E1D15` |
| Voile sur la soie | `rgba(28,16,10,.62)` |
| Ivoire (texte sur fond sombre, fond RSVP) | `#F2E6DC` |
| Accent taupe rosé | `#CFA184` |
| Cuivre (labels sur fond clair) | `#8E5A3C` |
| Texte secondaire sombre | `rgba(242,230,220,.78)` |
| Filets sombres | `rgba(242,230,220,.14–.22)` |
| Filets clairs | `rgba(46,29,21,.2–.3)` |

Palette du dress code (affichage uniquement) : `#FF98AE #FDCC60 #BAC563 #FF9A3D #C0CFE0 #FFA090 #DE3466 #72892C #F2AF5F`.

### Typographie
Famille : `"Segoe UI Variable Text", "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif` (échelle Fluent 2). Graisses : 300, 400, 600.
- Display : `clamp(52px,10vw,112px)` / 1 / 600 / -0,03em
- H2 : `clamp(32px,4.4vw,56px)` ou `clamp(36px,5vw,68px)` / 1,06–1,08 / 300 / -0,025em
- Heure du programme : `clamp(40px,6vw,56px)` / 1 / 300
- Sous-titre : 20/28
- Corps : 16/24
- Caption et labels : 12/16, capitales, letter-spacing .24–.34em

Note : Segoe UI n'est pas une webfont libre. Sur macOS/iOS le rendu bascule sur San Francisco. Pour un rendu identique partout, la remplacer par une grotesque proche sous licence web (par exemple « Selawik », le fallback open source de Microsoft).

### Formes
Rayon 2px sur les boutons. Aucune ombre. Les séparations se font uniquement avec des filets de 1px.

## Assets
- `img/hero-etreinte.jpg` : photo du hero (Diana Le Photography).
- `img/etreinte.jpg` : photo de la section château, recadrée sur les mains.
- `img/soie.jpg` : texture de fond en soie brune, 2728×1644, agrandie depuis une capture. **Demander l'original en haute résolution** pour la production.
- Picto château et icônes d'itinéraire : SVG en ligne dans le HTML.
- Crédit photo obligatoire : « Diana Le Photography ».

## Contenus en attente
- Texte d'invitation
- Horaire du vin d'honneur
- Date limite du RSVP
- Règle sur les enfants
- Texte de la participation et lien de la cagnotte
- Liste d'hébergements
- Stationnement au château

## Fichiers
- `design/Grace et Ouss v4.dc.html` : référence complète (template et logique dans le même fichier).
- `design/support.js` : runtime de prévisualisation (inutile en production).
- `design/img/` : images.
- `grace-et-ouss-site-v4.html` : même design en un seul fichier autonome, à ouvrir hors ligne.

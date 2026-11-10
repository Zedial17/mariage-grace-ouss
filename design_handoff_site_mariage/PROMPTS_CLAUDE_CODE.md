# Prompts pour Claude Code

Avant de commencer : dézippez `design_handoff_site_mariage/` à la racine d'un dossier vide, puis lancez Claude Code dans ce dossier.

## 1. Construire le site
```
Lis design_handoff_site_mariage/README.md en entier, puis ouvre design_handoff_site_mariage/design/Grace et Ouss v4.dc.html, qui sert de référence visuelle.

Recrée ce site à l'identique avec Astro et Tailwind : une seule page, en français, sans framework JS côté client sauf pour les îlots interactifs.

Règles :
- Respecte au pixel près les couleurs, la typographie (échelle Fluent 2, Segoe UI Variable avec Selawik en fallback), les espacements en clamp(), les filets de 1px et le rayon de 2px décrits dans le README.
- Copie les images de design/img/ dans public/img/ et sers-les en AVIF/WebP avec <Image> d'Astro.
- Le programme est en lignes empilées (une ligne par horaire), groupées par date : 27 mars à la mairie de Pantin, 1er mai au Château de Cabezac.
- Pas de galerie photo.
- Compte à rebours vers le 2027-03-27T14:00 (Europe/Paris).
- Header avec nav complète à partir de 860px, burger en dessous.
- Toutes les grilles en repeat(auto-fit, minmax(min(100%, Npx), 1fr)) : aucun débordement horizontal à 320px.
- Le picto château et les icônes d'itinéraire sont des composants SVG repris tels quels du HTML de référence.

Découpe en composants : Header, Hero, Countdown, Invitation, Programme, Lieux (Château + Mairie), ItineraryPanel, DressCode, RsvpForm, Guestbook, Participation, Faq, Footer.
Mets tous les textes et données (dates, adresses, liens) dans src/content/site.ts pour qu'ils soient modifiables sans toucher au code.
```

## 2. Brancher le RSVP et le livre d'or
```
Branche RsvpForm et Guestbook sur Supabase.

RSVP :
- Table rsvp : id, created_at, nom, email, reponse ('oui'|'non'), accompagnant (bool), nom_accompagnant, message.
- Validation côté client et côté serveur : nom, e-mail valide et réponse obligatoires ; nom_accompagnant obligatoire si accompagnant = true.
- Une seule personne supplémentaire maximum, sans exception.
- Champ honeypot anti-spam.
- Après l'envoi, affiche l'état « Merci. » exactement comme dans la référence.

Livre d'or :
- Table messages : id, created_at, nom, texte, approuve (bool, false par défaut).
- N'afficher que les messages approuvés. Après l'envoi, afficher le message localement avec la mention « en attente de validation ».
- Supprime les 3 messages d'exemple.

Crée une page /admin protégée par mot de passe (variable d'environnement) qui :
- liste les RSVP avec le total des personnes et un export CSV ;
- permet d'approuver ou de supprimer les messages du livre d'or.

Mets les clés dans .env.example et documente la mise en place dans le README.
```

## 3. Contrôle qualité
```
Vérifie le site à 320, 375, 768, 1024 et 1440px avec Playwright, puis compare chaque capture à la référence HTML.
Corrige tout écart de layout, tout débordement horizontal et toute cible tactile de moins de 44px.
Vise un score Lighthouse mobile d'au moins 95 sur chaque critère.
Le contraste du texte doit atteindre au moins 4,5:1, sauf pour les titres.
Le fond soie doit être en attachment fixed sur desktop et en scroll sous 820px.
```

## 4. Mise en ligne
```
Prépare le déploiement sur Vercel (ou Netlify) :
- balises meta et Open Graph (titre « Grace & Ouss · 27 mars & 1er mai 2027 », image : la photo du hero recadrée en 1200×630) ;
- favicon « G&O » sur fond #2E1D15 ;
- robots en noindex (site privé) ;
- page 404 dans la même direction artistique.
```

## Contenus à donner à Claude Code dès que vous les avez
```
Mets à jour src/content/site.ts avec :
- texte d'invitation : …
- horaire du vin d'honneur : …
- date limite du RSVP : …
- règle sur les enfants : …
- texte de la participation : …
- lien de la cagnotte : …
- hébergements : …
- stationnement au château : …
```

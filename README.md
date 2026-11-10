# Grace & Ouss — site de mariage

Site d'invitation one-page, en français, construit avec **Astro 7** et
**Tailwind CSS 4**. Recréation à l'identique du handoff `design_handoff_site_mariage/`.

**Aucun serveur, aucune base de données** : le site est un paquet de fichiers
statiques hébergé sur GitHub Pages, et les réponses des invités partent
directement dans un **Google Sheet partagé** — même fonctionnement que le site
Emma.

- **Mariage civil** — samedi 27 mars 2027, 14h00, Mairie de Pantin
- **Cérémonie & soirée** — samedi 1er mai 2027, Château de Cabezac

## Démarrer

Le projet demande **Node 22.23.4 ou plus** (voir `.nvmrc`).

```bash
nvm use
```

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run dev
```

| Commande          | Effet                                         |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Serveur de développement sur `localhost:4321` |
| `npm run build`   | Compile le site statique dans `dist/`         |
| `npm run preview` | Prévisualise le build                         |
| `npm run check`   | Vérification des types                        |

Sans `.env`, le site se construit et s'affiche normalement ; seuls les envois
répondent « Les réponses ne sont pas encore collectées ».

## Le Google Sheet

Tout vit dans **un seul classeur**, que vous partagez avec la mariée. Le site y
écrit et y lit à travers un petit script Apps Script attaché au classeur.

### 1. Créer le classeur

Nouveau Google Sheet → **Partage → inviter la mariée en Éditeur**.

### 2. Installer le script

**Extensions → Apps Script**. Remplacez le contenu de `Code.gs` par celui de
[`google-apps-script/Code.gs`](google-apps-script/Code.gs), puis renseignez :

| Constante  | Valeur                                                                           |
| ---------- | -------------------------------------------------------------------------------- |
| `JETON`    | Une longue chaîne au hasard. Elle protège les actions sensibles (voir plus bas). |
| `NOTIFIER` | L'adresse prévenue à chaque réponse. `''` pour désactiver.                       |

Enregistrez, puis exécutez une fois **`initialiser`** et acceptez l'autorisation.
Deux onglets apparaissent.

### 3. Déployer en application web

**Déployer → Nouveau déploiement → Application web**, *Exécuter en tant que :
moi*, *Qui a accès : tout le monde*. Copiez l'URL qui se termine par `/exec`.

### 4. Renseigner la variable

Dans `.env` : `PUBLIC_SHEETS_ENDPOINT` = l'URL `/exec`.

Pour le déploiement, la même valeur va dans **GitHub → Settings → Secrets and
variables → Actions → New repository secret**, sous le nom
`PUBLIC_SHEETS_ENDPOINT`.

### Ce que « sans serveur » implique

Le site appelle le script depuis le navigateur. **L'URL du script est donc
visible dans le code source de la page** — c'est inévitable, et c'est aussi le
cas sur le site Emma.

Le script s'en protège lui-même. Il n'accepte sans jeton que ce qu'un invité a
le droit de faire :

| Action libre                  | Ce qu'elle permet                                   |
| ----------------------------- | ---------------------------------------------------- |
| `rsvp`, `message`, `virement` | déposer une réponse, un mot, une demande de RIB      |
| `messages`, `convives`        | lire ce qui est **déjà publié**, et la carte agrégée |

Tout le reste — lire les réponses nominatives, approuver, supprimer — exige le
`JETON`, qui ne quitte jamais le script. Le script revalide par ailleurs chaque
envoi (réponse, e-mail, nom de l'accompagnant) avant d'écrire quoi que ce soit.

Ce qu'un inconnu qui trouve l'URL peut faire : ajouter de fausses réponses ou de
faux mots, qui n'apparaîtront pas sans votre validation. Ce qu'il ne peut pas
faire : lire la liste des invités, ni effacer une ligne.

## Administrer : dans le classeur

Il n'y a **pas de page `/admin`** — sans serveur, un mot de passe dans la page
ne protégerait rien. Le classeur fait le travail, et vous y êtes déjà.

### Onglet « RSVP »

| Horodatage | Nom | E-mail | Réponse | Accompagnant | Nom accompagnant | Ville | Pays | Latitude | Longitude | Message | Personnes | ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

- **Personnes** vaut 0, 1 ou 2 : un `=SOMME()` en bas de colonne donne le nombre
  d'assiettes. Attention, il additionne tout : si un invité répond deux fois,
  pensez à supprimer l'ancienne ligne.
- **Ville, Pays, Latitude, Longitude** se remplissent seules : le script géocode
  la ville à l'enregistrement, via le service Maps d'Apps Script (gratuit, sans
  clé API). Une ville non reconnue n'empêche rien.
- **Export CSV** : Fichier → Télécharger → Valeurs séparées par des virgules.

### Onglet « Livre d'or »

| Horodatage | Nom | Message | Publié | ID |
| ---------- | --- | ------- | ------ | -- |

**Publié** est une case à cocher. **La cocher publie le message sur le site**,
la décocher le retire. Rien ne paraît sans cette validation.

> Ne renommez pas les colonnes et ne supprimez pas `ID`. Si les en-têtes sont
> abîmés, le script les réécrit à la prochaine réponse, sans toucher aux données.

## Mise en ligne — GitHub Pages

Comme le site Emma, à ceci près qu'Astro doit compiler : le dépôt contient donc
un workflow qui s'en charge.

1. **Settings → Pages → Source = GitHub Actions.**
2. **Settings → Secrets and variables → Actions** : ajoutez
   `PUBLIC_SHEETS_ENDPOINT`.
3. Poussez sur `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   compile et publie.

L'adresse sera `https://zedial17.github.io/mariage-grace-ouss/`.

> **Le dépôt doit être public** pour que GitHub Pages fonctionne sur un compte
> gratuit — c'est le cas du dépôt d'Emma. Aucun secret n'y figure : `.env` est
> exclu, et l'URL du script serait de toute façon visible dans la page.

Le chemin de base (`/mariage-grace-ouss/`) vient de `BASE_PATH`. Le jour où vous
branchez un vrai nom de domaine, videz `BASE_PATH` et mettez `SITE_URL` à
l'adresse finale.

## Les sections interactives

Trois sections reprennent les mécaniques du site Emma, transposées dans la
palette et la typographie de Grace & Ouss.

### « Serez-vous des nôtres ? » — en trois temps

Trois étapes (Vous · Présence · Détails) avec un fil numéroté. Chaque étape ne
laisse passer que si ses champs sont valides ; une erreur détectée à l'envoi
ramène à l'étape concernée. La ville de départ y est demandée : c'est elle qui
alimente la carte.

### « Participation » — le coffret

Un coffret au trait s'ouvre sur deux façons de contribuer :

- **PayPal** — `paypal.me/GraceONGALLA`, copie en un clic et lien direct.
- **Virement bancaire** — le RIB **ne figure pas sur le site**. L'invité laisse
  un moyen de le joindre, et vous recevez un e-mail. Rien n'est écrit dans le
  classeur.

### « D'où vous venez » — la carte des convives

Chaque invité indique sa ville, le script la géocode, et la carte se remplit.
Des traits convergent vers le losange de Cabezac ; chaque point grossit avec le
nombre de convives.

**Aucun nom n'y figure** : l'action `convives` ne renvoie que des villes, des
pays et des nombres. Seules les réponses positives, géocodées et non remplacées
sont comptées.

Le tracé du monde est **pré-calculé** dans `src/content/monde.ts` : la géométrie
Natural Earth a été projetée hors ligne, et `projeter()` reproduit
`geoNaturalEarth1()` de d3 à 0 px près. Ni d3 ni topojson ne partent en
production.

### « Les mots du cœur » — le rail

Les messages défilent dans un rail à accrochage, en CSS pur. Les flèches ne
s'activent que si le rail déborde.

### Le couple dans l'en-tête

Une fois le hero passé, le logo « G & O » laisse la place au couple animé. Le
fichier n'est téléchargé qu'à ce moment, et jamais si le visiteur a demandé
moins d'animations. WebP animé sans perte (55 ko), GIF en repli.

> Le site Emma obtient des effets comparables avec d3, topojson, GSAP et
> ScrollTrigger — environ 250 ko de JavaScript. Ici **tout le JavaScript du site
> pèse 6,7 ko compressés**, carte comprise.

## Structure

```
src/
  content/site.ts        tous les textes et données
  content/monde.ts       tracé du monde pré-calculé + projection
  styles/global.css      jetons de design (@theme Tailwind) + base
  lib/
    classeur.ts          appels au Google Sheet depuis le navigateur
    validation.ts        règles de saisie (mêmes que celles du script)
  pages/
    index.astro          la page
    404.astro            page introuvable
  layouts/Base.astro     document HTML, métadonnées, Open Graph
  components/            Header, Hero, Countdown, Invitation, Programme,
                         Lieux, ItineraryPanel, Repere, DressCode, RsvpForm,
                         Convives, Guestbook, Participation, Faq, Footer
  assets/img/            photos, texture de soie, couple animé
public/
  og.jpg                 aperçu de partage 1200×630
  favicon.svg            icône « G&O »
  apple-touch-icon.png   écran d'accueil iOS
  robots.txt             interdit l'indexation
google-apps-script/Code.gs   à coller dans le classeur
.github/workflows/deploy.yml compile et publie sur GitHub Pages
```

## Choix techniques

- **Tout statique.** Deux pages compilées, aucune fonction serveur. C'est ce qui
  permet GitHub Pages.
- **Les réponses sont lisibles.** Le site Emma poste en `mode: 'no-cors'` et ne
  peut donc pas savoir si l'enregistrement a réussi — l'écran « merci »
  s'affiche même en cas d'échec. Ici le `POST` part en `text/plain`, ce qui en
  fait une requête simple au sens CORS : pas de pré-vol, et la réponse reste
  lisible. « Merci. » ne s'affiche que si la ligne est vraiment écrite.
- **Validation à deux endroits.** `src/lib/validation.ts` dans le navigateur, et
  les mêmes contrôles dans le script avant écriture.
- **Une personne supplémentaire maximum.** Le classeur n'a qu'une colonne
  « Nom accompagnant », obligatoire si la case est cochée et vide sinon.
- **Anti-spam.** Un champ `site_web` invisible et hors tabulation ; s'il est
  rempli, rien n'est envoyé.
- **Jetons de design.** Couleurs, échelle Fluent 2, espacements en `clamp()` et
  rayon de 2px déclarés dans `@theme` (`src/styles/global.css`).
- **Typographie.** `Segoe UI Variable` puis `Selawik` puis la police système.
  Pour activer Selawik, déposer les `.woff2` dans `public/fonts/` et décommenter
  le bloc `@font-face` de `global.css`.
- **Images.** Hero et château en AVIF/WebP via `<Picture>` d'Astro ; la soie de
  fond en `image-set()`, empreintée donc en cache d'un an.

## Modifier les textes

**Tout le contenu est dans [`src/content/site.ts`](src/content/site.ts)** :
dates, adresses, horaires, liens d'itinéraire, textes, palette, FAQ, messages
d'erreur. Rien à toucher dans les composants.

Éléments encore marqués `À CONFIRMER` : texte d'invitation, horaire du vin
d'honneur, date limite du RSVP, règle sur les enfants, texte de la participation,
hébergements, stationnement au château.

## Contrôle qualité

Mesuré avec Playwright (Chrome) sur le build, à **320, 375, 768, 1024 et
1440px**, en comparant chaque largeur à la référence du handoff.

- **Fidélité** : mêmes positions et mêmes hauteurs de section que la référence,
  aux 5 largeurs. Aucun débordement horizontal. Les seuls écarts sont voulus :
  les messages d'exemple supprimés et la mention « formulaire de démonstration »
  retirée.
- **Cibles tactiles** : 44px minimum partout.
- **Contraste** : tous les textes au-dessus de 4,5:1.
- **Fond soie** : `fixed` au-dessus de 820px, `scroll` en dessous.
- **Lighthouse mobile** : performance 99, accessibilité 100, bonnes pratiques
  100. Le SEO plafonne à 69 à cause du `noindex` voulu — c'est le seul audit en
  échec.

## Crédits

Photographies : **Diana Le Photography**.

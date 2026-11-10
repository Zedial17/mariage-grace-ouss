# Grace & Ouss — site de mariage

Site d'invitation one-page, en français, construit avec **Astro 7** et **Tailwind CSS 4**.
Recréation à l'identique du handoff `design_handoff_site_mariage/`.
RSVP et livre d'or sont enregistrés dans un **Google Sheet partagé**.

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

| Commande        | Effet                                        |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Serveur de développement sur `localhost:4321` |
| `npm run build` | Compile le site dans `dist/` + `.vercel/`     |
| `npm run check` | Vérification des types                        |

Sans `.env`, le site se construit et s'affiche normalement ; seuls les envois
répondent « Les réponses ne sont pas encore collectées » et /admin reste fermée.

## Google Sheets — mise en place

Tout vit dans **un seul classeur**, que vous partagez avec la mariée. Le site y
écrit et y lit à travers un petit script Apps Script attaché au classeur.

### 1. Créer le classeur

Nouveau Google Sheet → nommez-le par exemple « Mariage Grace & Ouss ».
**Partage → inviter la mariée en Éditeur.**

### 2. Installer le script

Dans le classeur : **Extensions → Apps Script**. Supprimez le contenu de
`Code.gs` et collez celui de [`google-apps-script/Code.gs`](google-apps-script/Code.gs).

En haut du fichier, remplissez deux constantes :

| Constante  | Valeur                                                             |
| ---------- | ------------------------------------------------------------------ |
| `JETON`    | Une longue chaîne au hasard, inventée par vous. Elle protège le classeur. |
| `NOTIFIER` | Une adresse e-mail prévenue à chaque réponse. Laissez `''` pour désactiver. |

Enregistrez, puis exécutez une fois la fonction **`initialiser`** (menu
déroulant des fonctions → `initialiser` → ▶). Google demandera une
autorisation : acceptez. Deux onglets apparaissent dans le classeur.

### 3. Déployer en application web

**Déployer → Nouveau déploiement → Application web**

| Champ                 | Valeur         |
| --------------------- | -------------- |
| Exécuter en tant que  | Moi            |
| Qui a accès           | Tout le monde  |

Copiez l'URL qui se termine par `/exec`.

> « Tout le monde » est obligatoire pour que le site puisse écrire sans compte
> Google. C'est le `JETON` qui protège réellement le classeur : sans lui, le
> script refuse tout. Et comme le site n'appelle jamais ce script depuis le
> navigateur, l'URL n'apparaît nulle part dans la page.

### 4. Renseigner les trois variables

Copiez `.env.example` en `.env` :

| Variable          | Valeur                                                       |
| ----------------- | ------------------------------------------------------------- |
| `SHEETS_ENDPOINT` | L'URL `/exec` copiée à l'étape 3                               |
| `SHEETS_TOKEN`    | **Exactement** la même chaîne que `JETON` dans le script       |
| `ADMIN_PASSWORD`  | À choisir : le mot de passe de la page `/admin`                |

À la mise en ligne, reportez ces trois variables dans Vercel
(**Settings → Environment Variables**), en *Production* **et** *Preview*.

### 5. Mettre le script à jour plus tard

Après toute modification de `Code.gs` : **Déployer → Gérer les déploiements →
crayon → Version « Nouvelle version » → Déployer**. L'URL ne change pas.

## Ce qu'il y a dans le classeur

### Onglet « RSVP »

| Horodatage | Nom | E-mail | Réponse | Accompagnant | Nom accompagnant | Ville | Pays | Latitude | Longitude | Message | Personnes | ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

La colonne **Personnes** vaut 0, 1 ou 2 : un `=SOMME()` en bas de colonne donne
directement le nombre d'assiettes.

**Ville, Pays, Latitude et Longitude** sont remplies toutes seules : l'invité
saisit sa ville, le script la géocode au moment de l'enregistrement, via le
service Maps intégré à Apps Script (gratuit, sans clé API). C'est ce qui
alimentera la carte des invités. Une ville non reconnue n'empêche rien : la
réponse est enregistrée sans coordonnées.

### Onglet « Livre d'or »

| Horodatage | Nom | Message | Publié | ID |
| ---------- | --- | ------- | ------ | -- |

**Publié** est une vraie case à cocher. **Cocher la case dans le classeur
publie le message sur le site** — c'est équivalent au bouton « Approuver » de
/admin. La mariée peut donc modérer sans jamais ouvrir la page d'administration.

> Ne renommez pas les colonnes et ne supprimez pas la colonne `ID` : le script
> s'en sert pour retrouver les lignes. Si les en-têtes sont abîmés, le script
> les réécrit tout seul à la prochaine réponse, sans toucher aux données.

## Les sections interactives

Trois sections reprennent les mécaniques du site Emma, transposées dans la
palette et la typographie de Grace & Ouss.

### « Serez-vous des nôtres ? » — en trois temps

Le formulaire est découpé en trois étapes (Vous · Présence · Détails) avec un
fil d'étapes numéroté. Chaque étape ne laisse passer que si ses champs sont
valides ; une erreur détectée à l'envoi ramène à l'étape concernée. L'état de
l'étape 1 est rendu par le serveur, donc aucun clignotement au chargement.

La ville de départ y est demandée (facultative) : c'est elle qui alimentera la
carte des invités.

### « Participation » — le coffret

Un coffret au trait, dans la même famille que le picto château, s'ouvre sur
deux façons de contribuer :

- **PayPal** — `paypal.me/GraceONGALLA`, avec copie en un clic et lien direct.
- **Virement bancaire** — le RIB **ne figure pas sur le site**. L'invité laisse
  son nom et un moyen de le joindre, et les mariés reçoivent un e-mail
  (`/api/virement` → Apps Script → Gmail). Rien n'est écrit dans le classeur.

### « D'où vous venez » — la carte des convives

Chaque invité indique sa ville en répondant ; le script la géocode, et la
carte se remplit toute seule. Des traits convergent vers le losange de
Cabezac, chaque point grossit avec le nombre de convives, et trois compteurs
annoncent les totaux.

**Aucun nom n'y figure.** `/api/convives` ne renvoie que des villes, des pays
et des nombres — jamais de nom, d'e-mail ni de message. Seules les réponses
positives encore valables et géocodées sont comptées, et deux réponses d'une
même ville sont regroupées sans tenir compte de la casse ni des accents.

Le tracé du monde est **pré-calculé** dans `src/content/monde.ts` : la
géométrie Natural Earth a été projetée hors ligne, et la fonction `projeter()`
reproduit `geoNaturalEarth1()` de d3 à 0 px près pour ces mêmes échelle et
translation. Ni d3 ni topojson ne partent en production.

### « Les mots du cœur » — le rail

Les messages défilent horizontalement dans un rail à accrochage, en CSS pur :
pas de bibliothèque d'animation, la molette et le doigt fonctionnent, et les
flèches ne s'activent que si le rail déborde vraiment. Chaque carte porte son
numéro et le losange de la charte. Le compteur annonce le nombre de mots.

### Le couple dans l'en-tête

Une fois le hero passé, le logo « G & O » laisse la place au couple animé,
comme sur le site Emma. Le fichier n'est téléchargé qu'au moment du
basculement, et jamais si le visiteur a demandé moins d'animations
(`prefers-reduced-motion`). Servi en WebP animé sans perte (55 ko, soit 25 %
de moins que le GIF), avec le GIF en repli.

> Le site Emma obtient des effets comparables avec d3, topojson, GSAP et
> ScrollTrigger — environ 250 ko de JavaScript. Ici **l'ensemble du
> JavaScript du site pèse 6,8 ko compressés**, carte comprise.

## La page /admin

`https://…/admin` — privée, `noindex`, protégée par `ADMIN_PASSWORD`.

Le mot de passe ne transite qu'à la connexion ; ensuite un cookie `httpOnly`,
`SameSite=Lax`, limité au chemin `/admin`, porte un jeton signé en HMAC-SHA256
valable 12 h. **Changer `ADMIN_PASSWORD` déconnecte immédiatement tout le monde.**

Elle offre, en plus du classeur :

- **le total des personnes attendues**, dédoublonné (voir ci-dessous) ;
- l'**export CSV** (point-virgule + BOM UTF-8 : Excel français l'ouvre d'un
  double-clic) ;
- les boutons approuver / retirer / supprimer du livre d'or.

### À propos des doublons

Rien n'empêche deux réponses avec la même adresse : un couple peut partager une
boîte, et un invité peut vouloir corriger sa réponse. Ces lignes sont marquées
**« doublon »**, la plus ancienne est grisée, et **le total ne compte que la
réponse la plus récente de chaque adresse**. Le CSV reprend ces indicateurs dans
les colonnes `doublon` et `remplacee`, et sa colonne `personnes` met à 0 les
lignes remplacées — la somme y est donc juste, contrairement à celle du classeur
qui additionne tout.

## Mise en ligne (Vercel)

1. Poussez le dossier sur GitHub, puis **Add New → Project** sur Vercel.
   Astro est détecté tout seul : rien à configurer côté build.
2. **Settings → Environment Variables**, en *Production* **et** *Preview* :

   | Variable          | Obligatoire | Rôle                                            |
   | ----------------- | ----------- | ------------------------------------------------ |
   | `SHEETS_ENDPOINT` | oui         | l'URL `/exec` du script Apps Script               |
   | `SHEETS_TOKEN`    | oui         | le jeton partagé avec le script                   |
   | `ADMIN_PASSWORD`  | oui         | le mot de passe de `/admin`                       |
   | `SITE_URL`        | non         | à remplir quand vous branchez un vrai domaine     |

   Sans `SITE_URL`, le site utilise l'URL de production que Vercel fournit à la
   compilation : les aperçus de partage fonctionnent dès le premier déploiement.
   Dès que vous achetez un nom de domaine, renseignez `SITE_URL` (par exemple
   `https://grace-et-ouss.fr`) et redéployez, sinon les aperçus continueront de
   pointer vers l'ancienne adresse.

3. Toute URL inconnue renvoie la page 404 avec un vrai statut 404.

### Ce qui est en place

- **Aperçu de partage** : `public/og.jpg`, la photo du hero recadrée en
  1200×630 sur les deux visages. Balises Open Graph et Twitter complètes,
  en URL absolue — c'est ainsi que le lien s'affichera dans WhatsApp ou
  iMessage, qui est la façon dont l'invitation va circuler.
- **Favicon** « G&O » en #CFA184 sur #2E1D15 : `favicon.svg` pour les
  navigateurs, `apple-touch-icon.png` (180×180) pour l'écran d'accueil iOS.
- **Site privé** : `noindex, nofollow` sur chaque page, plus un `robots.txt`
  qui interdit tout. Attention, cela n'empêche pas les aperçus dans les
  messageries, et c'est voulu : ils ne passent pas par les moteurs de
  recherche. Un site non indexé reste accessible à qui a le lien.
- **Page 404** dans la même direction artistique : fond soie, logo, filet
  d'accent, bouton de retour et raccourcis vers le programme, le lieu et le RSVP.
- **Cache** : tout ce qui porte une empreinte (`/_astro/`, dont la texture de
  soie) est servi en `immutable` pour un an.

## Structure

```
src/
  content/site.ts        tous les textes et données (site + page admin)
  content/monde.ts       tracé du monde pré-calculé + projection
  styles/global.css      jetons de design (@theme Tailwind) + base
  lib/
    validation.ts        règles partagées navigateur ↔ serveur
    sheets.ts            appels au script Apps Script, cache mémoire
    rsvp.ts              doublons, comptage, agrégation des villes
    convives.ts          données publiques de la carte (avec cache)
    admin-auth.ts        mot de passe, jeton signé, cookie de session
  pages/
    index.astro          la page publique (statique)
    api/rsvp.ts          POST — enregistre une réponse
    api/messages.ts      GET  — messages publiés
                         POST — dépose un message (Publié = faux)
    api/virement.ts      POST — demande de RIB par e-mail (rien n'est stocké)
    api/convives.ts      GET  — villes agrégées pour la carte (anonyme)
    admin/index.astro    tableau de bord protégé
    admin/export.csv.ts  export CSV protégé
  layouts/Base.astro     document HTML, métadonnées
  components/            Header, Hero, Countdown, Invitation, Programme,
                         Lieux, ItineraryPanel, Repere, DressCode, RsvpForm,
                         Guestbook, Participation, Faq, Footer, icons/
  pages/404.astro        page introuvable
  assets/img/            photos et texture de soie, empreintées au build
public/
  og.jpg               aperçu de partage 1200×630
  favicon.svg          icône « G&O »
  apple-touch-icon.png écran d'accueil iOS
  robots.txt           interdit l'indexation
google-apps-script/Code.gs   à coller dans le classeur
```

## Choix techniques

- **Le classeur n'est jamais appelé depuis le navigateur.** Contrairement au
  site Emma, les formulaires passent par `/api/*` : l'URL du script et le jeton
  restent sur le serveur, la validation est refaite côté serveur, et « Merci. »
  ne s'affiche que si la ligne est réellement écrite.
- **La page reste statique.** Seules `/api/*` et `/admin` sont rendues à la
  demande (`export const prerender = false`), via l'adaptateur Vercel.
- **Validation écrite une seule fois.** `src/lib/validation.ts` tourne dans le
  navigateur *et* dans les routes serveur. Le script Apps Script refait les
  mêmes contrôles en dernier recours, pour que le classeur reste cohérent même
  si quelqu'un appelait le script directement.
- **Une personne supplémentaire maximum.** Le classeur n'a qu'une colonne
  « Nom accompagnant », obligatoire si la case est cochée et vide sinon : il n'y
  a aucun moyen d'en déclarer deux, à aucun niveau.
- **Anti-spam.** Un champ `site_web` invisible et hors tabulation ; s'il est
  rempli, le serveur répond « ok » sans rien enregistrer.
- **Cache.** Apps Script met une à deux secondes à répondre ; la liste des
  messages publiés est gardée 60 s en mémoire. Les actions de /admin vident ce
  cache aussitôt. En production (plusieurs instances serverless), une
  approbation peut mettre jusqu'à 60 s à paraître pour tous les visiteurs.
- **Livre d'or.** La liste est rendue à la compilation (lisible sans
  JavaScript), puis rafraîchie depuis `/api/messages` au chargement : un message
  approuvé paraît sans redéployer. Le message qu'on vient de déposer s'affiche
  localement avec « en attente de validation ».
- **Pas de framework JS côté client.** Les parties interactives sont des
  `<script>` Astro inlinés dans le HTML.
- **Jetons de design.** Couleurs, échelle Fluent 2, espacements en `clamp()`,
  interlettrages et rayon de 2px sont déclarés dans `@theme`
  (`src/styles/global.css`) et utilisés comme classes Tailwind.
- **Typographie.** `Segoe UI Variable` puis `Selawik` puis la police système.
  Selawik n'est pas chargée par défaut : déposer les `.woff2` dans
  `public/fonts/` et décommenter le bloc `@font-face` de `global.css`.
- **Images.** Hero et château en AVIF/WebP via `<Picture>` d'Astro ; la soie de
  fond est un `background-image` servi en `image-set()`.

## Modifier les textes

**Tout le contenu est dans [`src/content/site.ts`](src/content/site.ts)** : dates,
adresses, horaires, liens d'itinéraire, textes, palette, FAQ, messages d'erreur
et libellés de la page admin. Rien à toucher dans les composants.

Les éléments encore en attente d'une réponse des mariés y sont marqués
`À CONFIRMER` :

- texte d'invitation
- horaire du vin d'honneur
- date limite du RSVP
- règle sur les enfants
- texte de la participation et lien de la cagnotte
- liste d'hébergements
- stationnement au château

Pour activer le bouton « Cagnotte en ligne », renseigner
`participation.cagnotte.href`.

## Contrôle qualité

Mesuré avec Playwright (Chrome) sur le build de production, à **320, 375, 768,
1024 et 1440px**, en comparant chaque largeur à
`design_handoff_site_mariage/grace-et-ouss-site-v4.html`.

### Fidélité au design

Vérifiée de deux façons.

**Par les mesures** : chaque section a exactement la même hauteur et la même
position que dans la référence, aux 5 largeurs. Aucun débordement horizontal.

**Par les captures** : capture pleine page des deux documents, découpe de
chaque section à ses coordonnées, puis comparaison pixel à pixel (le fond soie
est retiré des deux côtés — en `background-size: cover` sur la page entière, il
est forcément cadré autrement puisque les deux pages n'ont pas la même hauteur).

| Section | Résultat |
| --- | --- |
| Invitation, Programme, Tenue | **0 pixel d'écart**, aux 5 largeurs |
| Hero, Lieux | n'écartent que sur les photos : nous servons de l'AVIF/WebP là où la référence sert le JPEG d'origine |
| RSVP, Livre d'or | les deux écarts voulus ci-dessous |
| Participation, Infos, Footer | mise en page identique, antialiasing décalé (voir plus bas) |

Deux écarts, volontaires, introduits par le branchement :

- les trois messages d'exemple du livre d'or ont été supprimés (demandé) ;
- la mention « Formulaire de démonstration — à relier à votre outil de
  collecte » a disparu du RSVP : le formulaire est réellement branché.

Ces deux suppressions décalent tout ce qui suit d'une hauteur **non entière**.
Les sections Participation, Infos et Footer tombent donc sur une phase
sous-pixel différente de celle de la référence (par exemple `.891` contre `.391`
à 768px), et Chrome lisse les glyphes et les filets de 1px différemment. L'écart
moyen reste sous 5/255 et la géométrie est identique au centième de pixel :
les blocs de la FAQ, par exemple, sont à 193,3 / 266,3 / 339,3px dans les deux
documents.

Vérifié au passage : le modificateur d'opacité de Tailwind (`text-ivoire/78`)
mélange en oklab là où la référence écrit `rgba()`. Mesuré sur les 16 niveaux
d'opacité utilisés, **l'écart de rendu est d'au plus 1/255** — rien à corriger.

### Cibles tactiles

Toutes à 44px minimum. Quatre cibles étaient trop petites et ont été agrandies
**sans déplacer un seul pixel** :

| Élément                  | Avant | Après | Méthode                          |
| ------------------------ | ----- | ----- | -------------------------------- |
| Logo « G & O »           | 20px  | 44px  | `py-3 -my-3`                     |
| Liens de nav (≥ 860px)   | 36px  | 44px  | `py-3 -my-1`                     |
| Boutons « Répondre »     | 40px  | 44px  | calque `::after` de 44px          |
| Lignes de la FAQ         | 28px  | 72px  | `py-[22px] -my-[22px]`           |

Les deux boutons « Répondre » ont une bordure visible : y ajouter du padding
aurait grossi le bouton à l'écran. D'où le calque transparent, qui étend la
zone cliquable sans rien changer au dessin.

### Contraste

86 textes mesurés sur le fond réel (le voile brun sous la soie, pas la soie
elle-même) : **aucun sous 4,5:1**, titres compris.

### Fond soie

`background-attachment: fixed` à 1024 et 1440px, `scroll` à 320, 375 et 768px
(la bascule est à 820px, pour iOS).

### Lighthouse

Sur le build servi avec gzip et cache, comme le fait Vercel :

| Critère        | Mobile | Desktop |
| -------------- | ------ | ------- |
| Performance    | 99     | 100     |
| Accessibilité  | 100    | 100     |
| Bonnes pratiques | 100  | 100     |
| SEO            | 63     | 63      |

LCP 1,4 s en mobile, CLS 0.

**Le SEO à 63 est voulu** : le seul audit en échec est « Page is blocked from
indexing », conséquence directe du `noindex` demandé pour un site privé. Tous
les autres passent. Ce score ne pourra monter que si vous décidez un jour de
rendre le site public.

Reste un point mineur pour l'étape 4 : `public/img/soie.*` est servi avec un
cache d'une heure. Une règle d'en-têtes Vercel sur `/img/*` le mettrait en cache
long, pour les visites répétées.

## Reste à faire

1. ~~Construire le site~~ ✅
2. ~~Brancher le RSVP et le livre d'or + page `/admin`~~ ✅
3. ~~Contrôle qualité (Playwright, Lighthouse, contrastes)~~ ✅
4. ~~Mise en ligne (Vercel : meta/Open Graph, favicon, noindex, page 404)~~ ✅

Les quatre étapes du handoff sont faites. Il reste, côté mariés :

- créer le Google Sheet et renseigner les trois variables (voir plus haut) ;
- fournir les contenus marqués `À CONFIRMER` dans `src/content/site.ts`.

## Crédits

Photographies : **Diana Le Photography**.

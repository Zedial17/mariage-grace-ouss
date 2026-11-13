/**
 * Source unique de tous les textes et données du site.
 * Tout se modifie ici, sans toucher aux composants.
 *
 * Les éléments marqués « À CONFIRMER » attendent une réponse des mariés
 * (voir « Contenus en attente » dans le handoff).
 */

/** 'google' | 'waze' | 'apple' — choisit l'icône SVG du panneau « Y aller ». */
export type TypeItineraire = 'google' | 'waze' | 'apple';

export type LienItineraire = {
  type: TypeItineraire;
  libelle: string;
  href: string;
};

export type Moment = {
  heure: string;
  titre: string;
  /** Petite mention sous le titre, ex. « à confirmer ». */
  note?: string;
  description: string;
};

export type GroupeProgramme = {
  date: string;
  lieu: string;
  moments: Moment[];
};

export type Repere = {
  label: string;
  /** Les retours à la ligne « \n » deviennent des <br>. */
  valeur: string;
  /** Texte secondaire (78 % d'opacité). */
  attenue?: boolean;
};

/* ------------------------------------------------------------------ */
/* Métadonnées                                                         */
/* ------------------------------------------------------------------ */

export const meta = {
  titre: 'Grace & Ouss · 27 mars & 1er mai 2027',
  description:
    'Invitation au mariage de Grace et Ouss : mairie de Pantin le 27 mars 2027, Château de Cabezac le 1er mai 2027.',
  langue: 'fr',
  /** Site privé : on ne veut pas être indexé. */
  noindex: true,
  /**
   * Aperçu affiché quand on partage le lien (WhatsApp, iMessage, Messenger…).
   * Le `noindex` ci-dessus n'empêche pas ces aperçus : il ne vise que les
   * moteurs de recherche.
   */
  partage: {
    image: '/og.jpg',
    largeur: 1200,
    hauteur: 630,
    alt: 'Grace et Ouss enlacés',
  },
};

/* ------------------------------------------------------------------ */
/* Page 404                                                            */
/* ------------------------------------------------------------------ */

export const page404 = {
  titre: 'Page introuvable',
  code: '404',
  texte: 'Ce lien ne mène nulle part. Tout se passe sur la page d’invitation.',
  retour: 'Retour à l’invitation',
  liens: [
    { href: '/#jour', libelle: 'Le programme' },
    { href: '/#lieu', libelle: 'Le lieu' },
    { href: '/#rsvp', libelle: 'Répondre' },
  ],
};

export const couple = {
  prenomA: 'Grace',
  prenomB: 'Ouss',
  logo: 'G & O',
  creditPhoto: 'Diana Le Photography',
};

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

/** Liens de la barre haute (≥ 860px). */
export const nav = [
  { href: '#jour', libelle: 'Le jour J' },
  { href: '#lieu', libelle: 'Le lieu' },
  { href: '#tenue', libelle: 'Tenue' },
  { href: '#mots', libelle: "Livre d'or" },
  { href: '#infos', libelle: 'Infos' },
];

/** Liens du panneau burger (< 860px) — inclut Participation. */
export const navMobile = [
  { href: '#jour', libelle: 'Le jour J' },
  { href: '#lieu', libelle: 'Le lieu' },
  { href: '#tenue', libelle: 'Tenue' },
  { href: '#mots', libelle: "Livre d'or" },
  { href: '#participation', libelle: 'Participation' },
  { href: '#infos', libelle: 'Infos' },
];

export const ctaRepondre = { href: '#rsvp', libelle: 'Répondre' };

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  surtitre: '27 mars & 1er mai 2027',
  alt: 'Grace et Ouss',
  texte: 'Pantin, puis le Château de Cabezac.',
  ctaPrincipal: { href: '#rsvp', libelle: 'Confirmer ma présence' },
  ctaSecondaire: { href: '#jour', libelle: 'Le programme' },
};

/* ------------------------------------------------------------------ */
/* Compte à rebours                                                    */
/* ------------------------------------------------------------------ */

export const countdown = {
  /**
   * 27 mars 2027, 14h00, Europe/Paris.
   * Le passage à l'heure d'été 2027 tombe le 28 mars : ce jour-là la
   * France est encore en CET, donc +01:00.
   */
  cible: '2027-03-27T14:00:00+01:00',
  unites: {
    jours: 'jours',
    heures: 'heures',
    minutes: 'minutes',
    secondes: 'secondes',
  },
};

/* ------------------------------------------------------------------ */
/* L'invitation                                                        */
/* ------------------------------------------------------------------ */

export const invitation = {
  label: "L'invitation",
  citation:
    "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction.",
  /** Laisser vide pour masquer la ligne d'attribution. */
  auteur: 'Antoine de Saint-Exupéry',
  /** Laisser vide : la citation se suffit. */
  texte: '',
};

/* ------------------------------------------------------------------ */
/* Programme                                                           */
/* ------------------------------------------------------------------ */

const groupesProgramme: GroupeProgramme[] = [
  {
    date: 'Samedi 27 mars 2027',
    lieu: 'Mairie de Pantin',
    moments: [
      {
        heure: '14h00',
        titre: 'Mariage civil',
        description: 'Merci d’arriver à 13h45.',
      },
    ],
  },
  {
    date: 'Samedi 1er mai 2027',
    lieu: 'Château de Cabezac',
    moments: [
      {
        heure: '16h30',
        titre: 'Cérémonie',
        description: 'Dans les vignes. Installés pour 16h15.',
      },
      {
        heure: '18h00',
        titre: "Vin d'honneur",
        description: 'Coupes et photographies, face aux vignes.',
      },
      {
        heure: '20h00',
        titre: 'Dîner & soirée',
        description: 'Dîner assis, quelques mots, puis la piste.',
      },
    ],
  },
];

export const programme = {
  label: 'Le programme',
  titre: 'Deux dates, un même oui',
  groupes: groupesProgramme,
};

/* ------------------------------------------------------------------ */
/* Lieux                                                               */
/* ------------------------------------------------------------------ */

const chateauInfos: Repere[] = [
  { label: 'Adresse', valeur: '23 Hameau de Cabezac\n11120 Bize-Minervois' },
  { label: 'Accueil', valeur: 'Samedi 1er mai 2027\nà partir de 16h00' },
];

const chateauReperes: Repere[] = [
  {
    label: 'Depuis Narbonne',
    valeur: '30 min par la D607 puis la D5.',
    attenue: true,
  },
  {
    label: 'Stationnement',
    valeur: '25 places sur place,\n30 autres à une minute à pied.',
    attenue: true,
  },
];

const chateauItineraire: LienItineraire[] = [
  {
    type: 'google',
    libelle: 'Google Maps',
    href: 'https://maps.google.com/?q=23+Hameau+de+Cabezac+11120+Bize-Minervois',
  },
  {
    type: 'waze',
    libelle: 'Waze',
    href: 'https://waze.com/ul?q=23%20Hameau%20de%20Cabezac%2011120%20Bize-Minervois&navigate=yes',
  },
  {
    type: 'apple',
    libelle: 'Plans (Apple)',
    href: 'https://maps.apple.com/?q=23%20Hameau%20de%20Cabezac%2011120%20Bize-Minervois',
  },
];

export const chateau = {
  label: 'Le lieu',
  titre: 'Château de Cabezac',
  sousTitre: 'Cérémonie & soirée · 1er mai 2027',
  description:
    'Un domaine viticole du Minervois. De la cérémonie à la dernière danse.',
  photoAlt: 'Grace rit, la joue contre celle d’Ouss',
  infos: chateauInfos,
  reperes: chateauReperes,
  itineraire: chateauItineraire,
};

const mairieInfos: Repere[] = [
  { label: 'Adresse', valeur: '84-88 avenue du Général Leclerc\n93500 Pantin' },
  { label: 'Rendez-vous', valeur: 'Samedi 27 mars 2027\n14h00' },
  { label: 'Transports', valeur: 'Métro 5 · Église de Pantin.', attenue: true },
];

const mairieItineraire: LienItineraire[] = [
  {
    type: 'google',
    libelle: 'Google Maps',
    href: 'https://maps.google.com/?q=Mairie+de+Pantin+84+avenue+du+G%C3%A9n%C3%A9ral+Leclerc+93500+Pantin',
  },
  {
    type: 'waze',
    libelle: 'Waze',
    href: 'https://waze.com/ul?q=Mairie%20de%20Pantin%2093500%20Pantin&navigate=yes',
  },
  {
    type: 'apple',
    libelle: 'Plans (Apple)',
    href: 'https://maps.apple.com/?q=Mairie%20de%20Pantin%2084%20avenue%20du%20G%C3%A9n%C3%A9ral%20Leclerc%2093500%20Pantin',
  },
];

export const mairie = {
  label: 'Mariage civil',
  titre: 'Mairie de Pantin',
  infos: mairieInfos,
  itineraire: mairieItineraire,
};

export const itineraire = { titre: 'Y aller' };

/* ------------------------------------------------------------------ */
/* Tenue                                                               */
/* ------------------------------------------------------------------ */

export const tenue = {
  label: 'La tenue',
  titre: 'Pastel & coloré',
  texte: 'La coupe est libre. La couleur fait la fête.',
  regle: {
    titre: 'Ni blanc, ni noir.',
    precision: "L'écru et le beige comptent comme du blanc.",
  },
  note: 'Allées en gravier, et frais le soir.',
  paletteLabel: 'La palette',
  palette: [
    '#FF98AE',
    '#FDCC60',
    '#BAC563',
    '#FF9A3D',
    '#C0CFE0',
    '#FFA090',
    '#DE3466',
    '#72892C',
    '#F2AF5F',
  ],
};

/* ------------------------------------------------------------------ */
/* RSVP                                                                */
/* ------------------------------------------------------------------ */

export const rsvp = {
  label: 'Réponse',
  titre: 'Serez-vous des nôtres ?',
  dateLimite: 'Avant le 15 mars 2027.',
  champs: {
    reponse: 'Votre réponse',
    oui: 'Avec joie',
    non: 'Empêché(e)',
    nom: 'Prénom et nom',
    email: 'E-mail',
    accompagnant: 'Accompagnant(e)',
    seul: 'Seul(e)',
    avecUn: 'À deux',
    limite: 'Une personne au maximum.',
    nomAccompagnant: 'Son prénom et son nom',
    ville: 'Ville de départ',
    villeExemple: 'Paris, Narbonne, Bruxelles…',
    mot: 'Un mot pour nous',
    motExemple: 'Allergies, régime, une envie…',
    facultatif: 'facultatif',
    envoyer: 'Envoyer',
  },
  erreurs: {
    nom: 'Merci d’indiquer votre prénom et votre nom.',
    email: 'Merci d’indiquer une adresse e-mail valide.',
    reponse: 'Merci de choisir une réponse.',
    nomAccompagnant: 'Merci d’indiquer le nom de votre accompagnant(e).',
  },
  confirmation: {
    titre: 'Merci.',
    texte: 'Votre réponse est enregistrée.',
  },
};

/* ------------------------------------------------------------------ */
/* Livre d'or                                                          */
/* ------------------------------------------------------------------ */

export const livreDor = {
  label: "Livre d'or",
  titre: 'Les mots du cœur',
  /** Compteur et navigation du rail de cartes. */
  rail: {
    un: 'mot déposé',
    plusieurs: 'mots déposés',
    precedent: 'Mot précédent',
    suivant: 'Mot suivant',
  },
  texte: 'Un vœu, un souvenir, une phrase.',
  champs: {
    nom: 'Votre nom',
    message: 'Votre message',
    envoyer: 'Déposer mes mots',
  },
  erreurs: {
    texte: 'Merci d’écrire quelques mots avant d’envoyer.',
  },
  nomParDefaut: 'Un invité',
  mentionAttente: 'en attente de validation',
  /** Affiché tant qu'aucun message n'a été approuvé. */
  vide: 'Les premiers mots paraîtront ici.',
};

/* ------------------------------------------------------------------ */
/* Participation                                                       */
/* ------------------------------------------------------------------ */

export const participation = {
  label: 'Participation',
  titre: "Votre présence, d'abord",
  texte:
    'Vous voir à Cabezac est déjà le plus beau des cadeaux. Une urne attendra le soir du dîner.',
  coffret: {
    ouvrir: 'Contribuer',
    refermer: 'Refermer',
  },
  paypal: {
    titre: 'PayPal',
    lien: 'paypal.me/GraceONGALLA',
    href: 'https://paypal.me/GraceONGALLA',
    copier: 'Copier',
    copie: 'Copié',
  },
  virement: {
    titre: 'Virement',
    champs: {
      nom: 'Votre nom',
      contact: 'E-mail ou téléphone',
      envoyer: 'Demander le RIB',
    },
    erreurs: {
      nom: 'Merci d’indiquer votre nom.',
      contact: 'Merci d’indiquer un e-mail ou un téléphone.',
    },
    confirmation: 'Demande envoyée. Nous revenons vers vous.',
  },
};

/* ------------------------------------------------------------------ */
/* Carte des invités                                                   */
/* ------------------------------------------------------------------ */

export const convives = {
  label: 'Les convives',
  titre: "D'où vous venez",
  texte: 'Chaque réponse ajoute une ville, jamais un nom.',
  compteurs: {
    personnes: 'convives',
    villes: 'villes',
    pays: 'pays',
  },
  destination: {
    nom: 'Château de Cabezac',
    /** Bize-Minervois, le point d'arrivée marqué sur la carte. */
    lat: 43.3186,
    lng: 2.8706,
  },
  vide: 'En attente des premières réponses.',
  legende: 'Le losange marque Cabezac.',
  /** Libellé au survol d'un point : « Paris · 4 convives ». */
  unite: { un: 'convive', plusieurs: 'convives' },
};

/* ------------------------------------------------------------------ */
/* Infos                                                               */
/* ------------------------------------------------------------------ */

export const faq = {
  label: 'Informations',
  titre: 'Bon à savoir',
  questions: [
    {
      question: 'Où dormir',
      reponse:
        'La Bastide Cabezac, dans le hameau. Gîtes et chambres d’hôtes au village, Narbonne à trente minutes. Le 1er mai est férié : réservez tôt.',
    },
    {
      question: 'Comment venir',
      reponse:
        'Gare de Narbonne à trente minutes. Aéroports de Béziers, Carcassonne, Montpellier. En voiture, pensez au covoiturage.',
    },
    {
      question: 'Les enfants',
      reponse:
        'La mairie est ouverte à tous. Cabezac se fera entre adultes.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export const footer = {
  dates: '27 · 03 · 2027 — Pantin  ·  01 · 05 · 2027 — Bize-Minervois',
  credit: 'Photographies : Diana Le Photography',
};

/* ------------------------------------------------------------------ */
/* Messages techniques (envois)                                        */
/* ------------------------------------------------------------------ */

export const reseau = {
  /** Google Sheets pas encore configuré (variables d'environnement absentes). */
  indisponible:
    "Les réponses ne sont pas encore collectées. Réessayez un peu plus tard, ou prévenez-nous directement.",
  /** Erreur réseau ou serveur. */
  echec: "L’envoi a échoué. Vérifiez votre connexion et réessayez.",
  enCours: 'Envoi…',
};

/* ------------------------------------------------------------------ */
/* Page /admin (privée)                                                */
/* ------------------------------------------------------------------ */

export const admin = {
  titre: 'Administration',
  sousTitre: 'Grace & Ouss',
  connexion: {
    label: 'Mot de passe',
    bouton: 'Entrer',
    erreur: 'Mot de passe incorrect.',
    nonConfigure:
      'ADMIN_PASSWORD n’est pas défini : la page est fermée tant que la variable manque.',
  },
  deconnexion: 'Se déconnecter',
  sheetsAbsent:
    'SHEETS_ENDPOINT ou SHEETS_TOKEN manque : le classeur ne peut pas être lu.',
  rappelClasseur:
    'Ces données vivent dans le Google Sheet partagé. Vous pouvez aussi cocher la colonne « Publié » directement dans le classeur pour afficher un message.',
  rsvp: {
    titre: 'Réponses',
    personnes: 'personnes attendues',
    oui: 'avec joie',
    non: 'empêché(e)s',
    reponses: 'réponses reçues',
    export: 'Exporter en CSV',
    vide: 'Aucune réponse pour le moment.',
    doublon: 'doublon',
    doublonAide:
      'Même adresse e-mail qu’une autre réponse. Seule la plus récente compte dans le total.',
    supprimer: 'Supprimer',
    confirmerSuppression: 'Supprimer définitivement cette réponse ?',
    colonnes: {
      date: 'Reçue le',
      nom: 'Nom',
      email: 'E-mail',
      reponse: 'Réponse',
      accompagnant: 'Accompagnant(e)',
      ville: 'Ville',
      message: 'Message',
    },
  },
  messages: {
    titre: "Livre d'or",
    enAttente: 'En attente',
    publies: 'Publiés',
    approuver: 'Approuver',
    retirer: 'Retirer de la page',
    supprimer: 'Supprimer',
    confirmerSuppression: 'Supprimer définitivement ce message ?',
    vide: 'Aucun message.',
  },
};

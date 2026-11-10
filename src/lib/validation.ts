/**
 * Validation partagée entre le navigateur et le serveur.
 *
 * Le même module tourne des deux côtés : les règles ne peuvent pas diverger.
 * Les messages d'erreur viennent de src/content/site.ts, donc modifiables
 * sans toucher au code.
 */
import { rsvp as texteRsvp, livreDor } from '../content/site';

/** Longueurs maximales, alignées sur ce que la base accepte. */
export const LIMITES = {
  nom: 120,
  email: 160,
  ville: 120,
  nomAccompagnant: 120,
  message: 2000,
  texte: 2000,
} as const;

export type Reponse = 'oui' | 'non';

export type DonneesRsvp = {
  nom: string;
  email: string;
  /** Facultatif — alimente la carte des invités. */
  ville: string;
  reponse: Reponse | null;
  accompagnant: boolean;
  nom_accompagnant: string;
  message: string;
};

export type ChampRsvp = 'nom' | 'email' | 'reponse' | 'nom_accompagnant';
export type ErreursRsvp = Partial<Record<ChampRsvp, string>>;

export type DonneesMessage = {
  nom: string;
  texte: string;
};

export type ErreursMessage = Partial<Record<'texte', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const nettoie = (valeur: unknown, max: number): string =>
  typeof valeur === 'string' ? valeur.trim().slice(0, max) : '';

/** Normalise une charge utile quelconque (FormData, JSON) en données RSVP. */
export function lireRsvp(brut: Record<string, unknown>): DonneesRsvp {
  const reponse = brut.reponse === 'oui' || brut.reponse === 'non' ? brut.reponse : null;

  // Une seule personne supplémentaire maximum : le choix est binaire,
  // il n'existe aucun moyen d'en déclarer deux.
  const accompagnant = brut.accompagnant === true || brut.accompagnant === 'plus';

  return {
    nom: nettoie(brut.nom, LIMITES.nom),
    email: nettoie(brut.email, LIMITES.email),
    ville: nettoie(brut.ville, LIMITES.ville),
    reponse,
    accompagnant,
    nom_accompagnant: accompagnant
      ? nettoie(brut.nom_accompagnant, LIMITES.nomAccompagnant)
      : '',
    message: nettoie(brut.message, LIMITES.message),
  };
}

export function validerRsvp(donnees: DonneesRsvp): ErreursRsvp {
  const erreurs: ErreursRsvp = {};

  if (donnees.nom.length < 2) erreurs.nom = texteRsvp.erreurs.nom;
  if (!EMAIL.test(donnees.email)) erreurs.email = texteRsvp.erreurs.email;
  if (!donnees.reponse) erreurs.reponse = texteRsvp.erreurs.reponse;
  if (donnees.accompagnant && donnees.nom_accompagnant.length < 2) {
    erreurs.nom_accompagnant = texteRsvp.erreurs.nomAccompagnant;
  }

  return erreurs;
}

export function lireMessage(brut: Record<string, unknown>): DonneesMessage {
  return {
    nom: nettoie(brut.nom, LIMITES.nom) || livreDor.nomParDefaut,
    texte: nettoie(brut.texte, LIMITES.texte),
  };
}

export function validerMessage(donnees: DonneesMessage): ErreursMessage {
  const erreurs: ErreursMessage = {};
  if (donnees.texte.length < 2) erreurs.texte = livreDor.erreurs.texte;
  return erreurs;
}

/**
 * Champs contrôlés à chaque étape du formulaire, dans l'ordre des étapes.
 * Sert à bloquer le passage à l'étape suivante tant qu'elle est incomplète.
 */
export const CHAMPS_PAR_ETAPE: ChampRsvp[][] = [
  ['nom', 'email'],
  ['reponse', 'nom_accompagnant'],
  [],
];

/** Erreurs de la seule étape demandée (0 = la première). */
export function validerEtape(donnees: DonneesRsvp, etape: number): ErreursRsvp {
  const toutes = validerRsvp(donnees);
  const champs = CHAMPS_PAR_ETAPE[etape] ?? [];
  return Object.fromEntries(
    Object.entries(toutes).filter(([champ]) => champs.includes(champ as ChampRsvp)),
  );
}

export const aDesErreurs = (erreurs: object): boolean =>
  Object.keys(erreurs).length > 0;

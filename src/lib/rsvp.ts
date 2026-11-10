/**
 * Annotation et comptage des réponses, partagés par /admin et l'export CSV.
 *
 * Les lignes arrivent du classeur dans l'ordre « plus récent d'abord » :
 * c'est cet ordre qui fait foi, pas l'horodatage (qui n'est qu'un texte
 * lisible, déjà mis en forme par Apps Script).
 */
import type { LigneRsvp } from './sheets';

export type RsvpAnnote = LigneRsvp & {
  /** Une autre réponse porte la même adresse e-mail. */
  doublon: boolean;
  /** Réponse remplacée par une plus récente de la même adresse. */
  obsolete: boolean;
};

export type StatsRsvp = {
  reponses: number;
  oui: number;
  non: number;
  personnes: number;
};

const cle = (email: string) => email.trim().toLowerCase();

/**
 * Marque les doublons d'adresse et compte les personnes attendues.
 * Seule la réponse la plus récente d'une adresse entre dans le total ;
 * un invité qui se ravise n'est donc jamais compté deux fois.
 */
export function annoter(lignes: LigneRsvp[]): {
  lignes: RsvpAnnote[];
  stats: StatsRsvp;
} {
  const parEmail = new Map<string, number>();
  lignes.forEach((l) => parEmail.set(cle(l.email), (parEmail.get(cle(l.email)) ?? 0) + 1));

  const dejaVu = new Set<string>();
  const annotees: RsvpAnnote[] = lignes.map((ligne) => {
    const k = cle(ligne.email);
    const obsolete = dejaVu.has(k);
    dejaVu.add(k);
    return { ...ligne, doublon: (parEmail.get(k) ?? 0) > 1, obsolete };
  });

  const courantes = annotees.filter((l) => !l.obsolete);
  const oui = courantes.filter((l) => l.reponse === 'oui');

  return {
    lignes: annotees,
    stats: {
      reponses: courantes.length,
      oui: oui.length,
      non: courantes.length - oui.length,
      personnes: oui.length + oui.filter((l) => l.accompagnant).length,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Carte des invités                                                   */
/* ------------------------------------------------------------------ */

export type Ville = {
  nom: string;
  pays: string | null;
  lat: number;
  lng: number;
  /** Nombre de personnes attendues depuis cette ville. */
  personnes: number;
};

export type Convives = {
  villes: Ville[];
  personnes: number;
  pays: number;
};

/** Clé de regroupement : insensible à la casse et aux accents. */
const cleVille = (nom: string) =>
  nom
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Agrège les villes d'origine, pour la carte.
 *
 * Ne retient que les réponses positives encore valables et géocodées, et ne
 * ressort aucune donnée nominative : seulement une ville, un pays et un
 * nombre.
 */
export function agregerVilles(lignes: LigneRsvp[]): Convives {
  const { lignes: annotees } = annoter(lignes);
  const parVille = new Map<string, Ville>();

  for (const l of annotees) {
    if (l.obsolete || l.reponse !== 'oui') continue;
    if (!l.ville || l.lat === null || l.lng === null) continue;

    const cle = cleVille(l.ville);
    const personnes = l.accompagnant ? 2 : 1;
    const existante = parVille.get(cle);

    if (existante) {
      existante.personnes += personnes;
    } else {
      parVille.set(cle, {
        nom: l.ville.trim(),
        pays: l.pays,
        lat: l.lat,
        lng: l.lng,
        personnes,
      });
    }
  }

  const villes = [...parVille.values()].sort((a, b) => b.personnes - a.personnes);

  return {
    villes,
    personnes: villes.reduce((t, v) => t + v.personnes, 0),
    pays: new Set(villes.map((v) => v.pays).filter(Boolean)).size,
  };
}

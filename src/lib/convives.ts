/**
 * Données publiques de la carte des invités.
 *
 * Utilisé à la compilation (rendu initial) et par /api/convives (rafraîchi
 * pendant la visite). Comme la liste des messages, elle est gardée en
 * mémoire un moment : Apps Script est lent et la carte n'a pas besoin
 * d'être à la seconde.
 */
import { lireTout } from './sheets';
import { agregerVilles, type Convives } from './rsvp';

const CACHE_MS = 120_000;
let cache: { a: number; valeur: Convives } | null = null;

const VIDE: Convives = { villes: [], personnes: 0, pays: 0 };

export async function convives(): Promise<Convives> {
  if (cache && Date.now() - cache.a < CACHE_MS) return cache.valeur;

  const { rsvp } = await lireTout();
  if (rsvp.length === 0 && cache) return cache.valeur;

  const valeur = rsvp.length ? agregerVilles(rsvp) : VIDE;
  cache = { a: Date.now(), valeur };
  return valeur;
}

export function viderCacheConvives(): void {
  cache = null;
}

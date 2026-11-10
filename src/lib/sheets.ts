/**
 * Accès au Google Sheet, via le script Apps Script déployé en application web
 * (voir google-apps-script/Code.gs).
 *
 * Le site n'appelle jamais ce script depuis le navigateur : l'URL et le jeton
 * restent côté serveur, pour que personne ne puisse écrire dans le classeur
 * sans passer par la validation des routes /api.
 */
import { SHEETS_ENDPOINT, SHEETS_TOKEN } from 'astro:env/server';

export type LigneRsvp = {
  id: string;
  /** Déjà formaté par Apps Script : « 27/03/2027 14:05:00 » (Europe/Paris). */
  created_at: string;
  nom: string;
  email: string;
  reponse: 'oui' | 'non';
  accompagnant: boolean;
  nom_accompagnant: string | null;
  /** Ville saisie par l'invité, puis géocodée par Apps Script. */
  ville: string | null;
  pays: string | null;
  lat: number | null;
  lng: number | null;
  message: string | null;
};

export type LigneMessage = {
  id: string;
  created_at: string;
  nom: string;
  texte: string;
  approuve: boolean;
};

export type MessagePublie = Pick<LigneMessage, 'id' | 'nom' | 'texte'>;

/** Vrai quand l'URL du script et le jeton sont tous les deux renseignés. */
export const sheetsConfigure = Boolean(SHEETS_ENDPOINT && SHEETS_TOKEN);

/** Apps Script met parfois quelques secondes à démarrer. */
const DELAI_MS = 15_000;

type Reponse<T> = ({ ok: true } & T) | { ok: false; message?: string };

/**
 * Appelle le script. Tout passe en POST, y compris les lectures : le jeton
 * reste ainsi hors des URLs et des journaux d'accès.
 */
async function appeler<T>(
  action: string,
  charge: Record<string, unknown> = {},
): Promise<Reponse<T>> {
  if (!sheetsConfigure) {
    return { ok: false, message: 'Google Sheets non configuré.' };
  }

  try {
    const reponse = await fetch(SHEETS_ENDPOINT!, {
      method: 'POST',
      // text/plain évite le pré-vol CORS et convient à Apps Script,
      // qui lit le corps brut.
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: SHEETS_TOKEN, action, ...charge }),
      redirect: 'follow',
      signal: AbortSignal.timeout(DELAI_MS),
    });

    if (!reponse.ok) {
      console.error(`[sheets] ${action} : HTTP ${reponse.status}`);
      return { ok: false };
    }

    const corps = (await reponse.json()) as Reponse<T>;
    if (!corps.ok) console.error(`[sheets] ${action} :`, corps.message);
    return corps;
  } catch (erreur) {
    console.error(`[sheets] ${action} injoignable :`, (erreur as Error).message);
    return { ok: false };
  }
}

/* ------------------------------------------------------------------ */
/* Écritures                                                           */
/* ------------------------------------------------------------------ */

export const ajouterRsvp = (donnees: Record<string, unknown>) =>
  appeler<{ id: string }>('rsvp', donnees);

export const ajouterMessage = (donnees: Record<string, unknown>) =>
  appeler<{ id: string }>('message', donnees);

/** N'écrit rien : déclenche seulement l'e-mail aux mariés. */
export const demanderVirement = (donnees: { nom: string; contact: string }) =>
  appeler('virement', donnees);

export const publierMessage = (id: string, publie: boolean) =>
  appeler(publie ? 'approuver' : 'retirer', { id });

export const supprimerMessage = (id: string) => appeler('supprimer_message', { id });

export const supprimerRsvp = (id: string) => appeler('supprimer_rsvp', { id });

/* ------------------------------------------------------------------ */
/* Lectures                                                            */
/* ------------------------------------------------------------------ */

/**
 * Petit cache mémoire : la page publique demande la liste à chaque visite,
 * et Apps Script est lent. 60 s suffisent pour qu'un message approuvé
 * paraisse vite sans marteler le classeur.
 */
const CACHE_MS = 60_000;
let cache: { a: number; messages: MessagePublie[] } | null = null;

export async function messagesApprouves(): Promise<MessagePublie[]> {
  if (cache && Date.now() - cache.a < CACHE_MS) return cache.messages;

  const corps = await appeler<{ messages: MessagePublie[] }>('messages');
  if (!corps.ok) return cache?.messages ?? [];

  cache = { a: Date.now(), messages: corps.messages ?? [] };
  return cache.messages;
}

export function viderCache(): void {
  cache = null;
}

/** Tout le classeur, pour /admin et l'export CSV. Du plus récent au plus ancien. */
export async function lireTout(): Promise<{
  rsvp: LigneRsvp[];
  messages: LigneMessage[];
}> {
  const corps = await appeler<{ rsvp: LigneRsvp[]; messages: LigneMessage[] }>('tout');
  if (!corps.ok) return { rsvp: [], messages: [] };
  return { rsvp: corps.rsvp ?? [], messages: corps.messages ?? [] };
}

/**
 * Appels au Google Sheet, depuis le navigateur.
 *
 * Le site est entièrement statique : il n'y a plus de route serveur entre
 * la page et le classeur. L'URL du script est donc publique, et c'est le
 * script lui-même qui contrôle ce qu'un visiteur a le droit de faire
 * (voir google-apps-script/Code.gs) : écrire une réponse ou un mot, lire
 * ce qui est publié. Rien d'autre.
 */
import { PUBLIC_SHEETS_ENDPOINT } from 'astro:env/client';

export type Ville = {
  nom: string;
  pays: string | null;
  lat: number;
  lng: number;
  personnes: number;
};

export type MessagePublie = { id: string; nom: string; texte: string };

export type Reponse<T> = ({ ok: true } & T) | { ok: false; message?: string };

/**
 * Vrai quand l'URL du script est renseignée au moment de la compilation.
 *
 * Seule une URL d'**application web** fonctionne : elle contient `/macros/s/`
 * et se termine par `/exec`. Apps Script affiche aussi une URL de
 * bibliothèque (`/macros/library/d/…`), qui ressemble beaucoup mais n'est
 * pas appelable — c'est la confusion la plus courante.
 */
const EXEC = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec\/?$/;

export const classeurConfigure = Boolean(PUBLIC_SHEETS_ENDPOINT);

if (classeurConfigure && !EXEC.test(PUBLIC_SHEETS_ENDPOINT)) {
  console.error(
    '[classeur] PUBLIC_SHEETS_ENDPOINT ne ressemble pas à une URL ' +
      'd’application web Apps Script.\n' +
      '  Reçu   : ' + PUBLIC_SHEETS_ENDPOINT + '\n' +
      '  Attendu : https://script.google.com/macros/s/…/exec\n' +
      'Dans Apps Script : Déployer → Nouveau déploiement → type ' +
      '« Application web », puis copier l’URL qui finit par /exec. ' +
      'L’URL en /macros/library/d/… est celle de la bibliothèque : elle ne ' +
      'répond pas aux requêtes du site.',
  );
}

/** Apps Script met parfois quelques secondes à démarrer. */
const DELAI_MS = 20_000;

/**
 * Tout passe en POST avec un corps `text/plain`.
 *
 * C'est une « requête simple » au sens CORS : pas de pré-vol, et la
 * réponse reste lisible — contrairement au `mode: 'no-cors'` du site
 * Emma, qui envoie à l'aveugle et affiche « merci » même en cas d'échec.
 */
export async function appeler<T>(
  action: string,
  charge: Record<string, unknown> = {},
): Promise<Reponse<T>> {
  if (!classeurConfigure) {
    return { ok: false, message: 'Classeur non configuré.' };
  }

  try {
    const reponse = await fetch(PUBLIC_SHEETS_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...charge }),
      redirect: 'follow',
      signal: AbortSignal.timeout(DELAI_MS),
    });

    if (!reponse.ok) {
      console.error(`[classeur] ${action} : HTTP ${reponse.status}`);
      return { ok: false };
    }
    return (await reponse.json()) as Reponse<T>;
  } catch (erreur) {
    console.error(`[classeur] ${action} injoignable :`, (erreur as Error).message);
    return { ok: false };
  }
}

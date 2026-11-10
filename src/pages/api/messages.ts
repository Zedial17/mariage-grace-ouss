import type { APIRoute } from 'astro';
import {
  ajouterMessage,
  messagesApprouves,
  sheetsConfigure,
  viderCache,
} from '../../lib/sheets';
import { lireMessage, validerMessage, aDesErreurs } from '../../lib/validation';
import { reseau } from '../../content/site';

export const prerender = false;

const json = (corps: unknown, status: number, entetes: HeadersInit = {}) =>
  new Response(JSON.stringify(corps), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...entetes },
  });

/** Liste publique : uniquement les messages publiés dans le classeur. */
export const GET: APIRoute = async () => {
  const messages = await messagesApprouves();
  return json({ ok: true, messages }, 200, {
    'cache-control': 'public, max-age=30, stale-while-revalidate=300',
  });
};

export const POST: APIRoute = async ({ request }) => {
  let brut: Record<string, unknown>;
  try {
    brut = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, message: reseau.echec }, 400);
  }

  if (typeof brut.site_web === 'string' && brut.site_web.length > 0) {
    return json({ ok: true }, 200);
  }

  const donnees = lireMessage(brut);
  const erreurs = validerMessage(donnees);
  if (aDesErreurs(erreurs)) {
    return json({ ok: false, erreurs }, 422);
  }

  if (!sheetsConfigure) {
    return json({ ok: false, message: reseau.indisponible }, 503);
  }

  // Le script écrit « Publié = faux » : rien ne paraît sans validation.
  const resultat = await ajouterMessage({ nom: donnees.nom, texte: donnees.texte });
  if (!resultat.ok) {
    return json({ ok: false, message: reseau.echec }, 502);
  }

  viderCache();
  return json({ ok: true, message: { nom: donnees.nom, texte: donnees.texte } }, 201);
};

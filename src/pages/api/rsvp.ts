import type { APIRoute } from 'astro';
import { ajouterRsvp, sheetsConfigure } from '../../lib/sheets';
import { lireRsvp, validerRsvp, aDesErreurs } from '../../lib/validation';
import { reseau } from '../../content/site';

export const prerender = false;

const json = (corps: unknown, status: number) =>
  new Response(JSON.stringify(corps), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export const POST: APIRoute = async ({ request }) => {
  let brut: Record<string, unknown>;
  try {
    brut = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, message: reseau.echec }, 400);
  }

  // Piège à robots : on répond « ok » sans rien enregistrer.
  if (typeof brut.site_web === 'string' && brut.site_web.length > 0) {
    return json({ ok: true }, 200);
  }

  const donnees = lireRsvp(brut);
  const erreurs = validerRsvp(donnees);
  if (aDesErreurs(erreurs)) {
    return json({ ok: false, erreurs }, 422);
  }

  if (!sheetsConfigure) {
    return json({ ok: false, message: reseau.indisponible }, 503);
  }

  const resultat = await ajouterRsvp({
    nom: donnees.nom,
    email: donnees.email,
    ville: donnees.ville,
    reponse: donnees.reponse,
    accompagnant: donnees.accompagnant,
    nom_accompagnant: donnees.accompagnant ? donnees.nom_accompagnant : '',
    message: donnees.message,
  });

  if (!resultat.ok) {
    return json({ ok: false, message: reseau.echec }, 502);
  }

  return json({ ok: true }, 201);
};

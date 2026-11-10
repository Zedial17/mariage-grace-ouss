import type { APIRoute } from 'astro';
import { demanderVirement, sheetsConfigure } from '../../lib/sheets';
import { reseau } from '../../content/site';

export const prerender = false;

const json = (corps: unknown, status: number) =>
  new Response(JSON.stringify(corps), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

/**
 * Demande de coordonnées bancaires : rien n'est écrit dans le classeur,
 * le script envoie simplement un e-mail aux mariés. Le RIB ne figure donc
 * jamais sur le site.
 */
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

  const nom = String(brut.nom ?? '').trim().slice(0, 120);
  const contact = String(brut.contact ?? '').trim().slice(0, 160);

  if (nom.length < 2 || contact.length < 4) {
    return json({ ok: false, message: reseau.echec }, 422);
  }

  if (!sheetsConfigure) {
    return json({ ok: false, message: reseau.indisponible }, 503);
  }

  const resultat = await demanderVirement({ nom, contact });
  if (!resultat.ok) {
    return json({ ok: false, message: reseau.echec }, 502);
  }

  return json({ ok: true }, 200);
};

import type { APIRoute } from 'astro';
import { convives } from '../../lib/convives';

export const prerender = false;

/**
 * Carte des invités : villes, pays et nombres. Aucune donnée nominative
 * ne sort d'ici — ni nom, ni e-mail, ni message.
 */
export const GET: APIRoute = async () => {
  const donnees = await convives();
  return new Response(JSON.stringify({ ok: true, ...donnees }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
};

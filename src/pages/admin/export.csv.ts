import type { APIRoute } from 'astro';
import { lireTout, sheetsConfigure } from '../../lib/sheets';
import { annoter } from '../../lib/rsvp';
import { sessionOuverte } from '../../lib/admin-auth';

export const prerender = false;

const COLONNES = [
  'recue_le',
  'nom',
  'email',
  'reponse',
  'accompagnant',
  'nom_accompagnant',
  'ville',
  'pays',
  'message',
  'personnes',
  'doublon',
  'remplacee',
] as const;

/** Échappement CSV : guillemets doublés, champ toujours entre guillemets. */
const cellule = (valeur: unknown): string =>
  `"${String(valeur ?? '').replace(/"/g, '""')}"`;

export const GET: APIRoute = async ({ cookies }) => {
  if (!sessionOuverte(cookies)) {
    return new Response('Non autorisé', { status: 401 });
  }
  if (!sheetsConfigure) {
    return new Response('Google Sheets non configuré', { status: 503 });
  }

  const { rsvp } = await lireTout();
  const { lignes } = annoter(rsvp);

  const corps = lignes.map((l) =>
    [
      l.created_at,
      l.nom,
      l.email,
      l.reponse,
      l.accompagnant ? 'oui' : 'non',
      l.nom_accompagnant ?? '',
      l.ville ?? '',
      l.pays ?? '',
      l.message ?? '',
      // Compte uniquement si la réponse est positive et toujours valable.
      l.obsolete || l.reponse === 'non' ? 0 : l.accompagnant ? 2 : 1,
      l.doublon ? 'oui' : 'non',
      l.obsolete ? 'oui' : 'non',
    ]
      .map(cellule)
      .join(';'),
  );

  // Point-virgule + BOM UTF-8 : Excel en français ouvre le fichier
  // directement, sans assistant d'importation.
  const csv = '﻿' + [COLONNES.join(';'), ...corps].join('\r\n') + '\r\n';
  const jour = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="rsvp-grace-et-ouss-${jour}.csv"`,
      'cache-control': 'no-store',
    },
  });
};

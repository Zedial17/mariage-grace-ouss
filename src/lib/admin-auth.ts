/**
 * Protection de /admin par un mot de passe unique (variable
 * d'environnement ADMIN_PASSWORD).
 *
 * Le mot de passe ne transite qu'une fois, à la connexion. Ensuite un
 * cookie httpOnly porte un jeton signé en HMAC-SHA256 avec ce même mot de
 * passe : changer ADMIN_PASSWORD invalide donc toutes les sessions.
 */
import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { ADMIN_PASSWORD } from 'astro:env/server';

export const COOKIE_ADMIN = 'go_admin';

/** Durée de vie d'une session, en secondes (12 h). */
const DUREE = 12 * 60 * 60;

export const motDePasseConfigure = Boolean(ADMIN_PASSWORD);

/** Comparaison à temps constant, quelle que soit la longueur des chaînes. */
function egalite(a: string, b: string): boolean {
  const ha = Uint8Array.from(createHash('sha256').update(a).digest());
  const hb = Uint8Array.from(createHash('sha256').update(b).digest());
  return timingSafeEqual(ha, hb);
}

export function verifierMotDePasse(saisi: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  return egalite(saisi, ADMIN_PASSWORD);
}

function signature(expiration: number): string {
  return createHmac('sha256', ADMIN_PASSWORD!)
    .update(`admin:${expiration}`)
    .digest('hex');
}

function creerJeton(): string {
  const expiration = Math.floor(Date.now() / 1000) + DUREE;
  return `${expiration}.${signature(expiration)}`;
}

function jetonValide(jeton: string | undefined): boolean {
  if (!jeton || !ADMIN_PASSWORD) return false;

  const separateur = jeton.indexOf('.');
  if (separateur < 1) return false;

  const expiration = Number(jeton.slice(0, separateur));
  if (!Number.isFinite(expiration) || expiration < Date.now() / 1000) return false;

  return egalite(jeton.slice(separateur + 1), signature(expiration));
}

export function ouvrirSession(cookies: AstroCookies, secure: boolean): void {
  cookies.set(COOKIE_ADMIN, creerJeton(), {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/admin',
    maxAge: DUREE,
  });
}

export function fermerSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE_ADMIN, { path: '/admin' });
}

export function sessionOuverte(cookies: AstroCookies): boolean {
  return jetonValide(cookies.get(COOKIE_ADMIN)?.value);
}

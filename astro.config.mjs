// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

/**
 * Domaine du site, nécessaire aux URLs absolues des balises Open Graph.
 * - SITE_URL : à définir dès qu'un vrai nom de domaine est branché.
 * - Sinon, Vercel fournit l'URL de production à la compilation : l'aperçu
 *   de partage fonctionne donc sans rien configurer.
 */
const domaine =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

// https://astro.build/config
export default defineConfig({
  site: domaine,
  compressHTML: true,

  // La page reste statique ; seuls /api/* et /admin sont rendus à la demande
  // (ils déclarent `export const prerender = false`).
  adapter: vercel(),

  image: {
    // Formats modernes (AVIF/WebP) générés à la compilation par sharp.
    responsiveStyles: false,
  },

  env: {
    schema: {
      /** URL /exec de l'application web Apps Script liée au Google Sheet. */
      SHEETS_ENDPOINT: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      /** Jeton partagé avec le script : serveur uniquement. */
      SHEETS_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      /** Mot de passe de la page /admin. */
      ADMIN_PASSWORD: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        // Les fichiers référencés depuis le CSS (la texture de soie)
        // atterrissent sinon à la racine, hors du cache d'un an que Vercel
        // applique à /_astro/.
        output: { assetFileNames: '_astro/[name].[hash][extname]' },
      },
    },
  },
});

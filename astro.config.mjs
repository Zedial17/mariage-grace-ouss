// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * Site entièrement statique, hébergé sur GitHub Pages — comme le site Emma.
 *
 * - SITE_URL : l'adresse publique du site.
 * - BASE_PATH : le sous-dossier quand le site est servi depuis un dépôt
 *   de projet (https://zedial17.github.io/mariage-grace-ouss/). À vider
 *   le jour où un vrai nom de domaine est branché.
 */
const domaine = process.env.SITE_URL || 'https://zedial17.github.io';
const base = process.env.BASE_PATH ?? '/mariage-grace-ouss';

// https://astro.build/config
export default defineConfig({
  site: domaine,
  base,
  trailingSlash: 'ignore',
  compressHTML: true,

  image: {
    // Formats modernes (AVIF/WebP) générés à la compilation par sharp.
    responsiveStyles: false,
  },

  env: {
    schema: {
      /**
       * URL /exec de l'application web Apps Script.
       *
       * PUBLIC_ : elle est embarquée dans la page, donc visible de tous.
       * C'est le prix du tout-statique — le classeur n'est protégé que par
       * les contrôles du script lui-même (voir google-apps-script/Code.gs).
       */
      PUBLIC_SHEETS_ENDPOINT: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        default: '',
      }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        // Les fichiers référencés depuis le CSS (la texture de soie)
        // atterrissent sinon à la racine, hors du dossier empreinté.
        output: { assetFileNames: '_astro/[name].[hash][extname]' },
      },
    },
  },
});

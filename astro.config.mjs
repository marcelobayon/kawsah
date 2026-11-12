// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The production domain lives here AND in src/config/config.js.
// Keep them in sync (this one drives canonical URLs + the sitemap).
const SITE = 'https://www.kawsah.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  build: {
    // Emit /purchase/index.html so Netlify serves clean directory URLs.
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      // Keep utility/duplicate routes out of the sitemap.
      filter: (page) => !page.includes('/404'),
    }),
  ],
});

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://chpeptides.com',
  integrations: [
    tailwind(),
    sitemap()
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  },
  output: 'server',
  adapter: netlify({
    edgeMiddleware: true,
    functionPerRoute: false, // This ensures all routes go through a single function
    dist: './dist' // Explicitly set the dist directory
  }),
  server: {
    host: true, // This enables listening on all network interfaces
    port: 3000  // Specify a port explicitly
  },
  vite: {
    server: {
      // Prevent Vite from trying to print URLs before server is ready
      hmr: {
        clientPort: 3000
      }
    }
  }
});
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: [
    '@wxt-dev/module-vue',
    '@wxt-dev/auto-icons'
  ],
  autoIcons: {
    baseIconPath: 'assets/logo.svg',
    grayscaleOnDev: false
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  dev: {
    server: {
      port: 3001
    }
  },
  manifest: {
    version: packageJson.version,
    permissions: ["storage"],
    host_permissions: [
      "https://api.levelcast.org/*",
      "http://localhost:3000/*",
      "*://*.libreview.io/*"
    ]
  }
});

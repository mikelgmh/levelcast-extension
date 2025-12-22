import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  dev: {
    server: {
      port: 3001
    }
  },
  manifest: {
    permissions: ["storage"],
    host_permissions: [
      "https://api.levelcast.org/*",
      "http://localhost:3000/*"
    ]
  }
});

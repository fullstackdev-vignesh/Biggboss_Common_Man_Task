import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
    // DigitalOcean / PM2 / Nginx deployment
  // IMPORTANT: Build a real Node.js HTTP server,
  // not a Cloudflare Worker.
  nitro: {
    preset: "node_server",
  },
  vite: {
    base: "/bcm/",
    server: {
      host: '0.0.0.0',
      port: 8080,
      allowedHosts: [
        'adinntech.in',
        'www.adinntech.in',
        'localhost',
        '127.0.0.1',
        '.adinntech.in'
      ]
    },
    preview: {
      host: '0.0.0.0',
      port: 8080,
      allowedHosts: [
        'adinntech.in',
        'www.adinntech.in',
        'localhost',
        "127.0.0.1",
        '.adinntech.in'
      ]
    }
  }
});

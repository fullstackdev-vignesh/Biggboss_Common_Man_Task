// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Vercel sets VERCEL=1 during its build — use that to switch the Nitro preset
// between Vercel's serverless output and the DigitalOcean/PM2/Nginx node server.
const isVercel = process.env["VERCEL"] === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: isVercel ? "vercel" : "node_server",
  },
  vite: isVercel
    ? {}
    : {
        // DigitalOcean / PM2 / Nginx deployment — served under /bcm/ behind Nginx.
        base: "/bcm/",
        server: {
          host: "0.0.0.0",
          port: 8080,
          allowedHosts: [
            "adinntech.in",
            "www.adinntech.in",
            "localhost",
            "127.0.0.1",
            ".adinntech.in",
          ],
        },
        preview: {
          host: "0.0.0.0",
          port: 8080,
          allowedHosts: [
            "adinntech.in",
            "www.adinntech.in",
            "localhost",
            "127.0.0.1",
            ".adinntech.in",
          ],
        },
      },
});

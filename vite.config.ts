import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

// Same rendering mode as the app where the bug was found: SSR with
// hydration in dev, so the server render and the client hydration pass
// must agree on hydration ids.
export default defineConfig({
  plugins: [solid({ start: true, ssr: true })],
  resolve: {
    alias: [
      // md-* Lit elements stay inert in this repro
      { find: /^@material\/web\/.*$/, replacement: fileURLToPath(new URL("./src/stubs/material-web.ts", import.meta.url)) },
      // the svg icon components the rail's menu button imports
      { find: /^@solidmaterial\/icons\/400\/outlined\/menu\.svg$/, replacement: fileURLToPath(new URL("./src/stubs/menu-icon.tsx", import.meta.url)) },
      { find: /^@solidmaterial\/icons\/400\/outlined\/menu_open\.svg$/, replacement: fileURLToPath(new URL("./src/stubs/menu-open-icon.tsx", import.meta.url)) },
    ],
  },
});

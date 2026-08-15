// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
// output: "server" enables SSR — required for /signin and /auth/callback
// which run server-side to handle OAuth flows securely.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
});
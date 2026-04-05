import { defineConfig } from "vite";

export default defineConfig({
  base: '/english/',
  server: {
    open: true,
    port: 3000,
  },
  build: {
    outDir: "dist",
  },
});

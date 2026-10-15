import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    cssCodeSplit: true,
    rollupOptions: {
      // Three.js is shipped as a pre-built, minified ESM asset in public/vendor/three
      // (generated with `npm run vendor:three`). Keeping it out of the app bundle
      // keeps the bundler fast and the app chunk small.
      external: ["three"],
      output: {
        paths: {
          three: "/vendor/three/three.module.js",
        },
      },
    },
  },
});

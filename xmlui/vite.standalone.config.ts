import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { rawScssModulePlugin } from "./src/vite-plugin/rawScssModulePlugin";
import { svgReactPlugin } from "./src/vite-plugin/svgReactPlugin";

export default defineConfig({
  plugins: [rawScssModulePlugin(), svgReactPlugin(), react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist/standalone",
    emptyOutDir: true,
    lib: {
      entry: "src/standalone/index.ts",
      name: "xmlui",
      formats: ["iife"],
      fileName: () => "xmlui-latest.js",
    },
  },
});

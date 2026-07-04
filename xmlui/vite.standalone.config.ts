import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

import { rawScssModulePlugin } from "./src/vite-plugin/rawScssModulePlugin";
import { svgReactPlugin } from "./src/vite-plugin/svgReactPlugin";

export default defineConfig({
  resolve: {
    alias: {
      "attr-accept": path.resolve("src/compat/attrAccept.ts"),
      papaparse: path.resolve("src/compat/papaParse.ts"),
    },
  },
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

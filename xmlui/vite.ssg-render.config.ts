import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import counterBadgeExtension from "../packages/xmlui-counter-badge/src";

import { rawScssModulePlugin } from "./src/vite-plugin/rawScssModulePlugin";
import { svgReactPlugin } from "./src/vite-plugin/svgReactPlugin";
import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";

export default defineConfig({
  resolve: {
    alias: {
      "attr-accept": path.resolve("src/compat/attrAccept.ts"),
      papaparse: path.resolve("src/compat/papaParse.ts"),
    },
  },
  plugins: [
    rawScssModulePlugin(),
    svgReactPlugin(),
    xmluiPlugin({ extensions: [counterBadgeExtension] }),
    react(),
  ],
  build: {
    ssr: true,
    outDir: ".xmlui-ssg-ssr",
    emptyOutDir: true,
    rolldownOptions: {
      input: path.resolve("src/ssg/renderEntry.tsx"),
      output: {
        entryFileNames: "render.mjs",
        chunkFileNames: "chunks/[name].[hash].mjs",
      },
    },
  },
});

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import counterBadgeExtension from "../packages/xmlui-counter-badge/src";

import { exampleApiMocksPlugin } from "./src/vite-plugin/exampleApiMocks";
import { rawScssModulePlugin } from "./src/vite-plugin/rawScssModulePlugin";
import { svgReactPlugin } from "./src/vite-plugin/svgReactPlugin";
import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";

export default defineConfig({
  resolve: {
    alias: {
      invariant: fileURLToPath(new URL("./src/compat/invariant.ts", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["if-function"],
      },
    },
  },
  plugins: [
    rawScssModulePlugin(),
    svgReactPlugin(),
    exampleApiMocksPlugin(),
    xmluiPlugin({ extensions: [counterBadgeExtension] }),
    react(),
  ],
});

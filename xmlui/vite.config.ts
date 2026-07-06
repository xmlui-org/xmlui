import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import counterBadgeExtension from "../packages/xmlui-counter-badge/src";

import { exampleApiMocksPlugin } from "./src/vite-plugin/exampleApiMocks";
import { rawScssModulePlugin } from "./src/vite-plugin/rawScssModulePlugin";
import { svgReactPlugin } from "./src/vite-plugin/svgReactPlugin";
import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";
import { createXmluiLogger, xmluiCssOptions } from "./vite.shared";

export default defineConfig({
  customLogger: createXmluiLogger(),
  resolve: {
    alias: {
      "attr-accept": fileURLToPath(new URL("./src/compat/attrAccept.ts", import.meta.url)),
      invariant: fileURLToPath(new URL("./src/compat/invariant.ts", import.meta.url)),
      papaparse: fileURLToPath(new URL("./src/compat/papaParse.ts", import.meta.url)),
      "react-qr-code": fileURLToPath(new URL("./src/compat/reactQrCode.tsx", import.meta.url)),
    },
  },
  css: xmluiCssOptions,
  plugins: [
    rawScssModulePlugin(),
    svgReactPlugin(),
    exampleApiMocksPlugin(),
    xmluiPlugin({ extensions: [counterBadgeExtension] }),
    react(),
  ],
});

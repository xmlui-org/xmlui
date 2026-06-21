import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import counterBadgeExtension from "../packages/xmlui-counter-badge/src";

import { exampleApiMocksPlugin } from "./src/vite-plugin/exampleApiMocks";
import { rawScssModulePlugin } from "./src/vite-plugin/rawScssModulePlugin";
import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";

export default defineConfig({
  plugins: [
    rawScssModulePlugin(),
    exampleApiMocksPlugin(),
    xmluiPlugin({ extensions: [counterBadgeExtension] }),
    react(),
  ],
});

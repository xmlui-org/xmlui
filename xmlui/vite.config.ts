import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import counterBadgeExtension from "../packages/xmlui-counter-badge/src";

import { exampleApiMocksPlugin } from "./src/vite-plugin/exampleApiMocks";
import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";

export default defineConfig({
  plugins: [exampleApiMocksPlugin(), xmluiPlugin({ extensions: [counterBadgeExtension] }), react()],
});

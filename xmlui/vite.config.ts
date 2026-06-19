import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { exampleApiMocksPlugin } from "./src/vite-plugin/exampleApiMocks";
import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";

export default defineConfig({
  plugins: [exampleApiMocksPlugin(), xmluiPlugin(), react()],
});

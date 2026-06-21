import { defineConfig } from "vitest/config";

import { rawScssModulePlugin } from "../../xmlui/src/vite-plugin/rawScssModulePlugin";

export default defineConfig({
  plugins: [rawScssModulePlugin()],
});

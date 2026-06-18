import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";

export default defineConfig({
  plugins: [xmluiPlugin(), react()],
});

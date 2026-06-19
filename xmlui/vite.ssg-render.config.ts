import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";

export default defineConfig({
  plugins: [xmluiPlugin(), react()],
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


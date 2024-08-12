import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import dts from "vite-plugin-dts";
import * as packageJson from "./package.json";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@components-core": path.resolve(__dirname, "./src/components-core"),
      "@abstractions": path.resolve(__dirname, "./src/abstractions"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@parsers": path.resolve(__dirname, "./src/parsers"),
    },
  },
  esbuild: {
    target: "es2020",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
  build: {
    outDir: "dist",
    lib: {
      entry: [path.resolve("src", "index.ts")],
      name: "xmlui",
      fileName: (format) => `xmlui.${format}.js`,
    },
    rollupOptions: {
      external: [
        //...Object.keys(packageJson.dependencies),
        // ...Object.keys(packageJson.peerDependencies)
      ],
    },
  },
  plugins: [react(), svgr(), ViteYaml(), libInjectCss(), dts({ rollupTypes: true })],
});

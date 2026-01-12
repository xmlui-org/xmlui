import { defineConfig } from "tsdown";

export default defineConfig([
  // Binary build
  {
    external: ["vite", "tsx"],
    entry: "bin/index.ts",
    outDir: "dist/bin",
    format: ["esm", "commonjs"],
    shims: true,
  },
  // Vite plugin build
  {
    entry: "bin/vite-xmlui-plugin.ts",
    outDir: "dist/for-node",
    format: ["esm", "commonjs"],
    shims: true,
    dts: true,
    clean: false,
  },
]);

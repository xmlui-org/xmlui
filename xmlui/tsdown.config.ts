import { defineConfig } from "tsdown";

export default defineConfig([
  // Binary build
  {
    name: "xmlui-node-cli",
    external: ["vite", "tsx"],
    entry: "bin/index.ts",
    outDir: "dist/bin",
    format: ["esm", "commonjs"],
    shims: true,
    clean: false,
  },
  // Vite plugin build
  {
    name: "vite-xmlui-plugin",
    entry: "bin/vite-xmlui-plugin.ts",
    outDir: "dist/for-node",
    format: ["esm", "commonjs"],
    shims: true,
    dts: true,
    clean: false,
  },
  {
    name: "language-server",
    entry: "src/language-server/server.ts",
    outDir: "dist/for-node",
    format: ["esm", "commonjs"],
    shims: true,
    dts: true,
    clean: false,
  },
]);

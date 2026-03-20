import { defineConfig } from "tsdown";

export default defineConfig([
  // Binary build
  {
    name: "xmlui bin",
    deps: {
      neverBundle: ["vite", "tsx"],
    },
    entry: "src/nodejs/bin/index.ts",
    outDir: "dist/nodejs/bin",
    format: ["esm"],
    shims: true,
    clean: false,
  },
  // Vite plugin build
  {
    name: "vite-xmlui-plugin",
    entry: "src/nodejs/vite-xmlui-plugin.ts",
    outDir: "dist/nodejs",
    format: ["esm", "commonjs"],
    shims: true,
    dts: true,
    clean: false,
  },
  {
    name: "xmlui-node",
    entry: "src/nodejs/index.ts",
    outDir: "dist/nodejs",
    format: ["esm", "commonjs"],
    shims: true,
    dts: true,
    clean: false,
  },
  {
    name: "language-server",
    entry: "src/language-server/server.ts",
    outDir: "dist/nodejs",
    format: ["esm", "commonjs"],
    shims: true,
    dts: true,
    clean: false,
  },
]);

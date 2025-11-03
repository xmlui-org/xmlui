import { defineConfig } from "tsdown";

export default defineConfig({
  external: ["vite"],
  entry: "bin/index.ts",
  outDir: "dist/bin",
  format: ["esm", "commonjs"],
  shims: true,
});

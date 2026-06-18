const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    platform: "node",
    target: "node18",
    outfile: "dist/extension.cjs",
    external: ["vscode"],
    minify: true,
    sourcemap: false,
    logLevel: "info",
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

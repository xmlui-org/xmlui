const esbuild = require("esbuild");
const fs = require("node:fs/promises");
const path = require("node:path");

const rawScssThemeVarsPlugin = {
  name: "xmlui-rs:raw-scss-theme-vars",
  setup(build) {
    build.onResolve({ filter: /\.module\.scss\?xmlui-theme-vars$/ }, (args) => ({
      path: path.resolve(args.resolveDir, args.path.replace("?xmlui-theme-vars", "")),
      namespace: "xmlui-theme-vars",
    }));
    build.onLoad({ filter: /.*/, namespace: "xmlui-theme-vars" }, async (args) => ({
      contents: `export default ${JSON.stringify(await fs.readFile(args.path, "utf8"))};`,
      loader: "js",
    }));
  },
};

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
    plugins: [rawScssThemeVarsPlugin],
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

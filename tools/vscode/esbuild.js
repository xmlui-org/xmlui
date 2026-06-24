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

const scssModuleStubPlugin = {
  name: "xmlui-rs:scss-module-stub",
  setup(build) {
    build.onResolve({ filter: /\.module\.scss$/ }, (args) => ({
      path: path.resolve(args.resolveDir, args.path),
      namespace: "xmlui-scss-module",
    }));
    build.onLoad({ filter: /.*/, namespace: "xmlui-scss-module" }, async (args) => {
      const source = await fs.readFile(args.path, "utf8");
      const classNames = Array.from(new Set(
        Array.from(source.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g), (match) => match[1]),
      )).sort();
      const classes = Object.fromEntries(classNames.map((className) => [className, className]));
      return {
        contents: `export default ${JSON.stringify(classes)};`,
        loader: "js",
      };
    });
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
    plugins: [rawScssThemeVarsPlugin, scssModuleStubPlugin],
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

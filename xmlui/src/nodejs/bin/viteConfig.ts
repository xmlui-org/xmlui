import { createLogger, defineConfig } from "vite";
import type { UserConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { default as ViteYaml } from "@modyfi/vite-plugin-yaml";
import { default as ViteXmlui } from "../vite-xmlui-plugin";
import * as path from "path";
import { CSS_LAYER_ORDER } from "../../components-core/cssLayers";

type ViteConfigData = {
  flatDist?: boolean;
  withRelativeRoot?: boolean;
  flatDistUiPrefix?: string;
};

const logger = createLogger();
const loggerWarn = logger.warn;

logger.warn = (msg, options) => {
  // TODO: we ignore the remix HMR warnings, because we do not use the remix vite plugin. Revisit after updating to react-router@7
  if (msg.includes('Failed to resolve "remix:manifest"')) return;
  loggerWarn(msg, options);
};

/**
 * Defence-in-depth: ensures the canonical CSS `@layer` cascade order is
 * established before any other stylesheet is parsed by the browser.
 *
 * The original cause of the inverted cascade (a stray per-module CSS chunk
 * emitted because `metadata-helpers.ts` transitively imported a `.tsx`
 * component that imported a `.module.scss`) is fixed at the source by the
 * `xmlui/scripts/check-metadata-purity.mjs` guard. This plugin remains in
 * place to protect against:
 *
 *   1. Future changes that reintroduce multi-chunk CSS via a new accidental
 *      import path that escapes the source-graph guard.
 *   2. Library consumers that load our emitted `.css` assets directly
 *      without going through an xmlui-controlled `index.html`.
 *
 * The plugin both:
 *   1. Injects an inline <style> block with the layer-order declaration as the
 *      very first element of <head> (transformIndexHtml).
 *   2. Prepends the same declaration to every emitted CSS asset, so it remains
 *      effective in builds that don't go through index.html (e.g. lib/UMD).
 *
 * See `xmlui/dev-docs/plans/css-layer-order-rootcause.md`.
 */
function cssLayerOrderPlugin(): Plugin {
  return {
    name: "xmlui:css-layer-order",
    enforce: "post",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const tag = `<style>${CSS_LAYER_ORDER}</style>`;
        if (html.includes(tag)) return html;
        return html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n    ${tag}`);
      },
    },
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "asset" && file.fileName.endsWith(".css")) {
          const source = typeof file.source === "string"
            ? file.source
            : new TextDecoder().decode(file.source);
          if (!source.startsWith(CSS_LAYER_ORDER)) {
            file.source = `${CSS_LAYER_ORDER}\n${source}`;
          }
        }
      }
    },
  };
}

export async function getViteConfig({
  flatDist = false,
  withRelativeRoot = false,
  flatDistUiPrefix = "",
}: ViteConfigData = {}) {
  //TODO finish this (merge smart)
  let overrides: UserConfig = {};
  try {
    const configOverrides = await import(process.cwd() + `/vite.config-overrides`);
    overrides = configOverrides.default || {};
  } catch (e) {
    // console.error(e);
  }

  // Single instance shared by the main pipeline and the dep-scanner pipeline.
  // The dep scanner runs a separate Rolldown build that only sees plugins
  // listed under `optimizeDeps.rolldownOptions.plugins`. Without this, .xmlui
  // files reached via `import.meta.glob('/src/**')` are not transformed by the
  // xmlui plugin during scanning and Rolldown's parser fails on the XML markup.
  const xmluiPlugin = ViteXmlui({}) as Plugin;

  return defineConfig({
    plugins: [
      react(),
      svgr(),
      ViteYaml(),
      xmluiPlugin,
      cssLayerOrderPlugin(),
      ...(overrides.plugins || []),
    ] as Plugin[],
    customLogger: logger,
    base: withRelativeRoot ? "" : undefined,
    // experimental: {
    //   renderBuiltUrl: (filename, {type, hostType, hostId}) =>{
    //     if (type === 'asset') {
    //       // return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
    //       return 'https://static.themohoz.com/xmlui/v0.31/' + filename
    //     } else {
    //       return { relative: true }
    //     }
    //   }
    // },
    define: overrides.define,
    resolve: {
      alias: overrides.resolve?.alias,
      extensions: [
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".json",
        ".xmlui",
        ".xmlui.xs",
        ".xs",
        ...(overrides.resolve?.extensions || []),
      ],
    },
    css: {
      ...overrides.css,
      preprocessorOptions: {
        ...overrides.css?.preprocessorOptions,
        scss: {
          ...overrides.css?.preprocessorOptions?.scss,
          silenceDeprecations: ["import", "global-builtin", "new-global"],
        },
      },
    },
    optimizeDeps: {
      extensions: [".xmlui", ".xmlui.xs", ".xs"],
      rolldownOptions: {
        // Run the xmlui transform inside the dep-scanner's Rolldown pipeline.
        // The scanner does NOT inherit the main `plugins` list, so without this
        // it would try to parse raw XML markup as JS/JSX and fail.
        plugins: [xmluiPlugin],
        // Tell Rolldown's dep scanner to treat these extensions as JS modules.
        // Without this, Rolldown auto-detects the content type of .xmlui files,
        // sees XML opening tags like <Theme and incorrectly classifies them as JSX,
        // which then fails to parse because JSX is not enabled for these extensions.
        // Setting moduleTypes bypasses content detection and ensures the Vite plugin
        // transform hook runs first, converting XML → dataToEsm JS before parsing.
        moduleTypes: {
          ".xmlui": "js",
          ".xs": "js",
        },
      },
      ...overrides.optimizeDeps,
    },
    build: {
      rolldownOptions: {
        input: path.resolve(process.cwd(), "index.html"),
        output: {
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name?.split(".").pop();
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType!)) {
              return flatDist
                ? `${flatDistUiPrefix}internal_img_[name].[hash][extname]`
                : `internal/img/[name].[hash][extname]`;
            }
            if (assetInfo.name === "index.css") {
              return flatDist
                ? `${flatDistUiPrefix}internal_[name].[hash][extname]`
                : `internal/[name].[hash][extname]`;
            }
            return flatDist
              ? `${flatDistUiPrefix}internal_chunks_[name].[hash][extname]`
              : `internal/chunks/[name].[hash][extname]`;
          },
          chunkFileNames: flatDist
            ? `${flatDistUiPrefix}internal_chunks_[name].[hash].js`
            : "internal/chunks/[name].[hash].js",
          entryFileNames: flatDist
            ? `${flatDistUiPrefix}internal_[name].[hash].js`
            : "internal/[name].[hash].js",
        },
        // treeshake: {
        //   preset: "recommended",
        //   moduleSideEffects: (id: string, external: boolean)=>{
        //     if(id.includes(path.resolve(process.cwd(), 'index.html'))){   //otherwise tree shaking doesn't work
        //       return true;
        //     }
        //     if(id.includes(path.resolve(process.cwd(), "src", 'main.tsx'))){   //otherwise tree shaking doesn't work
        //       return true;
        //     }
        //     return false;
        //   }
        // }
        //   assetFileNames: (assetInfo) => {
        //     let extType = assetInfo.name?.split(".").pop();
        //     if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType!)) {
        //       return `img/[name][extname]`;
        //     }
        //     if (assetInfo.name === "index.css") {
        //       return `[name][extname]`;
        //     }
        //     return `chunks/[name][extname]`;
        //   },
        //   chunkFileNames: "chunks/[name].js",
        //   entryFileNames: "[name].js",
        // },
      },
    },
  });
}

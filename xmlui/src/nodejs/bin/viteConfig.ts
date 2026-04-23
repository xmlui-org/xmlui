import { createLogger, defineConfig } from "vite";
import type { UserConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { default as ViteYaml } from "@modyfi/vite-plugin-yaml";
import { default as ViteXmlui } from "../vite-xmlui-plugin";
import * as path from "path";

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

const CSS_LAYER_ORDER = "@layer reset, base, components, themes, dynamic;";

/**
 * Ensures the canonical CSS @layer cascade order is established before any other
 * stylesheet is parsed by the browser. Vite 8 / Rolldown can split CSS into
 * per-module chunks (e.g. one whose only content is `@layer components { ... }`)
 * and may emit them with `<link>` tags that load before the main entry CSS.
 * Without this guard the browser would derive the layer order from those chunks
 * and end up with `components` ranked LOWER than `base`, inverting the cascade
 * (the CSS reset would then beat component styles, leaving every Button etc.
 * with `background-color: rgba(0,0,0,0)`).
 *
 * The plugin both:
 *   1. Injects an inline <style> block with the layer-order declaration as the
 *      very first element of <head> (transformIndexHtml).
 *   2. Prepends the same declaration to every emitted CSS asset, so it remains
 *      effective in builds that don't go through index.html (e.g. lib/UMD).
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

  return defineConfig({
    plugins: [
      react(),
      svgr(),
      ViteYaml(),
      ViteXmlui({}) as Plugin,
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

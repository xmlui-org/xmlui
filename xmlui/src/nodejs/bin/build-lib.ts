#!/usr/bin/env node

import type { Plugin } from "vite";
import { build as viteBuild, defineConfig, loadEnv, type UserConfig } from "vite";
// @ts-ignore
import path from "path";
import react from "@vitejs/plugin-react";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { default as ViteXmlui } from "../vite-xmlui-plugin";

export const buildLib = async ({
  watchMode,
  mode = "production",
}: {
  watchMode?: boolean;
  mode?: string;
}) => {
  const env = loadEnv(mode, process.cwd(), "");

  const umdFileName = `${env.npm_package_name}.js`;
  const esFileName = `${env.npm_package_name}.mjs`;

  let overrides: UserConfig = {};
  try {
    const configOverrides = await import(process.cwd() + `/vite.config-overrides`);
    overrides = configOverrides.default || {};
  } catch (e) {
    // console.error(e);
  }

  const config: UserConfig = {
    customLogger: overrides.customLogger,
    resolve: {
      extensions: [".js", ".ts", ".jsx", ".tsx", ".json", ".xmlui", ".xmlui.xs", ".xs"],
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
      "import.meta.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
    },
    build: {
      emptyOutDir: false,
      outDir: "dist",
      watch: watchMode ? {} : undefined,
      sourcemap: watchMode ? "inline" : false,
      lib:
        mode === "metadata"
          ? {
              entry: [path.resolve("meta", "componentsMetadata.ts")],
              name: `${env.npm_package_name}-metadata`,
              fileName: `${env.npm_package_name}-metadata`,
            }
          : {
              entry: [path.resolve("src", "index.tsx")],
              formats: watchMode ? ["es"] : ["umd", "es"],
              name: env.npm_package_name,
              fileName: (format) => (format === "es" ? esFileName : umdFileName),
            },
      rolldownOptions: {
        treeshake: mode === "metadata" ? true : undefined,
        external: mode === "metadata" ? [] : ["react", "react-dom", "xmlui", "react/jsx-runtime"],
        output: {
          footer: (chunk) => {
            if (chunk.name === "index" && chunk.fileName === umdFileName) {
              return `if(typeof window.xmlui !== "undefined"){window.xmlui.standalone.registerExtension(window['${env.npm_package_name}'].default || window['${env.npm_package_name}']);}`;
            }
            return "";
          },
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "jsxRuntime",
          },
        },
      },
    },
    plugins: (mode === "metadata"
      ? [ViteXmlui({})]
      : [react(), ViteXmlui({}), libInjectCss(), ...(overrides.plugins || [])]) as Plugin[],
  };

  await viteBuild(defineConfig(config));
};

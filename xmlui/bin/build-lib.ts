#!/usr/bin/env node

import { defineConfig, InlineConfig } from "vite";
import { loadEnv } from "vite";
import { build as viteBuild } from "vite";
// @ts-ignore
import path from "path";
import react from "@vitejs/plugin-react";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export const buildLib = async ({}) => {
  const env = loadEnv("production", process.cwd(), "");

  const umdFileName = `${env.npm_package_name}.js`;
  const esFileName = `${env.npm_package_name}.mjs`;
  await viteBuild(defineConfig({
    esbuild: {
      target: "es2020",
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "es2020",
      },
    },
    define: {
      "process.env": {
        NODE_ENV: env.NODE_ENV
      },
    },
    build: {
      lib: {
        entry: [path.resolve("src", "index.tsx")],
        formats: ["umd", "es"],
        name: env.npm_package_name,
        fileName: (format) => format === 'es' ? esFileName : umdFileName
      },
      rollupOptions: {
        external: ["react", "react-dom", "xmlui", "react/jsx-runtime"],
        output: {
          footer: (chunk)=>{
            if(chunk.name === "index" && chunk.fileName === umdFileName){
              return `if(typeof window.xmlui !== "undefined"){window.xmlui.registerComponent(window['${env.npm_package_name}']);}`
            }
          },
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "jsxRuntime",
          },
        },
      },
    },
    plugins: [react(), libInjectCss()],
  }));
};

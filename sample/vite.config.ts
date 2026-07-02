import react from "@vitejs/plugin-react";
import { pathToFileURL } from "node:url";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

import { rawScssModulePlugin } from "../xmlui/src/vite-plugin/rawScssModulePlugin";

const XMLUI_RE = /\.xmlui$/;
const compilerPath = new URL("../xmlui/src/compiler/compileXmluiModule.ts", import.meta.url).pathname;

function sampleXmluiPlugin(): Plugin {
  let devServer: ViteDevServer | undefined;
  return {
    name: "xmlui-rs:sample-xmlui",
    enforce: "pre",
    configureServer(server) {
      devServer = server;
    },
    async transform(source, id) {
      if (!XMLUI_RE.test(id)) {
        return null;
      }

      const { compileXmluiModuleWithSourceMap } = devServer
        ? await devServer.ssrLoadModule(`/@fs${compilerPath}`)
        : await import(pathToFileURL(compilerPath).href);
      const compiled = compileXmluiModuleWithSourceMap({ id, source });
      return {
        code: compiled.code,
        map: compiled.map,
      };
    },
  };
}

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["if-function"],
      },
    },
  },
  plugins: [rawScssModulePlugin(), sampleXmluiPlugin(), react()],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json", ".xmlui"],
  },
  optimizeDeps: {
    include: ["classnames", "react", "react-dom", "react-dom/client"],
    noDiscovery: true,
  },
});

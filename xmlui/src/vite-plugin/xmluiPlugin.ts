import type { Plugin, ViteDevServer } from "vite";
import type { XmluiComponentContract } from "../compiler/contracts/types";
import { fileURLToPath, pathToFileURL } from "node:url";

const XMLUI_RE = /\.xmlui$/;
const compilerModulePath = fileURLToPath(new URL("../compiler/compileXmluiModule.ts", import.meta.url));

export type XmluiPluginOptions = {
  extensions?: Iterable<any>;
  extensionComponents?: Iterable<XmluiComponentContract>;
};

export function xmluiPlugin(options: XmluiPluginOptions = {}): Plugin {
  let devServer: ViteDevServer | undefined;
  return {
    name: "xmlui-rs:xmlui",
    enforce: "pre",
    configureServer(server) {
      devServer = server;
    },
    async transform(source, id) {
      if (!XMLUI_RE.test(id)) {
        return null;
      }
      if (isPackageXmlui(id)) {
        if (/^\s*export\s+default\s+/.test(source)) {
          return null;
        }
        return {
          code: `export default ${JSON.stringify(source)};`,
          map: null,
        };
      }

      const { compileXmluiModuleWithSourceMap } = devServer
        ? await devServer.ssrLoadModule(compilerModulePath)
        : await import(pathToFileURL(compilerModulePath).href);
      const compiled = compileXmluiModuleWithSourceMap({
        id,
        source,
        extensions: options.extensions as any,
        extensionComponents: options.extensionComponents,
      });
      return {
        code: compiled.code,
        map: compiled.map,
      };
    },
  };
}

function isPackageXmlui(id: string): boolean {
  const normalized = id.replaceAll("\\", "/");
  return normalized.includes("/packages/") || normalized.includes("/node_modules/");
}

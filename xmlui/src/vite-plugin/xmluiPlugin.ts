import type { Plugin } from "vite";
import type { XmluiComponentContract } from "../compiler/contracts";

const XMLUI_RE = /\.xmlui$/;

export type XmluiPluginOptions = {
  extensions?: Iterable<any>;
  extensionComponents?: Iterable<XmluiComponentContract>;
};

export function xmluiPlugin(options: XmluiPluginOptions = {}): Plugin {
  return {
    name: "xmlui-rs:xmlui",
    enforce: "pre",
    async transform(source, id) {
      if (!XMLUI_RE.test(id)) {
        return null;
      }
      if (isExternalPackageXmlui(id)) {
        return {
          code: `export default ${JSON.stringify(source)};`,
          map: null,
        };
      }

      const { compileXmluiModuleWithSourceMap } = await import("../compiler/compileXmluiModule");
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

function isExternalPackageXmlui(id: string): boolean {
  const normalized = id.replaceAll("\\", "/");
  const cwd = process.cwd().replaceAll("\\", "/");
  return !normalized.startsWith(`${cwd}/`) && (
    normalized.includes("/packages/") ||
    normalized.includes("/node_modules/")
  );
}

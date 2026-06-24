import type { Plugin } from "vite";

const XMLUI_RE = /\.xmlui$/;

export type XmluiPluginOptions = {
  extensions?: Iterable<any>;
};

export function xmluiPlugin(options: XmluiPluginOptions = {}): Plugin {
  return {
    name: "xmlui-rs:xmlui",
    enforce: "pre",
    async transform(source, id) {
      if (!XMLUI_RE.test(id)) {
        return null;
      }

      const { compileXmluiModuleWithSourceMap } = await import("../compiler/compileXmluiModule");
      const compiled = compileXmluiModuleWithSourceMap({
        id,
        source,
        extensions: options.extensions as any,
      });
      return {
        code: compiled.code,
        map: compiled.map,
      };
    },
  };
}

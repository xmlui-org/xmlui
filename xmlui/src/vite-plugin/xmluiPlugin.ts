import type { Plugin } from "vite";

import { compileXmluiModule } from "../compiler/compileXmluiModule";
import type { Extension } from "../extensions";

const XMLUI_RE = /\.xmlui$/;

export type XmluiPluginOptions = {
  extensions?: Iterable<Extension>;
};

export function xmluiPlugin(options: XmluiPluginOptions = {}): Plugin {
  return {
    name: "xmlui-rs:xmlui",
    enforce: "pre",
    transform(source, id) {
      if (!XMLUI_RE.test(id)) {
        return null;
      }

      return {
        code: compileXmluiModule({ id, source, extensions: options.extensions }),
        map: { mappings: "" },
      };
    },
  };
}

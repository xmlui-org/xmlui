import type { Plugin } from "vite";

import { compileXmluiModule } from "../compiler/compileXmluiModule";

const XMLUI_RE = /\.xmlui$/;

export function xmluiPlugin(): Plugin {
  return {
    name: "xmlui-rs:xmlui",
    enforce: "pre",
    transform(source, id) {
      if (!XMLUI_RE.test(id)) {
        return null;
      }

      return {
        code: compileXmluiModule({ id, source }),
        map: { mappings: "" },
      };
    },
  };
}

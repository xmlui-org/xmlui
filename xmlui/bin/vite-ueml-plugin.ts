import { dataToEsm } from "@rollup/pluginutils";
import type { Plugin } from "vite";
import { collectCodeBehindFromSource, removeCodeBehindTokensFromTree } from "../src/parsers/scripting/code-behind-collect";
import { codeBehindFileExtension, componentFileExtension, moduleFileExtension } from "../src/parsers/xmlui-parser/fileExtensions";
import { Parser } from "../src/parsers/scripting/Parser";
import * as fs from "fs";
import * as path from "path";
import { componentFromXmlUiMarkup } from "../src/components-core/xmlui-parser";

export type PluginOptions = {
  withLegacyParser?: boolean;
};

const xmluiExtension = new RegExp(`.${componentFileExtension}$`);
const xmluiScriptExtension = new RegExp(`.${codeBehindFileExtension}$`);
const moduleScriptExtension = new RegExp(`.${moduleFileExtension}$`);

/**
 * Transform UEML files to JS objects.
 */
export default function viteUemlPlugin(pluginOptions: PluginOptions = {}): Plugin {
  let itemIndex = 0;
  return {
    name: "vite:transform-ueml",

    async transform(code: string, id: string, options) {
      const moduleResolver = (parentModule: string, moduleName: string) => {
        // --- Try with .xmlui.xs extension, and then with .xs.
        try {
          const modulePath = path.resolve(path.dirname(id), `${moduleName}.${codeBehindFileExtension}`);
          return fs.readFileSync(modulePath, {
            encoding: "utf8",
          });
        } catch {
          try {
            return fs.readFileSync(path.resolve(path.dirname(id), `${moduleName}.${moduleFileExtension}`), {
              encoding: "utf8",
            });
          } catch (err) {
            throw err;
          }
        }
      };

      if (xmluiExtension.test(id)) {
        const fileId = "" + itemIndex++;
        const file = {
          component: componentFromXmlUiMarkup(code, fileId, moduleResolver),
          src: code,
          file: fileId,
        }

        return {
          code: dataToEsm(file),
          map: { mappings: "" },
        };
      }

      if (xmluiScriptExtension.test(id) || moduleScriptExtension.test(id)) {
        // --- We parse the module file to catch parsing errors
        const parser = new Parser(code);
        parser.parseStatements();

        const codeBehind = collectCodeBehindFromSource("Main", code, moduleResolver);
        removeCodeBehindTokensFromTree(codeBehind);

        // TODO: Add error handling.
        // Check, if codeBehind.moduleErrors is not empty (Record<string, ModuleErrors[]>); each module
        // should be checked for errors and warnings. If there are errors, throw an error.

        return {
          code: dataToEsm(codeBehind),
          map: { mappings: "" },
        };
      }
      return null;
    },
    // async generateBundle(opts, bundle, isWrite){
    //   console.log('generate bundle', opts);
    // }
  };
}


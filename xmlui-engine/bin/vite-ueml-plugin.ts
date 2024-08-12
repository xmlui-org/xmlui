import { dataToEsm } from "@rollup/pluginutils";
import type { Plugin } from "vite";
import { collectCodeBehindFromSource, removeCodeBehindTokensFromTree } from "../src/parsers/scripting/code-behind-collect";
import { codeBehindFileExtension, componentFileExtension, moduleFileExtension } from "../src/parsers/ueml/fileExtensions";
import { createEvalContext } from "../src/components-core/script-runner/BindingTreeEvaluationContext";
import { Parser } from "../src/parsers/scripting/Parser";
import * as fs from "fs";
import * as path from "path";
import { parseXmlUiMarkup } from "../src/components-core/xmlui-parser";

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
  return {
    name: "vite:transform-ueml",

    // async resolveId(source, importer, options){
    //   console.log('resolveId', source, importer, options);
    //   return null;
    // },
    // async load(id, options){
    //   if (xmluiScriptExtension.test(id)) {
    //     console.log('load ', id, options);
    //   }
    //   return null;
    // },

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
        const componentDef = parseXmlUiMarkup(code, moduleResolver, pluginOptions.withLegacyParser);

        return {
          code: dataToEsm(componentDef),
          map: { mappings: "" },
        };
      }

      if (xmluiScriptExtension.test(id) || moduleScriptExtension.test(id)) {
        // --- We parse the module file to catch parsing errors
        const parser = new Parser(code);
        parser.parseStatements();

        let evalContext = createEvalContext({});
        let codeBehind = collectCodeBehindFromSource("Main", code, moduleResolver, evalContext);
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


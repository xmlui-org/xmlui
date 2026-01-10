import { dataToEsm } from "@rollup/pluginutils";
import type { Plugin } from "vite";
import MagicString from "magic-string";
import {
  collectCodeBehindFromSource,
  removeCodeBehindTokensFromTree,
} from "../src/parsers/scripting/code-behind-collect";
import {
  codeBehindFileExtension,
  componentFileExtension,
  moduleFileExtension,
} from "../src/parsers/xmlui-parser/fileExtensions";
import { Parser } from "../src/parsers/scripting/Parser";
import * as path from "path";
import { errReportComponent, xmlUiMarkupToComponent } from "../src/components-core/xmlui-parser";

export type PluginOptions = {
  // --- Add plugin options here.
};

const xmluiExtension = new RegExp(`.${componentFileExtension}$`);
const xmluiScriptExtension = new RegExp(`.${codeBehindFileExtension}$`);
const moduleScriptExtension = new RegExp(`.${moduleFileExtension}$`);

function toEsmWithSourceMap(sourceCode: string, id: string, data: unknown) {
  const esm = dataToEsm(data);
  const magic = new MagicString(sourceCode);
  magic.overwrite(0, sourceCode.length, esm);
  const map = magic.generateMap({ hires: true, source: id, includeContent: true });
  map.sources = [id];
  map.sourcesContent = [sourceCode];
  map.file = id;
  return {
    code: magic.toString(),
    map,
  };
}

/**
 * Transform XMLUI files to JS objects.
 */
export default function viteXmluiPlugin(pluginOptions: PluginOptions = {}): Plugin {
  let itemIndex = 0;
  return {
    name: "vite:transform-xmlui",

    async transform(code: string, id: string, options) {
      const moduleNameResolver = (moduleName: string) => {
        return path.resolve(path.dirname(id), moduleName);
      };

      if (xmluiExtension.test(id)) {
        const fileId = "" + itemIndex++;
        let { component, errors, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
          code,
          fileId,
        );
        if (errors.length > 0) {
          component = errReportComponent(errors, id, erroneousCompoundComponentName);
        }
        const file = {
          component,
          src: code,
          file: fileId,
        };

        return toEsmWithSourceMap(code, id, file);
      }

      const hasXmluiScriptExtension = xmluiScriptExtension.test(id);
      const hasModuleScriptExtension = moduleScriptExtension.test(id);
      if (hasXmluiScriptExtension || hasModuleScriptExtension) {
        // --- We parse the module file to catch parsing errors

        const parser = new Parser(code);
        parser.parseStatements();
        const moduleName = hasXmluiScriptExtension
          ? id.substring(0, id.length - (codeBehindFileExtension.length + 1))
          : id.substring(0, id.length - (moduleFileExtension.length + 1));

        const codeBehind = collectCodeBehindFromSource(moduleNameResolver(moduleName), code);
        removeCodeBehindTokensFromTree(codeBehind);

        // TODO: Add error handling.
        // Check, if codeBehind.moduleErrors is not empty (Record<string, ModuleErrors[]>); each module
        // should be checked for errors and warnings. If there are errors, throw an error.

        return toEsmWithSourceMap(code, id, { ...codeBehind, src: code });
      }
      return null;
    },
    // async generateBundle(opts, bundle, isWrite){
    //   console.log('generate bundle', opts);
    // }
  };
}

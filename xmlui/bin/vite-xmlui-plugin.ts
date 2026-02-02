import { dataToEsm } from "@rollup/pluginutils";
import type { Plugin } from "vite";
import {
  collectCodeBehindFromSource,
  collectCodeBehindFromSourceWithImports,
  removeCodeBehindTokensFromTree,
} from "../src/parsers/scripting/code-behind-collect";
import {
  codeBehindFileExtension,
  componentFileExtension,
  moduleFileExtension,
} from "../src/parsers/xmlui-parser/fileExtensions";
import { Parser } from "../src/parsers/scripting/Parser";
import { ModuleResolver } from "../src/parsers/scripting/ModuleResolver";
import type { ModuleFetcher } from "../src/parsers/scripting/ModuleResolver";
import * as path from "path";
import * as fs from "fs/promises";
import { errReportComponent, xmlUiMarkupToComponent } from "../src/components-core/xmlui-parser";

export type PluginOptions = {
  // --- Add plugin options here.
};

const xmluiExtension = new RegExp(`.${componentFileExtension}$`);
const xmluiScriptExtension = new RegExp(`.${codeBehindFileExtension}$`);
const moduleScriptExtension = new RegExp(`.${moduleFileExtension}$`);

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

        return {
          code: dataToEsm(file),
          map: { mappings: "" },
        };
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

        // --- Create a module fetcher for import support
        const moduleFetcher: ModuleFetcher = async (modulePath: string) => {
          // --- Resolve the module path relative to the current file
          const resolvedPath = ModuleResolver.resolvePath(modulePath, id);
          // --- Convert to filesystem path
          const fsPath = resolvedPath.startsWith("/") ? resolvedPath : "/" + resolvedPath;
          try {
            return await fs.readFile(fsPath, "utf-8");
          } catch (e) {
            throw new Error(`Failed to read module: ${fsPath}`);
          }
        };

        // --- Collect code-behind with import support
        const codeBehind = await collectCodeBehindFromSourceWithImports(
          moduleNameResolver(moduleName),
          code,
          moduleFetcher,
        );
        removeCodeBehindTokensFromTree(codeBehind);

        // TODO: Add error handling.
        // Check, if codeBehind.moduleErrors is not empty (Record<string, ModuleErrors[]>); each module
        // should be checked for errors and warnings. If there are errors, throw an error.

        return {
          code: dataToEsm({ ...codeBehind, src: code }),
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

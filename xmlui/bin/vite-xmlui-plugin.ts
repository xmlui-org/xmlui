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
import { clearParsedModulesCache } from "../src/parsers/scripting/modules";
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

        // --- Extract script content from XMLUI markup
        const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/);
        let codeBehind;

        if (scriptMatch && scriptMatch[1]) {
          const scriptContent = scriptMatch[1];

          // --- Create a module fetcher for import support
          const moduleFetcher: ModuleFetcher = async (modulePath: string) => {
            // The modulePath parameter is the RESOLVED absolute path
            try {
              return await fs.readFile(modulePath, "utf-8");
            } catch (e) {
              throw new Error(`Failed to read module: ${modulePath}. Error: ${e}`);
            }
          };

          // --- Collect code-behind with import support from inline <script> tags
          try {
            // Clear caches for fresh parse
            clearParsedModulesCache();
            ModuleResolver.clearCache();
            ModuleResolver.resetImportStack();

            codeBehind = await collectCodeBehindFromSourceWithImports(
              moduleNameResolver(id),
              scriptContent,
              moduleFetcher,
            );
            removeCodeBehindTokensFromTree(codeBehind);

            // --- Display any module errors or warnings found
            if (codeBehind.moduleErrors && Object.keys(codeBehind.moduleErrors).length > 0) {
              Object.entries(codeBehind.moduleErrors).forEach(([modulePath, errors]) => {
                errors.forEach((err) => {
                  this.warn(`[${modulePath}:${err.line}:${err.column}] ${err.code}: ${err.text}`);
                });
              });
            }
          } catch (e) {
            this.error(`Error collecting imports: ${e}`);
          }
        }

        let { component, errors, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
          code,
          fileId,
          codeBehind,
        );
        if (errors.length > 0) {
          component = errReportComponent(errors, id, erroneousCompoundComponentName);
        }
        const file = {
          component,
          src: code,
          ...(codeBehind || {}),
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
        // --- Clear caches for fresh parse
        clearParsedModulesCache();
        ModuleResolver.clearCache();
        ModuleResolver.resetImportStack();

        // --- We parse the module file to catch parsing errors

        const parser = new Parser(code);
        parser.parseStatements();
        const moduleName = hasXmluiScriptExtension
          ? id.substring(0, id.length - (codeBehindFileExtension.length + 1))
          : id.substring(0, id.length - (moduleFileExtension.length + 1));

        // --- Create a module fetcher for import support
        const moduleFetcher: ModuleFetcher = async (modulePath: string) => {
          // The modulePath parameter is the RESOLVED absolute path, not the original import path
          // So we can just read it directly
          try {
            return await fs.readFile(modulePath, "utf-8");
          } catch (e) {
            throw new Error(`Failed to read module: ${modulePath}. Error: ${e}`);
          }
        };

        // --- Collect code-behind with import support
        const codeBehind = await collectCodeBehindFromSourceWithImports(
          moduleNameResolver(moduleName),
          code,
          moduleFetcher,
        );
        removeCodeBehindTokensFromTree(codeBehind);

        // --- Display any module errors as warnings
        if (codeBehind.moduleErrors && Object.keys(codeBehind.moduleErrors).length > 0) {
          Object.entries(codeBehind.moduleErrors).forEach(([modulePath, errors]) => {
            errors.forEach((err) => {
              this.warn(`[${modulePath}:${err.line}:${err.column}] ${err.code}: ${err.text}`);
            });
          });
        }

        // --- Check for critical module errors (not validation warnings) and throw if any exist
        const hasCriticalErrors = codeBehind.moduleErrors && 
          Object.entries(codeBehind.moduleErrors).some(([_, errors]) => 
            errors.some(err => !err.code.startsWith("W04")) // W043, W044, W045 are validation warnings
          );
        
        if (hasCriticalErrors) {
          const errorMessages: string[] = [];
          Object.entries(codeBehind.moduleErrors!).forEach(([modulePath, errors]) => {
            errors.forEach((err) => {
              if (!err.code.startsWith("W04")) {
                errorMessages.push(`  ${modulePath}:${err.line}:${err.column} - ${err.code}: ${err.text}`);
              }
            });
          });
          if (errorMessages.length > 0) {
            throw new Error(`Module parsing errors:\n${errorMessages.join('\n')}`);
          }
        }

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

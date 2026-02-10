import { dataToEsm } from "@rollup/pluginutils";
import type { Plugin } from "vite";
import {
  collectCodeBehindFromSourceWithImports,
  removeCodeBehindTokensFromTree,
} from "../src/parsers/scripting/code-behind-collect";
import {
  codeBehindFileExtension,
  componentFileExtension,
  moduleFileExtension,
} from "../src/parsers/xmlui-parser/fileExtensions";
import { Parser } from "../src/parsers/scripting/Parser";
import { clearAllModuleCaches } from "../src/parsers/scripting/ModuleCache";
import type { ModuleFetcher } from "../src/parsers/scripting/types";
import { ScriptExtractor } from "../src/parsers/scripting/ScriptExtractor";
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
  
  // Helper to normalize Windows paths to use forward slashes
  const normalizePath = (p: string) => p.replace(/\\/g, '/');
  
  return {
    name: "vite:transform-xmlui",

    async transform(code: string, id: string, options) {
      // Normalize path separators for cross-platform consistency
      const normalizedId = normalizePath(id);
      
      if (xmluiExtension.test(id)) {
       
        const fileId = "" + itemIndex++;

        // --- Extract script content from XMLUI markup using ScriptExtractor
        const scriptResult = ScriptExtractor.extractInlineScript(code);
        let codeBehind;

        if (scriptResult) {
          const scriptContent = scriptResult.script;

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
            clearAllModuleCaches();

            codeBehind = await collectCodeBehindFromSourceWithImports(
              normalizedId,
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
        clearAllModuleCaches();

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
          normalizedId,
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
    
    handleHotUpdate({ file, server }) {
      // Normalize path for cross-platform consistency
      const normalizedFile = normalizePath(file);
      
      // Check if the changed file is an XMLUI-related file
      const isXmluiFile = xmluiExtension.test(normalizedFile);
      const isXsFile = xmluiScriptExtension.test(normalizedFile) || 
                       moduleScriptExtension.test(normalizedFile);
      
      if (isXmluiFile || isXsFile) {
        // Clear module caches to ensure fresh parsing on next transform
        clearAllModuleCaches();
        
        // For .xs files, we need a full page reload to ensure all imports are re-evaluated
        // This mimics stopping and restarting the dev server
        if (isXsFile) {
          this.warn(`[vite-xmlui-plugin] Processing updated script file: ${file}`);

          // Invalidate ALL modules to force complete re-transformation (mimic dev server restart)
          const allModules = Array.from(server.moduleGraph.idToModuleMap.values());
          
          for (const mod of allModules) {
            server.moduleGraph.invalidateModule(mod);
          }
          
          // Trigger full page reload
          server.ws.send({
            type: 'full-reload',
            path: '*'
          });
          return [];
        }
        
        // For .xmlui files, do a targeted HMR
        const module = server.moduleGraph.getModuleById(normalizedFile);
        if (module) {
          return [module];
        }
      }
      
      return undefined;
    },
  };
}

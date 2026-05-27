import { dataToEsm } from "@rollup/pluginutils";
import type { Plugin } from "vite";
import {
  collectCodeBehindFromSourceWithImports,
  removeCodeBehindTokensFromTree,
} from "../parsers/scripting/code-behind-collect";
import {
  codeBehindFileExtension,
  componentFileExtension,
  moduleFileExtension,
} from "../parsers/xmlui-parser/fileExtensions";
import { Parser } from "../parsers/scripting/Parser";
import { clearAllModuleCaches } from "../parsers/scripting/ModuleCache";
import type { ModuleFetcher } from "../parsers/scripting/types";
import { ScriptExtractor } from "../parsers/scripting/ScriptExtractor";
import * as fs from "fs/promises";
import {
  defaultMetadataLookup,
  errReportComponent,
  xmlUiMarkupToComponent,
} from "../components-core/xmlui-parser";
import { coreComponentMetadata } from "../components-core/coreComponentMetadata";
import type { CollectedDeclarations } from "../components-core/script-runner/ScriptingSourceTree";
import { analyze } from "../components-core/analyzer/walker";
import {
  collectComponentDefGraph,
  findCycles,
  formatCycle,
  cycleHash,
} from "../components-core/reactive-graph";
import { lintComponentDef } from "../components-core/accessibility/linter";
import type { A11yRegistry } from "../components-core/accessibility";
import { verifyComponentDef } from "../components-core/type-contracts";
import type { ComponentDef, ComponentMetadata, OptimizerMetadataView } from "../abstractions/ComponentDefs";
import collectedComponentMetadata from "../language-server/xmlui-metadata-generated.js";
import { extractOptimizerMetadataFromDir } from "../components-core/optimization/static-extractor";

export type AnalyzeMode = "off" | "warn" | "strict";

export type PluginOptions = {
  /**
   * Control the build-time static analyzer.
   *
   * - `"off"` — analyzer disabled entirely.
   * - `"warn"` (default) — analyzer runs; diagnostics are emitted as Vite
   *   warnings; the build always succeeds.
   * - `"strict"` — analyzer runs with `strict: true`; error-severity
   *   diagnostics cause the build to fail.
   */
  analyze?: AnalyzeMode;
  /**
   * Control reactive-cycle detection at build time — Plan #03 Step 3.4
   * (W6-7). When omitted, defaults to `"warn"` (or `"strict"` when
   * `analyze === "strict"`).
   *
   * - `"off"` — cycle detector disabled.
   * - `"warn"` — cycles produce `this.warn(...)`; the build succeeds.
   * - `"strict"` — `severity:"warn"` cycles call `this.error(...)`,
   *   failing the build. `severity:"info"` (pure-conditional) cycles
   *   always remain warnings.
   *
   * XMLUI files are analysed independently inside `transform`, then all parsed
   * roots are scanned once more during `buildEnd` so build logs include cycles
   * that only become visible when multiple files participate in the app graph.
   */
  reactiveCycles?: AnalyzeMode;
  /**
   * Control accessibility linting at build time — Plan #05 Phase 1 Step 1.3.
   *
   * - `"off"` — accessibility linter disabled.
   * - `"warn"` (default) — linter runs; diagnostics are emitted as Vite
   *   warnings; the build always succeeds.
   * - `"strict"` — must-have violations (`icon-only-button-no-label`,
   *   `modal-no-title`, etc.) call `this.error(...)`, failing the build.
   *
   * @see a11yRegistry to supply component metadata for the full rule set.
   */
  accessibility?: AnalyzeMode;
  /**
   * Optional component a11y metadata map used by the accessibility linter.
   *
   * When omitted the linter still runs component-name-based rules
   * (`icon-only-button-no-label`, `modal-no-title`).  Metadata-dependent
   * rules (`missing-accessible-name`, `form-input-no-label`) require this
   * registry to fire.
   *
   * Callers may build this from the generated LSP metadata or from any
   * `Map<string, { a11y?: ... }>` keyed by component type name.
   */
  a11yRegistry?: A11yRegistry;
  /**
   * Control verified type-contract diagnostics at build time — Plan #01 Step 3.2.
   *
   * - `"off"` — type-contract verifier disabled.
   * - `"warn"` (default) — diagnostics are emitted as Vite warnings.
   * - `"strict"` — error-capable diagnostics fail the build.
   */
  typeContracts?: AnalyzeMode;
  /**
   * Optional component metadata registry used by the type-contract verifier.
   * Defaults to the built-in component metadata.
   */
  typeContractRegistry?: ReadonlyMap<string, ComponentMetadata>;
  /**
   * Additional directories to scan for optimizer metadata at build time.
   * Use this for extension packages that contribute container-like components
   * with `childInjectedVars` or event `injectedVars`. Each entry must be an
   * absolute path to a directory containing `.tsx` component source files
   * with `optimization: {}` blocks inside `createMetadata` calls.
   *
   * Built-in xmlui components are always included automatically via
   * `collectedComponentMetadata`; only add dirs for external extension packages.
   *
   * @example
   * viteXmluiPlugin({
   *   optimizerSourceDirs: [resolve(__dirname, "node_modules/my-extension/src/components")],
   * })
   */
  optimizerSourceDirs?: string[];
};

const xmluiExtension = new RegExp(`.${componentFileExtension}$`);
const xmluiScriptExtension = new RegExp(`.${codeBehindFileExtension}$`);
const moduleScriptExtension = new RegExp(`.${moduleFileExtension}$`);

/**
 * Transform XMLUI files to JS objects.
 */
export default function viteXmluiPlugin(pluginOptions: PluginOptions = {}): Plugin {
  let projectRoot = "";
  const analyzeMode: AnalyzeMode = pluginOptions.analyze ?? "warn";
  const cyclesMode: AnalyzeMode =
    pluginOptions.reactiveCycles ?? (analyzeMode === "strict" ? "strict" : "warn");
  const a11yMode: AnalyzeMode = pluginOptions.accessibility ?? "warn";
  const a11yRegistry: A11yRegistry = pluginOptions.a11yRegistry ?? new Map();
  const typeContractMode: AnalyzeMode = pluginOptions.typeContracts ?? "warn";
  const typeContractRegistry =
    pluginOptions.typeContractRegistry ??
    new Map(Object.entries(collectedComponentMetadata) as [string, ComponentMetadata][]);
  // Dedupe cycle reports across multiple transform calls / HMR within a
  // single dev-server lifetime, so the same cycle is not warned twice.
  const reportedCycles = new Set<string>();
  const reactiveCycleRoots = new Map<string, ComponentDef>();
  // Aggregate a11y diagnostic counts across all files for the buildEnd summary.
  let a11yWarnCount = 0;
  let a11yErrorCount = 0;
  const typeContractCounts = new Map<string, number>();
  let typeContractWarnCount = 0;
  let typeContractErrorCount = 0;

  // Helper to normalize Windows paths to use forward slashes
  const normalizePath = (p: string) => p.replace(/\\/g, "/");

  // Build optimizer metadata lookup for extension packages.
  // When optimizerSourceDirs are provided, scan them and merge with the built-in
  // collectedComponentMetadata. Pass undefined when no extension dirs exist, letting
  // xmlUiMarkupToComponent use its default (also collectedComponentMetadata-based).
  let extensionMetadataLookup: ((type: string) => OptimizerMetadataView | undefined) | undefined;
  if (pluginOptions.optimizerSourceDirs && pluginOptions.optimizerSourceDirs.length > 0) {
    const extensionMetadata: Record<string, OptimizerMetadataView> = {};
    for (const dir of pluginOptions.optimizerSourceDirs) {
      let incoming: Record<string, any>;
      try {
        incoming = extractOptimizerMetadataFromDir(dir);
      } catch (err) {
        // Non-fatal when the directory simply doesn't exist; re-throw genuine errors.
        const code = (err as NodeJS.ErrnoException).code;
        if (code === "ENOENT" || code === "ENOTDIR") {
          console.warn(`[xmlui] optimizerSourceDirs: directory not found, skipping: ${dir}`);
          continue;
        }
        throw new Error(
          `[xmlui] optimizerSourceDirs: failed to scan "${dir}": ${(err as Error).message}`,
        );
      }
      // Warn on key collisions — last-dir-wins but the developer should know.
      for (const key of Object.keys(incoming)) {
        if (key in extensionMetadata) {
          console.warn(
            `[xmlui] optimizerSourceDirs: component "${key}" declared in multiple dirs; last-dir-wins.`,
          );
        }
        // Extension components silently shadow built-ins on lookup
        // (extensionMetadata is checked before getOptimizerMetadata). Warn explicitly so
        // a typo like declaring `List` in an extension doesn't quietly override
        // the built-in metadata that real XMLUI markup depends on.
        if (key in coreComponentMetadata || key in (collectedComponentMetadata as object)) {
          console.warn(
            `[xmlui] optimizerSourceDirs: extension component "${key}" shadows a built-in; the built-in optimizer metadata will be ignored.`,
          );
        }
      }
      Object.assign(extensionMetadata, incoming);
    }
    // Merged lookup: extension packages first, then built-in components (including DataLoader).
    extensionMetadataLookup = (type: string) =>
      extensionMetadata[type] ?? defaultMetadataLookup(type);
  }

  return {
    name: "vite:transform-xmlui",
    transform: async function (code: string, id: string, options) {
      if (
        !xmluiExtension.test(id) &&
        !xmluiScriptExtension.test(id) &&
        !moduleScriptExtension.test(id)
      ) {
        return;
      }
      // Normalize path separators for cross-platform consistency
      const normalizedId = normalizePath(id);

      if (xmluiExtension.test(id)) {
        // Use path relative to project root as fileId — matches glob keys used by _xsSourceFiles
        const fileId = projectRoot ? normalizedId.slice(projectRoot.length) : normalizedId;

        // --- Extract script content from XMLUI markup using ScriptExtractor
        const scriptResult = ScriptExtractor.extractInlineScript(code);
        let codeBehind: CollectedDeclarations;

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
              Object.entries(codeBehind.moduleErrors).forEach(
                ([modulePath, errors]: [string, any]) => {
                  errors.forEach((err) => {
                    this.warn(`[${modulePath}:${err.line}:${err.column}] ${err.code}: ${err.text}`);
                  });
                },
              );
            }
          } catch (e) {
            this.error(`Error collecting imports: ${e}`);
          }
        }

        let { component, errors, warnings, erroneousCompoundComponentName } =
          xmlUiMarkupToComponent(code, fileId, codeBehind, extensionMetadataLookup);
        if (errors.length > 0) {
          component = errReportComponent(errors, id, erroneousCompoundComponentName);
        }
        if (warnings.length > 0) {
          warnings.forEach((msg) => this.warn(`[xmlui] ${msg}`));
        }

        // --- Run static analyzer when not disabled
        if (analyzeMode !== "off") {
          try {
            const strict = analyzeMode === "strict";
            const analyzerDiags = analyze({ files: [{ file: fileId, source: code }], strict });
            for (const diag of analyzerDiags) {
              if (diag.severity === "error" && strict) {
                this.error(`[xmlui-check] ${diag.code}: ${diag.message}`);
              } else {
                this.warn(`[xmlui-check] ${diag.code}: ${diag.message}`);
              }
            }
          } catch (_analyzerErr) {
            // Analyzer errors must never break the build
          }
        }

        // --- Reactive cycle detection — Plan #03 Step 3.4 (W6-7).
        // Per-file pass: build the graph from this file's `ComponentDef`
        // and report any cycles found. The same root is retained for the
        // aggregate buildEnd scan below.
        if (cyclesMode !== "off" && component) {
          const root =
            (component as any).component &&
            typeof (component as any).component === "object"
              ? (component as any).component
              : (component as any);
          reactiveCycleRoots.set(fileId, root);
          let cycleHits: ReturnType<typeof findCycles> | null = null;
          try {
            const graph = collectComponentDefGraph(root);
            cycleHits = findCycles(graph);
          } catch (_cyclesErr) {
            // Analyzer failure must never break the build.
            cycleHits = null;
          }
          // Reporting is outside the try/catch so an explicit `this.error`
          // (strict mode) is not swallowed.
          if (cycleHits && cycleHits.length > 0) {
            const strictCycles = cyclesMode === "strict";
            for (const hit of cycleHits) {
              const id = cycleHash(hit);
              if (reportedCycles.has(id)) continue;
              reportedCycles.add(id);
              const message = `[xmlui:reactive-cycle] ${fileId}\n${formatCycle(hit)}`;
              // `severity:"info"` (pure-conditional) cycles never fail
              // the build — they are advisory only.
              if (strictCycles && (hit.severity ?? "warn") === "warn") {
                this.error(message);
              } else {
                this.warn(message);
              }
            }
          }
        }

        // --- Accessibility linting — Plan #05 Phase 1 Step 1.3.
        // Run lintComponentDef on the parsed component tree to surface
        // accessibility violations (icon-only-button, modal-no-title, and
        // others when a11yRegistry is supplied). In non-strict mode violations
        // are warnings; in strict mode must-have codes call this.error().
        if (a11yMode !== "off" && component) {
          try {
            const root: any =
              (component as any).component &&
              typeof (component as any).component === "object"
                ? (component as any).component
                : component;
            const strictA11y = a11yMode === "strict";
            const a11yHits = lintComponentDef(root, a11yRegistry, {
              strict: strictA11y,
              skipUnknown: true,
            });
            for (const hit of a11yHits) {
              const message = `[xmlui:a11y] ${fileId}: [${hit.code}] ${hit.message}${hit.fix ? ` Suggestion: ${hit.fix}` : ""}`;
              if (strictA11y && hit.severity === "error") {
                a11yErrorCount++;
                this.error(message);
              } else {
                a11yWarnCount++;
                this.warn(message);
              }
            }
          } catch (_a11yErr) {
            // A11y linter failure must never break the build.
          }
        }

        // --- Verified type contracts — Plan #01 Step 3.2.
        // Run after XMLUI parsing so literal props/events can be checked against
        // component metadata. Expression-valued props are intentionally left for
        // runtime warn-mode.
        if (typeContractMode !== "off" && component) {
          let hits: ReturnType<typeof verifyComponentDef> = [];
          try {
            const root: any =
              (component as any).component &&
              typeof (component as any).component === "object"
                ? (component as any).component
                : component;
            const strictTypes = typeContractMode === "strict";
            hits = verifyComponentDef(root, typeContractRegistry, {
              strict: strictTypes,
              skipUnknown: true,
            });
          } catch (_typeContractErr) {
            // Type-contract verifier failure must never break the build.
          }
          const strictTypes = typeContractMode === "strict";
          for (const hit of hits) {
            const message = `[xmlui:type-contract] ${fileId}: [${hit.code}] ${hit.message}${hit.suggestion ? ` Did you mean "${hit.suggestion}"?` : ""}`;
            typeContractCounts.set(hit.code, (typeContractCounts.get(hit.code) ?? 0) + 1);
            if (strictTypes && hit.severity === "error") {
              typeContractErrorCount++;
              this.error(message);
            } else {
              typeContractWarnCount++;
              this.warn(message);
            }
          }
        }

        const file = {
          component,
          src: code,
          ...codeBehind,
          file: fileId,
          warnings,
        };

        return {
          code: dataToEsm(file),
          map: { mappings: "" },
          moduleType: "js",
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
        const hasCriticalErrors =
          codeBehind.moduleErrors &&
          Object.entries(codeBehind.moduleErrors).some(
            ([_, errors]) => errors.some((err) => !err.code.startsWith("W04")), // W043, W044, W045 are validation warnings
          );

        if (hasCriticalErrors) {
          const errorMessages: string[] = [];
          Object.entries(codeBehind.moduleErrors!).forEach(([modulePath, errors]) => {
            errors.forEach((err) => {
              if (!err.code.startsWith("W04")) {
                errorMessages.push(
                  `  ${modulePath}:${err.line}:${err.column} - ${err.code}: ${err.text}`,
                );
              }
            });
          });
          if (errorMessages.length > 0) {
            throw new Error(`Module parsing errors:\n${errorMessages.join("\n")}`);
          }
        }

        return {
          code: dataToEsm({ ...codeBehind, src: code }),
          map: { mappings: "" },
          moduleType: "js",
        };
      }
      return null;
    },

    configResolved(config) {
      projectRoot = normalizePath(config.root);
    },

    buildEnd() {
      if (cyclesMode !== "off" && reactiveCycleRoots.size > 0) {
        let cycleHits: ReturnType<typeof findCycles> | null = null;
        try {
          const root: ComponentDef = {
            type: "Fragment",
            uid: "__xmlui_build__",
            children: Array.from(reactiveCycleRoots.values()),
          };
          const graph = collectComponentDefGraph(root);
          cycleHits = findCycles(graph);
        } catch (_cyclesErr) {
          cycleHits = null;
        }

        if (cycleHits && cycleHits.length > 0) {
          const strictCycles = cyclesMode === "strict";
          for (const hit of cycleHits) {
            const id = cycleHash(hit);
            if (reportedCycles.has(id)) continue;
            reportedCycles.add(id);
            const message = `[xmlui:reactive-cycle] buildEnd\n${formatCycle(hit)}`;
            if (strictCycles && (hit.severity ?? "warn") === "warn") {
              this.error(message);
            } else {
              this.warn(message);
            }
          }
        }
      }

      // Emit an accessibility summary when the linter found any issues.
      // This surfaces the totals even after individual per-file warnings
      // have scrolled past in the build log.
      if (a11yMode !== "off" && (a11yWarnCount > 0 || a11yErrorCount > 0)) {
        const summary = [
          `[xmlui:a11y] Build complete — accessibility diagnostics:`,
          a11yErrorCount > 0 ? `  ${a11yErrorCount} error(s)` : null,
          a11yWarnCount > 0 ? `  ${a11yWarnCount} warning(s)` : null,
          `  Run with accessibility="strict" to fail the build on must-have violations.`,
        ]
          .filter(Boolean)
          .join("\n");
        this.warn(summary);
      }

      if (
        typeContractMode !== "off" &&
        (typeContractWarnCount > 0 || typeContractErrorCount > 0)
      ) {
        const byCode = Array.from(typeContractCounts.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([code, count]) => `  ${code}: ${count}`)
          .join("\n");
        const total = typeContractWarnCount + typeContractErrorCount;
        const summary = [
          `[xmlui:type-contract] Build complete — ${total} type-contract diagnostic(s):`,
          typeContractErrorCount > 0 ? `  ${typeContractErrorCount} error(s)` : null,
          typeContractWarnCount > 0 ? `  ${typeContractWarnCount} warning(s)` : null,
          byCode || null,
          `  Run with typeContracts="strict" to fail the build on contract violations.`,
        ]
          .filter(Boolean)
          .join("\n");
        this.warn(summary);
      }
    },

    handleHotUpdate({ file, server }) {
      // Normalize path for cross-platform consistency
      const normalizedFile = normalizePath(file);

      // Check if the changed file is an XMLUI-related file
      const isXmluiFile = xmluiExtension.test(normalizedFile);
      const isXsFile =
        xmluiScriptExtension.test(normalizedFile) || moduleScriptExtension.test(normalizedFile);

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
          server.hot.send({
            type: "full-reload",
            path: "*",
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

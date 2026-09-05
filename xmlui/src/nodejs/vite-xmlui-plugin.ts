import { dataToEsm } from "@rollup/pluginutils";
import type { Plugin } from "vite";
import {
  collectCodeBehindFromSourceWithImports,
  removeCodeBehindTokensFromTree,
  type CodeBehindCollectionOptions,
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
import path from "node:path";
import { errReportComponent, xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { XmluiParserOptions } from "../parsers/xmlui-parser/parser";
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
import { verifyComponentDef } from "../components-core/type-contracts/verifier";
import { filterSuppressedTypeContractDiagnostics } from "../components-core/type-contracts/suppression";
import type {
  ComponentDef,
  ComponentMetadata,
  CompoundComponentDef,
  OptimizerMetadataView,
} from "../abstractions/ComponentDefs";
import { generatedMetadataRegistry } from "../language-server/generatedMetadataRegistry";
import { extractOptimizerMetadataFromDir } from "../components-core/optimization/static-extractor";
import { createDebugSourceUrl } from "../components-core/script-compiler/source";
import type {
  CompiledScriptArtifact,
  CompiledScriptSource,
  CompiledScriptSourceMapMode,
} from "../components-core/script-compiler/types";
import {
  createCompiledScriptGeneratedSourceUrl,
  createCompiledScriptSourceMap,
} from "../components-core/script-compiler/source-map";
import { createFunctionBodySourceMapArtifact } from "../components-core/script-compiler/artifact";
import { XmluiVirtualSourceRegistry, normalizePath } from "./virtual-sources";

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
   * with `contextVars` or event `injectedVars`. Each entry must be an
   * absolute path to a directory containing `.tsx` component source files
   * with `createMetadata` calls.
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
  /**
   * Compile XMLUI scripts to JavaScript: event handlers, inline `<script>` functions,
   * code-behind declarations, and — in the browser, on first use — binding
   * expressions. One switch decides for all of them.
   */
  compileScripts?: boolean;
  /**
   * Report every script block that falls back to interpretation, with a diagnostic
   * code and source position. The build always counts fallbacks in its summary; this
   * adds the per-block detail.
   */
  reportCompileFallbacks?: boolean;
  /**
   * Emit source-map/debug-source metadata for compiled scripts. Internal: the CLI
   * turns it on for `xmlui start` only, since the payload has no value in a build.
   * `"external"` is the dev-server mode; `"inline"` is reserved for runtime fallbacks.
   */
  sourceMaps?: CompiledScriptSourceMapMode;
  /**
   * Strip parser source-location metadata from ComponentDef graphs emitted to
   * browser/runtime modules. Build-time analyzers still run before this step.
   * Defaults to production builds only; dev server output keeps debug metadata.
   */
  stripComponentDebug?: boolean;
  /**
   * Remove empty optional collection fields from ComponentDef graphs emitted to
   * browser/runtime modules. Defaults to production builds only; dev server
   * output keeps the parser's fuller object shape for diagnostics.
   */
  normalizeComponentDefCollections?: boolean;
  /**
   * Remove parser/source-position metadata from ComponentDef graphs emitted to
   * browser/runtime modules. Defaults to production builds only; dev server
   * output keeps token/source locations for diagnostics and source maps.
   */
  stripComponentSourceMetadata?: boolean;
};

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object";
}

function isComponentDefLike(value: unknown): value is ComponentDef {
  return isRecord(value) && typeof value.type === "string";
}

function isCompoundComponentDefLike(value: unknown): value is CompoundComponentDef {
  return isRecord(value) && typeof value.name === "string" && isComponentDefLike(value.component);
}

const emptyCollectionKeys = new Set([
  "api",
  "children",
  "computedGlobalUses",
  "computedUses",
  "contextVars",
  "events",
  "functions",
  "globalVars",
  "loaders",
  "namespaces",
  "props",
  "slots",
  "uses",
  "vars",
  "_savedFunctionDefs",
  "_savedVarDefs",
]);

const sourceTokenKeys = new Set(["startToken", "endToken"]);

function isEmptyCollection(value: unknown): boolean {
  return (
    (Array.isArray(value) && value.length === 0) ||
    (isRecord(value) &&
      Object.getPrototypeOf(value) === Object.prototype &&
      Object.keys(value).length === 0)
  );
}

function stripComponentSourceMetadata(value: unknown, seen = new WeakSet<object>()) {
  if (!isRecord(value)) {
    return;
  }
  if (seen.has(value)) {
    return;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      stripComponentSourceMetadata(item, seen);
    }
    return;
  }

  for (const key of sourceTokenKeys) {
    delete (value as any)[key];
  }

  for (const item of Object.values(value)) {
    stripComponentSourceMetadata(item, seen);
  }
}

function stripComponentDebug(value: unknown, seen = new WeakSet<object>()) {
  if (!isRecord(value)) {
    return;
  }
  if (seen.has(value)) {
    return;
  }
  seen.add(value);

  if (isComponentDefLike(value) || isCompoundComponentDefLike(value)) {
    delete (value as any).debug;
  }

  if (isCompoundComponentDefLike(value)) {
    stripComponentDebug(value.component, seen);
  }

  if (isComponentDefLike(value)) {
    stripComponentDebug(value.children, seen);
    stripComponentDebug(value.loaders, seen);
    stripComponentDebug(value.slots, seen);
    stripComponentDebug(value.props, seen);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      stripComponentDebug(item, seen);
    }
    return;
  }

  for (const item of Object.values(value)) {
    stripComponentDebug(item, seen);
  }
}

function normalizeComponentDefCollections(value: unknown, seen = new WeakSet<object>()) {
  if (!isRecord(value)) {
    return;
  }
  if (seen.has(value)) {
    return;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      normalizeComponentDefCollections(item, seen);
    }
    return;
  }

  for (const item of Object.values(value)) {
    normalizeComponentDefCollections(item, seen);
  }

  if (isComponentDefLike(value) || isCompoundComponentDefLike(value)) {
    for (const key of emptyCollectionKeys) {
      if (isEmptyCollection((value as any)[key])) {
        delete (value as any)[key];
      }
    }
  }
}

function createTransformSourceMap(
  code: string,
  file: string,
  sources: CompiledScriptSource[],
): {
  version: 3;
  file: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
} {
  const uniqueSources = new Map<string, CompiledScriptSource>();
  for (const source of sources) {
    const key = source.url ?? source.id;
    if (!uniqueSources.has(key)) {
      uniqueSources.set(key, source);
    }
  }
  const entries = Array.from(uniqueSources.values());
  return {
    version: 3,
    file,
    sources: entries.map((source) => source.url ?? source.id),
    sourcesContent: entries.map((source) => source.sourceText ?? ""),
    names: [],
    mappings: code.length > 0 && entries.length > 0 ? "AAAA" : "",
  };
}

/**
 * Counters behind the build-time script compilation summary. `artifacts` counts
 * the compiled JavaScript artifacts actually emitted, `scripts` the parsed
 * script blocks that could have carried one, and `unsupported` those where the
 * compiler bailed out and the runtime falls back to interpretation.
 */
type CompiledScriptTally = {
  files: number;
  scripts: number;
  artifacts: number;
  unsupported: number;
};

function tallyCompiledScripts(value: unknown, tally: CompiledScriptTally): CompiledScriptTally {
  if (!value || typeof value !== "object") {
    return tally;
  }
  const maybeArtifact = value as Partial<CompiledScriptArtifact>;
  if (
    typeof maybeArtifact.sourceId === "string" &&
    typeof maybeArtifact.js === "string" &&
    typeof maybeArtifact.target === "string" &&
    Array.isArray(maybeArtifact.mappings)
  ) {
    tally.artifacts++;
    return tally;
  }
  // --- Every compilable slot carries a boolean `compiledUnsupported`, whether it is an
  // --- event handler (`__PARSED`) or a code-behind function declaration.
  const maybeScript = value as { compiledUnsupported?: boolean };
  if (typeof maybeScript.compiledUnsupported === "boolean") {
    tally.scripts++;
    if (maybeScript.compiledUnsupported) {
      tally.unsupported++;
    }
  }
  if (Array.isArray(value)) {
    value.forEach((item) => tallyCompiledScripts(item, tally));
    return tally;
  }
  Object.values(value).forEach((item) => tallyCompiledScripts(item, tally));
  return tally;
}

/**
 * Fields a compiled artifact only needs when source maps are on. `mappings` holds one
 * entry per emitted token and `sources[].sourceText` the complete original module, so
 * shipping them in a production build multiplied bundle size and put developer paths
 * and full script sources into the browser payload for no runtime benefit —
 * `createCompiledScriptFunctionBody` reads `js` alone when source maps are off.
 */
function stripCompiledArtifactDebugData(value: unknown, projectRoot: string): void {
  if (!value || typeof value !== "object") {
    return;
  }
  const maybeArtifact = value as Partial<CompiledScriptArtifact> & {
    compiled?: unknown;
    compiledUnsupported?: boolean;
  };
  const isArtifact =
    typeof maybeArtifact.js === "string" &&
    typeof maybeArtifact.target === "string" &&
    Array.isArray(maybeArtifact.mappings);
  // --- Code-behind declarations carry a `sourceId` of their own, next to the
  // --- artifact's; both are absolute module paths at build time. The extra shape
  // --- checks keep this off a `sourceId` that is merely an app's own prop value.
  const isCompiledSlot =
    maybeArtifact.compiled !== undefined || typeof maybeArtifact.compiledUnsupported === "boolean";
  if (typeof maybeArtifact.sourceId === "string" && (isArtifact || isCompiledSlot)) {
    (value as { sourceId: string }).sourceId = relativizeSourcePath(
      maybeArtifact.sourceId,
      projectRoot,
    );
  }
  if (isArtifact) {
    const artifact = value as CompiledScriptArtifact;
    artifact.mappings = [];
    artifact.sources = [];
    delete artifact.sourceText;
    delete artifact.sourceUrl;
    delete artifact.displayName;
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => stripCompiledArtifactDebugData(item, projectRoot));
    return;
  }
  Object.values(value).forEach((item) => stripCompiledArtifactDebugData(item, projectRoot));
}

/**
 * Turns an absolute path prefix into a project-relative one so build output does not
 * carry the developer's directory layout.
 */
function relativizeSourcePath(sourcePath: string, projectRoot: string): string {
  if (!projectRoot) {
    return sourcePath;
  }
  const normalizedRoot = projectRoot.endsWith("/") ? projectRoot : `${projectRoot}/`;
  return sourcePath.startsWith(normalizedRoot)
    ? `/${sourcePath.slice(normalizedRoot.length)}`
    : sourcePath;
}

function collectCompiledArtifacts(value: unknown, artifacts: CompiledScriptArtifact[] = []) {
  if (!value || typeof value !== "object") {
    return artifacts;
  }
  const maybeArtifact = value as Partial<CompiledScriptArtifact>;
  if (
    typeof maybeArtifact.sourceId === "string" &&
    typeof maybeArtifact.js === "string" &&
    typeof maybeArtifact.target === "string" &&
    Array.isArray(maybeArtifact.mappings)
  ) {
    artifacts.push(maybeArtifact as CompiledScriptArtifact);
    return artifacts;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectCompiledArtifacts(item, artifacts));
    return artifacts;
  }
  Object.values(value).forEach((item) => collectCompiledArtifacts(item, artifacts));
  return artifacts;
}

const xmluiExtension = new RegExp(`.${componentFileExtension}$`);
const xmluiScriptExtension = new RegExp(`.${codeBehindFileExtension}$`);
const moduleScriptExtension = new RegExp(`.${moduleFileExtension}$`);
const generatedOptimizerMetadataLookup = (
  type: string,
): OptimizerMetadataView | undefined => {
  if (type in coreComponentMetadata) {
    return coreComponentMetadata[type];
  }
  return generatedMetadataRegistry[type];
};

/**
 * Transform XMLUI files to JS objects.
 */
export default function viteXmluiPlugin(pluginOptions: PluginOptions = {}): Plugin {
  let projectRoot = "";
  let virtualSources: XmluiVirtualSourceRegistry | undefined;
  let devServerMode = false;
  const analyzeMode: AnalyzeMode = pluginOptions.analyze ?? "warn";
  const cyclesMode: AnalyzeMode =
    pluginOptions.reactiveCycles ?? (analyzeMode === "strict" ? "strict" : "warn");
  const a11yMode: AnalyzeMode = pluginOptions.accessibility ?? "warn";
  const a11yRegistry: A11yRegistry = pluginOptions.a11yRegistry ?? new Map();
  const typeContractMode: AnalyzeMode = pluginOptions.typeContracts ?? "warn";
  const typeContractRegistry =
    pluginOptions.typeContractRegistry ??
    new Map(Object.entries(generatedMetadataRegistry) as [string, ComponentMetadata][]);
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

  const isComponentsPath = (p: string) => p.includes("/components/");
  const isEntrypointPath = (p: string) => !isComponentsPath(p) && /\/Main\.xmlui$/.test(p);
  const rootForAnalysis = (component: ComponentDef | CompoundComponentDef): ComponentDef =>
    (component as CompoundComponentDef).component &&
    typeof (component as CompoundComponentDef).component === "object"
      ? (component as CompoundComponentDef).component
      : (component as ComponentDef);
  const inlineComponentFileName = (entrypointFile: string, componentName: string) =>
    `${entrypointFile}#components/${componentName}.${componentFileExtension}`;
  const browserWarningLogCode = (warnings: string[]) => {
    if (warnings.length === 0) {
      return "";
    }
    return (
      warnings.map((msg) => `console.warn("[xmlui] " + ${JSON.stringify(msg)});`).join("\n") + "\n"
    );
  };
  const compileScripts = pluginOptions.compileScripts === true;
  const reportCompileFallbacks = pluginOptions.reportCompileFallbacks === true;
  const sourceMapsEnabled = () =>
    compileScripts &&
    (pluginOptions.sourceMaps === true ||
      pluginOptions.sourceMaps === "inline" ||
      pluginOptions.sourceMaps === "external" ||
      (pluginOptions.sourceMaps !== false && devServerMode));
  const createDebugSource = (
    id: string,
    sourceText: string,
    displayName = id,
  ): CompiledScriptSource => ({
    id,
    url: virtualSources?.createUrl(id) ?? createDebugSourceUrl(id),
    displayName,
    sourceText,
  });
  const createCodeBehindCollectionOptions = (
    moduleName: string,
    sourceText: string,
    sourceIdPrefix = moduleName,
    sourceUrl?: string,
    displayName?: string,
    sourceOrigin?: CodeBehindCollectionOptions["sourceOrigin"],
    sources?: CompiledScriptSource[],
  ): CodeBehindCollectionOptions | undefined => {
    if (!compileScripts) {
      return undefined;
    }
    const primarySource = sources?.find((source) => source.id === moduleName);
    return {
      compileScripts: true,
      reportCompileFallbacks,
      sourceMaps: sourceMapsEnabled() ? (pluginOptions.sourceMaps ?? "external") : false,
      sourceIdPrefix,
      sourceUrl: sourceUrl ?? primarySource?.url ?? createDebugSourceUrl(sourceIdPrefix),
      displayName: displayName ?? primarySource?.displayName ?? sourceIdPrefix,
      sourceText,
      sources,
      sourceOrigin,
    };
  };
  // --- Code-behind compilation warnings (`Globals.xs`, `.xmlui.xs`, inline
  // --- `<script>`). The collector records why a declaration function fell back to
  // --- interpretation; before, that reason was computed and then dropped, which is
  // --- what made compilation fallbacks look silent.
  const pendingCodeBehindWarnings: string[] = [];
  const collectCodeBehindWarnings = (codeBehind: { warnings?: string[] } | undefined) => {
    if (codeBehind?.warnings?.length) {
      pendingCodeBehindWarnings.push(...codeBehind.warnings);
    }
  };
  const drainCodeBehindWarnings = (warn: (message: string) => void) => {
    while (pendingCodeBehindWarnings.length > 0) {
      warn(`[xmlui] ${pendingCodeBehindWarnings.shift()}`);
    }
  };

  // --- Build-time script compilation accounting. Without it, an app that asks
  // --- for `compileScripts` but never reaches the compiler (a misplaced or
  // --- unreadable config) looks exactly like an app that compiled fine.
  const compiledScriptTally: CompiledScriptTally = {
    files: 0,
    scripts: 0,
    artifacts: 0,
    unsupported: 0,
  };
  let compiledScriptSummaryReported = false;
  let compiledScriptSummaryTimer: ReturnType<typeof setTimeout> | undefined;
  const recordCompiledScripts = (value: unknown) => {
    // --- Nothing left to count once the summary is out; the walk is not free.
    if (!compileScripts || compiledScriptSummaryReported) return;
    compiledScriptTally.files++;
    tallyCompiledScripts(value, compiledScriptTally);
    if (!devServerMode) return;
    // --- The dev server transforms lazily, so there is no build end to report
    // --- at; summarize once the transforms settle.
    clearTimeout(compiledScriptSummaryTimer);
    compiledScriptSummaryTimer = setTimeout(() => reportCompiledScriptSummary(), 2000);
    compiledScriptSummaryTimer.unref?.();
  };
  const reportCompiledScriptSummary = (warn?: (message: string) => void) => {
    if (!compileScripts || compiledScriptSummaryReported) return;
    compiledScriptSummaryReported = true;
    clearTimeout(compiledScriptSummaryTimer);
    const { files, scripts, artifacts, unsupported } = compiledScriptTally;
    if (artifacts === 0 && scripts > 0) {
      const message =
        `[xmlui] Script compilation is enabled but produced no compiled artifacts: ` +
        `${scripts} script block(s) in ${files} file(s) will run interpreted.`;
      if (warn) {
        warn(message);
      } else {
        console.warn(message);
      }
      return;
    }
    const fallbacks =
      unsupported > 0 ? `, ${unsupported} fell back to interpretation (unsupported construct)` : "";
    console.log(
      devServerMode
        ? `[xmlui] Script compilation is active: ${artifacts} compiled artifact(s) from ` +
            `${scripts} script block(s) in ${files} file(s) transformed so far${fallbacks}`
        : `[xmlui] Script compilation: ${artifacts} compiled artifact(s) from ` +
            `${scripts} script block(s) in ${files} file(s)${fallbacks}`,
    );
  };
  const registerCompiledArtifacts = (value: unknown) => {
    if (!sourceMapsEnabled()) return;
    for (const artifact of collectCompiledArtifacts(value)) {
      const generatedUrl = createCompiledScriptGeneratedSourceUrl(artifact);
      const generatedPrefix = `"use strict";\n`;
      const generatedBody = `${generatedPrefix}${artifact.js}`;
      const sourceMapArtifact = createFunctionBodySourceMapArtifact(
        artifact,
        generatedBody,
        generatedPrefix.length,
      );
      virtualSources?.register(
        {
          id: artifact.sourceId,
          url: generatedUrl,
          displayName: artifact.displayName ?? artifact.sourceId,
          sourceText: generatedBody,
        },
        createCompiledScriptSourceMap(sourceMapArtifact, generatedUrl),
      );
    }
  };

  // Build optimizer metadata lookup for extension packages.
  // Build-time transforms use the generated metadata snapshot explicitly; the
  // browser runtime uses the live registry populated by collectedComponentMetadata.
  let optimizerMetadataLookup: (type: string) => OptimizerMetadataView | undefined =
    generatedOptimizerMetadataLookup;
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
        if (key in coreComponentMetadata || key in (generatedMetadataRegistry as object)) {
          console.warn(
            `[xmlui] optimizerSourceDirs: extension component "${key}" shadows a built-in; the built-in optimizer metadata will be ignored.`,
          );
        }
      }
      Object.assign(extensionMetadata, incoming);
    }
    // Merged lookup: extension packages first, then built-in components (including DataLoader).
    optimizerMetadataLookup = (type: string) =>
      extensionMetadata[type] ?? generatedOptimizerMetadataLookup(type);
  }

  async function resolveInlineComponentCodeBehind(
    inlineComponents: CompoundComponentDef[],
    entrypointFile: string,
    debugSourcesById?: Map<string, CompiledScriptSource>,
  ) {
    for (const inlineComponent of inlineComponents) {
      if (!inlineComponent.codeBehind) {
        continue;
      }
      const codeBehindPath = normalizePath(
        path.resolve(path.dirname(entrypointFile), inlineComponent.codeBehind),
      );
      const code = await fs.readFile(codeBehindPath, "utf-8");
      const codeBehindDebugSource = createDebugSource(codeBehindPath, code);
      debugSourcesById?.set(codeBehindPath, codeBehindDebugSource);
      const collectorSources = [codeBehindDebugSource];
      const moduleFetcher: ModuleFetcher = async (modulePath: string) => {
        try {
          const moduleSource = await fs.readFile(modulePath, "utf-8");
          const moduleDebugSource = createDebugSource(modulePath, moduleSource);
          debugSourcesById?.set(modulePath, moduleDebugSource);
          collectorSources.push(moduleDebugSource);
          return moduleSource;
        } catch (e) {
          throw new Error(`Failed to read module: ${modulePath}. Error: ${e}`);
        }
      };
      clearAllModuleCaches();
      const codeBehind = await collectCodeBehindFromSourceWithImports(
        codeBehindPath,
        code,
        moduleFetcher,
        createCodeBehindCollectionOptions(
          codeBehindPath,
          code,
          codeBehindPath,
          codeBehindDebugSource.url,
          codeBehindDebugSource.displayName,
          undefined,
          collectorSources,
        ),
      );
      collectCodeBehindWarnings(codeBehind);
      removeCodeBehindTokensFromTree(codeBehind);
      inlineComponent.component = {
        ...inlineComponent.component,
        vars: {
          ...inlineComponent.component.vars,
          ...codeBehind.vars,
        },
        functions: codeBehind.functions || inlineComponent.component.functions,
        scriptError: codeBehind.moduleErrors,
      };
      (inlineComponent as any).codeBehindSource = code;
      (inlineComponent as any).resolvedCodeBehind = codeBehindPath;
    }
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
        const debugSourcesById = new Map<string, CompiledScriptSource>();
        const rootDebugSource = createDebugSource(fileId, code);
        debugSourcesById.set(fileId, rootDebugSource);

        // --- Extract script content from XMLUI markup using ScriptExtractor
        const scriptResult = ScriptExtractor.extractInlineScript(code);
        let codeBehind: CollectedDeclarations;

        if (scriptResult) {
          const scriptContent = scriptResult.script;
          const collectorSources: CompiledScriptSource[] = [
            { ...rootDebugSource, id: normalizedId },
          ];

          // --- Create a module fetcher for import support
          const moduleFetcher: ModuleFetcher = async (modulePath: string) => {
            // The modulePath parameter is the RESOLVED absolute path
            try {
              const moduleSource = await fs.readFile(modulePath, "utf-8");
              const moduleDebugSource = createDebugSource(modulePath, moduleSource);
              debugSourcesById.set(modulePath, moduleDebugSource);
              collectorSources.push(moduleDebugSource);
              return moduleSource;
            } catch (e) {
              throw new Error(`Failed to read module: ${modulePath}. Error: ${e}`);
            }
          };

          // --- Collect code-behind with import support from inline <script> tags
          try {
            // Clear caches for fresh parse
            clearAllModuleCaches();

            const scriptContentOffset = code.indexOf(scriptContent);
            codeBehind = await collectCodeBehindFromSourceWithImports(
              normalizedId,
              scriptContent,
              moduleFetcher,
              createCodeBehindCollectionOptions(
                normalizedId,
                scriptContent,
                fileId,
                rootDebugSource.url,
                rootDebugSource.displayName,
                scriptContentOffset >= 0
                  ? { offset: scriptContentOffset, sourceText: code }
                  : undefined,
                collectorSources,
              ),
            );
            collectCodeBehindWarnings(codeBehind);
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

        const parserOptions: XmluiParserOptions = {
          ...(isEntrypointPath(normalizedId) ? { role: "entrypoint" as const } : {}),
          compileScripts,
          reportCompileFallbacks,
        };
        let { component, inlineComponents, errors, warnings, erroneousCompoundComponentName } =
          xmlUiMarkupToComponent(code, fileId, codeBehind, optimizerMetadataLookup, parserOptions);
        if (parserOptions.role === "entrypoint" && inlineComponents.length > 0) {
          await resolveInlineComponentCodeBehind(inlineComponents, normalizedId, debugSourcesById);
        }
        if (errors.length > 0) {
          component = errReportComponent(errors, id, erroneousCompoundComponentName);
          inlineComponents = [];
        }
        if (warnings.length > 0) {
          warnings.forEach((msg) => this.warn(`[xmlui] ${msg}`));
        }
        drainCodeBehindWarnings((message) => this.warn(message));

        // --- Run static analyzer when not disabled
        if (analyzeMode !== "off") {
          try {
            const strict = analyzeMode === "strict";
            const analyzerFiles = component
              ? [
                  { file: fileId, source: code, markupAst: rootForAnalysis(component) },
                  ...inlineComponents.map((inlineComponent) => ({
                    file: inlineComponentFileName(fileId, inlineComponent.name),
                    source: code,
                    markupAst: inlineComponent.component,
                  })),
                ]
              : [{ file: fileId, source: code }];
            const analyzerDiags = analyze({ files: analyzerFiles, strict });
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
          const roots = [
            { file: fileId, root: rootForAnalysis(component) },
            ...inlineComponents.map((inlineComponent) => ({
              file: inlineComponentFileName(fileId, inlineComponent.name),
              root: inlineComponent.component,
            })),
          ];
          let cycleHits: ReturnType<typeof findCycles> | null = null;
          try {
            roots.forEach(({ file, root }) => reactiveCycleRoots.set(file, root));
            const graph = collectComponentDefGraph({
              type: "Fragment",
              children: roots.map(({ root }) => root),
            });
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
            const roots = [
              { file: fileId, root: rootForAnalysis(component) },
              ...inlineComponents.map((inlineComponent) => ({
                file: inlineComponentFileName(fileId, inlineComponent.name),
                root: inlineComponent.component,
              })),
            ];
            const strictA11y = a11yMode === "strict";
            for (const { file, root } of roots) {
              const a11yHits = lintComponentDef(root, a11yRegistry, {
                strict: strictA11y,
                skipUnknown: true,
              });
              for (const hit of a11yHits) {
                const message = `[xmlui:a11y] ${file}: [${hit.code}] ${hit.message}${hit.fix ? ` Suggestion: ${hit.fix}` : ""}`;
                if (strictA11y && hit.severity === "error") {
                  a11yErrorCount++;
                  this.error(message);
                } else {
                  a11yWarnCount++;
                  this.warn(message);
                }
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
            const root: ComponentDef = {
              type: "Fragment",
              children: [
                rootForAnalysis(component),
                ...inlineComponents.map((inlineComponent) => inlineComponent.component),
              ],
            };
            const strictTypes = typeContractMode === "strict";
            hits = verifyComponentDef(root, typeContractRegistry, {
              strict: strictTypes,
              skipUnknown: true,
            });
          } catch (_typeContractErr) {
            // Type-contract verifier failure must never break the build.
          }
          const strictTypes = typeContractMode === "strict";
          for (const hit of filterSuppressedTypeContractDiagnostics(hits, code)) {
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

        const shouldStripComponentDebug = pluginOptions.stripComponentDebug ?? !devServerMode;
        if (shouldStripComponentDebug) {
          stripComponentDebug(component);
          stripComponentDebug(inlineComponents);
        }
        const shouldNormalizeComponentDefCollections =
          pluginOptions.normalizeComponentDefCollections ?? !devServerMode;
        if (shouldNormalizeComponentDefCollections) {
          normalizeComponentDefCollections(component);
          normalizeComponentDefCollections(inlineComponents);
        }
        const shouldStripComponentSourceMetadata =
          pluginOptions.stripComponentSourceMetadata ?? !devServerMode;
        if (shouldStripComponentSourceMetadata) {
          stripComponentSourceMetadata(component);
          stripComponentSourceMetadata(inlineComponents);
        }

        const debugSources = Array.from(debugSourcesById.values());
        virtualSources?.registerAll(debugSources);
        const file = {
          component,
          inlineComponents,
          src: code,
          ...codeBehind,
          file: fileId,
          warnings,
          ...(sourceMapsEnabled() ? { debugSources } : {}),
        };
        recordCompiledScripts(file);
        if (!sourceMapsEnabled()) {
          stripCompiledArtifactDebugData(file, projectRoot);
        }
        const outputCode = browserWarningLogCode(warnings) + dataToEsm(file);
        const map = sourceMapsEnabled()
          ? createTransformSourceMap(outputCode, fileId, debugSources)
          : { mappings: "" };
        if (sourceMapsEnabled()) {
          virtualSources?.register(debugSources[0], map);
          registerCompiledArtifacts(file);
        }

        return {
          code: outputCode,
          map,
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
        const debugSourcesById = new Map<string, CompiledScriptSource>();
        const rootDebugSource = createDebugSource(normalizedId, code);
        const collectorSources: CompiledScriptSource[] = [rootDebugSource];
        debugSourcesById.set(normalizedId, rootDebugSource);
        const moduleFetcher: ModuleFetcher = async (modulePath: string) => {
          // The modulePath parameter is the RESOLVED absolute path, not the original import path
          // So we can just read it directly
          try {
            const moduleSource = await fs.readFile(modulePath, "utf-8");
            const moduleDebugSource = createDebugSource(modulePath, moduleSource);
            debugSourcesById.set(modulePath, moduleDebugSource);
            collectorSources.push(moduleDebugSource);
            return moduleSource;
          } catch (e) {
            throw new Error(`Failed to read module: ${modulePath}. Error: ${e}`);
          }
        };

        // --- Collect code-behind with import support
        const codeBehind = await collectCodeBehindFromSourceWithImports(
          normalizedId,
          code,
          moduleFetcher,
          createCodeBehindCollectionOptions(
            normalizedId,
            code,
            normalizedId,
            rootDebugSource.url,
            rootDebugSource.displayName,
            undefined,
            collectorSources,
          ),
        );
        collectCodeBehindWarnings(codeBehind);
        removeCodeBehindTokensFromTree(codeBehind);
        drainCodeBehindWarnings((message) => this.warn(message));

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

        const debugSources = Array.from(debugSourcesById.values());
        virtualSources?.registerAll(debugSources);
        recordCompiledScripts(codeBehind);
        if (!sourceMapsEnabled()) {
          stripCompiledArtifactDebugData(codeBehind, projectRoot);
        }
        const outputCode = dataToEsm({
          ...codeBehind,
          src: code,
          sourceUrl: debugSources[0]?.url ?? createDebugSourceUrl(normalizedId),
          ...(sourceMapsEnabled() ? { debugSources } : {}),
        });

        const map = sourceMapsEnabled()
          ? createTransformSourceMap(outputCode, normalizedId, debugSources)
          : { mappings: "" };
        if (sourceMapsEnabled()) {
          virtualSources?.register(debugSources[0], map);
          registerCompiledArtifacts(codeBehind);
        }

        return {
          code: outputCode,
          map,
          moduleType: "js",
        };
      }
      return null;
    },

    configResolved(config) {
      projectRoot = normalizePath(config.root);
      virtualSources = new XmluiVirtualSourceRegistry(projectRoot);
    },

    configureServer(server) {
      devServerMode = true;
      virtualSources ??= new XmluiVirtualSourceRegistry(projectRoot);
      server.middlewares.use((req, res, next) => {
        if (!sourceMapsEnabled() || !req.url?.startsWith("/@xmlui-source/")) {
          next();
          return;
        }
        try {
          const url = req.url.split("?")[0];
          const isMap = url.endsWith(".map");
          const sourceUrl = isMap ? url.slice(0, -4) : url;
          const content = isMap
            ? virtualSources?.getMap(sourceUrl)
            : virtualSources?.getContent(sourceUrl);
          if (content === undefined) {
            next();
            return;
          }
          res.statusCode = 200;
          res.setHeader(
            "Content-Type",
            isMap ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
          );
          res.end(typeof content === "string" ? content : JSON.stringify(content));
        } catch (error) {
          res.statusCode = 400;
          res.end((error as Error).message);
        }
      });
    },

    buildEnd() {
      // --- In dev-server mode transforms keep trickling in after the
      // --- dependency-scan build ends, so the summary waits for them instead.
      if (!devServerMode) {
        reportCompiledScriptSummary((message) => this.warn(message));
      }
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

      if (typeContractMode !== "off" && (typeContractWarnCount > 0 || typeContractErrorCount > 0)) {
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

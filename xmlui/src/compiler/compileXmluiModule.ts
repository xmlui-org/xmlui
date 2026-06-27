import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { emitXmluiModule, type XmluiModuleImport } from "./codegen";
import {
  generateEventHandlerFunction,
  generateExpressionFunction,
  handlerUsesSharedYield,
  type SharedYieldHelperOptions,
} from "./codegen/script";
import { compileXmluiSource, throwFirstCompilerDiagnostic } from "./compileXmluiSource";
import type {
  XmluiBindingIr,
  XmluiEventIr,
  XmluiExpressionIrRef,
  XmluiIrTextSegment,
  XmluiModuleIr,
  XmluiNodeIr,
} from "./ir/index";
import { createMappedSourceMap, type RawSourceMap, type SourceMapMapping } from "./sourceMap";
import type { Extension } from "../extensions";
import type { XmluiComponentContract } from "./contracts";

const SHARED_YIELD_HELPER: SharedYieldHelperOptions = {
  createStateName: "__xmluiCreateYieldState",
  checkpointName: "__xmluiYieldIfNeeded",
};

export type CompileXmluiModuleOptions = {
  id: string;
  source: string;
  extensions?: Iterable<Extension>;
  extensionComponents?: Iterable<XmluiComponentContract>;
};

export type CompiledXmluiModule = {
  code: string;
  map: RawSourceMap;
};

export function compileXmluiModule({ id, source, extensions = [] }: CompileXmluiModuleOptions): string {
  return compileXmluiModuleWithSourceMap({ id, source, extensions }).code;
}

export function compileXmluiModuleWithSourceMap({
  id,
  source,
  extensions = [],
  extensionComponents = [],
}: CompileXmluiModuleOptions): CompiledXmluiModule {
  const initial = compileXmluiSource({
    id,
    source,
    validateComponentReferences: false,
    extensions,
    extensionComponents,
  });
  const imports = componentImports(id, initial.document.kind, initial.referencedComponents);
  const userComponents = new Set(imports.map((item) => item.componentName));
  if (initial.document.kind === "component") {
    userComponents.add(initial.document.name);
  }
  const compiled = compileXmluiSource({
    id,
    source,
    knownComponents: userComponents,
    validateComponentReferences: true,
    extensions,
    extensionComponents,
  });
  throwFirstCompilerDiagnostic(compiled);
  const code = emitXmluiModule({ compilerIr: compiled.compilerIr, imports });
  return {
    code,
    map: createXmluiModuleSourceMap(id, source, code, compiled.compilerIr),
  };
}

function createXmluiModuleSourceMap(
  id: string,
  source: string,
  code: string,
  compilerIr: XmluiModuleIr,
): RawSourceMap {
  return createMappedSourceMap({
    file: `${path.basename(id)}?xmlui-module`,
    sourceId: `xmlui-source://${id}`,
    source,
    generated: code,
    mappings: collectModuleSourceMappings(code, compilerIr),
  });
}

function collectModuleSourceMappings(code: string, compilerIr: XmluiModuleIr): SourceMapMapping[] {
  const mappings: SourceMapMapping[] = [];
  const usedOffsets = new Set<number>();
  const visitNode = (node: XmluiNodeIr) => {
    if (node.kind === "text") {
      for (const segment of node.segments) {
        collectTextSegmentMappings(code, segment, mappings, usedOffsets);
      }
      return;
    }
    for (const binding of node.bindings) {
      collectBindingMappings(code, binding, mappings, usedOffsets);
    }
    for (const event of [...node.events, ...node.methods]) {
      collectEventMappings(code, event, mappings, usedOffsets);
    }
    node.children.forEach(visitNode);
  };
  visitNode(compilerIr.definition.root);
  return mappings;
}

function collectTextSegmentMappings(
  code: string,
  segment: XmluiIrTextSegment,
  mappings: SourceMapMapping[],
  usedOffsets: Set<number>,
): void {
  if (segment.kind === "expression") {
    collectExpressionMappings(
      code,
      segment.expression,
      generatedName("expr", segment.expression.source),
      mappings,
      usedOffsets,
    );
  }
}

function collectBindingMappings(
  code: string,
  binding: XmluiBindingIr,
  mappings: SourceMapMapping[],
  usedOffsets: Set<number>,
): void {
  if (binding.expression) {
    collectExpressionMappings(
      code,
      binding.expression,
      generatedName("expr", binding.id),
      mappings,
      usedOffsets,
    );
  }
  for (const segment of binding.textSegments ?? []) {
    collectTextSegmentMappings(code, segment, mappings, usedOffsets);
  }
}

function collectExpressionMappings(
  code: string,
  expression: XmluiExpressionIrRef,
  functionName: string,
  mappings: SourceMapMapping[],
  usedOffsets: Set<number>,
): void {
  const generated = generateExpressionFunction(expression.ir, { functionName });
  collectFunctionMappings(code, generated.functionSource, generated.mappings, mappings, usedOffsets);
}

function collectEventMappings(
  code: string,
  event: XmluiEventIr,
  mappings: SourceMapMapping[],
  usedOffsets: Set<number>,
): void {
  const generated = generateEventHandlerFunction(event.ir, event.writes, {
    yieldHelper: event.ir.options.executionMode === "sync"
      ? "none"
      : handlerUsesSharedYield(event.ir)
        ? SHARED_YIELD_HELPER
        : "inline",
    functionName: generatedName("event", event.id),
  });
  collectFunctionMappings(code, generated.functionSource, generated.mappings, mappings, usedOffsets);
}

function collectFunctionMappings(
  code: string,
  functionSource: string,
  functionMappings: readonly { generatedLine: number; generatedColumn: number; sourceSpan: SourceMapMapping["sourceSpan"] }[],
  mappings: SourceMapMapping[],
  usedOffsets: Set<number>,
): void {
  const functionOffset = findNextUnusedOffset(code, functionSource, usedOffsets);
  if (functionOffset < 0) {
    return;
  }
  const lineStarts = lineStartOffsets(functionSource);
  for (const mapping of functionMappings) {
    const lineStart = lineStarts[mapping.generatedLine];
    if (lineStart === undefined) {
      continue;
    }
    mappings.push({
      generatedOffset: functionOffset + lineStart + mapping.generatedColumn,
      sourceSpan: mapping.sourceSpan,
    });
  }
}

function findNextUnusedOffset(code: string, needle: string, usedOffsets: Set<number>): number {
  let offset = code.indexOf(needle);
  while (offset >= 0 && usedOffsets.has(offset)) {
    offset = code.indexOf(needle, offset + needle.length);
  }
  if (offset >= 0) {
    usedOffsets.add(offset);
  }
  return offset;
}

function lineStartOffsets(source: string): number[] {
  const offsets = [0];
  for (let index = 0; index < source.length; index++) {
    if (source[index] === "\n") {
      offsets.push(index + 1);
    }
  }
  return offsets;
}

function generatedName(prefix: string, value: string | { sourceId: string; span: { start: number; end: number } }): string {
  const source = typeof value === "string"
    ? value
    : `${value.sourceId}:${value.span.start}:${value.span.end}`;
  return `${prefix}_${source.replace(/[^A-Za-z0-9_$]/g, "_")}`;
}

function componentImports(
  id: string,
  documentKind: XmluiModuleIr["document"]["kind"],
  referencedComponents: readonly string[],
): XmluiModuleImport[] {
  const imports = siblingComponentImports(id, referencedComponents);
  if (documentKind === "app") {
    imports.push(...appComponentImports(id, imports, referencedComponents));
  }
  return imports;
}

function siblingComponentImports(id: string, referencedComponents: readonly string[]): XmluiModuleImport[] {
  const dir = path.dirname(id);
  const referenced = new Set(referencedComponents);
  return xmluiFilesInDirectory(dir)
    .filter((file) => file.endsWith(".xmlui") && file !== path.basename(id))
    .filter((file) => referenced.has(path.basename(file, ".xmlui")))
    .sort()
    .map((file, index) => ({
      localName: `component${index}`,
      componentName: path.basename(file, ".xmlui"),
      specifier: `./${file}`,
    }));
}

function appComponentImports(
  id: string,
  existing: readonly XmluiModuleImport[],
  referencedComponents: readonly string[],
): XmluiModuleImport[] {
  const srcDir = path.dirname(id);
  const componentsDir = path.join(srcDir, "components");
  if (!existsSync(componentsDir) || !statSync(componentsDir).isDirectory()) {
    return [];
  }
  const usedComponentNames = new Set(existing.map((item) => item.componentName));
  const referenced = new Set(referencedComponents);
  const files = recursiveXmluiFiles(componentsDir)
    .filter((file) => file.endsWith(".xmlui"))
    .sort();
  const imports: XmluiModuleImport[] = [];
  files.forEach((file) => {
    const componentName = path.basename(file, ".xmlui");
    if (!referenced.has(componentName)) {
      return;
    }
    if (usedComponentNames.has(componentName)) {
      return;
    }
    usedComponentNames.add(componentName);
    const relative = path.relative(srcDir, file).replaceAll(path.sep, "/");
    imports.push({
      localName: `appComponent${imports.length}`,
      componentName,
      specifier: relative.startsWith(".") ? relative : `./${relative}`,
    });
  });
  return imports;
}

function recursiveXmluiFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return recursiveXmluiFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith(".xmlui") ? [fullPath] : [];
  });
}

function xmluiFilesInDirectory(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".xmlui"))
    .map((entry) => entry.name);
}

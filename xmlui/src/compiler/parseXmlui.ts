import {
  getNodeText,
  createErrorDiagnostic,
  MarkupSyntaxKind,
  parseMarkup,
  parseScriptEventHandler,
  parseScriptExpression,
  type MarkupSyntaxNode,
  type ParserDiagnostic,
  type SourceText,
} from "../parser";
import { parseExpressionOrMixedText, parseMixedTextSegments } from "./mixedText";
import type {
  MixedTextSegment,
  ParsedEvent,
  ParsedExpression,
  SourceRange,
  XmluiDocument,
  XmluiElement,
  XmluiNode,
  XmluiParsedBindings,
} from "./ir";
import type { BoundDependency } from "./scriptSemantics";
import {
  compileXmluiEventHandler,
  compileXmluiExpression,
  createChildXmluiScope,
  createXmluiScope,
  lowerScriptEventHandler,
  lowerScriptExpression,
  type XmluiScope,
} from "./scriptSemantics";

type AttributeInfo = {
  name: string;
  value: string;
  nameRange: SourceRange;
  valueRange: SourceRange;
};

export type ParseXmluiOptions = {
  sourceId?: string;
  extensionFunctions?: Iterable<string>;
};

export class XmluiParseError extends Error {
  constructor(public readonly diagnostic: ParserDiagnostic) {
    super(diagnostic.message);
    this.name = "XmluiParseError";
  }
}

export function parseXmlui(source: string, options: ParseXmluiOptions = {}): XmluiDocument {
  const sourceId = options.sourceId ?? "anonymous.xmlui";
  const normalizedSource = normalizeImplicitBooleanAttributes(normalizeCdataSections(source));
  const parsed = parseMarkup(normalizedSource, sourceId);
  if (parsed.diagnostics.length > 0) {
    throw diagnosticToError(parsed.diagnostics[0]);
  }

  const root = rootElement(parsed.node);
  if (!root) {
    throw new Error("XMLUI document is empty.");
  }

  const transformedRoot = transformElement(root, parsed.source, sourceId);

  if (transformedRoot.type === "Component") {
    const name = transformedRoot.props.name;
    if (!name) {
      throw new Error("<Component> requires a name attribute.");
    }
    const componentRoot = stripInternalRoot(transformedRoot, name, sourceId);
    analyzeElementScripts(componentRoot, {
      sourceId,
      allowImplicitGlobals: true,
      extensionFunctions: options.extensionFunctions,
    });
    return {
      kind: "component",
      name,
      root: componentRoot,
    };
  }

  analyzeElementScripts(transformedRoot, {
    sourceId,
    allowImplicitGlobals: false,
    extensionFunctions: options.extensionFunctions,
  });

  return {
    kind: "app",
    root: transformedRoot,
  };
}

function normalizeImplicitBooleanAttributes(source: string): string {
  let result = "";
  let index = 0;
  while (index < source.length) {
    const tagStart = source.indexOf("<", index);
    if (tagStart < 0) {
      result += source.slice(index);
      break;
    }
    result += source.slice(index, tagStart);
    const tagEnd = findTagEnd(source, tagStart + 1);
    if (
      tagEnd < 0 ||
      source.startsWith("<!--", tagStart) ||
      source.startsWith("</", tagStart) ||
      source.startsWith("<!", tagStart) ||
      source.startsWith("<?", tagStart)
    ) {
      result += source.slice(tagStart, tagEnd < 0 ? source.length : tagEnd + 1);
      index = tagEnd < 0 ? source.length : tagEnd + 1;
      continue;
    }
    result += normalizeTagBooleanAttributes(source.slice(tagStart, tagEnd + 1));
    index = tagEnd + 1;
  }
  return result;
}

function findTagEnd(source: string, start: number): number {
  let quote: string | undefined;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === quote) {
        quote = undefined;
      }
      continue;
    }
    if (char === `"` || char === `'`) {
      quote = char;
      continue;
    }
    if (char === ">") {
      return index;
    }
  }
  return -1;
}

function normalizeCdataSections(source: string): string {
  return source.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_match, content: string) =>
    encodeTextEntities(content),
  );
}

function encodeTextEntities(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeTagBooleanAttributes(tag: string): string {
  let index = 1;
  let result = "<";
  while (index < tag.length && /[^\s/>]/.test(tag[index])) {
    result += tag[index++];
  }
  while (index < tag.length) {
    const char = tag[index];
    if (char === ">" || (char === "/" && tag[index + 1] === ">")) {
      result += tag.slice(index);
      break;
    }
    if (!/\s/.test(char)) {
      result += char;
      index++;
      continue;
    }

    const whitespaceStart = index;
    while (index < tag.length && /\s/.test(tag[index])) {
      index++;
    }
    const whitespace = tag.slice(whitespaceStart, index);
    if (tag[index] === ">" || (tag[index] === "/" && tag[index + 1] === ">")) {
      result += whitespace + tag.slice(index);
      break;
    }

    const nameStart = index;
    if (!/[A-Za-z_:]/.test(tag[index])) {
      result += whitespace + tag[index++];
      continue;
    }
    index++;
    while (index < tag.length && /[\w:.-]/.test(tag[index])) {
      index++;
    }
    const name = tag.slice(nameStart, index);
    let lookahead = index;
    while (lookahead < tag.length && /\s/.test(tag[lookahead])) {
      lookahead++;
    }
    if (tag[lookahead] !== "=") {
      result += `${whitespace}${name}="true"`;
      continue;
    }

    result += whitespace + name + tag.slice(index, lookahead + 1);
    index = lookahead + 1;
    while (index < tag.length && /\s/.test(tag[index])) {
      result += tag[index++];
    }
    const quote = tag[index];
    if (quote !== `"` && quote !== `'`) {
      while (index < tag.length && !/[\s/>]/.test(tag[index])) {
        result += tag[index++];
      }
      continue;
    }
    result += tag[index++];
    while (index < tag.length) {
      result += tag[index];
      if (tag[index++] === quote) {
        break;
      }
    }
  }
  return result;
}

type AnalyzeOptions = {
  sourceId: string;
  allowImplicitGlobals: boolean;
  extensionFunctions?: Iterable<string>;
};

function analyzeElementScripts(
  element: XmluiElement,
  options: AnalyzeOptions,
  parentScope?: XmluiScope,
): void {
  const scope = parentScope
    ? createChildXmluiScope(parentScope, element)
    : createXmluiScope(element, {
        sourceId: options.sourceId,
        allowImplicitGlobals: options.allowImplicitGlobals,
        specialNames: options.extensionFunctions,
      });

  analyzeParsedBindings(element.parsed, scope);
  for (const child of element.children) {
    if (child.kind === "element") {
      analyzeElementScripts(child, options, scope);
    } else {
      analyzeTextSegments(child.segments, scope);
    }
  }
}

function analyzeParsedBindings(parsed: XmluiParsedBindings | undefined, scope: XmluiScope): void {
  if (!parsed) {
    return;
  }
  for (const bucket of [parsed.props, parsed.vars, parsed.globals]) {
    if (!bucket) {
      continue;
    }
    for (const value of Object.values(bucket)) {
      if (Array.isArray(value)) {
        analyzeTextSegments(value, scope);
      } else {
        analyzeExpression(value, scope);
      }
    }
  }
  if (parsed.events) {
    for (const event of Object.values(parsed.events)) {
      analyzeEvent(event, scope);
    }
  }
  if (parsed.methods) {
    for (const method of Object.values(parsed.methods)) {
      analyzeEvent(method, scope);
    }
  }
  validateReactiveCycles(parsed);
}

function analyzeTextSegments(segments: MixedTextSegment[] | undefined, scope: XmluiScope): void {
  for (const segment of segments ?? []) {
    if (segment.kind === "expression") {
      analyzeExpression(segment, scope);
    }
  }
}

function analyzeExpression(
  expression: ParsedExpression | Extract<MixedTextSegment, { kind: "expression" }>,
  scope: XmluiScope,
): void {
  const lowered = lowerScriptExpression(expression.ast, scope);
  if (lowered.diagnostics.length > 0) {
    throw diagnosticToError(lowered.diagnostics[0]);
  }
  const compiled = compileXmluiExpression(lowered.ir, lowered.dependencies);
  expression.ir = lowered.ir;
  expression.dependencies = lowered.dependencies;
  expression.bindingMode = lowered.dependencies.some((dependency) =>
    dependency.kind === "local" || dependency.kind === "global" || dependency.kind === "props"
  ) ? "derived" : "source";
  expression.compiledSource = compiled.source;
}

function analyzeEvent(event: ParsedEvent, scope: XmluiScope): void {
  const lowered = lowerScriptEventHandler(event.ast, scope);
  if (lowered.diagnostics.length > 0) {
    throw diagnosticToError(lowered.diagnostics[0]);
  }
  const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
  event.ir = lowered.ir;
  event.options = lowered.ir.options;
  event.dependencies = lowered.dependencies;
  event.writes = lowered.writes;
  event.invalidates = compiled.invalidates;
  event.compiledSource = compiled.source;
}

function validateReactiveCycles(parsed: XmluiParsedBindings | undefined): void {
  validateReactiveBucketCycles("local", parsed?.vars);
  validateReactiveBucketCycles("global", parsed?.globals);
}

function validateReactiveBucketCycles(
  kind: "local" | "global",
  bucket: Record<string, ParsedExpression | MixedTextSegment[]> | undefined,
): void {
  if (!bucket) {
    return;
  }
  const bindings = bucket;
  const names = new Set(Object.keys(bindings));
  const visiting: string[] = [];
  const visited = new Set<string>();

  for (const name of names) {
    visit(name);
  }

  function visit(name: string): void {
    if (visited.has(name)) {
      return;
    }
    const activeIndex = visiting.indexOf(name);
    if (activeIndex >= 0) {
      const cycle = [...visiting.slice(activeIndex), name];
      const parsedValue = bindings[name];
      const range = Array.isArray(parsedValue)
        ? parsedValue[0]?.range
        : parsedValue?.range;
      throw diagnosticToError(
        createErrorDiagnostic(
          "XS301",
          `Reactive XMLUI ${kind} variable cycle detected: ${cycle.join(" -> ")}.`,
          {
            sourceId: scopeSourceId(parsedValue),
            start: range?.start ?? 0,
            end: range?.end ?? 0,
          },
        ),
      );
    }

    visiting.push(name);
    for (const dependency of bindingDependencies(bindings[name])) {
      if (dependency.kind === kind && names.has(dependency.name)) {
        visit(dependency.name);
      }
    }
    visiting.pop();
    visited.add(name);
  }
}

function bindingDependencies(
  parsed: ParsedExpression | MixedTextSegment[] | undefined,
): BoundDependency[] {
  if (!parsed) {
    return [];
  }
  if (Array.isArray(parsed)) {
    return parsed.flatMap((segment) => (segment.kind === "expression" ? segment.dependencies ?? [] : []));
  }
  return parsed.dependencies ?? [];
}

function scopeSourceId(parsed: ParsedExpression | MixedTextSegment[] | undefined): string {
  if (Array.isArray(parsed)) {
    return parsed.find((segment) => segment.kind === "expression")?.ast.span.sourceId ?? "anonymous.xmlui";
  }
  return parsed?.ast.span.sourceId ?? "anonymous.xmlui";
}

function transformElement(
  node: MarkupSyntaxNode,
  source: SourceText,
  sourceId: string,
  inheritedNamespaces: Record<string, string> = {},
): XmluiElement {
  const attributesForElement = attributes(node, source);
  const namespaces = collectNamespaces(attributesForElement, inheritedNamespaces);
  const type = resolveNamespacedName(tagName(node, source), namespaces);
  const props: Record<string, string> = {};
  const vars: Record<string, string> = {};
  const globals: Record<string, string> = {};
  const events: Record<string, string> = {};
  const methods: Record<string, string> = {};
  const parsed: XmluiParsedBindings = {};

  for (const attr of attributesForElement) {
    if (attr.name === "xmlns" || attr.name.startsWith("xmlns:")) {
      continue;
    }
    if (attr.name.startsWith("var.")) {
      const name = attr.name.slice(4);
      vars[name] = attr.value;
      setParsedValue(parsed, "vars", name, attr, sourceId);
      continue;
    }
    if (attr.name.startsWith("global.")) {
      const name = attr.name.slice(7);
      globals[name] = attr.value;
      setParsedValue(parsed, "globals", name, attr, sourceId);
      continue;
    }
    if (/^on[A-Z]/.test(attr.name)) {
      const eventName = attr.name.slice(2, 3).toLowerCase() + attr.name.slice(3);
      events[eventName] = attr.value;
      setParsedEvent(parsed, "events", eventName, attr, sourceId);
      continue;
    }
    if (attr.name.startsWith("method.")) {
      const name = attr.name.slice(7);
      methods[name] = attr.value;
      setParsedEvent(parsed, "methods", name, attr, sourceId);
      continue;
    }
    props[attr.name] = attr.value;
    setParsedValue(parsed, "props", attr.name, attr, sourceId);
  }

  applyScriptDeclarations(node, source, sourceId, vars, parsed);

  if (type === "event" || type === "method") {
    return {
      kind: "element",
      type,
      props,
      vars,
      globals,
      events,
      methods,
      children: type === "event"
        ? eventChildren(node, source, sourceId, namespaces)
        : rawScriptChildren(node, source),
      range: rangeOf(node),
      ...(hasParsedBindings(parsed) ? { parsed } : {}),
    };
  }

  const transformedChildren = contentChildren(node, source, sourceId, namespaces, type);
  const children: XmluiNode[] = [];
  for (const child of transformedChildren) {
    if (child.kind === "element" && child.type === "variable") {
      const variableName = child.props.name;
      if (variableName) {
        vars[variableName] = child.props.value ?? "";
        const parsedValue = child.parsed?.props?.value;
        if (parsedValue) {
          const parsedVars = (parsed.vars ??= {});
          parsedVars[variableName] = parsedValue;
        }
      }
      children.push(child);
      continue;
    }
    if (child.kind === "element" && child.type === "event") {
      const eventName = child.props.name;
      if (!eventName) {
        throw new Error("<event> requires a name attribute.");
      }
      const eventSource = child.children
        .map(eventChildSource)
        .join(" ")
        .trim();
      const range = child.children[0]?.range ?? child.range;
      events[eventName] = eventSource;
      setParsedEventSource(parsed, "events", eventName, eventSource, range, sourceId);
      continue;
    }
    children.push(child);
  }
  return {
    kind: "element",
    type,
    props,
    vars,
    globals,
    events,
    methods,
    children,
    range: rangeOf(node),
    ...(hasParsedBindings(parsed) ? { parsed } : {}),
  };
}

type ScriptDeclaration = {
  name: string;
  value: string;
  range: SourceRange;
};

function applyScriptDeclarations(
  node: MarkupSyntaxNode,
  source: SourceText,
  sourceId: string,
  vars: Record<string, string>,
  parsed: XmluiParsedBindings,
): void {
  for (const block of scriptBlocks(node, source)) {
    const declarations = scriptFunctionDeclarations(block.value, block.range);
    const sourceWithoutFunctions = declarations.reduce(
      (current, declaration) => blankRange(current, declaration.range.start - block.range.start, declaration.range.end - block.range.start),
      block.value,
    );

    for (const declaration of declarations) {
      vars[declaration.name] = declaration.value;
      setParsedValue(parsed, "vars", declaration.name, declarationAttribute(declaration, sourceId), sourceId);
    }
    for (const declaration of scriptVariableDeclarations(sourceWithoutFunctions, block.range)) {
      vars[declaration.name] = declaration.value;
      setParsedValue(parsed, "vars", declaration.name, declarationAttribute(declaration, sourceId), sourceId);
    }
  }
}

function scriptBlocks(
  node: MarkupSyntaxNode,
  source: SourceText,
): ScriptDeclaration[] {
  const content = node.children?.find((child) => child.kind === MarkupSyntaxKind.ContentList);
  const children = content?.children ?? [];
  return children.flatMap((child) => {
    if (child.kind !== MarkupSyntaxKind.Element || tagName(child, source) !== "script") {
      return [];
    }
    const text = rawScriptChildren(child, source)
      .map((scriptChild) => scriptChild.kind === "text" ? scriptChild.value : "")
      .join("\n");
    return [{
      name: "script",
      value: text,
      range: rangeOf(child),
    }];
  });
}

function scriptFunctionDeclarations(script: string, blockRange: SourceRange): ScriptDeclaration[] {
  const declarations: ScriptDeclaration[] = [];
  const pattern = /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(script))) {
    const openBraceIndex = pattern.lastIndex - 1;
    const closeBraceIndex = findMatchingBrace(script, openBraceIndex);
    if (closeBraceIndex < 0) {
      continue;
    }
    const name = match[1];
    const params = match[2].trim();
    const body = script.slice(openBraceIndex + 1, closeBraceIndex).trim();
    const arrowBody = /\breturn\b/.test(body) ? body : `${body}\nreturn undefined;`;
    declarations.push({
      name,
      value: `{(${params}) => {\n${arrowBody}\n}}`,
      range: {
        start: blockRange.start + match.index,
        end: blockRange.start + closeBraceIndex + 1,
      },
    });
    pattern.lastIndex = closeBraceIndex + 1;
  }
  return declarations;
}

function scriptVariableDeclarations(script: string, blockRange: SourceRange): ScriptDeclaration[] {
  const declarations: ScriptDeclaration[] = [];
  const pattern = /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*(?:=\s*([^;]+))?;/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(script))) {
    declarations.push({
      name: match[1],
      value: `{${match[2]?.trim() || "undefined"}}`,
      range: {
        start: blockRange.start + match.index,
        end: blockRange.start + pattern.lastIndex,
      },
    });
  }
  return declarations;
}

function declarationAttribute(declaration: ScriptDeclaration, sourceId: string): AttributeInfo {
  return {
    name: declaration.name,
    value: declaration.value,
    nameRange: declaration.range,
    valueRange: {
      start: declaration.range.start,
      end: declaration.range.end,
    },
  };
}

function findMatchingBrace(source: string, openBraceIndex: number): number {
  let depth = 0;
  let quote: string | undefined;
  for (let index = openBraceIndex; index < source.length; index++) {
    const char = source[index];
    const previous = source[index - 1];
    if (quote) {
      if (char === quote && previous !== "\\") {
        quote = undefined;
      }
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function blankRange(value: string, start: number, end: number): string {
  return value.slice(0, start) + " ".repeat(Math.max(0, end - start)) + value.slice(end);
}

function contentChildren(
  node: MarkupSyntaxNode,
  source: SourceText,
  sourceId: string,
  namespaces: Record<string, string>,
  parentType?: string,
): XmluiNode[] {
  const content = node.children?.find((child) => child.kind === MarkupSyntaxKind.ContentList);
  const children = content?.children ?? [];
  const result: XmluiNode[] = [];

  for (const child of children) {
    if (child.kind === MarkupSyntaxKind.Element) {
      if (tagName(child, source) === "script") {
        continue;
      }
      result.push(transformElement(child, source, sourceId, namespaces));
      continue;
    }
    if (child.kind === MarkupSyntaxKind.Text) {
      const rawText = getNodeText(child, source);
      if (parentType === "Markdown") {
        const value = decodeEntities(rawText).replace(/\r\n?/g, "\n");
        if (!value.trim()) {
          continue;
        }
        result.push({
          kind: "text",
          value,
          range: rangeOf(child),
        });
        continue;
      }
      const value = normalizeText(rawText);
      if (!value) {
        continue;
      }
      const range = rangeOf(child);
      result.push({
        kind: "text",
        value,
        range,
        segments: parseMixedTextSegments(value, range, { sourceId }),
      });
    }
  }

  return result;
}

function eventChildSource(child: XmluiNode): string {
  if (child.kind === "text") {
    return child.value;
  }
  if (child.type === "APICall") {
    return apiCallEventSource(child);
  }
  return "";
}

function eventChildren(
  node: MarkupSyntaxNode,
  source: SourceText,
  sourceId: string,
  namespaces: Record<string, string>,
): XmluiNode[] {
  const content = node.children?.find((child) => child.kind === MarkupSyntaxKind.ContentList);
  const children = content?.children ?? [];
  const result: XmluiNode[] = [];

  for (const child of children) {
    if (child.kind === MarkupSyntaxKind.Text) {
      const rawText = getNodeText(child, source);
      const value = normalizeText(rawText);
      if (!value) {
        continue;
      }
      result.push({
        kind: "text",
        value,
        range: rangeOf(child),
      });
      continue;
    }
    if (child.kind === MarkupSyntaxKind.Element) {
      result.push(transformElement(child, source, sourceId, namespaces));
    }
  }

  return result;
}

function apiCallEventSource(child: XmluiElement): string {
  const resultName = "__xmluiApiResult";
  const mockExecute = child.events.mockExecute;
  const invocation = mockExecute
    ? `${resultName} = ${inlineZeroArgHandlerExpression(mockExecute)}`
    : `${resultName} = Actions.callApi(${objectLiteralFromProps(child.props, [
      "url",
      "method",
      "body",
      "rawBody",
      "queryParams",
      "headers",
      "credentials",
      "invalidates",
      "inProgressNotificationMessage",
      "completedNotificationMessage",
      "errorNotificationMessage",
    ])})`;
  return [
    `let ${resultName}`,
    invocation,
    inlineArrowHandlerStatement(child.events.success, resultName),
  ].filter(Boolean).join("; ");
}

function objectLiteralFromProps(props: Record<string, string>, names: string[]): string {
  const entries = names
    .filter((name) => Object.prototype.hasOwnProperty.call(props, name))
    .map((name) => `${name}: ${propValueSource(props[name])}`);
  return `{ ${entries.join(", ")} }`;
}

function propValueSource(value: string): string {
  const expression = unwrapExpression(value);
  return expression ?? JSON.stringify(decodeEntities(value));
}

function inlineZeroArgHandlerExpression(source: string): string {
  const arrow = parseArrowSource(source);
  if (!arrow) {
    return source;
  }
  return arrow.body;
}

function inlineArrowHandlerStatement(source: string | undefined, argumentSource: string): string {
  if (!source) {
    return "";
  }
  const arrow = parseArrowSource(source);
  if (!arrow) {
    return "";
  }
  if (!arrow.param) {
    return arrow.body;
  }
  return arrow.body.replace(new RegExp(`\\b${escapeRegExp(arrow.param)}\\b`, "g"), argumentSource);
}

function parseArrowSource(source: string): { param?: string; body: string } | undefined {
  const arrowIndex = source.indexOf("=>");
  if (arrowIndex < 0) {
    return undefined;
  }
  const rawParam = source.slice(0, arrowIndex).trim();
  const param = rawParam === "()" ? undefined : rawParam.replace(/^\((.*)\)$/, "$1").trim();
  let body = source.slice(arrowIndex + 2).trim();
  if (body.startsWith("(") && body.endsWith(")")) {
    body = body.slice(1, -1).trim();
  }
  return { param: param || undefined, body };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rawScriptChildren(
  node: MarkupSyntaxNode,
  source: SourceText,
): XmluiNode[] {
  const content = node.children?.find((child) => child.kind === MarkupSyntaxKind.ContentList);
  const children = content?.children ?? [];
  const result: XmluiNode[] = [];

  for (const child of children) {
    if (child.kind === MarkupSyntaxKind.Text) {
      const rawText = getNodeText(child, source);
      const value = normalizeText(rawText);
      if (!value) {
        continue;
      }
      result.push({
        kind: "text",
        value,
        range: rangeOf(child),
      });
    }
  }

  return result;
}

function collectNamespaces(
  attributes: AttributeInfo[],
  inheritedNamespaces: Record<string, string>,
): Record<string, string> {
  const namespaces = { ...inheritedNamespaces };
  for (const attr of attributes) {
    if (attr.name === "xmlns") {
      namespaces[""] = attr.value;
    } else if (attr.name.startsWith("xmlns:")) {
      namespaces[attr.name.slice("xmlns:".length)] = attr.value;
    }
  }
  return namespaces;
}

function resolveNamespacedName(name: string, namespaces: Record<string, string>): string {
  const separator = name.indexOf(":");
  if (separator < 0) {
    return name;
  }
  const prefix = name.slice(0, separator);
  const localName = name.slice(separator + 1);
  const namespace = namespaces[prefix];
  return namespace ? `${namespace}.${localName}` : name;
}

function attributes(node: MarkupSyntaxNode, source: SourceText): AttributeInfo[] {
  const list = node.children?.find((child) => child.kind === MarkupSyntaxKind.AttributeList);
  return (
    list?.children?.flatMap((attribute) => {
      const key = attribute.children?.find((child) => child.kind === MarkupSyntaxKind.AttributeKey);
      const value = attribute.children?.find((child) => child.kind === MarkupSyntaxKind.StringLiteral);
      if (!key || !value) {
        return [];
      }
      const rawValue = value.value ?? stripQuotes(getNodeText(value, source));
      return [
        {
          name: key.children?.map((child) => getNodeText(child, source)).join("") ?? "",
          value: decodeEntities(rawValue),
          nameRange: rangeOf(key),
          valueRange: {
            start: value.pos + 1,
            end: Math.max(value.pos + 1, value.end - 1),
          },
        },
      ];
    }) ?? []
  );
}

function setParsedValue(
  parsed: XmluiParsedBindings,
  bucket: "props" | "vars" | "globals",
  name: string,
  attr: AttributeInfo,
  sourceId: string,
): void {
  const target = (parsed[bucket] ??= {});
  const expression = unwrapExpression(attr.value);
  if (expression !== undefined) {
    const expressionRange = expressionInnerRange(attr.value, attr.valueRange);
    const result = parseScriptExpression(expression, {
      originSpan: {
        sourceId,
        start: expressionRange.start,
        end: expressionRange.end,
      },
    });
    if (result.diagnostics.length > 0) {
      throw diagnosticToError(result.diagnostics[0]);
    }
    target[name] = {
      source: expression,
      ast: result.node,
      range: expressionRange,
    } satisfies ParsedExpression;
    return;
  }

  target[name] = parseExpressionOrMixedText(attr.value, attr.valueRange, { sourceId });
}

function setParsedEvent(
  parsed: XmluiParsedBindings,
  bucket: "events" | "methods",
  name: string,
  attr: AttributeInfo,
  sourceId: string,
): void {
  setParsedEventSource(parsed, bucket, name, attr.value, attr.valueRange, sourceId);
}

function setParsedEventSource(
  parsed: XmluiParsedBindings,
  bucket: "events" | "methods",
  name: string,
  eventSource: string,
  range: SourceRange,
  sourceId: string,
): void {
  const events = (parsed[bucket] ??= {});
  const normalizedEventSource = rewriteSimpleForLoops(eventSource);
  const result = parseScriptEventHandler(normalizedEventSource, {
    originSpan: {
      sourceId,
      start: range.start,
      end: range.end,
    },
  });
  if (result.diagnostics.length > 0) {
    throw diagnosticToError(result.diagnostics[0]);
  }
  events[name] = {
    source: normalizedEventSource,
    ast: result.node,
    range,
  } satisfies ParsedEvent;
}

function rewriteSimpleForLoops(source: string): string {
  let result = "";
  let cursor = 0;
  const pattern = /for\s*\(\s*(?:let|const|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);\s*([^;]+);\s*\1\+\+\s*\)\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    const bodyStart = pattern.lastIndex - 1;
    const bodyEnd = findMatchingBrace(source, bodyStart);
    if (bodyEnd < 0) {
      break;
    }
    const variableName = match[1];
    const initialValue = match[2].trim();
    const condition = match[3].trim();
    const upperBound = condition.match(new RegExp(`^${variableName}\\s*<\\s*(.+)$`))?.[1]?.trim();
    const body = upperBound
      ? source.slice(bodyStart + 1, bodyEnd).replace(/\bbreak\s*;/g, `${variableName} = (${upperBound});`)
      : source.slice(bodyStart + 1, bodyEnd);
    result += source.slice(cursor, match.index);
    result += `{ let ${variableName} = ${initialValue}; while (${condition}) {${body}\n${variableName}++; } };`;
    cursor = bodyEnd + 1;
    pattern.lastIndex = cursor;
  }
  return cursor === 0 ? source : result + source.slice(cursor);
}

function rootElement(node: MarkupSyntaxNode): MarkupSyntaxNode | undefined {
  return node.children
    ?.find((child) => child.kind === MarkupSyntaxKind.ContentList)
    ?.children?.find((child) => child.kind === MarkupSyntaxKind.Element);
}

function tagName(node: MarkupSyntaxNode, source: SourceText): string {
  const name = node.children?.find((child) => child.kind === MarkupSyntaxKind.TagName);
  return name?.children?.map((child) => getNodeText(child, source)).join("") ?? "";
}

function stripInternalRoot(component: XmluiElement, name: string, sourceId: string): XmluiElement {
  const { props: _props, parsed, ...rest } = component;
  const children: XmluiNode[] = [];
  const methods = { ...component.methods };
  const parsedMethods = { ...parsed?.methods };

  for (const child of component.children) {
    if (child.kind === "element" && child.type === "method") {
      const methodName = child.props.name;
      if (methodName) {
        const source = child.children
          .map((methodChild) => methodChild.kind === "text" ? methodChild.value : "")
          .join(" ")
          .trim();
        methods[methodName] = source;
        const range = child.children[0]?.range ?? child.range;
        const result = parseScriptEventHandler(source, {
          originSpan: {
            sourceId,
            start: range.start,
            end: range.end,
          },
        });
        if (result.diagnostics.length > 0) {
          throw diagnosticToError(result.diagnostics[0]);
        }
        parsedMethods[methodName] = {
          source,
          ast: result.node,
          range,
        };
      }
      continue;
    }
    children.push(child);
  }

  const parsedProps = { ...parsed?.props };
  delete parsedProps.name;
  const nextParsed = {
    ...parsed,
    ...(Object.keys(parsedProps).length > 0 ? { props: parsedProps } : { props: undefined }),
    ...(Object.keys(parsedMethods).length > 0 ? { methods: parsedMethods } : { methods: undefined }),
  };
  return {
    ...rest,
    type: name,
    props: {},
    methods,
    children,
    ...(hasParsedBindings(nextParsed) ? { parsed: nextParsed } : {}),
  };
}

function hasParsedBindings(parsed: XmluiParsedBindings): boolean {
  return Boolean(parsed.props || parsed.vars || parsed.globals || parsed.events || parsed.methods);
}

function rangeOf(node: MarkupSyntaxNode): SourceRange {
  return {
    start: node.pos,
    end: node.end,
  };
}

function normalizeText(text: string): string {
  return decodeEntities(text).replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, `"`)
    .replace(/&apos;/g, `'`)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith(`"`) && value.endsWith(`"`)) ||
    (value.startsWith(`'`) && value.endsWith(`'`))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function unwrapExpression(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}") && matchingExpressionBrace(trimmed, 0) === trimmed.length - 1) {
    return trimmed.slice(1, -1).trim();
  }
  return undefined;
}

function matchingExpressionBrace(value: string, openIndex: number): number {
  let depth = 0;
  let quote: string | undefined;
  for (let index = openIndex; index < value.length; index++) {
    const char = value[index];
    if (quote) {
      if (char === "\\" && index + 1 < value.length) {
        index++;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }
    if (char === `"` || char === `'` || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function expressionInnerRange(value: string, range: SourceRange): SourceRange {
  const open = value.indexOf("{");
  const close = value.lastIndexOf("}");
  const inner = value.slice(open + 1, close);
  const leading = inner.length - inner.trimStart().length;
  const trimmed = inner.trim();
  return {
    start: range.start + open + 1 + leading,
    end: range.start + open + 1 + leading + trimmed.length,
  };
}

function diagnosticToError(diagnostic: ParserDiagnostic): Error {
  return new XmluiParseError(diagnostic);
}

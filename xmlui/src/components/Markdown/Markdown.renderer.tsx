import { Children, type CSSProperties, type ReactNode } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { wrapComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useBindingRevision } from "../../runtime/rendering/reactive";
import { readLocal, readReference, type RuntimeScope } from "../../runtime/state";
import { NestedAppComponent } from "../NestedApp/NestedAppReact";
import { CodeText } from "./CodeText";
import { defaultProps, MarkdownMd } from "./Markdown";
import styles from "./Markdown.module.scss";

type Block =
  | { kind: "heading"; level: number; text: string; anchor?: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "code"; language: string; content: string }
  | { kind: "playground"; content: string; height?: string }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "break" };

export const markdownRenderer = wrapComponent({
  name: "Markdown",
  metadata: MarkdownMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    useBindingRevision(undefined, adapter.scope);
    const source = markdownSource(adapter);
    const normalized = adapter.booleanProp("removeIndents", defaultProps.removeIndents)
      ? removeCommonIndent(source)
      : source;
    const recoveredSource = recoverCollapsedMarkdown(normalized);
    const renderedSource = replaceMarkdownBindings(recoveredSource, adapter.scope);
    const blocks = parseMarkdownBlocks(renderedSource, {
      removeBr: adapter.booleanProp("removeBr", defaultProps.removeBr),
    });
    const rootAttrs = adapter.rootAttrs();

    return (
      <div
        {...rootAttrs}
        className={[styles.markdown, rootAttrs.className].filter(Boolean).join(" ")}
        style={rootAttrs.style as CSSProperties}
      >
        {blocks.map((block, index) => renderBlock(block, index, adapter))}
      </div>
    );
  },
});

function markdownSource(adapter: XmluiComponentAdapter): string {
  const content = adapter.prop("content");
  if (content !== undefined && content !== null) {
    return String(content);
  }
  const children = adapter.node.children.filter(isTextNode);
  if (children.length !== adapter.node.children.length) {
    return "";
  }
  return decodeEscapedBraces(children.map((child) => child.value).join(""));
}

function decodeEscapedBraces(value: string): string {
  return value
    .replaceAll("@&#123;", "@\\{")
    .replaceAll("&#123;", "{")
    .replaceAll("&#125;", "}")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", `"`)
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function recoverCollapsedMarkdown(value: string): string {
  return recoverCollapsedTables(recoverCollapsedFences(value));
}

function recoverCollapsedFences(value: string): string {
  return value.replace(/```([\s\S]*?)```/g, (_match, inner: string) => {
    if (inner.includes("\n")) {
      return `\`\`\`${inner}\`\`\``;
    }
    const trimmed = inner.trim();
    const { info, content } = splitCollapsedFence(trimmed);
    return `\n\`\`\`${info}\n${content}\n\`\`\`\n`;
  });
}

function splitCollapsedFence(value: string): { info: string; content: string } {
  const firstSpace = value.search(/\s/);
  if (firstSpace <= 0) {
    return { info: "", content: value };
  }
  const first = value.slice(0, firstSpace);
  if (!isFenceInfo(first)) {
    return { info: "", content: value };
  }
  if (first === "xmlui-pg") {
    const appIndex = value.search(/<App\b/);
    if (appIndex > 0) {
      return {
        info: value.slice(0, appIndex).trim(),
        content: value.slice(appIndex).trim(),
      };
    }
  }
  return {
    info: value.slice(0, firstSpace).trim(),
    content: value.slice(firstSpace).trim(),
  };
}

function isFenceInfo(value: string): boolean {
  return /^(xmlui-pg|xmlui|js|jsx|ts|tsx|json|css|html|bash|sh|text)$/i.test(value);
}

function recoverCollapsedTables(value: string): string {
  return value.replace(/\|\s+\|/g, "|\n|");
}

function isTextNode(node: XmluiNode): node is Extract<XmluiNode, { kind: "text" }> {
  return node.kind === "text";
}

function removeCommonIndent(value: string): string {
  const normalized = value.replace(/\r\n?/g, "\n").replace(/^\n/, "").replace(/\n\s*$/, "");
  const lines = normalized.split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^[ \t]*/)?.[0].replace(/\t/g, "    ").length ?? 0);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return minIndent > 0
    ? lines.map((line) => trimIndent(line, minIndent)).join("\n")
    : normalized;
}

function trimIndent(line: string, count: number): string {
  let consumed = 0;
  let index = 0;
  while (index < line.length && consumed < count) {
    const char = line[index];
    if (char === " ") {
      consumed += 1;
      index += 1;
    } else if (char === "\t") {
      consumed += 4;
      index += 1;
    } else {
      break;
    }
  }
  return line.slice(index);
}

function replaceMarkdownBindings(value: string, scope: RuntimeScope): string {
  return splitFenceSegments(value)
    .map((segment) => segment.fenced ? segment.content : replaceBindingsInText(segment.content, scope))
    .join("");
}

function splitFenceSegments(value: string): Array<{ content: string; fenced: boolean }> {
  const segments: Array<{ content: string; fenced: boolean }> = [];
  const lines = value.split("\n");
  let fenced = false;
  let fence = "";
  let current = "";
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const withBreak = index < lines.length - 1 ? `${line}\n` : line;
    const match = line.match(/^\s*(`{3,})(.*)$/);
    if (!fenced && match) {
      if (current) {
        segments.push({ content: current, fenced: false });
      }
      current = withBreak;
      fenced = true;
      fence = match[1];
    } else if (fenced) {
      current += withBreak;
      if (match && match[1] === fence && match[2].trim() === "") {
        segments.push({ content: current, fenced: true });
        current = "";
        fenced = false;
        fence = "";
      }
    } else {
      current += withBreak;
    }
  }
  if (current) {
    segments.push({ content: current, fenced });
  }
  return segments;
}

function replaceBindingsInText(value: string, scope: RuntimeScope): string {
  let output = "";
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "\\" && value[index + 1] === "@" && value[index + 2] === "{") {
      output += "@{";
      index += 2;
      continue;
    }
    if (value[index] === "@" && value[index + 1] === "\\" && value[index + 2] === "{") {
      output += "@{";
      index += 2;
      continue;
    }
    if (value[index] === "@" && value[index + 1] === "{") {
      const close = findBindingClose(value, index + 2);
      if (close >= 0) {
        const expression = value.slice(index + 2, close).trim();
        output += expression ? stringifyMarkdownValue(evaluateMarkdownExpression(expression, scope)) : "";
        index = close;
        continue;
      }
    }
    output += value[index];
  }
  return output;
}

function findBindingClose(value: string, start: number): number {
  let depth = 0;
  for (let index = start; index < value.length; index += 1) {
    const char = value[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      if (depth === 0) {
        return index;
      }
      depth -= 1;
    }
  }
  return -1;
}

function evaluateMarkdownExpression(expression: string, scope: RuntimeScope): unknown {
  const context = new Proxy<Record<string, unknown>>({}, {
    has: () => true,
    get: (_target, name) => {
      if (typeof name !== "string") {
        return undefined;
      }
      if (name === "undefined") {
        return undefined;
      }
      const local = readLocal(scope, name);
      if (local !== undefined) {
        return local;
      }
      const reference = readReference(scope, name);
      if (reference !== undefined) {
        return reference;
      }
      return (globalThis as Record<string, unknown>)[name];
    },
  });
  try {
    return Function("context", `with (context) { return (${expression}); }`)(context);
  } catch {
    return undefined;
  }
}

function stringifyMarkdownValue(value: unknown): string {
  if (typeof value === "function") {
    return "[xmlui function]";
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value, (_key, entry) =>
      typeof entry === "function" ? "[xmlui function]" : entry,
    );
  }
  return value === undefined || value === null ? "" : String(value);
}

function parseMarkdownBlocks(source: string, options: { removeBr: boolean }): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const fence = line.match(/^\s*(`{3,})([^`]*)$/);
    if (fence) {
      const delimiter = fence[1];
      const info = fence[2].trim();
      const content: string[] = [];
      index += 1;
      while (index < lines.length && !new RegExp(`^\\s*${escapeRegExp(delimiter)}\\s*$`).test(lines[index])) {
        content.push(lines[index]);
        index += 1;
      }
      index += index < lines.length ? 1 : 0;
      if (info.startsWith("xmlui-pg")) {
        blocks.push({ kind: "playground", content: parsePlaygroundApp(content.join("\n")), height: parseFenceHeight(info) });
      } else {
        blocks.push({ kind: "code", language: info.split(/\s+/)[0] ?? "", content: content.join("\n") });
      }
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const parsedHeading = parseHeadingText(heading[2]);
      blocks.push({
        kind: "heading",
        level: heading[1].length,
        text: parsedHeading.text,
        anchor: parsedHeading.anchor,
      });
      index += 1;
      continue;
    }
    if (/^\s*(?:[-*+])\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*(?:[-*+])\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*(?:[-*+])\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "list", items });
      continue;
    }
    if (isTableStart(lines, index)) {
      const headers = splitTableRow(lines[index]);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && /^\s*\|/.test(lines[index])) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ kind: "table", headers, rows });
      continue;
    }
    if (!options.removeBr && /^<br\s*\/?>$/i.test(line.trim())) {
      blocks.push({ kind: "break" });
      index += 1;
      continue;
    }
    if (options.removeBr && /^<br\s*\/?>$/i.test(line.trim())) {
      index += 1;
      continue;
    }
    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^\s*(`{3,})/.test(lines[index]) &&
      !/^\s*(#{1,6})\s+/.test(lines[index]) &&
      !/^\s*(?:[-*+])\s+/.test(lines[index]) &&
      !isTableStart(lines, index)
    ) {
      const nextLine = lines[index].replace(/<br\s*\/?>/gi, options.removeBr ? "" : "\n");
      paragraph.push(nextLine);
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraph.join("\n") });
  }
  return blocks;
}

function renderBlock(block: Block, key: number, adapter: XmluiComponentAdapter): ReactNode {
  switch (block.kind) {
    case "heading": {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      const anchor = block.anchor ?? slugify(block.text);
      return (
        <Tag key={key} id={validHeadingId(anchor)}>
          {renderInline(block.text, key, adapter)}
          {adapter.booleanProp("showHeadingAnchors", defaultProps.showHeadingAnchors) ? (
            <a className={styles.headingAnchor} href={`#${anchor}`} aria-label={block.text}>#</a>
          ) : null}
        </Tag>
      );
    }
    case "paragraph":
      return <p key={key}>{renderInline(block.text, key, adapter)}</p>;
    case "list":
      return <ul key={key}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, itemIndex, adapter)}</li>)}</ul>;
    case "code":
      return <CodeText key={key} language={block.language}>{block.content}</CodeText>;
    case "playground":
      return (
        <div key={key} className={styles.playground} data-testid="markdown-playground">
          <NestedAppComponent app={block.content} height={block.height} />
        </div>
      );
    case "table":
      return (
        <table key={key}>
          <thead><tr>{block.headers.map((cell, cellIndex) => <th key={cellIndex}>{renderInline(cell, cellIndex, adapter)}</th>)}</tr></thead>
          <tbody>{block.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{renderInline(cell, cellIndex, adapter)}</td>)}</tr>
          ))}</tbody>
        </table>
      );
    case "break":
      return <br key={key} />;
  }
}

function renderInline(text: string, keyPrefix: number, adapter: XmluiComponentAdapter): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\n)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;
    if (token === "\n") {
      nodes.push(<br key={key} />);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const newTab = adapter.booleanProp("openLinkInNewTab", defaultProps.openLinkInNewTab);
      nodes.push(
        <a key={key} href={link?.[2]} target={newTab ? "_blank" : undefined} rel={newTab ? "noreferrer" : undefined}>
          {link?.[1]}
        </a>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return Children.toArray(nodes);
}

function parseHeadingText(text: string): { text: string; anchor?: string } {
  const explicit = text.match(/^(.*)\s+\[#([^\]]+)\]\s*$/);
  return explicit ? { text: explicit[1], anchor: explicit[2] } : { text };
}

function slugify(text: string): string {
  const slug = text.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "heading";
}

function validHeadingId(id: string): string {
  return /^[A-Za-z_]/.test(id) ? id : `_${id}`;
}

function isTableStart(lines: string[], index: number): boolean {
  const header = splitTableRow(lines[index] ?? "");
  const separator = splitTableRow(lines[index + 1] ?? "");
  return header.length > 0 &&
    separator.length === header.length &&
    separator.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(row: string): string[] {
  return row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function parsePlaygroundApp(content: string): string {
  const source = content.replace(/(?<!`)````(?!`)/g, "```").trim();
  const appSegment = source.match(/(?:^|\n)---app[^\n]*\n([\s\S]*)$/);
  return (appSegment?.[1] ?? source).trim();
}

function parseFenceHeight(info: string): string | undefined {
  return info.match(/\bheight="([^"]+)"/)?.[1];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

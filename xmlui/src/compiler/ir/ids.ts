import type { SourceSpan } from "../../parser";
import type { XmluiIrId } from "./types";

export type XmluiIrIdKind =
  | "module"
  | "definition"
  | "node"
  | "binding"
  | "event"
  | "scope"
  | "slot"
  | "prop";

export type XmluiIrIdParts = {
  sourceId: string;
  kind: XmluiIrIdKind;
  path?: readonly (string | number)[];
  name?: string;
};

export function createXmluiIrId(parts: XmluiIrIdParts): XmluiIrId {
  const path = parts.path?.map(escapePart).join("/") ?? "root";
  const suffix = parts.name ? `:${escapePart(parts.name)}` : "";
  return `${parts.kind}:${escapePart(parts.sourceId)}:${path}${suffix}` as XmluiIrId;
}

export function createXmluiIrSourceRef(sourceId: string, span: SourceSpan) {
  return {
    sourceId,
    span,
  };
}

export function sourceSpanFromOffsets(sourceId: string, start: number, end: number): SourceSpan {
  return {
    sourceId,
    start,
    end,
  };
}

function escapePart(part: string | number): string {
  return String(part).replace(/[%:/]/g, (ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, "0")}`);
}

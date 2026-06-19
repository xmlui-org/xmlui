import { createContractRegistry } from "../compiler/contracts";
import { generateXmluiMetadata } from "./generator";
import type { XmluiMetadataArtifact } from "./types";

export type XmluiCompletionItem = {
  label: string;
  kind: "component" | "prop" | "event" | "template" | "variable" | "api";
  detail: string;
};

export function getXmluiCompletions(
  text: string,
  offset: number,
  metadata: XmluiMetadataArtifact = generateXmluiMetadata({ registry: createContractRegistry() }),
): XmluiCompletionItem[] {
  const before = text.slice(0, offset);
  const tag = currentOpenTag(before);
  if (/<[A-Za-z0-9_]*$/.test(before)) {
    return metadata.components.map((component) => ({
      label: component.name,
      kind: "component",
      detail: component.description,
    }));
  }
  if (/(\s|<)[A-Za-z][A-Za-z0-9_:-]*\s+[^>]*$/.test(before) && tag) {
    const component = metadata.components.find((component) => component.name === tag);
    if (!component) {
      return [];
    }
    return [
      ...component.props.map((prop) => ({ label: prop.name, kind: "prop" as const, detail: prop.description })),
      ...component.events.map((event) => ({ label: event.attributeName, kind: "event" as const, detail: event.description })),
      ...component.templates.map((template) => ({ label: template.name, kind: "template" as const, detail: template.description })),
      { label: "var.", kind: "variable" as const, detail: "Declare a local XMLUI variable." },
      { label: "global.", kind: "variable" as const, detail: "Declare an app-global XMLUI variable." },
    ].sort((left, right) => left.label.localeCompare(right.label));
  }
  if (/\{[^}]*\$[A-Za-z0-9_]*$/.test(before)) {
    return metadata.globals
      .filter((item) => item.name.startsWith("$"))
      .map((item) => ({ label: item.name, kind: "variable", detail: item.description }));
  }
  return [];
}

function currentOpenTag(text: string): string | undefined {
  const open = text.lastIndexOf("<");
  const close = text.lastIndexOf(">");
  if (open < 0 || close > open || text[open + 1] === "/") {
    return undefined;
  }
  return /^<([A-Za-z][A-Za-z0-9_]*)/.exec(text.slice(open))?.[1];
}


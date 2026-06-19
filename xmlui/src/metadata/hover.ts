import { createContractRegistry } from "../compiler/contracts";
import { generateXmluiMetadata } from "./generator";
import type { XmluiMetadataArtifact } from "./types";

export type XmluiHoverInfo = {
  title: string;
  body: string;
};

export function getXmluiHoverInfo(
  text: string,
  offset: number,
  metadata: XmluiMetadataArtifact = generateXmluiMetadata({ registry: createContractRegistry() }),
): XmluiHoverInfo | undefined {
  const word = wordAt(text, offset);
  if (!word) {
    return undefined;
  }
  const component = metadata.components.find((component) => component.name === word.value);
  if (component) {
    return {
      title: `<${component.name}>`,
      body: component.description,
    };
  }
  const tag = currentOpenTag(text.slice(0, offset));
  if (tag) {
    const tagMetadata = metadata.components.find((component) => component.name === tag);
    const prop = tagMetadata?.props.find((prop) => prop.name === word.value);
    if (prop) {
      return { title: `${tag}.${prop.name}`, body: prop.description };
    }
    const event = tagMetadata?.events.find((event) => event.attributeName === word.value || event.name === word.value);
    if (event) {
      return { title: `${tag}.${event.attributeName}`, body: event.description };
    }
  }
  for (const componentMetadata of metadata.components) {
    const context = componentMetadata.contextVariables.find((context) => context.name === word.value);
    if (context) {
      return { title: context.name, body: context.description };
    }
  }
  return undefined;
}

function wordAt(text: string, offset: number): { value: string; start: number; end: number } | undefined {
  let start = offset;
  while (start > 0 && /[A-Za-z0-9_$]/.test(text[start - 1])) {
    start--;
  }
  let end = offset;
  while (end < text.length && /[A-Za-z0-9_$]/.test(text[end])) {
    end++;
  }
  const value = text.slice(start, end);
  return value ? { value, start, end } : undefined;
}

function currentOpenTag(text: string): string | undefined {
  const open = text.lastIndexOf("<");
  const close = text.lastIndexOf(">");
  if (open < 0 || close > open || text[open + 1] === "/") {
    return undefined;
  }
  return /^<([A-Za-z][A-Za-z0-9_]*)/.exec(text.slice(open))?.[1];
}


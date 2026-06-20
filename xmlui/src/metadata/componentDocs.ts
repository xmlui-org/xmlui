import {
  collectedBehaviorMetadata,
  canBehaviorAttachToComponent,
  type ComponentMetadata,
} from "../components";
import type {
  XmluiComponentMetadata,
  XmluiEventMetadata,
  XmluiMemberMetadata,
} from "./types";

export type ComponentDocsBlocks = {
  description?: string;
  style?: string;
  props: Record<string, string>;
  events: Record<string, string>;
  apis: Record<string, string>;
  rest: string;
};

export type GenerateComponentReferenceOptions = {
  additionalMarkdown?: string;
  componentMetadata?: ComponentMetadata;
};

export function parseComponentDocsMarkdown(markdown: string): ComponentDocsBlocks {
  const blocks: ComponentDocsBlocks = {
    props: {},
    events: {},
    apis: {},
    rest: markdown,
  };
  let rest = markdown;
  const blockSpecs = [
    { kind: "description" as const, start: "%-DESC-START", end: "%-DESC-END" },
    { kind: "style" as const, start: "%-STYLE-START", end: "%-STYLE-END" },
  ];
  for (const spec of blockSpecs) {
    const block = extractSingleBlock(rest, spec.start, spec.end);
    if (block) {
      blocks[spec.kind] = block.content.trim();
      rest = block.rest;
    }
  }
  for (const kind of ["PROP", "EVENT", "API"] as const) {
    const extracted = extractNamedBlocks(rest, kind);
    rest = extracted.rest;
    const target = kind === "PROP" ? blocks.props : kind === "EVENT" ? blocks.events : blocks.apis;
    Object.assign(target, extracted.blocks);
  }
  blocks.rest = rest.trim();
  return blocks;
}

export function generateComponentReferenceMarkdown(
  component: XmluiComponentMetadata,
  options: GenerateComponentReferenceOptions = {},
): string {
  const blocks = parseComponentDocsMarkdown(options.additionalMarkdown ?? "");
  const description = [component.description, blocks.description].filter(Boolean).join("\n\n");
  const lines = [
    `# ${component.name}`,
    "",
    description,
    "",
  ];

  appendMembers(lines, "Props", component.props, blocks.props);
  appendEvents(lines, component.events, blocks.events);
  appendMembers(lines, "APIs", component.apis, blocks.apis);
  appendMembers(lines, "Context Variables", component.contextVariables);
  appendMembers(lines, "Templates", component.templates);

  const behaviorRows = behaviorRowsForComponent(component.name, options.componentMetadata);
  if (behaviorRows.length > 0) {
    lines.push("## Behaviors", "");
    lines.push("| Name | Trigger Props | Description |");
    lines.push("|---|---|---|");
    lines.push(...behaviorRows);
    lines.push("");
  }

  if (blocks.style) {
    lines.push("## Styling", "");
    lines.push(blocks.style, "");
  }
  if (blocks.rest) {
    lines.push(blocks.rest, "");
  }
  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function componentReferenceSectionTitles(markdown: string): string[] {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^#{1,4} /.test(line))
    .map((line) => line.trim());
}

function appendMembers(
  lines: string[],
  title: string,
  members: XmluiMemberMetadata[],
  additions: Record<string, string> = {},
): void {
  lines.push(`## ${title}`, "");
  if (members.length === 0) {
    lines.push(`This component has no documented ${title.toLowerCase()} in the current metadata subset.`, "");
    return;
  }
  lines.push("| Name | Type | Description |");
  lines.push("|---|---|---|");
  for (const member of members) {
    lines.push(`| ${member.name} | ${member.type} | ${member.description} |`);
    if (additions[member.name]) {
      lines.push("", additions[member.name].trim(), "");
    }
  }
  lines.push("");
}

function appendEvents(
  lines: string[],
  events: XmluiEventMetadata[],
  additions: Record<string, string> = {},
): void {
  lines.push("## Events", "");
  if (events.length === 0) {
    lines.push("This component has no documented events in the current metadata subset.", "");
    return;
  }
  lines.push("| Attribute | Description |");
  lines.push("|---|---|");
  for (const event of events) {
    lines.push(`| ${event.attributeName} | ${event.description} |`);
    if (additions[event.name]) {
      lines.push("", additions[event.name].trim(), "");
    }
  }
  lines.push("");
}

function behaviorRowsForComponent(
  componentName: string,
  metadata?: ComponentMetadata,
): string[] {
  if (!metadata) {
    return [];
  }
  return Object.values(collectedBehaviorMetadata)
    .filter((behavior) => canBehaviorAttachToComponent(behavior, metadata, componentName))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((behavior) =>
      `| ${behavior.friendlyName ?? behavior.name} | ${behavior.triggerProps.map((prop) => `\`${prop}\``).join(", ")} | ${behavior.description} |`
    );
}

function extractSingleBlock(
  markdown: string,
  startMarker: string,
  endMarker: string,
): { content: string; rest: string } | undefined {
  const start = markdown.indexOf(startMarker);
  const end = markdown.indexOf(endMarker);
  if (start < 0 || end < start) {
    return undefined;
  }
  return {
    content: markdown.slice(start + startMarker.length, end),
    rest: `${markdown.slice(0, start)}${markdown.slice(end + endMarker.length)}`,
  };
}

function extractNamedBlocks(
  markdown: string,
  kind: "PROP" | "EVENT" | "API",
): { blocks: Record<string, string>; rest: string } {
  const blocks: Record<string, string> = {};
  const pattern = new RegExp(`%-${kind}-START\\s+([^\\n\\r]+)\\s*([\\s\\S]*?)%-${kind}-END`, "g");
  const rest = markdown.replace(pattern, (_match, name: string, content: string) => {
    blocks[name.trim()] = content.trim();
    return "";
  });
  return { blocks, rest };
}

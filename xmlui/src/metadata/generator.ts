import { createHash } from "node:crypto";

import { parseXmlui } from "../compiler/parseXmlui";
import {
  createContractRegistry,
  type XmluiComponentContract,
  type XmluiContractRegistry,
} from "../compiler/contracts";
import { normalizeExtensions, type Extension } from "../extensions";
import type { XmluiNode } from "../compiler/ir";
import { layoutPropNameSet } from "../styling";
import {
  componentDescription,
  eventDescription,
  propDescription,
} from "./descriptions";
import {
  XMLUI_METADATA_SCHEMA_VERSION,
  type XmluiComponentMetadata,
  type XmluiDiagnosticMetadata,
  type XmluiExampleMetadata,
  type XmluiGlobalMetadata,
  type XmluiMetadataArtifact,
} from "./types";

export type GenerateXmluiMetadataOptions = {
  registry?: XmluiContractRegistry;
  userComponents?: Array<{ id: string; source: string }>;
  extensions?: Iterable<Extension>;
  examples?: XmluiExampleMetadata[];
};

export function generateXmluiMetadata(
  options: GenerateXmluiMetadataOptions = {},
): XmluiMetadataArtifact {
  const normalizedExtensions = normalizeExtensions(options.extensions ?? []);
  const registry = options.registry ?? createContractRegistry({
    extensionComponents: normalizedExtensions.contracts,
  });
  const userComponentContracts = extractUserComponentMetadata(options.userComponents ?? []);
  const components = [
    ...registry.list().map((contract) => contractToMetadata(
      contract,
      options.examples ?? [],
      normalizedExtensions.components.find((component) =>
        component.localName === contract.name || component.qualifiedName === contract.name
      )?.description,
    )),
    ...userComponentContracts,
  ].sort((left, right) => left.name.localeCompare(right.name));
  const contractHash = hash(JSON.stringify(components.map((component) => ({
    name: component.name,
    props: component.props.map((prop) => prop.name),
    events: component.events.map((event) => event.attributeName),
  }))));

  return {
    schemaVersion: XMLUI_METADATA_SCHEMA_VERSION,
    generatedAt: new Date(0).toISOString(),
    components,
    globals: defaultGlobals(),
    diagnostics: defaultDiagnostics(),
    examples: [...(options.examples ?? defaultExamples())].sort((left, right) => left.name.localeCompare(right.name)),
    source: {
      compilerVersion: "experimental",
      contractHash,
    },
  };
}

function defaultGlobals(): XmluiGlobalMetadata[] {
  const globals: XmluiGlobalMetadata[] = [
    { name: "$props", kind: "special", description: "Current component props." },
    { name: "$routeParams", kind: "special", description: "Current route parameters." },
    { name: "$queryParams", kind: "special", description: "Current query parameters." },
    { name: "$item", kind: "special", description: "Current item in an item template." },
    { name: "delay", kind: "function", description: "Waits for a number of milliseconds in an event handler." },
    { name: "navigate", kind: "function", description: "Navigates to another XMLUI route." },
  ];
  return globals.sort((left, right) => left.name.localeCompare(right.name));
}

function defaultDiagnostics(): XmluiDiagnosticMetadata[] {
  const diagnostics: XmluiDiagnosticMetadata[] = [
    { code: "XP010", category: "parser", severity: "error", description: "Markup parser error." },
    { code: "XS201", category: "compiler", severity: "error", description: "Unresolved XMLUI script identifier." },
    { code: "XC002", category: "contract", severity: "error", description: "Unknown component property." },
    { code: "XC003", category: "contract", severity: "error", description: "Unknown component event." },
  ];
  return diagnostics;
}

export function validateXmluiMetadataArtifact(artifact: XmluiMetadataArtifact): string[] {
  const errors: string[] = [];
  if (artifact.schemaVersion !== XMLUI_METADATA_SCHEMA_VERSION) {
    errors.push(`Unsupported XMLUI metadata schema version ${artifact.schemaVersion}.`);
  }
  const names = new Set<string>();
  for (const component of artifact.components) {
    if (names.has(component.name)) {
      errors.push(`Duplicate component metadata '${component.name}'.`);
    }
    names.add(component.name);
    if (component.events.some((event) => !event.attributeName.startsWith("on"))) {
      errors.push(`Component '${component.name}' has an event without an on* attribute name.`);
    }
  }
  return errors;
}

export function metadataToJson(artifact: XmluiMetadataArtifact): string {
  return `${JSON.stringify(sortArtifact(artifact), null, 2)}\n`;
}

function contractToMetadata(
  contract: XmluiComponentContract,
  examples: XmluiExampleMetadata[],
  description?: string,
): XmluiComponentMetadata {
  const propNames = Object.keys(contract.props).sort();
  return {
    name: contract.name,
    kind: contract.kind,
    category: categoryForComponent(contract.name),
    description: description ?? componentDescription(contract.name),
    docsPath: `/docs/reference/components/${contract.name}`,
    allowsChildren: contract.allowsChildren,
    acceptsArbitraryProps: contract.acceptsArbitraryProps === true,
    declarations: {
      local: contract.declarations.local === true,
      global: contract.declarations.global === true,
    },
    props: propNames.map((name) => ({
      name,
      type: inferPropType(name),
      description: propDescription(name),
      required: false,
      expressionSupported: true,
    })),
    events: Object.values(contract.events)
      .sort((left, right) => left.attributeName.localeCompare(right.attributeName))
      .map((event) => ({
        name: event.name,
        attributeName: event.attributeName,
        type: "eventHandler",
        description: eventDescription(event.name),
        required: false,
        expressionSupported: false,
        async: true,
      })),
    templates: Object.keys(contract.templates ?? {}).sort().map((name) => member(name, "template")),
    contextVariables: Object.keys(contract.contextVariables ?? {}).sort().map((name) => member(name, "context")),
    apis: Object.keys(contract.apis ?? {}).sort().map((name) => member(name, "api")),
    layoutProps: propNames.some((name) => layoutPropNameSet.has(name)),
    examples: examples
      .filter((example) => example.components.includes(contract.name))
      .map((example) => example.name)
      .sort(),
  };
}

function extractUserComponentMetadata(
  sources: Array<{ id: string; source: string }>,
): XmluiComponentMetadata[] {
  return sources.flatMap((source) => {
    const document = parseXmlui(source.source, { sourceId: source.id });
    if (document.kind !== "component") {
      return [];
    }
    const props = new Set<string>();
    collectProps(document.root, props);
    return [{
      name: document.name,
      kind: "user",
      category: "user",
      description: `${document.name} user-defined component.`,
      allowsChildren: true,
      acceptsArbitraryProps: true,
      declarations: { local: true, global: false },
      props: [...props].sort().map((name) => ({
        name,
        type: "unknown",
        description: `${name} prop read from $props.`,
        required: false,
        expressionSupported: true,
      })),
      events: Object.keys(document.root.events).sort().map((name) => ({
        name,
        attributeName: name,
        type: "eventHandler",
        description: eventDescription(name),
        required: false,
        expressionSupported: false,
        async: true,
      })),
      templates: [],
      contextVariables: [],
      apis: Object.keys(document.root.methods).sort().map((name) => member(name, "api")),
      layoutProps: false,
      source: { id: source.id, start: document.root.range.start, end: document.root.range.end },
      examples: [],
    }];
  });
}

function collectProps(node: XmluiNode, props: Set<string>): void {
  if (node.kind === "text") {
    for (const segment of node.segments ?? []) {
      if (segment.kind === "expression") {
        collectPropsFromSource(segment.source, props);
      }
    }
    return;
  }
  for (const expression of Object.values(node.parsed?.props ?? {})) {
    if (!Array.isArray(expression)) {
      collectPropsFromSource(expression.source, props);
    }
  }
  for (const child of node.children) {
    collectProps(child, props);
  }
}

function collectPropsFromSource(source: string, props: Set<string>): void {
  for (const match of source.matchAll(/\$props\.([A-Za-z_$][A-Za-z0-9_$]*)/g)) {
    props.add(match[1]);
  }
}

function member(name: string, type: string) {
  return {
    name,
    type,
    description: `${name} ${type}.`,
    required: false,
    expressionSupported: true,
  };
}

function inferPropType(name: string): string {
  if (/^(enabled|readOnly|exact|active|clearable|searchable|multiSelect|reverse|indeterminate)$/.test(name)) {
    return "boolean";
  }
  if (/^(pollIntervalInSeconds|level|zIndex|opacity|zoom)$/.test(name)) {
    return "number";
  }
  if (/^(items|data|headers|queryParams|body|mockData|updates|invalidates)$/.test(name)) {
    return "any";
  }
  return "string";
}

function categoryForComponent(name: string): string {
  if (["HStack", "VStack", "Stack", "NavPanel"].includes(name)) {
    return "layout";
  }
  if (["DataSource", "APICall"].includes(name)) {
    return "data";
  }
  if (["Pages", "Page", "NavLink"].includes(name)) {
    return "routing";
  }
  if (["TextBox", "Checkbox", "Select", "Option"].includes(name)) {
    return "input";
  }
  return "core";
}

function defaultExamples(): XmluiExampleMetadata[] {
  return [
    {
      name: "counter-components",
      path: "standalone-samples/counter-components/Main.xmlui",
      demonstratesMutation: true,
      components: ["App", "H1", "Button", "IncrementButton"],
    },
    {
      name: "style-mutation",
      path: "standalone-samples/style-mutation/Main.xmlui",
      demonstratesMutation: true,
      components: ["App", "VStack", "H1", "Text", "Button"],
    },
    {
      name: "routing-state",
      path: "standalone-samples/routing-state/Main.xmlui",
      demonstratesMutation: true,
      components: ["App", "NavPanel", "NavLink", "Pages", "Page", "H1", "Text", "Button"],
    },
  ];
}

function sortArtifact(artifact: XmluiMetadataArtifact): XmluiMetadataArtifact {
  return {
    ...artifact,
    components: [...artifact.components].sort((left, right) => left.name.localeCompare(right.name)),
    examples: [...artifact.examples].sort((left, right) => left.name.localeCompare(right.name)),
    globals: [...artifact.globals].sort((left, right) => left.name.localeCompare(right.name)),
    diagnostics: [...artifact.diagnostics].sort((left, right) => left.code.localeCompare(right.code)),
  };
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

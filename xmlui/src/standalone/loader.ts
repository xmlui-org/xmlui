import { compileXmluiSource, throwFirstCompilerDiagnostic } from "../compiler/compileXmluiSource";
import type { XmluiDocumentInput, XmluiModule } from "../runtime";
import { createXmluiModule } from "../runtime";

export type StandaloneSource = {
  url: string;
  source: string;
};

export type StandaloneLoadOptions = {
  entry?: string;
  baseUrl?: string | URL;
  fetch?: typeof globalThis.fetch;
};

export type StandaloneLoadResult = {
  module: Extract<XmluiModule, { kind: "app" }>;
  sources: StandaloneSource[];
  referencedComponents: string[];
};

export class StandaloneLoadError extends Error {
  constructor(
    message: string,
    readonly details: { url?: string; status?: number; componentName?: string } = {},
  ) {
    super(message);
    this.name = "StandaloneLoadError";
  }
}

type LoadedSource = StandaloneSource & {
  componentName?: string;
};

export async function loadStandaloneXmluiApp(
  options: StandaloneLoadOptions = {},
): Promise<StandaloneLoadResult> {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new StandaloneLoadError("Standalone XMLUI loading requires fetch().");
  }

  const entryUrl = resolveUrl(options.entry ?? "Main.xmlui", options.baseUrl);
  const sources = new Map<string, LoadedSource>();
  const entry = await fetchSource(fetchImpl, entryUrl);
  sources.set(entry.url, entry);

  const initial = compileXmluiSource({
    id: entry.url,
    source: entry.source,
    validateComponentReferences: false,
  });
  const pending = [...initial.referencedComponents];
  const componentUrls = new Map<string, string>();

  while (pending.length > 0) {
    const componentName = pending.shift()!;
    if (componentUrls.has(componentName)) {
      continue;
    }
    const componentUrl = new URL(`${componentName}.xmlui`, entryUrl);
    componentUrls.set(componentName, componentUrl.href);
    const source = await fetchSource(fetchImpl, componentUrl, componentName);
    sources.set(source.url, source);
    const compiled = compileXmluiSource({
      id: source.url,
      source: source.source,
      validateComponentReferences: false,
    });
    if (compiled.document.kind !== "component") {
      throw new StandaloneLoadError(
        `Standalone component file '${componentName}.xmlui' must contain a <Component> root.`,
        { url: componentUrl.href, componentName },
      );
    }
    for (const reference of compiled.referencedComponents) {
      if (!componentUrls.has(reference)) {
        pending.push(reference);
      }
    }
  }

  const knownComponents = new Set(componentUrls.keys());
  const compiledEntry = compileXmluiSource({
    id: entry.url,
    source: entry.source,
    knownComponents,
  });
  throwFirstCompilerDiagnostic(compiledEntry);

  const componentDocuments: XmluiDocumentInput[] = [];
  for (const [componentName, componentUrl] of componentUrls) {
    const source = sources.get(componentUrl);
    if (!source) {
      throw new StandaloneLoadError(`Standalone component '${componentName}' was not loaded.`, {
        url: componentUrl,
        componentName,
      });
    }
    const compiled = compileXmluiSource({
      id: componentUrl,
      source: source.source,
      knownComponents,
    });
    throwFirstCompilerDiagnostic(compiled);
    if (compiled.runtimeDocument.kind !== "component") {
      throw new StandaloneLoadError(
        `Standalone component file '${componentName}.xmlui' must compile to a component.`,
        { url: componentUrl, componentName },
      );
    }
    componentDocuments.push(compiled.runtimeDocument);
  }

  const module = createXmluiModule(
    compiledEntry.runtimeDocument,
    componentDocuments.map((document) => createXmluiModule(document)),
  );
  if (module.kind !== "app") {
    throw new StandaloneLoadError("Standalone entry must compile to an XMLUI app.", { url: entry.url });
  }
  return {
    module,
    sources: [...sources.values()],
    referencedComponents: [...knownComponents].sort(),
  };
}

async function fetchSource(
  fetchImpl: typeof globalThis.fetch,
  url: URL,
  componentName?: string,
): Promise<LoadedSource> {
  let response: Response;
  try {
    response = await fetchImpl(url.href, { cache: "no-cache" });
  } catch (error) {
    throw new StandaloneLoadError(
      `Failed to load XMLUI source '${url.href}'.`,
      { url: url.href, componentName },
    );
  }
  if (!response.ok) {
    throw new StandaloneLoadError(
      `Failed to load XMLUI source '${url.href}' (${response.status}).`,
      { url: url.href, status: response.status, componentName },
    );
  }
  return {
    url: url.href,
    source: await response.text(),
    ...(componentName ? { componentName } : {}),
  };
}

function resolveUrl(entry: string, baseUrl: string | URL | undefined): URL {
  const base = baseUrl ?? (typeof document === "undefined" ? "http://localhost/" : document.baseURI);
  return new URL(entry, base);
}

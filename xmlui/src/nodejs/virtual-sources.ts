import path from "node:path";
import type { CompiledScriptSource } from "../components-core/script-compiler/types";

export type VirtualSourceRecord = CompiledScriptSource & {
  map?: unknown;
};

export class XmluiVirtualSourceRegistry {
  private readonly sources = new Map<string, VirtualSourceRecord>();

  constructor(private readonly root: string) {}

  register(source: CompiledScriptSource, map?: unknown): VirtualSourceRecord {
    const record: VirtualSourceRecord = { ...source, map };
    this.sources.set(this.normalizeUrl(source.url ?? source.id), record);
    return record;
  }

  registerAll(sources: CompiledScriptSource[]): void {
    for (const source of sources) {
      this.register(source);
    }
  }

  get(url: string): VirtualSourceRecord | undefined {
    return this.sources.get(this.normalizeUrl(url));
  }

  getContent(url: string): string | undefined {
    return this.get(url)?.sourceText;
  }

  getMap(url: string): unknown {
    return this.get(url)?.map;
  }

  createUrl(file: string): string {
    const normalized = normalizePath(file);
    const root = normalizePath(this.root).replace(/\/$/, "");
    const relative = normalized.startsWith(`${root}/`)
      ? normalized.slice(root.length + 1)
      : normalized.replace(/^\/+/, "");
    assertSafeVirtualPath(relative);
    return `/@xmlui-source/${relative}`;
  }

  private normalizeUrl(url: string): string {
    const normalized = normalizePath(url);
    if (normalized.startsWith("/@xmlui-source/")) {
      const virtualPath = normalized.slice("/@xmlui-source/".length);
      assertSafeVirtualPath(virtualPath);
      return `/@xmlui-source/${virtualPath}`;
    }
    return this.createUrl(normalized);
  }
}

export function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

export function assertSafeVirtualPath(value: string): void {
  const decoded = decodeURIComponent(value);
  if (
    decoded.startsWith("/") ||
    decoded.includes("\0") ||
    decoded.split("/").some((part) => part === "..") ||
    path.posix.normalize(decoded).startsWith("../")
  ) {
    throw new Error(`Unsafe XMLUI virtual source path: ${value}`);
  }
}

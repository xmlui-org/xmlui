import { TextDocument } from "./text-document";
import type { TextDocuments } from "vscode-languageserver";
import { glob } from "glob";
import * as fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import type { DocumentStore } from "./document-store";

export class ProjectDocumentManager implements DocumentStore {
  private diskDocs: Map<string, TextDocument> = new Map();
  private knownFiles: Set<string> = new Set();

  constructor(private readonly openDocuments: TextDocuments<TextDocument>) {}

  /**
   * Scans the workspace for all .xmlui files.
   */
  public async scan(rootPath: string) {
    // Find all .xmlui files using glob
    const files = await glob("**/*.xmlui", {
      cwd: rootPath,
      absolute: true,
      ignore: "**/node_modules/**",
    });

    this.knownFiles.clear();
    for (const file of files) {
      // Convert file path to URI
      const uri = pathToFileURL(file).toString();
      this.knownFiles.add(uri);
    }
  }

  public get(uri: string): TextDocument | undefined {
    // 1. Priority: Return the open document (managed by LSP, contains unsaved changes)
    const openDoc = this.openDocuments.get(uri);
    if (openDoc) return openDoc;

    // 2. Check if it's a known file on disk
    if (!this.knownFiles.has(uri)) return undefined;

    // 3. Check cache
    if (this.diskDocs.has(uri)) return this.diskDocs.get(uri);

    // 4. Read from disk (Lazy loading)
    try {
      const filePath = fileURLToPath(uri);
      const content = fs.readFileSync(filePath, "utf-8");
      // Version 0 for disk files
      const doc = TextDocument.create(uri, "xmlui", 0, content);
      this.diskDocs.set(uri, doc);
      return doc;
    } catch (error) {
      console.error(`Failed to load document: ${uri}`, error);
      return undefined;
    }
  }

  public all(): TextDocument[] {
    const result: TextDocument[] = [];

    // Get all open documents first
    const openDocs = this.openDocuments.all();
    const openUris = new Set(openDocs.map((d) => d.uri));
    result.push(...openDocs);

    // Add disk documents that are NOT open
    for (const uri of this.knownFiles) {
      if (!openUris.has(uri)) {
        // This will trigger lazy load if not already in cache
        // TODO: this is a blocking operation in a loop. Make this async
        const doc = this.get(uri);
        if (doc) result.push(doc);
      }
    }

    return result;
  }

  public keys(): string[] {
    // Union of open docs and known disk files
    const openKeys = this.openDocuments.keys();
    const allKeys = new Set([...openKeys, ...this.knownFiles]);
    return Array.from(allKeys);
  }

  // --- Cache Invalidation Helpers ---

  public markCreated(uri: string) {
    this.knownFiles.add(uri);
  }

  public markChanged(uri: string) {
    // If it's open, TextDocuments handles it. If closed, invalidate disk cache.
    // The next time get(uri) is called, it will re-read from disk.
    this.diskDocs.delete(uri);
    this.knownFiles.add(uri);
  }

  public markDeleted(uri: string) {
    this.knownFiles.delete(uri);
    this.diskDocs.delete(uri);
  }
}

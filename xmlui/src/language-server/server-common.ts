import type {
  Connection,
  InitializeParams,
  TextDocumentPositionParams,
  InitializeResult,
  HoverParams,
  DocumentFormattingParams,
} from "vscode-languageserver";
import {
  TextDocumentSyncKind,
  DidChangeConfigurationNotification,
  TextDocuments,
  DidChangeWatchedFilesNotification,
  FileChangeType,
} from "vscode-languageserver";
import { TextDocument } from "./base/text-document";
import collectedComponentMetadata from "./xmlui-metadata-generated.js";
import type { XmluiCompletionItem } from "./services/completion";
import { handleCompletion, handleCompletionResolve } from "./services/completion";
import { handleHover } from "./services/hover";
import { handleDocumentFormatting } from "./services/format";
import {
  MetadataProvider,
  type ComponentMetadataCollection,
} from "./services/common/metadata-utils";
import { getDiagnostics } from "./services/diagnostic";
import { Project } from "./base/project.js";
import { handleDefinition } from "./services/definition.js";
import { ProjectDocumentManager } from "./base/project-document-manager";
import { fileURLToPath } from "url";

const metaByComp = collectedComponentMetadata as ComponentMetadataCollection;
const metadataProvider = new MetadataProvider(metaByComp);

export function start(connection: Connection) {
  const documents = new TextDocuments(TextDocument);
  const documentManager = new ProjectDocumentManager(documents);
  const project = new Project(documentManager, metadataProvider);

  let hasConfigurationCapability = false;
  let hasWorkspaceFolderCapability = false;

  connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;
    hasConfigurationCapability = !!(
      capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );

    const rootUri = params.workspaceFolders?.[0]?.uri || params.rootUri || null;
    if (rootUri) {
      try {
        const rootPath = fileURLToPath(rootUri);
        documentManager.scan(rootPath).catch((err) => connection.console.error(String(err)));
      } catch (e) {
        connection.console.error(`Failed to scan workspace: ${e}`);
      }
    }

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: {
          resolveProvider: true,
          triggerCharacters: ["<", "/"],
        },
        hoverProvider: true,
        documentFormattingProvider: true,
        definitionProvider: true,
      },
    };
    if (hasWorkspaceFolderCapability) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };
    }
    return result;
  });

  connection.onInitialized(() => {
    if (hasConfigurationCapability) {
      void connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }

    // Register for file watchers to keep our manager up to date
    void connection.client.register(DidChangeWatchedFilesNotification.type, {
      watchers: [{ globPattern: "**/*.xmlui" }],
    });
  });

  connection.onDidChangeWatchedFiles((params) => {
    for (const change of params.changes) {
      switch (change.type) {
        case FileChangeType.Created:
          documentManager.markCreated(change.uri);
          break;
        case FileChangeType.Changed:
          documentManager.markChanged(change.uri);
          break;
        case FileChangeType.Deleted:
          documentManager.markDeleted(change.uri);
          break;
      }
    }
  });

  connection.onCompletion(({ position, textDocument }: TextDocumentPositionParams) => {
    return handleCompletion(project, textDocument.uri, position);
  });

  connection.onCompletionResolve((completionItem: XmluiCompletionItem) => {
    return handleCompletionResolve({ metaByComp: metadataProvider, item: completionItem });
  });

  connection.onHover(({ position, textDocument }: HoverParams) => {
    return handleHover(project, textDocument.uri, position);
  });

  connection.onDefinition(({ position, textDocument }) => {
    return handleDefinition(project, textDocument.uri, position);
  });

  connection.onDocumentFormatting(({ textDocument, options }: DocumentFormattingParams) => {
    return handleDocumentFormatting(project, textDocument.uri, options);
  });

  documents.onDidChangeContent(({ document }) => {
    const diagnostics = getDiagnostics(project, document.uri);
    void connection.sendDiagnostics({
      version: document.version,
      uri: document.uri,
      diagnostics,
    });
  });

  documents.listen(connection);
  connection.listen();
}

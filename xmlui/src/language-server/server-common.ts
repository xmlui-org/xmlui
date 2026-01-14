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
} from "vscode-languageserver";
import { TextDocument } from "./base/text-document";
import collectedComponentMetadata from "./xmlui-metadata-generated.js";
import type { XmluiCompletionItem } from "./services/completion";
import { handleCompletionWithProject, handleCompletionResolve } from "./services/completion";
import { handleHover } from "./services/hover";
import { handleDocumentFormattingWithProject } from "./services/format";
import {
  MetadataProvider,
  type ComponentMetadataCollection,
} from "./services/common/metadata-utils";
import { getDiagnostics, getDiagnosticsForDocument } from "./services/diagnostic";
import { Project } from "./base/project.js";
import { handleDefinition } from "./services/definition.js";

const metaByComp = collectedComponentMetadata as ComponentMetadataCollection;
const metadataProvider = new MetadataProvider(metaByComp);

export function start(connection: Connection) {
  const documents = new TextDocuments(TextDocument);
  const project = new Project(documents, metadataProvider);

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

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: {
          resolveProvider: true,
          triggerCharacters: ["<", "/"],
        },
        hoverProvider: true,
        documentFormattingProvider: true,
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
    if (hasWorkspaceFolderCapability) {
      connection.workspace.onDidChangeWorkspaceFolders((_event) => {
        connection.console.log("Workspace folder change event received.");
      });
    }
  });

  connection.onCompletion(({ position, textDocument }: TextDocumentPositionParams) => {
    return handleCompletionWithProject(project, textDocument.uri, position);
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
    return handleDocumentFormattingWithProject(project, textDocument.uri, options);
  });

  documents.onDidChangeContent(({ document }) => {
    const diagnostics = getDiagnosticsForDocument(project, document.uri);
    void connection.sendDiagnostics({
      version: document.version,
      uri: document.uri,
      diagnostics,
    });
  });

  documents.listen(connection);
  connection.listen();
}

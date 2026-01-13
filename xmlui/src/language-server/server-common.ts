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

const metaByComp = collectedComponentMetadata as ComponentMetadataCollection;
const metadataProvider = new MetadataProvider(metaByComp);

export function start(connection: Connection) {
  const documents = new TextDocuments(TextDocument);
  const project = new Project(documents);

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
    const document = documents.get(textDocument.uri);
    if (!document) {
      return [];
    }
    const parsedDocument = project.getParsedDocument(document);
    if (!parsedDocument) {
      return [];
    }
    return handleCompletion(
      {
        parseResult: parsedDocument.parseResult,
        getText: parsedDocument.getText,
        metaByComp: metadataProvider,
        offsetToPos: (offset: number) => document.positionAt(offset),
      },
      document.offsetAt(position),
    );
  });

  connection.onCompletionResolve((completionItem: XmluiCompletionItem) => {
    return handleCompletionResolve({ metaByComp: metadataProvider, item: completionItem });
  });

  connection.onHover(({ position, textDocument }: HoverParams) => {
    const document = documents.get(textDocument.uri);
    if (!document) {
      return null;
    }
    const parsedDocument = project.getParsedDocument(document);
    if (!parsedDocument) {
      return null;
    }
    const { parseResult, getText } = parsedDocument;
    const ctx = {
      node: parseResult.node,
      getText,
      metaByComp: metadataProvider,
      offsetToPosition: (offset: number) => document.positionAt(offset),
    };
    return handleHover(ctx, document.offsetAt(position));
  });

  connection.onDefinition(({ position, textDocument }) => {
    return handleDefinition(project, textDocument.uri, position);
  });

  connection.onDocumentFormatting(({ textDocument, options }: DocumentFormattingParams) => {
    const document = documents.get(textDocument.uri);
    if (!document) {
      return null;
    }
    const parsedDocument = project.getParsedDocument(document);
    if (!parsedDocument) {
      return null;
    }
    const {
      parseResult: { node },
      getText,
    } = parsedDocument;
    return handleDocumentFormatting({
      node,
      getText,
      options,
      offsetToPosition: (offset) => document.positionAt(offset),
    });
  });

  documents.onDidChangeContent(({ document }) => {
    const parsedDocument = project.getParsedDocument(document);
    if (!parsedDocument) {
      return;
    }
    const ctx = {
      parseResult: parsedDocument.parseResult,
      offsetToPos: (offset: number) => document.positionAt(offset),
    };
    const diagnostics = getDiagnostics(ctx);
    void connection.sendDiagnostics({
      version: document.version,
      uri: document.uri,
      diagnostics,
    });
  });

  documents.listen(connection);
  connection.listen();
}

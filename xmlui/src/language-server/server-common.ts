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
import { TextDocument } from "vscode-languageserver-textdocument";
import collectedComponentMetadata from "./xmlui-metadata-generated.js";
import type { XmluiCompletionItem } from "./services/completion";
import { handleCompletion, handleCompletionResolve } from "./services/completion";
import { handleHover } from "./services/hover";
import { handleDocumentFormatting } from "./services/format";
import { createXmlUiParser, type GetText, type ParseResult } from "../parsers/xmlui-parser/parser";
import {
  MetadataProvider,
  type ComponentMetadataCollection,
} from "./services/common/metadata-utils";
import { getDiagnostics } from "./services/diagnostic";

const metaByComp = collectedComponentMetadata as ComponentMetadataCollection;
const metadataProvider = new MetadataProvider(metaByComp);

export function start(connection: Connection) {
  // Also include all preview / proposed LSP features.
  // Create a simple text document manager.
  const documents = new TextDocuments(TextDocument);

  let hasConfigurationCapability = false;
  let hasWorkspaceFolderCapability = false;
  let hasDiagnosticRelatedInformationCapability = false;

  connection.onInitialize((params: InitializeParams) => {
    connection.console.log("Initializing!");
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(
      capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
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
      // Register for all configuration changes.
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
    const parseResult = parseDocument(document);
    return handleCompletion(
      {
        parseResult: parseResult.parseResult,
        getText: parseResult.getText,
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

    const { parseResult, getText } = parseDocument(document);
    const ctx = {
      node: parseResult.node,
      getText,
      metaByComp: metadataProvider,
      offsetToPosition: (offset: number) => document.positionAt(offset),
    };
    return handleHover(ctx, document.offsetAt(position));
  });

  connection.onDocumentFormatting(({ textDocument, options }: DocumentFormattingParams) => {
    const document = documents.get(textDocument.uri);
    if (!document) {
      return null;
    }
    const {
      parseResult: { node },
      getText,
    } = parseDocument(document);
    return handleDocumentFormatting({
      node,
      getText,
      options,
      offsetToPosition: (offset) => document.positionAt(offset),
    });
  });

  const parsedDocuments = new Map();
  function parseDocument(document: TextDocument): {
    parseResult: ParseResult;
    getText: GetText;
  } {
    const parseForDoc = parsedDocuments.get(document.uri);
    if (parseForDoc !== undefined) {
      if (parseForDoc.version === document.version) {
        return {
          parseResult: parseForDoc.parseResult,
          getText: parseForDoc.getText,
        };
      }
    }
    const parser = createXmlUiParser(document.getText());
    const parseResult = parser.parse();
    parsedDocuments.set(document.uri, {
      parseResult,
      version: document.version,
      getText: parser.getText,
    });
    return { parseResult, getText: parser.getText };
  }
  documents.onDidClose(({ document }) => {
    parsedDocuments.delete(document.uri);
  });

  documents.onDidChangeContent(handleDocunentContentChange);

  function handleDocunentContentChange({ document }: { document: TextDocument }) {
    const { parseResult } = parseDocument(document);
    const ctx = {
      parseResult,
      offsetToPos: (offset: number) => document.positionAt(offset),
    };

    const diagnostics = getDiagnostics(ctx);
    void connection.sendDiagnostics({
      version: document.version,
      uri: document.uri,
      diagnostics,
    });
  }

  // Make the text document manager listen on the connection
  // for open, change and close text document events
  documents.listen(connection);

  // Listen on the connection
  console.log("starting to listen");
  connection.listen();
}

import type {
	InitializeParams,
	CompletionItem,
	TextDocumentPositionParams,
	InitializeResult,
  HoverParams,
} from 'vscode-languageserver/node';
import {
  createConnection,
  MarkupKind,
  TextDocumentSyncKind,
  DidChangeConfigurationNotification,
  TextDocuments,
  ProposedFeatures,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { collectedComponentMetadata } from "./xmlui-metadata.mjs";
import {handleCompletion, handleCompletionResolve} from "./services/completion";
import {handleHover} from "./services/hover";
import { createXmlUiParser, type GetText, type ParseResult } from '../parsers/xmlui-parser/parser';

export function start(){
  // Create a connection for the server, using Node's IPC as a transport.
  // Also include all preview / proposed LSP features.
  const connection = createConnection(ProposedFeatures.all);

  // Create a simple text document manager.
  const documents = new TextDocuments(TextDocument);

  let hasConfigurationCapability = false;
  let hasWorkspaceFolderCapability = false;
  let hasDiagnosticRelatedInformationCapability = false;

  connection.onInitialize((params: InitializeParams) => {
    connection.console.log("initing!")
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
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true,
				triggerCharacters: ["<", "/"],
			},

			hoverProvider: true,
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
  });

  connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
  });

  connection.onCompletion(async ({ position, textDocument }: TextDocumentPositionParams) => {
    connection.console.log(`Received request completion`);
    const document = documents.get(textDocument.uri);
    if (!document) {
      return [];
    }
    const parseResult = getParseResult(document);
    return handleCompletion(parseResult.parseResult, document.offsetAt(position), parseResult.getText);
  });

  connection.onCompletionResolve(handleCompletionResolve);

  connection.onHover(({ position, textDocument }: HoverParams) => {
    connection.console.log(`Received request hover`);
    const document = documents.get(textDocument.uri);
    if (!document) {
      return null;
    }

    const parseResult = getParseResult(document);
    const ctx = {
      parseResult,
      collectedComponentMetadata
    }
    const hoverRes = handleHover(ctx, document.offsetAt(position));
    if (hoverRes === null){
      return null;
    }
    const { value, range } = hoverRes;
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value,
      },
      range: {
        start: document.positionAt(range.pos),
        end: document.positionAt(range.end),
      },
    };
  });

  const parseResults = new Map();
  function getParseResult(document: TextDocument): {
    parseResult: ParseResult;
    getText: GetText;
  } {
    const parseForDoc = parseResults.get(document.uri);
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
    parseResults.set(document.uri, {
      parseResult,
      version: document.version,
      getText: parser.getText,
    });
    return { parseResult, getText: parser.getText };
  }

  // Make the text document manager listen on the connection
  // for open, change and close text document events
  documents.listen(connection);

  // Listen on the connection
  connection.listen();
}

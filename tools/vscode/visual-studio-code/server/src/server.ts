import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  Connection,
  MarkupKind,
  HoverParams,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { handleCompleteion } from './services/completion';
import { handleHover } from './services/hover';
import { createXmlUiParser, GetText, ParseResult } from './xmlui-parser/parser';

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection: Connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: ['<', '/'],
      },
      hoverProvider: true,
    },
  };
});

connection.onCompletion(
  async ({ position, textDocument }: TextDocumentPositionParams) => {
    connection.console.log(`Received request completion`);
    const document = documents.get(textDocument.uri);
    if (!document) {
      return [];
    }
    const parseResult = getParseResult(document);
    return handleCompleteion(parseResult.parseResult, document.offsetAt(position), parseResult.getText);
  },
);

connection.onHover(({ position, textDocument }: HoverParams) => {
  connection.console.log(`Received request hover`);
  const document = documents.get(textDocument.uri);
  if (!document) {
    return null;
  }

  const parseResult = getParseResult(document);
  const { value, range } = handleHover(
    parseResult.parseResult,
    document.offsetAt(position),
  );
  return {
    contents: {
      kind: MarkupKind.PlainText,
      value,
    },
    range: {
      start: document.positionAt(range.pos),
      end: document.positionAt(range.end),
    },
  };
});

const parseResults = new Map();
function getParseResult(document: TextDocument): {parseResult: ParseResult, getText: GetText} {
  const parseForDoc = parseResults.get(document.uri);
  if (parseForDoc !== undefined) {
    if (parseForDoc.version === document.version) {
      connection.console.log('using cached parse result');
      return { parseResult: parseForDoc.parseResult,getText: parseForDoc.getText};
    }
  }
  const parser = createXmlUiParser(document.getText());
  const parseResult = parser.parse();
  parseResults.set(document.uri, {
    parseResult,
    version: document.version,
    getText: parser.getText,
  });
  connection.console.log('recomputing parse result');
  return {parseResult, getText: parser.getText};
}
connection.onDidOpenTextDocument((/* params */) => {
  // A text document got opened in VSCode.
  // params.textDocument.uri uniquely identifies the document. For documents store on disk this is a file URI.
  // params.textDocument.text the initial full content of the document.
  // connection.console.log(`${params.textDocument.uri} opened.`);
});

connection.onDidChangeTextDocument((/* params */) => {
  // The content of a text document did change in VSCode.
  // params.textDocument.uri uniquely identifies the document.
  // params.contentChanges describe the content changes to the document.
  // connection.console.log(
  //   `${params.textDocument.uri} changed: ${JSON.stringify(
  //     params.contentChanges
  //   )}`
  // );
});
connection.onDidCloseTextDocument((/* params */) => {
  // A text document got closed in VSCode.
  // params.textDocument.uri uniquely identifies the document.
  // connection.console.log(`${params.textDocument.uri} closed.`);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
documents.onDidChangeContent(function (e) {
  e.document.uri;
});
// Listen on the connection
connection.listen();

import * as vscode from "vscode";

import { collectXmluiCompletions } from "./completions";
import { collectXmluiDiagnostics } from "./diagnostics";
import { collectXmluiHover } from "./hover";
import { collectXmluiSemanticTokens, tokenTypes } from "./semanticTokens";

const legend = new vscode.SemanticTokensLegend([...tokenTypes], []);

export function activate(context: vscode.ExtensionContext): void {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection("xmlui");
  context.subscriptions.push(
    diagnosticCollection,
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: "xmlui", scheme: "file" },
      new XmluiSemanticTokensProvider(),
      legend,
    ),
    vscode.languages.registerCompletionItemProvider(
      { language: "xmlui", scheme: "file" },
      new XmluiCompletionProvider(),
      "<",
      " ",
      "$",
    ),
    vscode.languages.registerHoverProvider(
      { language: "xmlui", scheme: "file" },
      new XmluiHoverProvider(),
    ),
    vscode.workspace.onDidOpenTextDocument((document) =>
      updateDiagnostics(document, diagnosticCollection),
    ),
    vscode.workspace.onDidChangeTextDocument((event) =>
      updateDiagnostics(event.document, diagnosticCollection),
    ),
    vscode.workspace.onDidCloseTextDocument((document) =>
      diagnosticCollection.delete(document.uri),
    ),
  );

  for (const document of vscode.workspace.textDocuments) {
    updateDiagnostics(document, diagnosticCollection);
  }
}

export function deactivate(): void {
  // Nothing to dispose manually; VS Code owns registered subscriptions.
}

function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
): void {
  if (document.languageId !== "xmlui") {
    return;
  }
  const diagnostics = collectXmluiDiagnostics(document.getText(), document.uri.fsPath).map(
    (diagnostic) => {
      const item = new vscode.Diagnostic(
        new vscode.Range(
          diagnostic.line,
          diagnostic.character,
          diagnostic.endLine,
          diagnostic.endCharacter,
        ),
        diagnostic.message,
        diagnostic.severity === "error"
          ? vscode.DiagnosticSeverity.Error
          : vscode.DiagnosticSeverity.Warning,
      );
      item.code = diagnostic.code;
      item.source = "xmlui";
      return item;
    },
  );
  collection.set(document.uri, diagnostics);
}

class XmluiSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
  provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.ProviderResult<vscode.SemanticTokens> {
    const builder = new vscode.SemanticTokensBuilder(legend);
    for (const token of collectXmluiSemanticTokens(document.getText())) {
      builder.push(token.line, token.character, token.length, tokenTypes.indexOf(token.tokenType), 0);
    }
    return builder.build();
  }
}

class XmluiCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
    const offset = document.offsetAt(position);
    return collectXmluiCompletions(document.getText(), offset).map((completion) => {
      const item = new vscode.CompletionItem(
        completion.label,
        completionKind(completion.kind),
      );
      item.detail = completion.detail;
      return item;
    });
  }
}

class XmluiHoverProvider implements vscode.HoverProvider {
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
    const hover = collectXmluiHover(document.getText(), document.offsetAt(position));
    if (!hover) {
      return undefined;
    }
    return new vscode.Hover([`**${hover.title}**`, hover.body]);
  }
}

function completionKind(kind: ReturnType<typeof collectXmluiCompletions>[number]["kind"]): vscode.CompletionItemKind {
  switch (kind) {
    case "component":
      return vscode.CompletionItemKind.Class;
    case "event":
      return vscode.CompletionItemKind.Event;
    case "template":
      return vscode.CompletionItemKind.Snippet;
    case "variable":
      return vscode.CompletionItemKind.Variable;
    case "api":
      return vscode.CompletionItemKind.Method;
    default:
      return vscode.CompletionItemKind.Property;
  }
}

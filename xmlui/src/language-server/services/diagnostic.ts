import { DiagnosticSeverity, type Diagnostic } from "vscode-languageserver";
import type { ParserDiag } from "../../parsers/xmlui-parser/diagnostics";
import type { ParseResult } from "../../parsers/xmlui-parser/parser";
import type { Project } from "../base/project";
import type { DocumentUri, DocumentCursor } from "../base/text-document";
import { analyze } from "../../components-core/analyzer";
import { xmlUiMarkupToComponent } from "../../components-core/xmlui-parser";
import { getReactiveCycleDiagnostics } from "./reactive-cycle-diagnostic";
import { getA11yDiagnostics } from "./a11y-diagnostic";
import { getTypeContractDiagnostics } from "./type-contract-diagnostic";
import type { MetadataProvider } from "./common/metadata-utils";

export type DiagnosticsContext = {
  cursor: DocumentCursor;
  parseResult: ParseResult;
  source?: string;
  uri?: string;
  /**
   * When supplied, the accessibility linter runs against the parsed tree using
   * the a11y metadata slice from the provider.  Omit to skip a11y diagnostics
   * (e.g., in lightweight callers that don't have a project).
   */
  metadataProvider?: MetadataProvider;
};

function getDiagnosticsInternal(ctx: DiagnosticsContext): Diagnostic[] {
  const { errors } = ctx.parseResult;

  const parserDiags = errors.map((e) => {
    return errorToLspDiag(e, ctx.cursor);
  });

  // Run the build-validator analyzer on the raw source
  const analyzerDiags: Diagnostic[] = [];
  if (ctx.source && ctx.uri) {
    try {
      const findings = analyze({ files: [{ file: ctx.uri, source: ctx.source }], strict: false });
      for (const d of findings) {
        const line = Math.max(0, (d.line ?? 1) - 1);
        const col = Math.max(0, (d.column ?? 1) - 1);
        analyzerDiags.push({
          severity: d.severity === "error"
            ? DiagnosticSeverity.Error
            : d.severity === "warn"
              ? DiagnosticSeverity.Warning
              : DiagnosticSeverity.Information,
          range: {
            start: { line, character: col },
            end: { line, character: col + 1 },
          },
          message: d.message,
          code: d.code,
          source: "xmlui-check",
        });
      }
    } catch {
      // Analyzer must never crash the LSP server
    }
  }

  return [
    ...parserDiags,
    ...analyzerDiags,
    ...reactiveCycleDiags(ctx),
    ...typeContractDiags(ctx),
    ...a11yDiags(ctx),
  ];
}

/**
 * Reactive cycle detection — Plan #03 Step 3.3 (W6-7).
 *
 * Re-parses the document into a `ComponentDef` (cheap; cached parsers are
 * not threaded through this code path yet) and runs the cycle detector.
 * Failures are swallowed inside `getReactiveCycleDiagnostics`.
 */
function reactiveCycleDiags(ctx: DiagnosticsContext): Diagnostic[] {
  if (!ctx.source) return [];
  try {
    const { component } = xmlUiMarkupToComponent(ctx.source, ctx.uri ?? 0);
    return getReactiveCycleDiagnostics(component, { uri: ctx.uri });
  } catch {
    return [];
  }
}

/**
 * Accessibility linting — Plan #05 Phase 1 Step 1.3.
 *
 * Re-parses the document (shares the same parse as reactive-cycle above; a
 * future refactor can cache it) and runs `lintComponentDef()`. Returns empty
 * when `metadataProvider` is absent or the source is missing.
 */
function a11yDiags(ctx: DiagnosticsContext): Diagnostic[] {
  if (!ctx.source || !ctx.metadataProvider) return [];
  try {
    const { component } = xmlUiMarkupToComponent(ctx.source, ctx.uri ?? 0);
    return getA11yDiagnostics(component, ctx.metadataProvider, /* strict */ false);
  } catch {
    return [];
  }
}

/**
 * Verified type contracts — Plan #01 Step 3.1.
 */
function typeContractDiags(ctx: DiagnosticsContext): Diagnostic[] {
  if (!ctx.source || !ctx.metadataProvider) return [];
  try {
    const { component } = xmlUiMarkupToComponent(ctx.source, ctx.uri ?? 0);
    return getTypeContractDiagnostics(component, ctx.metadataProvider, /* strict */ false);
  } catch {
    return [];
  }
}

export function errorToLspDiag(e: ParserDiag, cursor: DocumentCursor): Diagnostic {
  return {
    severity: DiagnosticSeverity.Error,
    range: cursor.rangeAt(e),
    message: e.message,
    code: e.code,
  };
}

export function getDiagnostics(project: Project, uri: DocumentUri): Diagnostic[] {
  const document = project.documents.get(uri);
  if (!document) {
    return [];
  }
  const { parseResult } = document.parse();
  const source = document.getText();
  const ctx = {
    parseResult,
    cursor: document.cursor,
    source,
    uri,
    metadataProvider: project.metadataProvider,
  };
  return getDiagnosticsInternal(ctx);
}

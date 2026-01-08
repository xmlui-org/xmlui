import type { Diagnostic, Position } from "vscode-languageserver";
import type { ParserDiag } from "../../parsers/xmlui-parser/diagnostics";
import { offsetRangeToPosRange } from "./common/lsp-utils";

export type DiagnosticsContext = {
  offsetToPos: (pos: number) => Position;
  parseResult: ParseResult;
};

export function getDiagnostics(ctx: DiagnosticsContext): Diagnostic[] {
  const { errors } = ctx.parseResult;

  return errors.map((e) => {
    return errorToLspDiag(e, ctx.offsetToPos);
  });
}

export function errorToLspDiag(e: ParserDiag, offsetToPos: (number) => Position): Diagnostic {
  return {
    severity: e.category,
    range: offsetRangeToPosRange(offsetToPos, e),
    message: e.message,
    code: e.code,
  };
}

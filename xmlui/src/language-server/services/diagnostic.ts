import { Diagnostic, Position } from "vscode-languageserver";
import { Error, ParseResult } from "../../parsers/xmlui-parser";
import { offsetToPosRange } from "./common/lsp-utils";

export type DiagnosticsContext = {
  offsetToPos: (pos: number) => Position;
  parseResult: ParseResult;
}


export function getDiagnostics(ctx: DiagnosticsContext): Diagnostic[] {
  const { errors } = ctx.parseResult;

  return errors.map((e) => {
    return errorToLspDiag(e, ctx.offsetToPos);
  });
}

export function errorToLspDiag(e: Error, offsetToPos: (number) => Position): Diagnostic{
  return {
    severity: e.category,
    range: offsetToPosRange(offsetToPos, e),
    message: e.message,
    code: e.code,
  }
}

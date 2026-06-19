import type { MixedTextSegment, ParsedEvent, ParsedExpression } from "../ir";
import { rawJs, type EmitJsValue } from "./emitter";
import { generateEventHandlerFunction, generateExpressionFunction } from "./script";

export function emitGeneratedExpressionBinding(
  expression: ParsedExpression | Extract<MixedTextSegment, { kind: "expression" }>,
): EmitJsValue {
  if (!expression.ir) {
    throw new Error(`Cannot generate unbound XMLUI expression '${expression.source}'.`);
  }
  const generated = generateExpressionFunction(expression.ir);
  return {
    source: expression.source,
    ast: expression.ast,
    range: expression.range,
    ir: expression.ir,
    compiledSource: generated.body,
    evaluate: rawJs(generated.functionSource),
    dependencies: expression.dependencies,
    ...("expressionRange" in expression ? { expressionRange: expression.expressionRange } : {}),
  };
}

export function emitGeneratedMixedTextSegment(segment: MixedTextSegment): EmitJsValue {
  if (segment.kind === "literal") {
    return segment;
  }
  return emitGeneratedExpressionBinding(segment);
}

export function emitGeneratedEventHandler(event: ParsedEvent): EmitJsValue {
  if (!event.ir) {
    throw new Error(`Cannot generate unbound XMLUI event handler '${event.source}'.`);
  }
  const generated = generateEventHandlerFunction(event.ir, event.writes ?? []);
  return {
    source: event.source,
    ast: event.ast,
    range: event.range,
    ir: event.ir,
    compiledSource: generated.body,
    execute: rawJs(generated.functionSource),
    options: event.ir.options,
    dependencies: event.dependencies,
    writes: event.writes,
    invalidates: generated.invalidates,
  };
}

import type { BoundDependency, BoundWriteTarget, XmluiHandlerOptions } from "../scriptSemantics";
import type { XmluiIrBindingKind, XmluiIrId, XmluiIrSourceRef } from "../ir/index";

export type GeneratedExpressionFunction = (context: GeneratedExpressionContext) => unknown;

export type GeneratedEventFunction = (context: GeneratedEventContext) => Promise<unknown>;

export type GeneratedExpressionContext = {
  props?: Record<string, unknown>;
  readLocal(name: string): unknown;
  readGlobal(name: string): unknown;
  readContext?(name: string): unknown;
  readReference?(name: string): unknown;
};

export type GeneratedEventContext = GeneratedExpressionContext & {
  writeLocal(name: string, value: unknown): void;
  writeGlobal(name: string, value: unknown): void;
  delay?(ms: number): Promise<void>;
  emitEvent?(name: string, args: unknown[]): unknown | Promise<unknown>;
  call?(target: unknown, methodName: string, args: unknown[]): unknown | Promise<unknown>;
  complete?(value: unknown): Promise<unknown>;
  yieldIfNeeded?(iteration: number): Promise<void> | void;
};

export type GeneratedSourceMetadata = {
  irId: XmluiIrId;
  source: XmluiIrSourceRef;
  sourceText: string;
  generatedSource?: string;
};

export type GeneratedExpressionBinding = GeneratedSourceMetadata & {
  kind: Exclude<XmluiIrBindingKind, "text">;
  name: string;
  rawValue: string;
  dependencies: BoundDependency[];
  evaluate: GeneratedExpressionFunction;
};

export type GeneratedMixedTextSegment =
  | {
      kind: "literal";
      value: string;
      source: XmluiIrSourceRef;
    }
  | {
      kind: "expression";
      sourceText: string;
      source: XmluiIrSourceRef;
      dependencies: BoundDependency[];
      evaluate: GeneratedExpressionFunction;
      generatedSource?: string;
    };

export type GeneratedTextBinding = GeneratedSourceMetadata & {
  kind: "text";
  name: "text";
  rawValue: string;
  segments: GeneratedMixedTextSegment[];
  dependencies: BoundDependency[];
};

export type GeneratedBinding = GeneratedExpressionBinding | GeneratedTextBinding;

export type GeneratedEventHandler = GeneratedSourceMetadata & {
  name: string;
  dependencies: BoundDependency[];
  writes: BoundWriteTarget[];
  invalidates: Array<{ kind: "local" | "global"; name: string }>;
  options?: XmluiHandlerOptions;
  execute: GeneratedEventFunction;
};

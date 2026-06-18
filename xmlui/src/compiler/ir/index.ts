export {
  createXmluiIrId,
  createXmluiIrSourceRef,
  sourceSpanFromOffsets,
  type XmluiIrIdKind,
  type XmluiIrIdParts,
} from "./ids";
export {
  attachBinding,
  collectReferencedComponents,
  createIrId,
  createMinimalModuleIr,
  createMinimalScopeIr,
  emptyDependencySummary,
} from "./builders";
export { buildCompilerIrFromDocument, type BuildCompilerIrOptions } from "./lower";
export { validateCompilerIr } from "./validation";
export { compilerIrToRuntimeDocument } from "../irAdapter";
export type {
  XmluiBindingIr,
  XmluiBuiltinNodeIr,
  XmluiComponentReferenceNodeIr,
  XmluiDeclarationIr,
  XmluiDefinitionIr,
  XmluiDependencySummary,
  XmluiEventIr,
  XmluiExpressionIrRef,
  XmluiIrBindingKind,
  XmluiIrDeclarationKind,
  XmluiIrId,
  XmluiIrKind,
  XmluiIrNodeKind,
  XmluiIrSourceRef,
  XmluiIrTextSegment,
  XmluiIrValidationOptions,
  XmluiModuleIr,
  XmluiNodeIr,
  XmluiNodeIrBase,
  XmluiScopeIr,
  XmluiTextNodeIr,
} from "./types";

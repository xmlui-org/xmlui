import { createErrorDiagnostic, type ParserDiagnostic } from "../../parser";
import type {
  XmluiDeclarationIr,
  XmluiIrValidationOptions,
  XmluiModuleIr,
  XmluiNodeIr,
} from "./types";

export function validateCompilerIr(
  module: XmluiModuleIr,
  options: XmluiIrValidationOptions = {},
): ParserDiagnostic[] {
  const diagnostics: ParserDiagnostic[] = [];

  validateDefinition(module, diagnostics);
  validateComponentReferences(module.definition.root, diagnostics, options);
  validateNode(module.definition.root, diagnostics);
  validateScopes(module, diagnostics);

  return diagnostics;
}

function validateDefinition(module: XmluiModuleIr, diagnostics: ParserDiagnostic[]): void {
  if (!module.definition.name) {
    diagnostics.push(
      createErrorDiagnostic(
        "IR001",
        "XMLUI IR definition is missing a name.",
        module.definition.source.span,
      ),
    );
  }
}

function validateComponentReferences(
  node: XmluiNodeIr,
  diagnostics: ParserDiagnostic[],
  options: XmluiIrValidationOptions,
): void {
  if (
    node.kind === "component-reference" &&
    options.knownComponents &&
    !options.knownComponents.has(node.name)
  ) {
    diagnostics.push(
      createErrorDiagnostic(
        "IR003",
        `Unknown XMLUI component reference '${node.name}'.`,
        node.source.span,
      ),
    );
  }
  if ("children" in node) {
    node.children.forEach((child) => validateComponentReferences(child, diagnostics, options));
  }
}

function validateNode(node: XmluiNodeIr, diagnostics: ParserDiagnostic[]): void {
  for (const binding of node.bindings) {
    for (const dependency of binding.dependencies.reads) {
      if (dependency.kind === "unresolved") {
        diagnostics.push(
          createErrorDiagnostic(
            "IR004",
            `Unresolved XMLUI IR binding dependency '${dependency.name}'.`,
            dependency.span,
          ),
        );
      }
    }
  }

  for (const event of node.events) {
    for (const write of event.writes) {
      if (write.kind === "unresolved") {
        diagnostics.push(
          createErrorDiagnostic(
            "IR005",
            `Unresolved XMLUI IR event write target '${write.name}'.`,
            write.span,
          ),
        );
      }
      if (write.kind === "invalid") {
        diagnostics.push(
          createErrorDiagnostic("IR006", "Invalid XMLUI IR event write target.", write.span),
        );
      }
    }
  }

  if ("children" in node) {
    node.children.forEach((child) => validateNode(child, diagnostics));
  }
}

function validateScopes(module: XmluiModuleIr, diagnostics: ParserDiagnostic[]): void {
  for (const scope of module.definition.scopes) {
    const seen = new Map<string, XmluiDeclarationIr>();
    for (const declaration of scope.declarations) {
      const key = `${declaration.kind}:${declaration.name}`;
      const previous = seen.get(key);
      if (previous) {
        diagnostics.push(
          createErrorDiagnostic(
            "IR007",
            `Duplicate XMLUI IR ${declaration.kind} declaration '${declaration.name}'.`,
            declaration.source.span,
            previous.source.span,
          ),
        );
      } else {
        seen.set(key, declaration);
      }
    }
  }
}

import { createErrorDiagnostic, type ParserDiagnostic, type SourceSpan } from "../../parser";
import type {
  XmluiBindingIr,
  XmluiDeclarationIr,
  XmluiEventIr,
  XmluiModuleIr,
  XmluiNodeIr,
} from "../ir/index";
import { normalizeEventName } from "./builtins";
import { isValidUserComponentName } from "./registry";
import type {
  XmluiComponentContract,
  XmluiContractDiagnosticCode,
  XmluiContractRegistry,
} from "./types";

export function validateManagedReactContracts(
  module: XmluiModuleIr,
  registry: XmluiContractRegistry,
): ParserDiagnostic[] {
  const diagnostics: ParserDiagnostic[] = [];

  validateDefinition(module, registry, diagnostics);
  validateNode(module.definition.root, registry, diagnostics, module.kind === "component");
  validateDeclarations(module, diagnostics);

  return diagnostics;
}

function validateDefinition(
  module: XmluiModuleIr,
  registry: XmluiContractRegistry,
  diagnostics: ParserDiagnostic[],
): void {
  if (module.kind !== "component") {
    return;
  }
  const name = module.definition.name;
  if (!isValidUserComponentName(name)) {
    diagnostics.push(
      diagnostic(
        "XC007",
        `Invalid XMLUI component name '${name}'. Component names must start with an uppercase letter.`,
        module.definition.source.span,
      ),
    );
  }
  if (!registry.has(name)) {
    diagnostics.push(diagnostic("XC001", `Unknown XMLUI component <${name}>.`, module.definition.source.span));
  }
}

function validateNode(
  node: XmluiNodeIr,
  registry: XmluiContractRegistry,
  diagnostics: ParserDiagnostic[],
  isComponentRoot = false,
): void {
  if (node.kind === "text") {
    return;
  }
  const componentName = node.kind === "component-reference" ? node.name : node.type;
  const contract = registry.get(componentName);
  if (!contract) {
    diagnostics.push(diagnostic("XC001", `Unknown XMLUI component <${componentName}>.`, node.source.span));
  } else {
    validateBindings(node.bindings, contract, diagnostics, isComponentRoot);
    validateEvents(node.events, contract, diagnostics);
  }

  for (const child of node.children) {
    validateNode(child, registry, diagnostics);
  }
}

function validateBindings(
  bindings: XmluiBindingIr[],
  contract: XmluiComponentContract,
  diagnostics: ParserDiagnostic[],
  isComponentRoot: boolean,
): void {
  for (const binding of bindings) {
    if (binding.kind === "prop") {
      if (!contract.acceptsArbitraryProps && !contract.props[binding.name]) {
        diagnostics.push(
          diagnostic(
            "XC002",
            `<${contract.name}> has unknown prop '${binding.name}'.`,
            binding.source.span,
          ),
        );
      }
      continue;
    }
    if (binding.kind === "local" && !contract.declarations.local) {
      diagnostics.push(
        diagnostic(
          "XC004",
          `<${contract.name}> does not allow local variable declarations.`,
          binding.source.span,
        ),
      );
    }
    if (binding.kind === "global" && (!contract.declarations.global || isComponentRoot)) {
      diagnostics.push(
        diagnostic(
          "XC004",
          `<${contract.name}> does not allow global variable declarations here.`,
          binding.source.span,
        ),
      );
    }
  }
}

function validateEvents(
  events: XmluiEventIr[],
  contract: XmluiComponentContract,
  diagnostics: ParserDiagnostic[],
): void {
  for (const event of events) {
    const name = normalizeEventName(event.name);
    if (contract.kind !== "user" && !contract.events[name]) {
      diagnostics.push(
        diagnostic(
          "XC003",
          `<${contract.name}> has unknown event '${event.name}'.`,
          event.source.span,
        ),
      );
    }
    for (const write of event.writes) {
      if (write.kind === "unresolved") {
        diagnostics.push(
          diagnostic(
            "XC006",
            `Unresolved XMLUI event write target '${write.name}'.`,
            write.span,
          ),
        );
      }
    }
  }
}

function validateDeclarations(module: XmluiModuleIr, diagnostics: ParserDiagnostic[]): void {
  for (const scope of module.definition.scopes) {
    const seen = new Map<string, XmluiDeclarationIr>();
    for (const declaration of scope.declarations) {
      const key = `${declaration.kind}:${declaration.name}`;
      const previous = seen.get(key);
      if (previous) {
        diagnostics.push(
          diagnostic(
            "XC005",
            `Duplicate XMLUI ${declaration.kind} declaration '${declaration.name}'.`,
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

function diagnostic(
  code: XmluiContractDiagnosticCode,
  message: string,
  span: SourceSpan,
  contextSpan?: SourceSpan,
): ParserDiagnostic {
  return createErrorDiagnostic(code, message, span, contextSpan);
}

import { createContractRegistry, validateManagedReactContracts } from "./contracts";
import { buildCompilerIrFromDocument } from "./ir/index";
import { materializeRuntimeDocumentFromIr } from "./materializeRuntimeDocument";
import { parseXmlui } from "./parseXmlui";
import type { XmluiDocument } from "./ir";
import type { XmluiModuleIr } from "./ir/index";
import type { Extension } from "../extensions";
import { normalizeExtensions } from "../extensions";
import type { XmluiComponentContract } from "./contracts";

export type CompileXmluiSourceOptions = {
  id: string;
  source: string;
  knownComponents?: Iterable<string>;
  extensionComponents?: Iterable<XmluiComponentContract>;
  extensions?: Iterable<Extension>;
  validateComponentReferences?: boolean;
};

export type CompiledXmluiSource = {
  document: XmluiDocument;
  compilerIr: XmluiModuleIr;
  runtimeDocument: XmluiDocument;
  referencedComponents: string[];
};

export function compileXmluiSource({
  id,
  source,
  knownComponents = [],
  extensionComponents = [],
  extensions = [],
  validateComponentReferences = true,
}: CompileXmluiSourceOptions): CompiledXmluiSource {
  const normalizedExtensions = normalizeExtensions(extensions);
  const allExtensionContracts = [
    ...extensionComponents,
    ...normalizedExtensions.contracts,
  ];
  const document = parseXmlui(source, {
    sourceId: id,
    extensionFunctions: normalizedExtensions.functionNames,
  });
  const userComponents = new Set(knownComponents);
  for (const contract of allExtensionContracts) {
    userComponents.add(contract.name);
  }
  if (document.kind === "component") {
    userComponents.add(document.name);
  }
  const compilerIr = buildCompilerIrFromDocument(document, {
    sourceId: id,
    filename: id,
    validation: validateComponentReferences ? { knownComponents: userComponents } : undefined,
  });
  if (validateComponentReferences) {
    compilerIr.diagnostics.push(
      ...validateManagedReactContracts(
        compilerIr,
        createContractRegistry({ userComponents, extensionComponents: allExtensionContracts }),
      ),
    );
  }
  return {
    document,
    compilerIr,
    runtimeDocument: materializeRuntimeDocumentFromIr(compilerIr),
    referencedComponents: compilerIr.referencedComponents,
  };
}

export function throwFirstCompilerDiagnostic(compiled: CompiledXmluiSource): void {
  if (compiled.compilerIr.diagnostics.length > 0) {
    throw new Error(compiled.compilerIr.diagnostics[0].message);
  }
}

import { createContractRegistry, validateManagedReactContracts } from "./contracts";
import { buildCompilerIrFromDocument } from "./ir/index";
import { materializeRuntimeDocumentFromIr } from "./materializeRuntimeDocument";
import { parseXmlui } from "./parseXmlui";
import type { XmluiDocument } from "./ir";
import type { XmluiModuleIr } from "./ir/index";

export type CompileXmluiSourceOptions = {
  id: string;
  source: string;
  knownComponents?: Iterable<string>;
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
  validateComponentReferences = true,
}: CompileXmluiSourceOptions): CompiledXmluiSource {
  const document = parseXmlui(source, { sourceId: id });
  const userComponents = new Set(knownComponents);
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
        createContractRegistry({ userComponents }),
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


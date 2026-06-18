import { readdirSync } from "node:fs";
import path from "node:path";

import { emitXmluiModule, type XmluiModuleImport } from "./codegen";
import { createContractRegistry, validateManagedReactContracts } from "./contracts";
import { buildCompilerIrFromDocument } from "./ir/index";
import { parseXmlui } from "./parseXmlui";

export type CompileXmluiModuleOptions = {
  id: string;
  source: string;
};

export function compileXmluiModule({ id, source }: CompileXmluiModuleOptions): string {
  const document = parseXmlui(source, { sourceId: id });
  const imports = document.kind === "app" ? siblingComponentImports(id) : [];
  const userComponents = new Set(imports.map((item) => item.componentName));
  if (document.kind === "component") {
    userComponents.add(document.name);
  }
  const compilerIr = buildCompilerIrFromDocument(document, {
    sourceId: id,
    filename: id,
    validation: document.kind === "app"
      ? { knownComponents: userComponents }
      : undefined,
  });
  const contractDiagnostics = validateManagedReactContracts(
    compilerIr,
    createContractRegistry({ userComponents }),
  );
  compilerIr.diagnostics.push(...contractDiagnostics);
  if (compilerIr.diagnostics.length > 0) {
    throw new Error(compilerIr.diagnostics[0].message);
  }
  return emitXmluiModule({ compilerIr, imports });
}

function siblingComponentImports(
  id: string,
): XmluiModuleImport[] {
  const dir = path.dirname(id);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".xmlui") && file !== path.basename(id))
    .sort()
    .map((file, index) => ({
      localName: `component${index}`,
      componentName: path.basename(file, ".xmlui"),
      specifier: `./${file}`,
    }));
}

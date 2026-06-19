import { readdirSync } from "node:fs";
import path from "node:path";

import { emitXmluiModule, type XmluiModuleImport } from "./codegen";
import { compileXmluiSource, throwFirstCompilerDiagnostic } from "./compileXmluiSource";

export type CompileXmluiModuleOptions = {
  id: string;
  source: string;
};

export function compileXmluiModule({ id, source }: CompileXmluiModuleOptions): string {
  const initial = compileXmluiSource({
    id,
    source,
    validateComponentReferences: false,
  });
  const imports = initial.document.kind === "app" ? siblingComponentImports(id) : [];
  const userComponents = new Set(imports.map((item) => item.componentName));
  if (initial.document.kind === "component") {
    userComponents.add(initial.document.name);
  }
  const compiled = compileXmluiSource({
    id,
    source,
    knownComponents: userComponents,
    validateComponentReferences: true,
  });
  throwFirstCompilerDiagnostic(compiled);
  return emitXmluiModule({ compilerIr: compiled.compilerIr, imports });
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

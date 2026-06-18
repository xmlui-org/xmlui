import type { XmluiModuleIr } from "../ir/index";
import { emitImports, emitValue, type EmitImport } from "./emitter";
import { emitRuntimeDocumentFromIr } from "./runtimeDocument";

export type XmluiModuleImport = EmitImport & {
  componentName: string;
};

export type EmitXmluiModuleOptions = {
  compilerIr: XmluiModuleIr;
  imports?: readonly XmluiModuleImport[];
  runtimeSpecifier?: string;
};

export function emitXmluiModule({
  compilerIr,
  imports = [],
  runtimeSpecifier = "/src/runtime/index.tsx",
}: EmitXmluiModuleOptions): string {
  const documentSource = emitValue(emitRuntimeDocumentFromIr(compilerIr));
  const componentArray = imports.map((item) => item.localName).join(", ");
  const importLines = emitImports(imports);

  return `
import { createXmluiModule } from ${JSON.stringify(runtimeSpecifier)};
${importLines}

const document = ${documentSource};
const module = createXmluiModule(document, [${componentArray}]);

export default module;
`;
}

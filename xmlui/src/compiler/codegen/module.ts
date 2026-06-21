import type { XmluiModuleIr, XmluiNodeIr } from "../ir/index";
import { emitImports, emitValue, type EmitImport } from "./emitter";
import { emitRuntimeDocumentFromIr } from "./runtimeDocument";
import { emitSharedYieldHelperSource, handlerUsesSharedYield } from "./script";

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
  const yieldHelperSource = hasEventHandlers(compilerIr.definition.root)
    ? `\n${emitSharedYieldHelperSource()}\n`
    : "";

  return `
import { createXmluiModule } from ${JSON.stringify(runtimeSpecifier)};
${importLines}
${yieldHelperSource}

const document = ${documentSource};
const module = createXmluiModule(document, [${componentArray}]);

export default module;
`;
}

function hasEventHandlers(node: XmluiNodeIr): boolean {
  if (node.kind === "text") {
    return false;
  }
  if (
    node.events.some((event) => handlerUsesSharedYield(event.ir)) ||
    node.methods.some((method) => handlerUsesSharedYield(method.ir))
  ) {
    return true;
  }
  return node.children.some(hasEventHandlers);
}

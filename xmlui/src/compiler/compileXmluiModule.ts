import { readdirSync } from "node:fs";
import path from "node:path";

import { emitRuntimeDocument } from "./emitRuntimeDocument";
import { buildCompilerIrFromDocument, compilerIrToRuntimeDocument } from "./ir/index";
import { parseXmlui } from "./parseXmlui";

export type CompileXmluiModuleOptions = {
  id: string;
  source: string;
};

export function compileXmluiModule({ id, source }: CompileXmluiModuleOptions): string {
  const document = parseXmlui(source, { sourceId: id });
  const imports = document.kind === "app" ? siblingComponentImports(id) : [];
  const compilerIr = buildCompilerIrFromDocument(document, {
    sourceId: id,
    filename: id,
    validation: document.kind === "app"
      ? { knownComponents: new Set(imports.map((item) => item.componentName)) }
      : undefined,
  });
  if (compilerIr.diagnostics.length > 0) {
    throw new Error(compilerIr.diagnostics[0].message);
  }
  const moduleSource = emitRuntimeDocument(compilerIrToRuntimeDocument(compilerIr));
  const componentArray = imports.map((item) => item.localName).join(", ");
  const importLines = imports
    .map((item) => `import ${item.localName} from ${JSON.stringify(item.specifier)};`)
    .join("\n");

  return `
import { createXmluiModule } from "/src/runtime/index.tsx";
${importLines}

const document = ${moduleSource};
const module = createXmluiModule(document, [${componentArray}]);

export default module;
`;
}

function siblingComponentImports(
  id: string,
): Array<{ localName: string; componentName: string; specifier: string }> {
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

import { readdirSync } from "node:fs";
import path from "node:path";

import type { XmluiDocument } from "./ir";
import { parseXmlui } from "./parseXmlui";

export type CompileXmluiModuleOptions = {
  id: string;
  source: string;
};

export function compileXmluiModule({ id, source }: CompileXmluiModuleOptions): string {
  const document = parseXmlui(source);
  const imports = document.kind === "app" ? siblingComponentImports(id) : [];
  const moduleJson = JSON.stringify(document, null, 2);
  const componentArray = imports.map((item) => item.localName).join(", ");
  const importLines = imports
    .map((item) => `import ${item.localName} from ${JSON.stringify(item.specifier)};`)
    .join("\n");

  return `
import { createXmluiModule } from "/src/runtime/index.tsx";
${importLines}

const document = ${moduleJson};
const module = createXmluiModule(document, [${componentArray}]);

export default module;
`;
}

function siblingComponentImports(id: string): Array<{ localName: string; specifier: string }> {
  const dir = path.dirname(id);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".xmlui") && file !== path.basename(id))
    .sort()
    .map((file, index) => ({
      localName: `component${index}`,
      specifier: `./${file}`,
    }));
}

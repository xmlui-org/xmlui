import { builtInComponentContracts } from "../compiler/contracts";
import { builtInRenderers as legacyBuiltInRenderers } from "../runtime/rendering/builtins";
import type { XmluiBuiltInRenderer } from "../runtime/rendering/types";
import type {
  XmluiComponentTransferModule,
  XmluiRuntimeComponentModule,
} from "./types";

const oldComponentRoot = "/Users/dotneteer/source/xmlui/xmlui/src/components";

const implementedRuntimeNames = [
  "App",
  "AppHeader",
  "H1",
  "Stack",
  "HStack",
  "VStack",
  "Text",
  "Button",
  "Theme",
  "Slot",
  "Items",
  "TextBox",
  "Checkbox",
  "Select",
  "Option",
  "Pages",
  "Page",
  "NavLink",
  "NavPanel",
  "DataSource",
  "APICall",
] as const;

const implementedRuntimeNameSet = new Set<string>(implementedRuntimeNames);
const legacyRuntimeRenderers: Partial<Record<string, XmluiBuiltInRenderer>> = legacyBuiltInRenderers;

const componentFolderNames: Record<string, string> = {
  H1: "Heading",
};

function componentFolderName(name: string): string {
  return componentFolderNames[name] ?? name;
}

export const componentTransferModules: XmluiComponentTransferModule[] = builtInComponentContracts
  .map((contract) => {
    const renderer = legacyRuntimeRenderers[contract.name];
    const folderName = componentFolderName(contract.name);
    return {
      name: contract.name,
      contract,
      renderer,
      status: implementedRuntimeNameSet.has(contract.name) ? "partial-centralized" : "not-started",
      sources: {
        oldFolder: `${oldComponentRoot}/${folderName}`,
        rewriteFolder: `xmlui/src/components/${folderName}`,
        renderer: renderer ? ["xmlui/src/runtime/rendering/builtins.tsx"] : [],
        metadata: ["xmlui/src/compiler/contracts/builtins.ts"],
      },
      docs: {
        path: `xmlui/src/components/${folderName}/${contract.name}.md`,
      },
      transferredTests: {
        archivePath: `xmlui/src/components/${folderName}/__tests__/transferred/`,
        runnablePaths: [],
      },
    } satisfies XmluiComponentTransferModule;
  });

export const runtimeComponentModules: XmluiRuntimeComponentModule[] = componentTransferModules
  .filter((component): component is XmluiRuntimeComponentModule => typeof component.renderer === "function");

export const builtInComponentRenderers = Object.fromEntries(
  runtimeComponentModules.map((component) => [component.name, component.renderer]),
);

export function getComponentTransferModule(name: string): XmluiComponentTransferModule | undefined {
  return componentTransferModules.find((component) => component.name === name);
}

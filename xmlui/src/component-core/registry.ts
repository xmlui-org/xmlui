import { builtInComponentContracts } from "../compiler/contracts";
import { builtInRenderers as legacyBuiltInRenderers } from "../runtime/rendering/builtins";
import type { XmluiBuiltInRenderer } from "../runtime/rendering/types";
import { appContract, appRenderer } from "../components/App/App";
import { buttonContract, buttonRenderer } from "../components/Button/Button";
import {
  headingContract,
  headingRenderer,
  h1Contract,
  h1Renderer,
  h2Contract,
  h2Renderer,
  h3Contract,
  h3Renderer,
  h4Contract,
  h4Renderer,
  h5Contract,
  h5Renderer,
  h6Contract,
  h6Renderer,
} from "../components/Heading/Heading";
import { textContract, textRenderer } from "../components/Text/Text";
import type {
  XmluiComponentTransferModule,
  XmluiRuntimeComponentModule,
} from "./types";

const oldComponentRoot = "/Users/dotneteer/source/xmlui/xmlui/src/components";

const implementedRuntimeNames = [
  "App",
  "AppHeader",
  "Heading",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
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
const transferredContracts: Partial<Record<string, (typeof builtInComponentContracts)[number]>> = {
  App: appContract,
  Button: buttonContract,
  Heading: headingContract,
  H1: h1Contract,
  H2: h2Contract,
  H3: h3Contract,
  H4: h4Contract,
  H5: h5Contract,
  H6: h6Contract,
  Text: textContract,
};
const transferredRenderers: Partial<Record<string, XmluiBuiltInRenderer>> = {
  App: appRenderer,
  Button: buttonRenderer,
  Heading: headingRenderer,
  H1: h1Renderer,
  H2: h2Renderer,
  H3: h3Renderer,
  H4: h4Renderer,
  H5: h5Renderer,
  H6: h6Renderer,
  Text: textRenderer,
};

const componentFolderNames: Record<string, string> = {
  Heading: "Heading",
  H1: "Heading",
  H2: "Heading",
  H3: "Heading",
  H4: "Heading",
  H5: "Heading",
  H6: "Heading",
};

function componentFolderName(name: string): string {
  return componentFolderNames[name] ?? name;
}

export const componentTransferModules: XmluiComponentTransferModule[] = builtInComponentContracts
  .map((builtInContract) => {
    const contract = transferredContracts[builtInContract.name] ?? builtInContract;
    const renderer = transferredRenderers[contract.name] ?? legacyRuntimeRenderers[contract.name];
    const folderName = componentFolderName(contract.name);
    const appTransferred = contract.name === "App";
    const buttonTransferred = contract.name === "Button";
    const textTransferred = contract.name === "Text";
    const headingTransferred = contract.name === "Heading" || /^H[1-6]$/.test(contract.name);
    const transferredFolder = appTransferred || buttonTransferred || textTransferred || headingTransferred;
    return {
      name: contract.name,
      contract,
      renderer,
      status: transferredFolder
        ? "transferred-folder"
        : implementedRuntimeNameSet.has(contract.name)
          ? "partial-centralized"
          : "not-started",
      sources: {
        oldFolder: `${oldComponentRoot}/${folderName}`,
        rewriteFolder: `xmlui/src/components/${folderName}`,
        implementation: appTransferred
          ? [`xmlui/src/components/${folderName}/AppReact.tsx`]
          : buttonTransferred
            ? [`xmlui/src/components/${folderName}/ButtonReact.tsx`]
            : textTransferred
              ? [`xmlui/src/components/${folderName}/TextReact.tsx`]
              : headingTransferred
                ? [`xmlui/src/components/${folderName}/HeadingReact.tsx`]
            : [],
        renderer: transferredFolder
          ? [`xmlui/src/components/${folderName}/${headingTransferred ? "Heading" : contract.name}.tsx`]
          : renderer ? ["xmlui/src/runtime/rendering/builtins.tsx"] : [],
        metadata: transferredFolder
          ? [
              "xmlui/src/compiler/contracts/builtins.ts",
              `xmlui/src/components/${folderName}/${headingTransferred ? "Heading" : contract.name}.tsx`,
            ]
          : ["xmlui/src/compiler/contracts/builtins.ts"],
        defaults: transferredFolder ? [`xmlui/src/components/${folderName}/${headingTransferred ? "Heading" : contract.name}.defaults.ts`] : [],
        styles: transferredFolder ? [`xmlui/src/components/${folderName}/${headingTransferred ? "Heading" : contract.name}.module.scss`] : [],
        docs: transferredFolder ? [`xmlui/src/components/${folderName}/${contract.name}.md`] : [],
      },
      docs: {
        path: `xmlui/src/components/${folderName}/${contract.name}.md`,
      },
      transferredTests: {
        runnablePaths: appTransferred
          ? [
              "xmlui/src/components/App/App.spec.tsx",
              "xmlui/src/components/App/App-layout.spec.ts",
            ]
          : buttonTransferred
            ? [
                "xmlui/src/components/Button/Button.spec.tsx",
                "xmlui/src/components/Button/Button-style.spec.ts",
                "xmlui/tests/e2e/counter-components.spec.ts",
                "xmlui/tests/e2e/counter-globals.spec.ts",
              ]
            : textTransferred
              ? [
                  "xmlui/src/components/Text/Text.spec.tsx",
                  "xmlui/src/components/Text/Text-style.spec.ts",
                  "xmlui/src/components/Text/Text-old-e2e.spec.ts",
                ]
              : headingTransferred
                ? [
                    "xmlui/src/components/Heading/Heading.spec.tsx",
                    "xmlui/src/components/Heading/Heading-style.spec.ts",
                    "xmlui/src/components/Heading/Heading-old-e2e.spec.ts",
                  ]
          : [],
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

import { builtInComponentContracts } from "../compiler/contracts";
import { builtInRenderers as legacyBuiltInRenderers } from "../runtime/rendering/builtins";
import type { XmluiBuiltInRenderer } from "../runtime/rendering/types";
import { appRenderer } from "../components/App/App";
import { buttonRenderer } from "../components/Button/Button";
import { cardRenderer } from "../components/Card/Card";
import { codeBlockRenderer } from "../components/CodeBlock/CodeBlock";
import { contentSeparatorRenderer } from "../components/ContentSeparator/ContentSeparator";
import { fallbackRenderer } from "../components/Fallback/Fallback";
import {
  headingRenderer,
  h1Renderer,
  h2Renderer,
  h3Renderer,
  h4Renderer,
  h5Renderer,
  h6Renderer,
} from "../components/Heading/Heading";
import { textRenderer } from "../components/Text/Text";
import {
  htmlTagRenderers,
} from "../components/HtmlTags/HtmlTags";
import { brRenderer, BrRenderer } from "../components/Br/Br";
import { fragmentRenderer } from "../components/Fragment/Fragment";
import { iconRenderer } from "../components/Icon/Icon";
import { imageRenderer } from "../components/Image/Image";
import { iframeRenderer } from "../components/IFrame/IFrame";
import { logoRenderer } from "../components/Logo/Logo";
import { noResultRenderer } from "../components/NoResult/NoResult";
import { pageMetaTitleRenderer } from "../components/PageMetaTitle/PageMetaTitle";
import { qrCodeRenderer } from "../components/QRCode/QRCode";
import { spaceFillerRenderer } from "../components/SpaceFiller/SpaceFiller";
import { htmlTagComponentNames } from "./htmlTags";
import type {
  XmluiComponentTransferModule,
  XmluiRuntimeComponentModule,
} from "./types";

const oldComponentRoot = "/Users/dotneteer/source/xmlui/xmlui/src/components";

const implementedRuntimeNames = [
  "App",
  "AppHeader",
  "Fragment",
  "Image",
  "IFrame",
  "Icon",
  "Logo",
  "NoResult",
  "PageMetaTitle",
  "QRCode",
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
  "Card",
  "CodeBlock",
  "ContentSeparator",
  "Fallback",
  "Br",
  "br",
  "Theme",
  "Slot",
  "SpaceFiller",
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
const transferredRenderers: Partial<Record<string, XmluiBuiltInRenderer>> = {
  App: appRenderer,
  br: brRenderer,
  Br: BrRenderer,
  Button: buttonRenderer,
  Card: cardRenderer,
  CodeBlock: codeBlockRenderer,
  ContentSeparator: contentSeparatorRenderer,
  Fallback: fallbackRenderer,
  Fragment: fragmentRenderer,
  Icon: iconRenderer,
  Image: imageRenderer,
  IFrame: iframeRenderer,
  Logo: logoRenderer,
  NoResult: noResultRenderer,
  PageMetaTitle: pageMetaTitleRenderer,
  QRCode: qrCodeRenderer,
  SpaceFiller: spaceFillerRenderer,
  Heading: headingRenderer,
  H1: h1Renderer,
  H2: h2Renderer,
  H3: h3Renderer,
  H4: h4Renderer,
  H5: h5Renderer,
  H6: h6Renderer,
  Text: textRenderer,
  ...htmlTagRenderers,
};

const componentFolderNames: Record<string, string> = {
  br: "Br",
  Br: "Br",
  Fragment: "Fragment",
  Heading: "Heading",
  H1: "Heading",
  H2: "Heading",
  H3: "Heading",
  H4: "Heading",
  H5: "Heading",
  H6: "Heading",
};
for (const name of htmlTagComponentNames) {
  componentFolderNames[name] = "HtmlTags";
}

function componentFolderName(name: string): string {
  return componentFolderNames[name] ?? name;
}

export const componentTransferModules: XmluiComponentTransferModule[] = builtInComponentContracts
  .map((builtInContract) => {
    const contract = builtInContract;
    const renderer = transferredRenderers[contract.name] ?? legacyRuntimeRenderers[contract.name];
    const folderName = componentFolderName(contract.name);
    const appTransferred = contract.name === "App";
    const buttonTransferred = contract.name === "Button";
    const textTransferred = contract.name === "Text";
    const headingTransferred = contract.name === "Heading" || /^H[1-6]$/.test(contract.name);
    const htmlTagTransferred = htmlTagComponentNames.includes(contract.name);
    const brTransferred = contract.name === "br" || contract.name === "Br";
    const fragmentTransferred = contract.name === "Fragment";
    const imageTransferred = contract.name === "Image";
    const iframeTransferred = contract.name === "IFrame";
    const iconTransferred = contract.name === "Icon";
    const logoTransferred = contract.name === "Logo";
    const pageMetaTitleTransferred = contract.name === "PageMetaTitle";
    const qrCodeTransferred = contract.name === "QRCode";
    const codeBlockTransferred = contract.name === "CodeBlock";
    const contentSeparatorTransferred = contract.name === "ContentSeparator";
    const fallbackTransferred = contract.name === "Fallback";
    const noResultTransferred = contract.name === "NoResult";
    const spaceFillerTransferred = contract.name === "SpaceFiller";
    const transferredFolder =
      appTransferred ||
      buttonTransferred ||
      textTransferred ||
      headingTransferred ||
      htmlTagTransferred ||
      brTransferred ||
      fragmentTransferred ||
      imageTransferred ||
      iframeTransferred ||
      iconTransferred ||
      logoTransferred ||
      pageMetaTitleTransferred ||
      qrCodeTransferred ||
      codeBlockTransferred ||
      contentSeparatorTransferred ||
      fallbackTransferred ||
      noResultTransferred ||
      spaceFillerTransferred;
    const sharedComponentFile = htmlTagTransferred
      ? "HtmlTags"
      : brTransferred
        ? "Br"
        : fragmentTransferred
          ? "Fragment"
          : headingTransferred
            ? "Heading"
            : contract.name;
    const docsFile = headingTransferred && /^H[1-6]$/.test(contract.name)
      ? contract.name
      : sharedComponentFile;
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
                : imageTransferred
                  ? [`xmlui/src/components/${folderName}/ImageReact.tsx`]
                  : iframeTransferred
                    ? [`xmlui/src/components/${folderName}/IFrameReact.tsx`]
                    : iconTransferred
                      ? [`xmlui/src/components/${folderName}/IconReact.tsx`]
                      : logoTransferred
                        ? [`xmlui/src/components/${folderName}/LogoReact.tsx`]
                        : pageMetaTitleTransferred
                          ? [`xmlui/src/components/${folderName}/PageMetaTitleReact.tsx`]
                          : qrCodeTransferred
                            ? [`xmlui/src/components/${folderName}/QRCodeReact.tsx`]
                            : codeBlockTransferred
                              ? [`xmlui/src/components/${folderName}/CodeBlockReact.tsx`]
                              : contentSeparatorTransferred
                                ? [`xmlui/src/components/${folderName}/ContentSeparatorReact.tsx`]
                                : fallbackTransferred
                                  ? [`xmlui/src/components/${folderName}/FallbackReact.tsx`]
                                  : noResultTransferred
                                    ? [`xmlui/src/components/${folderName}/NoResultReact.tsx`]
                                    : spaceFillerTransferred
                                      ? [`xmlui/src/components/${folderName}/SpaceFillerReact.tsx`]
                : transferredFolder
                  ? [`xmlui/src/components/${folderName}/${sharedComponentFile}.tsx`]
                  : [],
        renderer: transferredFolder
          ? [`xmlui/src/components/${folderName}/${sharedComponentFile}.tsx`]
          : renderer ? ["xmlui/src/runtime/rendering/builtins.tsx"] : [],
        metadata: transferredFolder
          ? [
              "xmlui/src/compiler/contracts/builtins.ts",
              `xmlui/src/components/${folderName}/${sharedComponentFile}.tsx`,
            ]
          : ["xmlui/src/compiler/contracts/builtins.ts"],
        defaults:
          transferredFolder && !htmlTagTransferred && !brTransferred && !fragmentTransferred && !iconTransferred && !spaceFillerTransferred
            ? [`xmlui/src/components/${folderName}/${sharedComponentFile}.defaults.ts`]
            : [],
        styles:
          transferredFolder && !brTransferred && !fragmentTransferred && !pageMetaTitleTransferred
            ? [`xmlui/src/components/${folderName}/${sharedComponentFile}.module.scss`]
            : [],
        docs: transferredFolder ? [`xmlui/src/components/${folderName}/${docsFile}.md`] : [],
      },
      docs: {
        path: `xmlui/src/components/${folderName}/${docsFile}.md`,
      },
      transferredTests: {
        runnablePaths: appTransferred
          ? [
              "xmlui/src/components/App/App.spec.tsx",
              "xmlui/src/components/App/App-layout.spec.ts",
            ]
          : buttonTransferred
            ? [
                "xmlui/src/components/Button/Button.spec.ts",
                "xmlui/src/components/Button/Button.spec.tsx",
                "xmlui/src/components/Button/Button-style.spec.ts",
                "xmlui/tests/e2e/counter-components.spec.ts",
                "xmlui/tests/e2e/counter-globals.spec.ts",
              ]
            : textTransferred
              ? [
                    "xmlui/src/components/Text/Text.spec.tsx",
                    "xmlui/src/components/Text/Text-style.spec.ts",
                    "xmlui/src/components/Text/Text.spec.ts",
                  ]
              : headingTransferred
                ? [
                    "xmlui/src/components/Heading/Heading.spec.tsx",
                    "xmlui/src/components/Heading/Heading-style.spec.ts",
                    "xmlui/src/components/Heading/Heading.spec.ts",
                    "xmlui/src/components/Heading/HeadingShortcuts.spec.ts",
                  ]
                : htmlTagTransferred
                  ? ["xmlui/src/components/HtmlTags/HtmlTags.spec.ts"]
                  : brTransferred
                    ? ["xmlui/src/components/Br/Br.spec.ts"]
                    : fragmentTransferred
                      ? ["xmlui/src/components/Fragment/Fragment.spec.ts"]
                      : imageTransferred
                        ? ["xmlui/src/components/Image/Image.spec.ts"]
                        : iframeTransferred
                          ? ["xmlui/src/components/IFrame/IFrame.spec.ts"]
                          : iconTransferred
                            ? ["xmlui/src/components/Icon/Icon.spec.ts"]
                            : pageMetaTitleTransferred
                              ? ["xmlui/src/components/PageMetaTitle/PageMetaTitle.spec.ts"]
                              : qrCodeTransferred
                                ? ["xmlui/src/components/QRCode/QRCode.spec.ts"]
                                : codeBlockTransferred
                                  ? ["xmlui/src/components/CodeBlock/CodeBlock.spec.ts"]
                                  : contentSeparatorTransferred
                                    ? ["xmlui/src/components/ContentSeparator/ContentSeparator.spec.ts"]
                                    : noResultTransferred
                                    ? ["xmlui/src/components/NoResult/NoResult.spec.ts"]
                                      : fallbackTransferred
                                        ? ["xmlui/src/components/Fallback/Fallback.spec.ts"]
                                      : spaceFillerTransferred
                                        ? ["xmlui/src/components/SpaceFiller/SpaceFiller.spec.ts"]
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

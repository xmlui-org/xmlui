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
import { linkRenderer } from "../components/Link/Link";
import { logoRenderer } from "../components/Logo/Logo";
import { noResultRenderer } from "../components/NoResult/NoResult";
import { pageMetaTitleRenderer } from "../components/PageMetaTitle/PageMetaTitle";
import { qrCodeRenderer } from "../components/QRCode/QRCode";
import { spaceFillerRenderer } from "../components/SpaceFiller/SpaceFiller";
import { passwordInputRenderer, textBoxRenderer } from "../components/TextBox/TextBox";
import { textAreaRenderer } from "../components/TextArea/TextArea";
import { numberBoxRenderer } from "../components/NumberBox/NumberBox";
import { checkboxRenderer } from "../components/Checkbox/Checkbox";
import { switchRenderer } from "../components/Switch/Switch";
import { ratingInputRenderer } from "../components/RatingInput/RatingInput";
import { sliderRenderer } from "../components/Slider/Slider";
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
  "Link",
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
  "TextArea",
  "NumberBox",
  "Checkbox",
  "Switch",
  "RatingInput",
  "Slider",
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
  Link: linkRenderer,
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
  TextBox: textBoxRenderer,
  PasswordInput: passwordInputRenderer,
  TextArea: textAreaRenderer,
  NumberBox: numberBoxRenderer,
  Checkbox: checkboxRenderer,
  Switch: switchRenderer,
  RatingInput: ratingInputRenderer,
  Slider: sliderRenderer,
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
  PasswordInput: "TextBox",
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
    const textBoxTransferred = contract.name === "TextBox";
    const passwordInputTransferred = contract.name === "PasswordInput";
    const textAreaTransferred = contract.name === "TextArea";
    const numberBoxTransferred = contract.name === "NumberBox";
    const checkboxTransferred = contract.name === "Checkbox";
    const switchTransferred = contract.name === "Switch";
    const ratingInputTransferred = contract.name === "RatingInput";
    const sliderTransferred = contract.name === "Slider";
    const headingTransferred = contract.name === "Heading" || /^H[1-6]$/.test(contract.name);
    const htmlTagTransferred = htmlTagComponentNames.includes(contract.name);
    const brTransferred = contract.name === "br" || contract.name === "Br";
    const fragmentTransferred = contract.name === "Fragment";
    const imageTransferred = contract.name === "Image";
    const iframeTransferred = contract.name === "IFrame";
    const iconTransferred = contract.name === "Icon";
    const linkTransferred = contract.name === "Link";
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
      textBoxTransferred ||
      passwordInputTransferred ||
      textAreaTransferred ||
      numberBoxTransferred ||
      checkboxTransferred ||
      switchTransferred ||
      ratingInputTransferred ||
      sliderTransferred ||
      headingTransferred ||
      htmlTagTransferred ||
      brTransferred ||
      fragmentTransferred ||
      imageTransferred ||
      iframeTransferred ||
      iconTransferred ||
      linkTransferred ||
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
            : passwordInputTransferred
              ? "TextBox"
              : textAreaTransferred
                ? "TextArea"
                : numberBoxTransferred
                  ? "NumberBox"
                  : checkboxTransferred
                    ? "Checkbox"
                    : switchTransferred
                      ? "Switch"
                      : ratingInputTransferred
                        ? "RatingInput"
                        : sliderTransferred
                          ? "Slider"
                      : contract.name;
    const docsFile = headingTransferred && /^H[1-6]$/.test(contract.name)
      ? contract.name
      : sharedComponentFile;
    const implementationPaths = transferredFolder
      ? [`xmlui/src/components/${folderName}/${sharedComponentFile}.tsx`]
      : [];
    if (appTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/AppReact.tsx`);
    } else if (buttonTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ButtonReact.tsx`);
    } else if (textTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/TextReact.tsx`);
    } else if (textBoxTransferred || passwordInputTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/TextBoxReact.tsx`);
    } else if (textAreaTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/TextAreaReact.tsx`);
    } else if (numberBoxTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/NumberBoxReact.tsx`);
    } else if (checkboxTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/CheckboxReact.tsx`);
    } else if (switchTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/SwitchReact.tsx`);
    } else if (ratingInputTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/RatingInputReact.tsx`);
    } else if (sliderTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/SliderReact.tsx`);
    } else if (headingTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/HeadingReact.tsx`);
    } else if (imageTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ImageReact.tsx`);
    } else if (iframeTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/IFrameReact.tsx`);
    } else if (iconTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/IconReact.tsx`);
    } else if (linkTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/LinkReact.tsx`);
    } else if (logoTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/LogoReact.tsx`);
    } else if (pageMetaTitleTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/PageMetaTitleReact.tsx`);
    } else if (qrCodeTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/QRCodeReact.tsx`);
    } else if (codeBlockTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/CodeBlockReact.tsx`);
    } else if (contentSeparatorTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ContentSeparatorReact.tsx`);
    } else if (fallbackTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FallbackReact.tsx`);
    } else if (noResultTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/NoResultReact.tsx`);
    } else if (spaceFillerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/SpaceFillerReact.tsx`);
    }

    const runnablePaths = componentRunnablePaths({
      appTransferred,
      buttonTransferred,
      textTransferred,
      textBoxTransferred,
      passwordInputTransferred,
      textAreaTransferred,
      numberBoxTransferred,
      checkboxTransferred,
      switchTransferred,
      ratingInputTransferred,
      sliderTransferred,
      headingTransferred,
      htmlTagTransferred,
      brTransferred,
      fragmentTransferred,
      imageTransferred,
      iframeTransferred,
      iconTransferred,
      linkTransferred,
      pageMetaTitleTransferred,
      qrCodeTransferred,
      codeBlockTransferred,
      contentSeparatorTransferred,
      fallbackTransferred,
      noResultTransferred,
      spaceFillerTransferred,
    });
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
        implementation: implementationPaths,
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
        runnablePaths,
      },
    } satisfies XmluiComponentTransferModule;
  });

function componentRunnablePaths(flags: {
  appTransferred: boolean;
  buttonTransferred: boolean;
  textTransferred: boolean;
  textBoxTransferred: boolean;
  passwordInputTransferred: boolean;
  textAreaTransferred: boolean;
  numberBoxTransferred: boolean;
  checkboxTransferred: boolean;
  switchTransferred: boolean;
  ratingInputTransferred: boolean;
  sliderTransferred: boolean;
  headingTransferred: boolean;
  htmlTagTransferred: boolean;
  brTransferred: boolean;
  fragmentTransferred: boolean;
  imageTransferred: boolean;
  iframeTransferred: boolean;
  iconTransferred: boolean;
  linkTransferred: boolean;
  pageMetaTitleTransferred: boolean;
  qrCodeTransferred: boolean;
  codeBlockTransferred: boolean;
  contentSeparatorTransferred: boolean;
  fallbackTransferred: boolean;
  noResultTransferred: boolean;
  spaceFillerTransferred: boolean;
}): string[] {
  if (flags.appTransferred) {
    return [
      "xmlui/src/components/App/App.spec.tsx",
      "xmlui/src/components/App/App-layout.spec.ts",
    ];
  }
  if (flags.buttonTransferred) {
    return [
      "xmlui/src/components/Button/Button.spec.ts",
      "xmlui/src/components/Button/Button.spec.tsx",
      "xmlui/src/components/Button/Button-style.spec.ts",
      "xmlui/tests/e2e/counter-components.spec.ts",
      "xmlui/tests/e2e/counter-globals.spec.ts",
    ];
  }
  if (flags.textTransferred) {
    return [
      "xmlui/src/components/Text/Text.spec.tsx",
      "xmlui/src/components/Text/Text-style.spec.ts",
      "xmlui/src/components/Text/Text.spec.ts",
    ];
  }
  if (flags.textBoxTransferred) {
    return ["xmlui/src/components/TextBox/TextBox.spec.ts"];
  }
  if (flags.passwordInputTransferred) {
    return ["xmlui/src/components/TextBox/TextBox.spec.ts"];
  }
  if (flags.textAreaTransferred) {
    return ["xmlui/src/components/TextArea/TextArea.spec.ts"];
  }
  if (flags.numberBoxTransferred) {
    return ["xmlui/src/components/NumberBox/NumberBox.spec.ts"];
  }
  if (flags.checkboxTransferred) {
    return ["xmlui/src/components/Checkbox/Checkbox.spec.ts"];
  }
  if (flags.switchTransferred) {
    return ["xmlui/src/components/Switch/Switch.spec.ts"];
  }
  if (flags.ratingInputTransferred) {
    return ["xmlui/src/components/RatingInput/RatingInput.spec.ts"];
  }
  if (flags.sliderTransferred) {
    return ["xmlui/src/components/Slider/Slider.spec.ts"];
  }
  if (flags.headingTransferred) {
    return [
      "xmlui/src/components/Heading/Heading.spec.tsx",
      "xmlui/src/components/Heading/Heading-style.spec.ts",
      "xmlui/src/components/Heading/Heading.spec.ts",
      "xmlui/src/components/Heading/HeadingShortcuts.spec.ts",
    ];
  }
  if (flags.htmlTagTransferred) {
    return ["xmlui/src/components/HtmlTags/HtmlTags.spec.ts"];
  }
  if (flags.brTransferred) {
    return ["xmlui/src/components/Br/Br.spec.ts"];
  }
  if (flags.fragmentTransferred) {
    return ["xmlui/src/components/Fragment/Fragment.spec.ts"];
  }
  if (flags.imageTransferred) {
    return ["xmlui/src/components/Image/Image.spec.ts"];
  }
  if (flags.iframeTransferred) {
    return ["xmlui/src/components/IFrame/IFrame.spec.ts"];
  }
  if (flags.iconTransferred) {
    return ["xmlui/src/components/Icon/Icon.spec.ts"];
  }
  if (flags.linkTransferred) {
    return ["xmlui/src/components/Link/Link.spec.ts"];
  }
  if (flags.pageMetaTitleTransferred) {
    return ["xmlui/src/components/PageMetaTitle/PageMetaTitle.spec.ts"];
  }
  if (flags.qrCodeTransferred) {
    return ["xmlui/src/components/QRCode/QRCode.spec.ts"];
  }
  if (flags.codeBlockTransferred) {
    return ["xmlui/src/components/CodeBlock/CodeBlock.spec.ts"];
  }
  if (flags.contentSeparatorTransferred) {
    return ["xmlui/src/components/ContentSeparator/ContentSeparator.spec.ts"];
  }
  if (flags.noResultTransferred) {
    return ["xmlui/src/components/NoResult/NoResult.spec.ts"];
  }
  if (flags.fallbackTransferred) {
    return ["xmlui/src/components/Fallback/Fallback.spec.ts"];
  }
  if (flags.spaceFillerTransferred) {
    return ["xmlui/src/components/SpaceFiller/SpaceFiller.spec.ts"];
  }
  return [];
}

export const runtimeComponentModules: XmluiRuntimeComponentModule[] = componentTransferModules
  .filter((component): component is XmluiRuntimeComponentModule => typeof component.renderer === "function");

export const builtInComponentRenderers = Object.fromEntries(
  runtimeComponentModules.map((component) => [component.name, component.renderer]),
);

export function getComponentTransferModule(name: string): XmluiComponentTransferModule | undefined {
  return componentTransferModules.find((component) => component.name === name);
}

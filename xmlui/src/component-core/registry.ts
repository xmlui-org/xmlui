import { builtInComponentContracts } from "../compiler/contracts";
import { builtInRenderers as legacyBuiltInRenderers } from "../runtime/rendering/builtins";
import type { XmluiBuiltInRenderer } from "../runtime/rendering/types";
import { accordionItemRenderer, accordionRenderer } from "../components/Accordion/Accordion.renderer";
import { appRenderer } from "../components/App/App";
import { buttonRenderer } from "../components/Button/Button";
import { cardRenderer } from "../components/Card/Card.renderer";
import { codeBlockRenderer } from "../components/CodeBlock/CodeBlock";
import { contentSeparatorRenderer } from "../components/ContentSeparator/ContentSeparator.renderer";
import { expandableItemRenderer } from "../components/ExpandableItem/ExpandableItem.renderer";
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
import { imageRenderer } from "../components/Image/Image.renderer";
import { iframeRenderer } from "../components/IFrame/IFrame.renderer";
import { itemsRenderer } from "../components/Items/Items";
import { listRenderer } from "../components/List/List";
import { linkRenderer } from "../components/Link/Link.renderer";
import { logoRenderer } from "../components/Logo/Logo";
import { noResultRenderer } from "../components/NoResult/NoResult.renderer";
import { pageMetaTitleRenderer } from "../components/PageMetaTitle/PageMetaTitle";
import { qrCodeRenderer } from "../components/QRCode/QRCode.renderer";
import { responsiveBarRenderer } from "../components/ResponsiveBar/ResponsiveBar.renderer";
import { spaceFillerRenderer } from "../components/SpaceFiller/SpaceFiller.renderer";
import {
  hSplitterRenderer,
  splitterRenderer,
  vSplitterRenderer,
} from "../components/Splitter/Splitter.renderer";
import { stickyBoxRenderer } from "../components/StickyBox/StickyBox.renderer";
import { stickySectionRenderer } from "../components/StickySection/StickySection.renderer";
import { hStackRenderer, stackRenderer, vStackRenderer } from "../components/Stack/Stack";
import { tabItemRenderer, tabsRenderer } from "../components/Tabs/Tabs.renderer";
import { passwordInputRenderer, textBoxRenderer } from "../components/TextBox/TextBox.renderer";
import { textAreaRenderer } from "../components/TextArea/TextArea.renderer";
import { numberBoxRenderer } from "../components/NumberBox/NumberBox.renderer";
import { checkboxRenderer } from "../components/Checkbox/Checkbox.renderer";
import { switchRenderer } from "../components/Switch/Switch.renderer";
import { ratingInputRenderer } from "../components/RatingInput/RatingInput.renderer";
import { sliderRenderer } from "../components/Slider/Slider.renderer";
import { colorPickerRenderer } from "../components/ColorPicker/ColorPicker.renderer";
import { dateInputRenderer } from "../components/DateInput/DateInput.renderer";
import { datePickerRenderer } from "../components/DatePicker/DatePicker.renderer";
import { drawerRenderer } from "../components/Drawer/Drawer.renderer";
import { modalDialogRenderer } from "../components/ModalDialog/ModalDialog.renderer";
import { autoCompleteRenderer } from "../components/AutoComplete/AutoComplete";
import { fileInputRenderer } from "../components/FileInput/FileInput.renderer";
import { fileUploadDropZoneRenderer } from "../components/FileUploadDropZone/FileUploadDropZone.renderer";
import { flowLayoutRenderer } from "../components/FlowLayout/FlowLayout.renderer";
import { optionRenderer } from "../components/Option/Option";
import { paginationRenderer } from "../components/Pagination/Pagination";
import { radioGroupRenderer } from "../components/RadioGroup/RadioGroup";
import { scrollViewerRenderer } from "../components/ScrollViewer/ScrollViewer.renderer";
import { selectRenderer } from "../components/Select/Select";
import { selectionStoreRenderer } from "../components/SelectionStore/SelectionStore";
import { tableRenderer } from "../components/Table/Table";
import { columnRenderer } from "../components/Column/Column";
import { tileGridRenderer } from "../components/TileGrid/TileGrid.renderer";
import { tableOfContentsRenderer } from "../components/TableOfContents/TableOfContents";
import { treeRenderer } from "../components/Tree/Tree";
import { treeDisplayRenderer } from "../components/TreeDisplay/TreeDisplay";
import { timeInputRenderer } from "../components/TimeInput/TimeInput.renderer";
import { htmlTagComponentNames } from "./htmlTags";
import type {
  XmluiComponentTransferModule,
  XmluiRuntimeComponentModule,
} from "./types";

const oldComponentRoot = "/Users/dotneteer/source/xmlui/xmlui/src/components";

const implementedRuntimeNames = [
  "Accordion",
  "AccordionItem",
  "App",
  "AppHeader",
  "AutoComplete",
  "Fragment",
  "Image",
  "IFrame",
  "Icon",
  "Link",
  "List",
  "Logo",
  "NoResult",
  "PageMetaTitle",
  "QRCode",
  "ResponsiveBar",
  "Splitter",
  "HSplitter",
  "VSplitter",
  "StickyBox",
  "StickySection",
  "Tabs",
  "TabItem",
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
  "FlowLayout",
  "Text",
  "Button",
  "Card",
  "CodeBlock",
  "ContentSeparator",
  "ExpandableItem",
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
  "RadioGroup",
  "Slider",
  "ColorPicker",
  "DateInput",
  "DatePicker",
  "Drawer",
  "ModalDialog",
  "FileInput",
  "FileUploadDropZone",
  "TimeInput",
  "ScrollViewer",
  "Select",
  "SelectionStore",
  "Option",
  "Pages",
  "Page",
  "Pagination",
  "Table",
  "Column",
  "TileGrid",
  "Tree",
  "TreeDisplay",
  "TableOfContents",
  "NavLink",
  "NavPanel",
  "DataSource",
  "APICall",
] as const;

const implementedRuntimeNameSet = new Set<string>(implementedRuntimeNames);
const legacyRuntimeRenderers: Partial<Record<string, XmluiBuiltInRenderer>> = legacyBuiltInRenderers;
const transferredRenderers: Partial<Record<string, XmluiBuiltInRenderer>> = {
  Accordion: accordionRenderer,
  AccordionItem: accordionItemRenderer,
  App: appRenderer,
  br: brRenderer,
  Br: BrRenderer,
  Button: buttonRenderer,
  Card: cardRenderer,
  CodeBlock: codeBlockRenderer,
  ContentSeparator: contentSeparatorRenderer,
  ExpandableItem: expandableItemRenderer,
  Fallback: fallbackRenderer,
  Fragment: fragmentRenderer,
  Icon: iconRenderer,
  Image: imageRenderer,
  IFrame: iframeRenderer,
  Link: linkRenderer,
  List: listRenderer,
  Logo: logoRenderer,
  NoResult: noResultRenderer,
  PageMetaTitle: pageMetaTitleRenderer,
  QRCode: qrCodeRenderer,
  ResponsiveBar: responsiveBarRenderer,
  Splitter: splitterRenderer,
  HSplitter: hSplitterRenderer,
  VSplitter: vSplitterRenderer,
  StickyBox: stickyBoxRenderer,
  StickySection: stickySectionRenderer,
  Tabs: tabsRenderer,
  TabItem: tabItemRenderer,
  SpaceFiller: spaceFillerRenderer,
  Heading: headingRenderer,
  H1: h1Renderer,
  H2: h2Renderer,
  H3: h3Renderer,
  H4: h4Renderer,
  H5: h5Renderer,
  H6: h6Renderer,
  Stack: stackRenderer,
  HStack: hStackRenderer,
  VStack: vStackRenderer,
  FlowLayout: flowLayoutRenderer,
  Text: textRenderer,
  TextBox: textBoxRenderer,
  PasswordInput: passwordInputRenderer,
  TextArea: textAreaRenderer,
  NumberBox: numberBoxRenderer,
  Checkbox: checkboxRenderer,
  Switch: switchRenderer,
  RatingInput: ratingInputRenderer,
  Slider: sliderRenderer,
  ColorPicker: colorPickerRenderer,
  DateInput: dateInputRenderer,
  DatePicker: datePickerRenderer,
  Drawer: drawerRenderer,
  ModalDialog: modalDialogRenderer,
  AutoComplete: autoCompleteRenderer,
  FileInput: fileInputRenderer,
  FileUploadDropZone: fileUploadDropZoneRenderer,
  Option: optionRenderer,
  Pagination: paginationRenderer,
  Table: tableRenderer,
  Column: columnRenderer,
  TileGrid: tileGridRenderer,
  Tree: treeRenderer,
  TreeDisplay: treeDisplayRenderer,
  TableOfContents: tableOfContentsRenderer,
  RadioGroup: radioGroupRenderer,
  ScrollViewer: scrollViewerRenderer,
  Select: selectRenderer,
  SelectionStore: selectionStoreRenderer,
  Items: itemsRenderer,
  TimeInput: timeInputRenderer,
  ...htmlTagRenderers,
};

const componentFolderNames: Record<string, string> = {
  AccordionItem: "Accordion",
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
  HStack: "Stack",
  VStack: "Stack",
  PasswordInput: "TextBox",
  HSplitter: "Splitter",
  VSplitter: "Splitter",
  TabItem: "Tabs",
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
    const accordionTransferred = contract.name === "Accordion" || contract.name === "AccordionItem";
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
    const colorPickerTransferred = contract.name === "ColorPicker";
    const dateInputTransferred = contract.name === "DateInput";
    const datePickerTransferred = contract.name === "DatePicker";
    const drawerTransferred = contract.name === "Drawer";
    const modalDialogTransferred = contract.name === "ModalDialog";
    const fileInputTransferred = contract.name === "FileInput";
    const fileUploadDropZoneTransferred = contract.name === "FileUploadDropZone";
    const itemsTransferred = contract.name === "Items";
    const tableTransferred = contract.name === "Table";
    const columnTransferred = contract.name === "Column";
    const tileGridTransferred = contract.name === "TileGrid";
    const treeTransferred = contract.name === "Tree";
    const treeDisplayTransferred = contract.name === "TreeDisplay";
    const tableOfContentsTransferred = contract.name === "TableOfContents";
    const timeInputTransferred = contract.name === "TimeInput";
    const scrollViewerTransferred = contract.name === "ScrollViewer";
    const responsiveBarTransferred = contract.name === "ResponsiveBar";
    const splitterTransferred = contract.name === "Splitter" || contract.name === "HSplitter" || contract.name === "VSplitter";
    const stickyBoxTransferred = contract.name === "StickyBox";
    const stickySectionTransferred = contract.name === "StickySection";
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
    const expandableItemTransferred = contract.name === "ExpandableItem";
    const fallbackTransferred = contract.name === "Fallback";
    const noResultTransferred = contract.name === "NoResult";
    const spaceFillerTransferred = contract.name === "SpaceFiller";
    const tabsTransferred = contract.name === "Tabs" || contract.name === "TabItem";
    const stackTransferred = contract.name === "Stack" || contract.name === "HStack" || contract.name === "VStack";
    const flowLayoutTransferred = contract.name === "FlowLayout";
    const transferredFolder =
      accordionTransferred ||
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
      colorPickerTransferred ||
      dateInputTransferred ||
      datePickerTransferred ||
      drawerTransferred ||
      modalDialogTransferred ||
      fileInputTransferred ||
      fileUploadDropZoneTransferred ||
      itemsTransferred ||
      tableTransferred ||
      columnTransferred ||
      tileGridTransferred ||
      treeTransferred ||
      treeDisplayTransferred ||
      tableOfContentsTransferred ||
      timeInputTransferred ||
      scrollViewerTransferred ||
      responsiveBarTransferred ||
      splitterTransferred ||
      stickyBoxTransferred ||
      stickySectionTransferred ||
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
      expandableItemTransferred ||
      fallbackTransferred ||
      noResultTransferred ||
      spaceFillerTransferred ||
      tabsTransferred ||
      stackTransferred ||
      flowLayoutTransferred;
    const sharedComponentFile = accordionTransferred
      ? "Accordion"
      : htmlTagTransferred
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
                          : colorPickerTransferred
                            ? "ColorPicker"
                            : dateInputTransferred
                              ? "DateInput"
                            : datePickerTransferred
                              ? "DatePicker"
                              : drawerTransferred
                                ? "Drawer"
                              : modalDialogTransferred
                                ? "ModalDialog"
                              : fileInputTransferred
                                  ? "FileInput"
                                  : fileUploadDropZoneTransferred
                                    ? "FileUploadDropZone"
                                    : itemsTransferred
                                      ? "Items"
                                      : tableTransferred
                                        ? "Table"
                                        : columnTransferred
                                          ? "Column"
                                          : tileGridTransferred
                                            ? "TileGrid"
                                            : treeTransferred
                                              ? "Tree"
                                              : treeDisplayTransferred
                                                ? "TreeDisplay"
                                                : tableOfContentsTransferred
                                                  ? "TableOfContents"
                                                  : timeInputTransferred
                                                    ? "TimeInput"
                                                  : scrollViewerTransferred
                                                    ? "ScrollViewer"
                                                    : responsiveBarTransferred
                                                      ? "ResponsiveBar"
                                                    : splitterTransferred
                                                      ? "Splitter"
                                                      : stickyBoxTransferred
                                                        ? "StickyBox"
                                                        : stickySectionTransferred
                                                          ? "StickySection"
                                                          : expandableItemTransferred
                                                            ? "ExpandableItem"
                                                            : tabsTransferred
                                                              ? "Tabs"
                                                      : contract.name;
    const docsFile = headingTransferred && /^H[1-6]$/.test(contract.name)
      ? contract.name
      : sharedComponentFile;
    const implementationPaths = transferredFolder
      ? [`xmlui/src/components/${folderName}/${sharedComponentFile}.tsx`]
      : [];
    if (appTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/AppReact.tsx`);
    } else if (accordionTransferred) {
      implementationPaths.splice(
        0,
        implementationPaths.length,
        `xmlui/src/components/${folderName}/${contract.name === "AccordionItem" ? "AccordionItemReact" : "AccordionReact"}.tsx`,
      );
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
    } else if (colorPickerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ColorPickerReact.tsx`);
    } else if (dateInputTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/DateInputReact.tsx`);
    } else if (datePickerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/DatePickerReact.tsx`);
    } else if (drawerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/DrawerReact.tsx`);
    } else if (modalDialogTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ModalDialogReact.tsx`);
    } else if (fileInputTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FileInputReact.tsx`);
    } else if (fileUploadDropZoneTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FileUploadDropZoneReact.tsx`);
    } else if (itemsTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ItemsReact.tsx`);
    } else if (tableTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/TableReact.tsx`);
    } else if (columnTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ColumnReact.tsx`);
    } else if (treeTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/TreeReact.tsx`);
    } else if (treeDisplayTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/TreeDisplayReact.tsx`);
    } else if (tableOfContentsTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/TableOfContentsReact.tsx`);
    } else if (timeInputTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/TimeInputReact.tsx`);
    } else if (scrollViewerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ScrollViewerReact.tsx`);
    } else if (responsiveBarTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ResponsiveBarReact.tsx`);
    } else if (splitterTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/SplitterReact.tsx`);
    } else if (stickyBoxTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/StickyBoxReact.tsx`);
    } else if (stickySectionTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/StickySectionReact.tsx`);
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
    } else if (expandableItemTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ExpandableItemReact.tsx`);
    } else if (tabsTransferred) {
      implementationPaths.splice(
        0,
        implementationPaths.length,
        `xmlui/src/components/${folderName}/${contract.name === "TabItem" ? "TabItemReact" : "TabsReact"}.tsx`,
      );
    } else if (fallbackTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FallbackReact.tsx`);
    } else if (noResultTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/NoResultReact.tsx`);
    } else if (spaceFillerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/SpaceFillerReact.tsx`);
    }

    const runnablePaths = componentRunnablePaths({
      accordionTransferred,
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
      colorPickerTransferred,
      dateInputTransferred,
      datePickerTransferred,
      drawerTransferred,
      modalDialogTransferred,
      fileInputTransferred,
      fileUploadDropZoneTransferred,
      itemsTransferred,
      tableTransferred,
      columnTransferred,
      treeTransferred,
      treeDisplayTransferred,
      tableOfContentsTransferred,
      timeInputTransferred,
      scrollViewerTransferred,
      responsiveBarTransferred,
      splitterTransferred,
      stickyBoxTransferred,
      stickySectionTransferred,
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
      expandableItemTransferred,
      fallbackTransferred,
      noResultTransferred,
      spaceFillerTransferred,
      tabsTransferred,
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
          transferredFolder && !brTransferred && !fragmentTransferred && !pageMetaTitleTransferred && !itemsTransferred
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
  accordionTransferred: boolean;
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
  colorPickerTransferred: boolean;
  dateInputTransferred: boolean;
  datePickerTransferred: boolean;
  drawerTransferred: boolean;
  modalDialogTransferred: boolean;
  fileInputTransferred: boolean;
  fileUploadDropZoneTransferred: boolean;
  itemsTransferred: boolean;
  tableTransferred: boolean;
  columnTransferred: boolean;
  treeTransferred: boolean;
  treeDisplayTransferred: boolean;
  tableOfContentsTransferred: boolean;
  timeInputTransferred: boolean;
  scrollViewerTransferred: boolean;
  responsiveBarTransferred: boolean;
  splitterTransferred: boolean;
  stickyBoxTransferred: boolean;
  stickySectionTransferred: boolean;
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
  expandableItemTransferred: boolean;
  fallbackTransferred: boolean;
  noResultTransferred: boolean;
  spaceFillerTransferred: boolean;
  tabsTransferred: boolean;
}): string[] {
  if (flags.accordionTransferred) {
    return [
      "xmlui/src/components/Accordion/Accordion.foundation.spec.ts",
      "xmlui/src/components/Accordion/Accordion.spec.ts",
    ];
  }
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
  if (flags.colorPickerTransferred) {
    return ["xmlui/src/components/ColorPicker/ColorPicker.spec.ts"];
  }
  if (flags.dateInputTransferred) {
    return ["xmlui/src/components/DateInput/DateInput.spec.ts"];
  }
  if (flags.datePickerTransferred) {
    return ["xmlui/src/components/DatePicker/DatePicker.spec.ts"];
  }
  if (flags.drawerTransferred) {
    return [
      "xmlui/src/components/Drawer/Drawer.foundation.spec.ts",
      "xmlui/src/components/Drawer/Drawer.spec.ts",
    ];
  }
  if (flags.modalDialogTransferred) {
    return [
      "xmlui/src/components/ModalDialog/ModalDialog.foundation.spec.ts",
      "xmlui/src/components/ModalDialog/ModalDialog.spec.ts",
    ];
  }
  if (flags.fileInputTransferred) {
    return ["xmlui/src/components/FileInput/FileInput.spec.ts"];
  }
  if (flags.fileUploadDropZoneTransferred) {
    return ["xmlui/src/components/FileUploadDropZone/FileUploadDropZone.spec.ts"];
  }
  if (flags.itemsTransferred) {
    return ["xmlui/src/components/Items/Items.spec.ts"];
  }
  if (flags.tableTransferred) {
    return [
      "xmlui/src/components/Table/Table.spec.ts",
      "xmlui/src/components/Table/TableCellTextOverflow.spec.ts",
      "xmlui/src/components/Table/Table.foundation.spec.ts",
    ];
  }
  if (flags.columnTransferred) {
    return ["xmlui/src/components/Table/Table.foundation.spec.ts"];
  }
  if (flags.treeTransferred) {
    return [
      "xmlui/src/components/Tree/Tree.foundation.spec.ts",
      "xmlui/src/components/Tree/Tree.spec.ts",
      "xmlui/src/components/Tree/Tree-autoLoadAfter-field.spec.ts",
      "xmlui/src/components/Tree/Tree-dynamic-field.spec.ts",
      "xmlui/src/components/Tree/Tree-dynamic-integration.spec.ts",
      "xmlui/src/components/Tree/Tree-dynamic.spec.ts",
      "xmlui/src/components/Tree/Tree-icons.spec.ts",
      "xmlui/src/components/Tree/Tree-loaded-field.spec.ts",
      "xmlui/src/components/Tree/Tree-replace-apis.spec.ts",
      "xmlui/src/components/Tree/Tree-spinnerDelay.spec.ts",
    ];
  }
  if (flags.treeDisplayTransferred) {
    return [
      "xmlui/src/components/TreeDisplay/TreeDisplay.foundation.spec.ts",
      "xmlui/src/components/TreeDisplay/TreeDisplay.spec.ts",
    ];
  }
  if (flags.tableOfContentsTransferred) {
    return [
      "xmlui/src/components/TableOfContents/TableOfContents.foundation.spec.ts",
      "xmlui/src/components/TableOfContents/TableOfContents.spec.ts",
    ];
  }
  if (flags.timeInputTransferred) {
    return ["xmlui/src/components/TimeInput/TimeInput.spec.ts"];
  }
  if (flags.scrollViewerTransferred) {
    return [
      "xmlui/src/components/ScrollViewer/ScrollViewer.foundation.spec.ts",
      "xmlui/src/components/ScrollViewer/ScrollViewer.spec.ts",
    ];
  }
  if (flags.responsiveBarTransferred) {
    return [
      "xmlui/src/components/ResponsiveBar/ResponsiveBar.foundation.spec.ts",
      "xmlui/src/components/ResponsiveBar/ResponsiveBar.spec.ts",
    ];
  }
  if (flags.splitterTransferred) {
    return [
      "xmlui/src/components/Splitter/Splitter.foundation.spec.ts",
      "xmlui/src/components/Splitter/Splitter.spec.ts",
      "xmlui/src/components/Splitter/HSplitter.spec.ts",
      "xmlui/src/components/Splitter/VSplitter.spec.ts",
    ];
  }
  if (flags.stickyBoxTransferred) {
    return ["xmlui/src/components/StickySection/StickySection.foundation.spec.ts"];
  }
  if (flags.stickySectionTransferred) {
    return [
      "xmlui/src/components/StickySection/StickySection.foundation.spec.ts",
      "xmlui/src/components/StickySection/StickySection.spec.ts",
    ];
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
  if (flags.expandableItemTransferred) {
    return [
      "xmlui/src/components/ExpandableItem/ExpandableItem.foundation.spec.ts",
      "xmlui/src/components/ExpandableItem/ExpandableItem.spec.ts",
    ];
  }
  if (flags.tabsTransferred) {
    return [
      "xmlui/src/components/Tabs/Tabs.foundation.spec.ts",
      "xmlui/src/components/Tabs/Tabs.spec.ts",
    ];
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

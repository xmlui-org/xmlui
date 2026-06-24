import { builtInComponentContracts } from "../compiler/contracts";
import { builtInRenderers as legacyBuiltInRenderers } from "../runtime/rendering/builtins";
import type { XmluiBuiltInRenderer } from "../runtime/rendering/types";
import { accordionItemRenderer, accordionRenderer } from "../components/Accordion/Accordion.renderer";
import { appRenderer } from "../components/App/App";
import { appHeaderRenderer } from "../components/AppHeader/AppHeader.renderer";
import { avatarRenderer } from "../components/Avatar/Avatar.renderer";
import { badgeRenderer } from "../components/Badge/Badge.renderer";
import { buttonRenderer } from "../components/Button/Button";
import { cardRenderer } from "../components/Card/Card.renderer";
import { codeBlockRenderer } from "../components/CodeBlock/CodeBlock";
import { conciseValidationFeedbackRenderer } from "../components/ConciseValidationFeedback/ConciseValidationFeedback.renderer";
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
import { progressBarRenderer } from "../components/ProgressBar/ProgressBar.renderer";
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
import { spinnerRenderer } from "../components/Spinner/Spinner.renderer";
import { stepRenderer, stepperRenderer } from "../components/Stepper/Stepper.renderer";
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
import { tooltipRenderer } from "../components/Tooltip/Tooltip.renderer";
import { contextMenuRenderer } from "../components/ContextMenu/ContextMenu.renderer";
import {
  dropdownMenuRenderer,
  menuItemRenderer,
  menuSeparatorRenderer,
  subMenuItemRenderer,
} from "../components/DropdownMenu/DropdownMenu.renderer";
import { autoCompleteRenderer } from "../components/AutoComplete/AutoComplete";
import { fileInputRenderer } from "../components/FileInput/FileInput.renderer";
import { fileUploadDropZoneRenderer } from "../components/FileUploadDropZone/FileUploadDropZone.renderer";
import { focusScopeRenderer } from "../components/FocusScope/FocusScope.renderer";
import { flowLayoutRenderer } from "../components/FlowLayout/FlowLayout.renderer";
import { footerRenderer } from "../components/Footer/Footer.renderer";
import { formRenderer } from "../components/Form/Form.renderer";
import { formItemRenderer } from "../components/FormItem/FormItem.renderer";
import { formSegmentRenderer } from "../components/FormSegment/FormSegment.renderer";
import { stepperFormRenderer } from "../components/StepperForm/StepperForm.renderer";
import { tabsFormRenderer } from "../components/TabsForm/TabsForm.renderer";
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
import { validationSummaryRenderer } from "../components/ValidationSummary/ValidationSummary.renderer";
import { navGroupRenderer } from "../components/NavGroup/NavGroup.renderer";
import { navLinkRenderer } from "../components/NavLink/NavLink.renderer";
import { navPanelCollapseButtonRenderer } from "../components/NavPanelCollapseButton/NavPanelCollapseButton.renderer";
import { navPanelRenderer } from "../components/NavPanel/NavPanel.renderer";
import { dataSourceRenderer } from "../components/DataSource/DataSource.renderer";
import { apiCallRenderer } from "../components/APICall/APICall.renderer";
import { appStateRenderer } from "../components/AppState/AppState.renderer";
import { changeListenerRenderer } from "../components/ChangeListener/ChangeListener.renderer";
import { lifecycleRenderer } from "../components/Lifecycle/Lifecycle.renderer";
import { timerRenderer } from "../components/Timer/Timer.renderer";
import { queueRenderer } from "../components/Queue/Queue.renderer";
import { messageListenerRenderer } from "../components/MessageListener/MessageListener.renderer";
import { eventSourceRenderer } from "../components/EventSource/EventSource.renderer";
import { webSocketRenderer } from "../components/WebSocket/WebSocket.renderer";
import { liveRegionRenderer } from "../components/LiveRegion/LiveRegion.renderer";
import { bookmarkRenderer } from "../components/Bookmark/Bookmark.renderer";
import { skipLinkRenderer } from "../components/SkipLink/SkipLink.renderer";
import { toastRenderer } from "../components/Toast/Toast.renderer";
import { themeRenderer } from "../components/Theme/Theme.renderer";
import { slotRenderer } from "../components/Slot/Slot.renderer";
import { toneSwitchRenderer } from "../components/ToneSwitch/ToneSwitch.renderer";
import { toneChangerButtonRenderer } from "../components/ToneChangerButton/ToneChangerButton.renderer";
import { pageRenderer, pagesRenderer } from "../components/Pages/Pages.renderer";
import { redirectRenderer } from "../components/Redirect/Redirect.renderer";
import { nestedAppRenderer } from "../components/NestedApp/NestedApp.renderer";
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
  "Avatar",
  "Badge",
  "AutoComplete",
  "Fragment",
  "Image",
  "IFrame",
  "Icon",
  "Link",
  "List",
  "Logo",
  "NoResult",
  "ValidationSummary",
  "ConciseValidationFeedback",
  "PageMetaTitle",
  "ProgressBar",
  "QRCode",
  "ResponsiveBar",
  "Splitter",
  "HSplitter",
  "VSplitter",
  "StickyBox",
  "StickySection",
  "Spinner",
  "Stepper",
  "Step",
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
  "Tooltip",
  "ContextMenu",
  "DropdownMenu",
  "MenuItem",
  "MenuSeparator",
  "SubMenuItem",
  "FileInput",
  "FileUploadDropZone",
  "FocusScope",
  "Footer",
  "Form",
  "FormItem",
  "FormSegment",
  "StepperForm",
  "TabsForm",
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
  "NavGroup",
  "NavLink",
  "NavPanelCollapseButton",
  "NavPanel",
  "DataSource",
  "APICall",
  "AppState",
  "ChangeListener",
  "Lifecycle",
  "Timer",
  "Queue",
  "EventSource",
  "MessageListener",
  "WebSocket",
  "LiveRegion",
  "Bookmark",
  "SkipLink",
  "Toast",
  "ToneSwitch",
  "ToneChangerButton",
  "Redirect",
  "NestedApp",
] as const;

const implementedRuntimeNameSet = new Set<string>(implementedRuntimeNames);
const legacyRuntimeRenderers: Partial<Record<string, XmluiBuiltInRenderer>> = legacyBuiltInRenderers;
const transferredRenderers: Partial<Record<string, XmluiBuiltInRenderer>> = {
  Accordion: accordionRenderer,
  AccordionItem: accordionItemRenderer,
  App: appRenderer,
  AppHeader: appHeaderRenderer,
  Avatar: avatarRenderer,
  Badge: badgeRenderer,
  br: brRenderer,
  Br: BrRenderer,
  Button: buttonRenderer,
  Card: cardRenderer,
  CodeBlock: codeBlockRenderer,
  ConciseValidationFeedback: conciseValidationFeedbackRenderer,
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
  ProgressBar: progressBarRenderer,
  QRCode: qrCodeRenderer,
  ResponsiveBar: responsiveBarRenderer,
  Splitter: splitterRenderer,
  HSplitter: hSplitterRenderer,
  VSplitter: vSplitterRenderer,
  StickyBox: stickyBoxRenderer,
  StickySection: stickySectionRenderer,
  Spinner: spinnerRenderer,
  Stepper: stepperRenderer,
  Step: stepRenderer,
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
  Tooltip: tooltipRenderer,
  ContextMenu: contextMenuRenderer,
  DropdownMenu: dropdownMenuRenderer,
  MenuItem: menuItemRenderer,
  MenuSeparator: menuSeparatorRenderer,
  SubMenuItem: subMenuItemRenderer,
  AutoComplete: autoCompleteRenderer,
  FileInput: fileInputRenderer,
  FileUploadDropZone: fileUploadDropZoneRenderer,
  FocusScope: focusScopeRenderer,
  Footer: footerRenderer,
  Form: formRenderer,
  FormItem: formItemRenderer,
  FormSegment: formSegmentRenderer,
  StepperForm: stepperFormRenderer,
  TabsForm: tabsFormRenderer,
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
  ValidationSummary: validationSummaryRenderer,
  NavGroup: navGroupRenderer,
  NavLink: navLinkRenderer,
  NavPanelCollapseButton: navPanelCollapseButtonRenderer,
  NavPanel: navPanelRenderer,
  DataSource: dataSourceRenderer,
  APICall: apiCallRenderer,
  AppState: appStateRenderer,
  ChangeListener: changeListenerRenderer,
  Lifecycle: lifecycleRenderer,
  Timer: timerRenderer,
  Queue: queueRenderer,
  EventSource: eventSourceRenderer,
  MessageListener: messageListenerRenderer,
  WebSocket: webSocketRenderer,
  LiveRegion: liveRegionRenderer,
  Bookmark: bookmarkRenderer,
  SkipLink: skipLinkRenderer,
  Toast: toastRenderer,
  Theme: themeRenderer,
  Slot: slotRenderer,
  ToneSwitch: toneSwitchRenderer,
  ToneChangerButton: toneChangerButtonRenderer,
  Pages: pagesRenderer,
  Page: pageRenderer,
  Redirect: redirectRenderer,
  NestedApp: nestedAppRenderer,
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
  Step: "Stepper",
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
    const appHeaderTransferred = contract.name === "AppHeader";
    const avatarTransferred = contract.name === "Avatar";
    const badgeTransferred = contract.name === "Badge";
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
    const tooltipTransferred = contract.name === "Tooltip";
    const contextMenuTransferred = contract.name === "ContextMenu";
    const dropdownMenuTransferred = contract.name === "DropdownMenu";
    const menuPrimitiveTransferred = contract.name === "MenuItem" ||
      contract.name === "MenuSeparator" ||
      contract.name === "SubMenuItem";
    const fileInputTransferred = contract.name === "FileInput";
    const fileUploadDropZoneTransferred = contract.name === "FileUploadDropZone";
    const focusScopeTransferred = contract.name === "FocusScope";
    const footerTransferred = contract.name === "Footer";
    const formTransferred = contract.name === "Form";
    const formItemTransferred = contract.name === "FormItem";
    const formSegmentTransferred = contract.name === "FormSegment";
    const structuredFormTransferred = contract.name === "StepperForm" || contract.name === "TabsForm";
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
    const spinnerTransferred = contract.name === "Spinner";
    const stepperTransferred = contract.name === "Stepper" || contract.name === "Step";
    const headingTransferred = contract.name === "Heading" || /^H[1-6]$/.test(contract.name);
    const htmlTagTransferred = htmlTagComponentNames.includes(contract.name);
    const brTransferred = contract.name === "br" || contract.name === "Br";
    const fragmentTransferred = contract.name === "Fragment";
    const imageTransferred = contract.name === "Image";
    const iframeTransferred = contract.name === "IFrame";
    const iconTransferred = contract.name === "Icon";
    const linkTransferred = contract.name === "Link";
    const navGroupTransferred = contract.name === "NavGroup";
    const navLinkTransferred = contract.name === "NavLink";
    const navPanelCollapseButtonTransferred = contract.name === "NavPanelCollapseButton";
    const navPanelTransferred = contract.name === "NavPanel";
    const logoTransferred = contract.name === "Logo";
    const pageMetaTitleTransferred = contract.name === "PageMetaTitle";
    const progressBarTransferred = contract.name === "ProgressBar";
    const qrCodeTransferred = contract.name === "QRCode";
    const codeBlockTransferred = contract.name === "CodeBlock";
    const contentSeparatorTransferred = contract.name === "ContentSeparator";
    const expandableItemTransferred = contract.name === "ExpandableItem";
    const fallbackTransferred = contract.name === "Fallback";
    const noResultTransferred = contract.name === "NoResult";
    const validationSummaryTransferred = contract.name === "ValidationSummary";
    const conciseValidationFeedbackTransferred = contract.name === "ConciseValidationFeedback";
    const spaceFillerTransferred = contract.name === "SpaceFiller";
    const tabsTransferred = contract.name === "Tabs" || contract.name === "TabItem";
    const stackTransferred = contract.name === "Stack" || contract.name === "HStack" || contract.name === "VStack";
    const flowLayoutTransferred = contract.name === "FlowLayout";
    const dataSourceTransferred = contract.name === "DataSource";
    const apiCallTransferred = contract.name === "APICall";
    const appStateTransferred = contract.name === "AppState";
    const changeListenerTransferred = contract.name === "ChangeListener";
    const lifecycleTransferred = contract.name === "Lifecycle";
    const timerTransferred = contract.name === "Timer";
    const queueTransferred = contract.name === "Queue";
    const eventSourceTransferred = contract.name === "EventSource";
    const messageListenerTransferred = contract.name === "MessageListener";
    const webSocketTransferred = contract.name === "WebSocket";
    const liveRegionTransferred = contract.name === "LiveRegion";
    const bookmarkTransferred = contract.name === "Bookmark";
    const skipLinkTransferred = contract.name === "SkipLink";
    const toastTransferred = contract.name === "Toast";
    const themeTransferred = contract.name === "Theme";
    const slotTransferred = contract.name === "Slot";
    const toneSwitchTransferred = contract.name === "ToneSwitch";
    const toneChangerButtonTransferred = contract.name === "ToneChangerButton";
    const pagesTransferred = contract.name === "Pages" || contract.name === "Page";
    const redirectTransferred = contract.name === "Redirect";
    const nestedAppTransferred = contract.name === "NestedApp";
    const transferredFolder =
      accordionTransferred ||
      appTransferred ||
      appHeaderTransferred ||
      avatarTransferred ||
      badgeTransferred ||
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
      tooltipTransferred ||
      contextMenuTransferred ||
      dropdownMenuTransferred ||
      menuPrimitiveTransferred ||
      fileInputTransferred ||
      fileUploadDropZoneTransferred ||
      focusScopeTransferred ||
      footerTransferred ||
      formTransferred ||
      formItemTransferred ||
      formSegmentTransferred ||
      structuredFormTransferred ||
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
      spinnerTransferred ||
      stepperTransferred ||
      headingTransferred ||
      htmlTagTransferred ||
      brTransferred ||
      fragmentTransferred ||
      imageTransferred ||
      iframeTransferred ||
      iconTransferred ||
      linkTransferred ||
      navGroupTransferred ||
      navLinkTransferred ||
      navPanelCollapseButtonTransferred ||
      navPanelTransferred ||
      logoTransferred ||
      pageMetaTitleTransferred ||
      progressBarTransferred ||
      qrCodeTransferred ||
      codeBlockTransferred ||
      contentSeparatorTransferred ||
      expandableItemTransferred ||
      fallbackTransferred ||
      noResultTransferred ||
      validationSummaryTransferred ||
      conciseValidationFeedbackTransferred ||
      spaceFillerTransferred ||
      tabsTransferred ||
      stackTransferred ||
      flowLayoutTransferred ||
      dataSourceTransferred ||
      apiCallTransferred ||
      appStateTransferred ||
      changeListenerTransferred ||
      lifecycleTransferred ||
      timerTransferred ||
      queueTransferred ||
      eventSourceTransferred ||
      messageListenerTransferred ||
      webSocketTransferred ||
      liveRegionTransferred ||
      bookmarkTransferred ||
      skipLinkTransferred ||
      toastTransferred ||
      themeTransferred ||
      slotTransferred ||
      toneSwitchTransferred ||
      toneChangerButtonTransferred ||
      pagesTransferred ||
      redirectTransferred ||
      nestedAppTransferred;
    const sharedComponentFile = accordionTransferred
      ? "Accordion"
      : appHeaderTransferred
        ? "AppHeader"
        : avatarTransferred
          ? "Avatar"
          : badgeTransferred
            ? "Badge"
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
                              : tooltipTransferred
                                ? "Tooltip"
                              : contextMenuTransferred
                                ? "ContextMenu"
                              : dropdownMenuTransferred
                                ? "DropdownMenu"
                              : menuPrimitiveTransferred
                                ? "DropdownMenu"
                              : fileInputTransferred
                                  ? "FileInput"
                                  : fileUploadDropZoneTransferred
                                    ? "FileUploadDropZone"
                                    : focusScopeTransferred
                                      ? "FocusScope"
                                    : footerTransferred
                                      ? "Footer"
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
                                                          : spinnerTransferred
                                                            ? "Spinner"
                                                            : stepperTransferred
                                                              ? "Stepper"
                                                          : expandableItemTransferred
                                                            ? "ExpandableItem"
                                                            : tabsTransferred
                                                              ? "Tabs"
                                                              : navGroupTransferred
                                                                ? "NavGroup"
                                                              : navLinkTransferred
                                                                ? "NavLink"
                                                                : navPanelCollapseButtonTransferred
                                                                  ? "NavPanelCollapseButton"
                                                                : navPanelTransferred
                                                                ? "NavPanel"
                                                                : progressBarTransferred
                                                                  ? "ProgressBar"
                                                                : dataSourceTransferred
                                                                  ? "DataSource"
                                                                  : apiCallTransferred
                                                                    ? "APICall"
                                                                    : appStateTransferred
                                                                      ? "AppState"
                                                                      : changeListenerTransferred
                                                                        ? "ChangeListener"
                                                                        : lifecycleTransferred
                                                                          ? "Lifecycle"
                                                                          : timerTransferred
                                                                            ? "Timer"
                                                                            : queueTransferred
                                                                              ? "Queue"
                                                                              : eventSourceTransferred
                                                                                ? "EventSource"
                                                                              : messageListenerTransferred
                                                                                  ? "MessageListener"
                                                                                  : webSocketTransferred
                                                                                    ? "WebSocket"
                                                                                    : liveRegionTransferred
                                                                                      ? "LiveRegion"
                                                                                      : bookmarkTransferred
                                                                                        ? "Bookmark"
                                                                                        : skipLinkTransferred
                                                                                          ? "SkipLink"
                                                                                          : toastTransferred
                                                                                            ? "Toast"
                                                                                            : themeTransferred
                                                                                              ? "Theme"
                                                                                              : slotTransferred
                                                                                                ? "Slot"
                                                                                                : toneSwitchTransferred
                                                                                                  ? "ToneSwitch"
                                                                                                  : toneChangerButtonTransferred
                                                                                                    ? "ToneChangerButton"
                                                                                                    : pagesTransferred
                                                                                                      ? "Pages"
                                                                                                      : redirectTransferred
                                                                                                        ? "Redirect"
                                                                                                        : nestedAppTransferred
                                                                                                          ? "NestedApp"
                                                      : contract.name;
    const docsFile = headingTransferred && /^H[1-6]$/.test(contract.name)
      ? contract.name
      : sharedComponentFile;
    const implementationPaths = transferredFolder
      ? [`xmlui/src/components/${folderName}/${sharedComponentFile}.tsx`]
      : [];
    if (appTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/AppReact.tsx`);
    } else if (appHeaderTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/AppHeaderReact.tsx`);
    } else if (avatarTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/AvatarReact.tsx`);
    } else if (badgeTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/BadgeReact.tsx`);
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
    } else if (tooltipTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/TooltipReact.tsx`);
    } else if (contextMenuTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ContextMenuReact.tsx`);
    } else if (dropdownMenuTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/DropdownMenuReact.tsx`);
    } else if (menuPrimitiveTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/DropdownMenuReact.tsx`);
    } else if (fileInputTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FileInputReact.tsx`);
    } else if (fileUploadDropZoneTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FileUploadDropZoneReact.tsx`);
    } else if (focusScopeTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FocusScopeReact.tsx`);
    } else if (footerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FooterReact.tsx`);
    } else if (formTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FormReact.tsx`);
    } else if (formItemTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FormItemReact.tsx`);
    } else if (formSegmentTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/FormSegmentReact.tsx`);
    } else if (structuredFormTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/${contract.name}React.tsx`);
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
    } else if (spinnerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/SpinnerReact.tsx`);
    } else if (stepperTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/${contract.name === "Step" ? "StepReact" : "StepperReact"}.tsx`);
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
    } else if (navGroupTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/NavGroupReact.tsx`);
    } else if (navLinkTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/NavLinkReact.tsx`);
    } else if (navPanelCollapseButtonTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/NavPanelCollapseButtonReact.tsx`);
    } else if (navPanelTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/NavPanelReact.tsx`);
    } else if (logoTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/LogoReact.tsx`);
    } else if (pageMetaTitleTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/PageMetaTitleReact.tsx`);
    } else if (progressBarTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ProgressBarReact.tsx`);
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
    } else if (validationSummaryTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ValidationSummaryReact.tsx`);
    } else if (conciseValidationFeedbackTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ConciseValidationFeedbackReact.tsx`);
    } else if (spaceFillerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/SpaceFillerReact.tsx`);
    } else if (dataSourceTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/DataSource.renderer.tsx`);
    } else if (apiCallTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/APICall.renderer.tsx`);
    } else if (appStateTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/AppState.renderer.tsx`);
    } else if (changeListenerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ChangeListener.renderer.tsx`);
    } else if (lifecycleTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/Lifecycle.renderer.tsx`);
    } else if (timerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/Timer.renderer.tsx`);
    } else if (queueTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/Queue.renderer.tsx`);
    } else if (eventSourceTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/EventSource.renderer.tsx`);
    } else if (messageListenerTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/MessageListener.renderer.tsx`);
    } else if (webSocketTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/WebSocket.renderer.tsx`);
    } else if (liveRegionTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/LiveRegion.renderer.tsx`);
    } else if (bookmarkTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/Bookmark.renderer.tsx`);
    } else if (skipLinkTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/SkipLink.renderer.tsx`);
    } else if (toastTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/Toast.renderer.tsx`);
    } else if (themeTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/Theme.renderer.tsx`);
    } else if (slotTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/Slot.renderer.tsx`);
    } else if (toneSwitchTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ToneSwitch.renderer.tsx`);
    } else if (toneChangerButtonTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/ToneChangerButton.renderer.tsx`);
    } else if (pagesTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/Pages.renderer.tsx`);
    } else if (redirectTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/Redirect.renderer.tsx`);
    } else if (nestedAppTransferred) {
      implementationPaths.splice(0, implementationPaths.length, `xmlui/src/components/${folderName}/NestedAppReact.tsx`);
    }

    const runnablePaths = componentRunnablePaths({
      accordionTransferred,
      appTransferred,
      appHeaderTransferred,
      avatarTransferred,
      badgeTransferred,
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
      tooltipTransferred,
      contextMenuTransferred,
      dropdownMenuTransferred,
      menuPrimitiveTransferred,
      fileInputTransferred,
      fileUploadDropZoneTransferred,
      focusScopeTransferred,
      footerTransferred,
      formTransferred,
      formItemTransferred,
      formSegmentTransferred,
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
      spinnerTransferred,
      stepperTransferred,
      headingTransferred,
      htmlTagTransferred,
      brTransferred,
      fragmentTransferred,
      imageTransferred,
      iframeTransferred,
      iconTransferred,
      linkTransferred,
      navGroupTransferred,
      navLinkTransferred,
      navPanelCollapseButtonTransferred,
      navPanelTransferred,
      pageMetaTitleTransferred,
      progressBarTransferred,
      qrCodeTransferred,
      codeBlockTransferred,
      contentSeparatorTransferred,
      expandableItemTransferred,
      fallbackTransferred,
      noResultTransferred,
      validationSummaryTransferred,
      conciseValidationFeedbackTransferred,
      spaceFillerTransferred,
      tabsTransferred,
      dataSourceTransferred,
      apiCallTransferred,
      appStateTransferred,
      changeListenerTransferred,
      lifecycleTransferred,
      timerTransferred,
      queueTransferred,
      eventSourceTransferred,
      messageListenerTransferred,
      webSocketTransferred,
      liveRegionTransferred,
      bookmarkTransferred,
      skipLinkTransferred,
      toastTransferred,
      themeTransferred,
      slotTransferred,
      toneSwitchTransferred,
      toneChangerButtonTransferred,
      pagesTransferred,
      redirectTransferred,
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
          transferredFolder &&
          !htmlTagTransferred &&
          !brTransferred &&
          !fragmentTransferred &&
          !iconTransferred &&
          !spaceFillerTransferred &&
          !dataSourceTransferred &&
          !apiCallTransferred &&
          !appStateTransferred &&
          !changeListenerTransferred &&
          !lifecycleTransferred &&
          !timerTransferred &&
          !queueTransferred &&
          !eventSourceTransferred &&
          !messageListenerTransferred &&
          !webSocketTransferred &&
          !liveRegionTransferred &&
          !bookmarkTransferred &&
          !skipLinkTransferred &&
          !toastTransferred &&
          !themeTransferred &&
          !slotTransferred &&
          !toneSwitchTransferred &&
          !toneChangerButtonTransferred &&
          !pagesTransferred &&
          !redirectTransferred
            ? [`xmlui/src/components/${folderName}/${sharedComponentFile}.defaults.ts`]
            : [],
        styles:
          transferredFolder &&
          !brTransferred &&
          !fragmentTransferred &&
          !pageMetaTitleTransferred &&
          !itemsTransferred &&
          !dataSourceTransferred &&
          !apiCallTransferred &&
          !appStateTransferred &&
          !changeListenerTransferred &&
          !lifecycleTransferred &&
          !timerTransferred &&
          !queueTransferred &&
          !eventSourceTransferred &&
          !messageListenerTransferred &&
          !webSocketTransferred &&
          !toastTransferred &&
          !themeTransferred &&
          !slotTransferred &&
          !toneChangerButtonTransferred &&
          !pagesTransferred &&
          !redirectTransferred
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
  appHeaderTransferred: boolean;
  avatarTransferred: boolean;
  badgeTransferred: boolean;
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
  tooltipTransferred: boolean;
  contextMenuTransferred: boolean;
  dropdownMenuTransferred: boolean;
  menuPrimitiveTransferred: boolean;
  fileInputTransferred: boolean;
  fileUploadDropZoneTransferred: boolean;
  focusScopeTransferred: boolean;
  footerTransferred: boolean;
  formTransferred: boolean;
  formItemTransferred: boolean;
  formSegmentTransferred: boolean;
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
  spinnerTransferred: boolean;
  stepperTransferred: boolean;
  headingTransferred: boolean;
  htmlTagTransferred: boolean;
  brTransferred: boolean;
  fragmentTransferred: boolean;
  imageTransferred: boolean;
  iframeTransferred: boolean;
  iconTransferred: boolean;
  linkTransferred: boolean;
  navGroupTransferred: boolean;
  navLinkTransferred: boolean;
  navPanelCollapseButtonTransferred: boolean;
  navPanelTransferred: boolean;
  pageMetaTitleTransferred: boolean;
  progressBarTransferred: boolean;
  qrCodeTransferred: boolean;
  codeBlockTransferred: boolean;
  contentSeparatorTransferred: boolean;
  expandableItemTransferred: boolean;
  fallbackTransferred: boolean;
  noResultTransferred: boolean;
  validationSummaryTransferred: boolean;
  conciseValidationFeedbackTransferred: boolean;
  spaceFillerTransferred: boolean;
  tabsTransferred: boolean;
  dataSourceTransferred: boolean;
  apiCallTransferred: boolean;
  appStateTransferred: boolean;
  changeListenerTransferred: boolean;
  lifecycleTransferred: boolean;
  timerTransferred: boolean;
  queueTransferred: boolean;
  eventSourceTransferred: boolean;
  messageListenerTransferred: boolean;
  webSocketTransferred: boolean;
  liveRegionTransferred: boolean;
  bookmarkTransferred: boolean;
  skipLinkTransferred: boolean;
  toastTransferred: boolean;
  themeTransferred: boolean;
  slotTransferred: boolean;
  toneSwitchTransferred: boolean;
  toneChangerButtonTransferred: boolean;
  pagesTransferred: boolean;
  redirectTransferred: boolean;
  nestedAppTransferred?: boolean;
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
  if (flags.appHeaderTransferred) {
    return [
      "xmlui/src/components/AppHeader/AppHeader.foundation.spec.ts",
      "xmlui/src/components/AppHeader/AppHeader.spec.ts",
    ];
  }
  if (flags.avatarTransferred) {
    return ["xmlui/src/components/Avatar/Avatar.spec.ts"];
  }
  if (flags.badgeTransferred) {
    return ["xmlui/src/components/Badge/Badge.spec.ts"];
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
  if (flags.tooltipTransferred) {
    return [
      "xmlui/src/components/Tooltip/Tooltip.foundation.spec.ts",
      "xmlui/src/components/Tooltip/Tooltip.spec.ts",
    ];
  }
  if (flags.contextMenuTransferred) {
    return [
      "xmlui/src/components/ContextMenu/ContextMenu.foundation.spec.ts",
      "xmlui/src/components/ContextMenu/ContextMenu.spec.ts",
    ];
  }
  if (flags.dropdownMenuTransferred) {
    return [
      "xmlui/src/components/DropdownMenu/DropdownMenu.foundation.spec.ts",
      "xmlui/src/components/DropdownMenu/DropdownMenu.spec.ts",
    ];
  }
  if (flags.menuPrimitiveTransferred) {
    return [
      "xmlui/src/components/ContextMenu/ContextMenu.foundation.spec.ts",
      "xmlui/src/components/DropdownMenu/DropdownMenu.foundation.spec.ts",
    ];
  }
  if (flags.fileInputTransferred) {
    return ["xmlui/src/components/FileInput/FileInput.spec.ts"];
  }
  if (flags.fileUploadDropZoneTransferred) {
    return ["xmlui/src/components/FileUploadDropZone/FileUploadDropZone.spec.ts"];
  }
  if (flags.focusScopeTransferred) {
    return ["xmlui/src/components/FocusScope/FocusScope.spec.ts"];
  }
  if (flags.footerTransferred) {
    return [
      "xmlui/src/components/Footer/Footer.foundation.spec.ts",
      "xmlui/src/components/Footer/Footer.spec.ts",
    ];
  }
  if (flags.formTransferred) {
    return [
      "xmlui/src/components/Form/Form.foundation.spec.ts",
      "xmlui/src/components/Form/Form.spec.ts",
    ];
  }
  if (flags.formItemTransferred) {
    return [
      "xmlui/src/components/FormItem/FormItem.foundation.spec.ts",
      "xmlui/src/components/FormItem/FormItem.spec.ts",
      "xmlui/src/components/FormItem/FormItemLabelClick.spec.ts",
    ];
  }
  if (flags.formSegmentTransferred) {
    return [
      "xmlui/src/components/FormSegment/FormSegment.foundation.spec.ts",
      "xmlui/src/components/FormSegment/FormSegment.spec.ts",
    ];
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
  if (flags.spinnerTransferred) {
    return ["xmlui/src/components/Spinner/Spinner.spec.ts"];
  }
  if (flags.stepperTransferred) {
    return ["xmlui/src/components/Stepper/Stepper.spec.ts"];
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
  if (flags.navGroupTransferred) {
    return [
      "xmlui/src/components/NavGroup/NavGroup.foundation.spec.ts",
      "xmlui/src/components/NavGroup/NavGroup.spec.ts",
      "xmlui/src/components/NavPanel/NavPanel.foundation.spec.ts",
      "xmlui/src/components/NavLink/NavLink.foundation.spec.ts",
    ];
  }
  if (flags.navLinkTransferred) {
    return [
      "xmlui/src/components/NavLink/NavLink.foundation.spec.ts",
      "xmlui/src/components/NavLink/NavLink.spec.ts",
    ];
  }
  if (flags.navPanelCollapseButtonTransferred) {
    return [
      "xmlui/src/components/NavPanelCollapseButton/NavPanelCollapseButton.foundation.spec.ts",
      "xmlui/src/components/NavPanel/NavPanel.foundation.spec.ts",
    ];
  }
  if (flags.navPanelTransferred) {
    return [
      "xmlui/src/components/NavPanel/NavPanel.foundation.spec.ts",
      "xmlui/src/components/NavPanel/NavPanel.spec.ts",
    ];
  }
  if (flags.pageMetaTitleTransferred) {
    return ["xmlui/src/components/PageMetaTitle/PageMetaTitle.spec.ts"];
  }
  if (flags.progressBarTransferred) {
    return ["xmlui/src/components/ProgressBar/ProgressBar.spec.ts"];
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
  if (flags.validationSummaryTransferred) {
    return ["xmlui/src/components/ValidationSummary/ValidationSummary.foundation.spec.ts"];
  }
  if (flags.conciseValidationFeedbackTransferred) {
    return ["xmlui/src/components/ConciseValidationFeedback/ConciseValidationFeedback.foundation.spec.ts"];
  }
  if (flags.fallbackTransferred) {
    return ["xmlui/src/components/Fallback/Fallback.spec.ts"];
  }
  if (flags.spaceFillerTransferred) {
    return ["xmlui/src/components/SpaceFiller/SpaceFiller.spec.ts"];
  }
  if (flags.dataSourceTransferred) {
    return [
      "xmlui/src/components/DataSource/DataSource.spec.ts",
      "xmlui/tests/e2e/data-operations.spec.ts",
    ];
  }
  if (flags.apiCallTransferred) {
    return [
      "xmlui/src/components/APICall/APICall.spec.ts",
      "xmlui/tests/e2e/data-operations.spec.ts",
    ];
  }
  if (flags.appStateTransferred) {
    return ["xmlui/src/components/AppState/AppState.spec.ts"];
  }
  if (flags.changeListenerTransferred) {
    return ["xmlui/src/components/ChangeListener/ChangeListener.spec.ts"];
  }
  if (flags.lifecycleTransferred) {
    return ["xmlui/src/components/Lifecycle/Lifecycle.spec.ts"];
  }
  if (flags.timerTransferred) {
    return ["xmlui/src/components/Timer/Timer.spec.ts"];
  }
  if (flags.queueTransferred) {
    return ["xmlui/src/components/Queue/Queue.spec.ts"];
  }
  if (flags.eventSourceTransferred) {
    return ["xmlui/src/components/EventSource/EventSource.spec.ts"];
  }
  if (flags.messageListenerTransferred) {
    return ["xmlui/src/components/MessageListener/MessageListener.spec.ts"];
  }
  if (flags.webSocketTransferred) {
    return ["xmlui/src/components/WebSocket/WebSocket.spec.ts"];
  }
  if (flags.liveRegionTransferred) {
    return ["xmlui/src/components/LiveRegion/LiveRegion.spec.ts"];
  }
  if (flags.bookmarkTransferred) {
    return ["xmlui/src/components/Bookmark/Bookmark.spec.ts"];
  }
  if (flags.skipLinkTransferred) {
    return ["xmlui/src/components/SkipLink/SkipLink.spec.ts"];
  }
  if (flags.toastTransferred) {
    return ["xmlui/src/components/Toast/Toast.spec.ts"];
  }
  if (flags.themeTransferred) {
    return ["xmlui/src/components/Theme/Theme.spec.ts"];
  }
  if (flags.slotTransferred) {
    return ["xmlui/src/components/Slot/Slot.spec.ts"];
  }
  if (flags.toneSwitchTransferred) {
    return ["xmlui/src/components/ToneSwitch/ToneSwitch.spec.ts"];
  }
  if (flags.toneChangerButtonTransferred) {
    return ["xmlui/src/components/ToneChangerButton/ToneChangerButton.spec.ts"];
  }
  if (flags.pagesTransferred) {
    return ["xmlui/src/components/Pages/Pages.spec.ts"];
  }
  if (flags.redirectTransferred) {
    return ["xmlui/src/components/Redirect/Redirect.spec.ts"];
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

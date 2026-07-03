import { accordionItemRenderer, accordionRenderer } from "../components/Accordion/Accordion.renderer";
import { apiCallRenderer } from "../components/APICall/APICall.renderer";
import { appRuntimeRenderer } from "../components/App/App";
import { appHeaderRuntimeRenderer } from "../components/AppHeader/AppHeader";
import { appStateRenderer } from "../components/AppState/AppState";
import { autoCompleteRenderer } from "../components/AutoComplete/AutoComplete";
import { avatarRenderer } from "../components/Avatar/Avatar.renderer";
import { badgeRenderer } from "../components/Badge/Badge.renderer";
import { bookmarkRenderer } from "../components/Bookmark/Bookmark.renderer";
import { brRenderer, BrRenderer } from "../components/Br/Br";
import { buttonRenderer } from "../components/Button/Button";
import { cardRenderer } from "../components/Card/Card";
import { changeListenerRenderer } from "../components/ChangeListener/ChangeListener.renderer";
import { checkboxRenderer } from "../components/Checkbox/Checkbox.renderer";
import { codeBlockRenderer } from "../components/CodeBlock/CodeBlock";
import { colorPickerRenderer } from "../components/ColorPicker/ColorPicker.renderer";
import { columnRenderer } from "../components/Column/Column";
import { conciseValidationFeedbackRenderer } from "../components/ConciseValidationFeedback/ConciseValidationFeedback.renderer";
import { contentSeparatorRenderer } from "../components/ContentSeparator/ContentSeparator.renderer";
import { contextMenuRenderer } from "../components/ContextMenu/ContextMenu.renderer";
import { dataSourceRenderer } from "../components/DataSource/DataSource.renderer";
import { dateInputRenderer } from "../components/DateInput/DateInput.renderer";
import { datePickerRenderer } from "../components/DatePicker/DatePicker.renderer";
import { drawerRenderer } from "../components/Drawer/Drawer.renderer";
import {
  dropdownMenuRenderer,
  menuItemRenderer,
  menuSeparatorRenderer,
  subMenuItemRenderer,
} from "../components/DropdownMenu/DropdownMenu.renderer";
import { eventSourceRenderer } from "../components/EventSource/EventSource.renderer";
import { expandableItemRenderer } from "../components/ExpandableItem/ExpandableItem.renderer";
import { fallbackRenderer } from "../components/Fallback/Fallback";
import { fileInputRenderer } from "../components/FileInput/FileInput.renderer";
import { fileUploadDropZoneRenderer } from "../components/FileUploadDropZone/FileUploadDropZone.renderer";
import { flowLayoutRenderer } from "../components/FlowLayout/FlowLayout.renderer";
import { focusScopeRenderer } from "../components/FocusScope/FocusScope.renderer";
import { footerRuntimeRenderer } from "../components/Footer/Footer";
import { formRenderer } from "../components/Form/Form.renderer";
import { formItemRenderer } from "../components/FormItem/FormItem.renderer";
import { formSegmentRenderer } from "../components/FormSegment/FormSegment.renderer";
import { fragmentRenderer } from "../components/Fragment/Fragment";
import {
  headingRenderer,
  h1Renderer,
  h2Renderer,
  h3Renderer,
  h4Renderer,
  h5Renderer,
  h6Renderer,
} from "../components/Heading/Heading";
import { htmlTagRenderers } from "../components/HtmlTags/HtmlTags";
import { iconRenderer } from "../components/Icon/Icon";
import { iframeRenderer } from "../components/IFrame/IFrame.renderer";
import { imageRenderer } from "../components/Image/Image.renderer";
import { includeMarkupRenderer } from "../components/IncludeMarkup/IncludeMarkup.renderer";
import { inspectorRenderer } from "../components/Inspector/Inspector";
import { inspectButtonRenderer } from "../components/InspectButton/InspectButton";
import { i18nRenderer } from "../components/I18n/I18n";
import { itemsRenderer } from "../components/Items/Items";
import { lifecycleRenderer } from "../components/Lifecycle/Lifecycle.renderer";
import { linkRenderer } from "../components/Link/Link.renderer";
import { listRenderer } from "../components/List/List";
import { liveRegionRenderer } from "../components/LiveRegion/LiveRegion.renderer";
import { logoRenderer } from "../components/Logo/Logo";
import { markdownRenderer } from "../components/Markdown/Markdown.renderer";
import { messageListenerRenderer } from "../components/MessageListener/MessageListener.renderer";
import { modalDialogRenderer } from "../components/ModalDialog/ModalDialog.renderer";
import { navGroupRuntimeRenderer } from "../components/NavGroup/NavGroup";
import { navLinkRuntimeRenderer } from "../components/NavLink/NavLink";
import { navPanelRuntimeRenderer } from "../components/NavPanel/NavPanel";
import { navPanelCollapseButtonRenderer } from "../components/NavPanelCollapseButton/NavPanelCollapseButton.renderer";
import { nestedAppRenderer } from "../components/NestedApp/NestedApp.renderer";
import { noResultRenderer } from "../components/NoResult/NoResult.renderer";
import { numberBoxRenderer } from "../components/NumberBox/NumberBox";
import { optionRenderer } from "../components/Option/Option";
import { pageRuntimeRenderer, pagesRuntimeRenderer } from "../components/Pages/Pages";
import { pageMetaTitleRenderer } from "../components/PageMetaTitle/PageMetaTitle";
import { paginationRenderer } from "../components/Pagination/Pagination";
import { partRenderer } from "../components/Part/Part";
import { passwordInputRenderer, textBoxRenderer } from "../components/TextBox/TextBox";
import { progressBarRenderer } from "../components/ProgressBar/ProgressBar";
import { qrCodeRenderer } from "../components/QRCode/QRCode.renderer";
import { queueRenderer } from "../components/Queue/Queue.renderer";
import { radioGroupRenderer } from "../components/RadioGroup/RadioGroup";
import { ratingInputRenderer } from "../components/RatingInput/RatingInput.renderer";
import { redirectRenderer } from "../components/Redirect/Redirect.renderer";
import { responsiveBarRenderer } from "../components/ResponsiveBar/ResponsiveBar.renderer";
import { retryPolicyRenderer } from "../components/RetryPolicy/RetryPolicy";
import { scrollViewerRenderer } from "../components/ScrollViewer/ScrollViewer.renderer";
import { selectRenderer } from "../components/Select/Select";
import { selectionStoreRenderer } from "../components/SelectionStore/SelectionStore";
import { skipLinkRenderer } from "../components/SkipLink/SkipLink.renderer";
import { sliderRenderer } from "../components/Slider/Slider.renderer";
import { slotRenderer } from "../components/Slot/Slot.renderer";
import { spaceFillerRenderer } from "../components/SpaceFiller/SpaceFiller.renderer";
import { spinnerRenderer } from "../components/Spinner/Spinner.renderer";
import {
  hSplitterRenderer,
  splitterRenderer,
  vSplitterRenderer,
} from "../components/Splitter/Splitter.renderer";
import {
  chStackRenderer,
  cvStackRenderer,
  hStackRenderer,
  stackRenderer,
  vStackRenderer,
} from "../components/Stack/Stack";
import { stepRenderer, stepperRenderer } from "../components/Stepper/Stepper.renderer";
import { stepperFormRenderer } from "../components/StepperForm/StepperForm.renderer";
import { stickyBoxRenderer } from "../components/StickyBox/StickyBox.renderer";
import { stickySectionRenderer } from "../components/StickySection/StickySection.renderer";
import { switchRenderer } from "../components/Switch/Switch.renderer";
import { tabItemRenderer, tabsRenderer } from "../components/Tabs/Tabs.renderer";
import { tabsFormRenderer } from "../components/TabsForm/TabsForm.renderer";
import { tableRenderer } from "../components/Table/Table";
import { tableOfContentsRenderer } from "../components/TableOfContents/TableOfContents";
import { textRenderer } from "../components/Text/Text";
import { textAreaRenderer } from "../components/TextArea/TextArea";
import { themeRenderer } from "../components/Theme/Theme.renderer";
import { tileGridRenderer } from "../components/TileGrid/TileGrid.renderer";
import { timeInputRenderer } from "../components/TimeInput/TimeInput.renderer";
import { timerRenderer } from "../components/Timer/Timer.renderer";
import { toastRenderer } from "../components/Toast/Toast.renderer";
import { toneChangerButtonRenderer } from "../components/ToneChangerButton/ToneChangerButton.renderer";
import { toneSwitchRenderer } from "../components/ToneSwitch/ToneSwitch.renderer";
import { tooltipRenderer } from "../components/Tooltip/Tooltip.renderer";
import { treeRenderer } from "../components/Tree/Tree";
import { treeDisplayRenderer } from "../components/TreeDisplay/TreeDisplay";
import { validationSummaryRenderer } from "../components/ValidationSummary/ValidationSummary.renderer";
import { webSocketRenderer } from "../components/WebSocket/WebSocket.renderer";
import { builtInRenderers as legacyBuiltInRenderers } from "../runtime/rendering/builtins";
import type { XmluiBuiltInRenderer } from "../runtime/rendering/types";

export type RuntimeRendererEntry = {
  name: string;
  renderer: XmluiBuiltInRenderer;
};

export const coreRuntimeRendererEntries = [
  { name: "Accordion", renderer: accordionRenderer },
  { name: "AccordionItem", renderer: accordionItemRenderer },
  { name: "App", renderer: appRuntimeRenderer },
  { name: "AppHeader", renderer: appHeaderRuntimeRenderer },
  { name: "Avatar", renderer: avatarRenderer },
  { name: "Badge", renderer: badgeRenderer },
  { name: "br", renderer: brRenderer },
  { name: "Br", renderer: BrRenderer },
  { name: "Button", renderer: buttonRenderer },
  { name: "Card", renderer: cardRenderer },
  { name: "CodeBlock", renderer: codeBlockRenderer },
  { name: "ConciseValidationFeedback", renderer: conciseValidationFeedbackRenderer },
  { name: "ContentSeparator", renderer: contentSeparatorRenderer },
  { name: "ExpandableItem", renderer: expandableItemRenderer },
  { name: "Fallback", renderer: fallbackRenderer },
  { name: "Fragment", renderer: fragmentRenderer },
  { name: "Icon", renderer: iconRenderer },
  { name: "Image", renderer: imageRenderer },
  { name: "IFrame", renderer: iframeRenderer },
  { name: "Link", renderer: linkRenderer },
  { name: "List", renderer: listRenderer },
  { name: "Logo", renderer: logoRenderer },
  { name: "NoResult", renderer: noResultRenderer },
  { name: "PageMetaTitle", renderer: pageMetaTitleRenderer },
  { name: "ProgressBar", renderer: progressBarRenderer },
  { name: "QRCode", renderer: qrCodeRenderer },
  { name: "ResponsiveBar", renderer: responsiveBarRenderer },
  { name: "Splitter", renderer: splitterRenderer },
  { name: "HSplitter", renderer: hSplitterRenderer },
  { name: "VSplitter", renderer: vSplitterRenderer },
  { name: "StickyBox", renderer: stickyBoxRenderer },
  { name: "StickySection", renderer: stickySectionRenderer },
  { name: "Spinner", renderer: spinnerRenderer },
  { name: "Stepper", renderer: stepperRenderer },
  { name: "Step", renderer: stepRenderer },
  { name: "Tabs", renderer: tabsRenderer },
  { name: "TabItem", renderer: tabItemRenderer },
  { name: "SpaceFiller", renderer: spaceFillerRenderer },
  { name: "Heading", renderer: headingRenderer },
  { name: "H1", renderer: h1Renderer },
  { name: "H2", renderer: h2Renderer },
  { name: "H3", renderer: h3Renderer },
  { name: "H4", renderer: h4Renderer },
  { name: "H5", renderer: h5Renderer },
  { name: "H6", renderer: h6Renderer },
  { name: "Stack", renderer: stackRenderer },
  { name: "HStack", renderer: hStackRenderer },
  { name: "VStack", renderer: vStackRenderer },
  { name: "CHStack", renderer: chStackRenderer },
  { name: "CVStack", renderer: cvStackRenderer },
  { name: "FlowLayout", renderer: flowLayoutRenderer },
  { name: "Text", renderer: textRenderer },
  { name: "TextBox", renderer: textBoxRenderer },
  { name: "PasswordInput", renderer: passwordInputRenderer },
  { name: "TextArea", renderer: textAreaRenderer },
  { name: "NumberBox", renderer: numberBoxRenderer },
  { name: "Checkbox", renderer: checkboxRenderer },
  { name: "Switch", renderer: switchRenderer },
  { name: "RatingInput", renderer: ratingInputRenderer },
  { name: "Slider", renderer: sliderRenderer },
  { name: "ColorPicker", renderer: colorPickerRenderer },
  { name: "DateInput", renderer: dateInputRenderer },
  { name: "DatePicker", renderer: datePickerRenderer },
  { name: "Drawer", renderer: drawerRenderer },
  { name: "ModalDialog", renderer: modalDialogRenderer },
  { name: "Tooltip", renderer: tooltipRenderer },
  { name: "ContextMenu", renderer: contextMenuRenderer },
  { name: "DropdownMenu", renderer: dropdownMenuRenderer },
  { name: "MenuItem", renderer: menuItemRenderer },
  { name: "MenuSeparator", renderer: menuSeparatorRenderer },
  { name: "SubMenuItem", renderer: subMenuItemRenderer },
  { name: "AutoComplete", renderer: autoCompleteRenderer },
  { name: "FileInput", renderer: fileInputRenderer },
  { name: "FileUploadDropZone", renderer: fileUploadDropZoneRenderer },
  { name: "FocusScope", renderer: focusScopeRenderer },
  { name: "Footer", renderer: footerRuntimeRenderer },
  { name: "Form", renderer: formRenderer },
  { name: "FormItem", renderer: formItemRenderer },
  { name: "FormSegment", renderer: formSegmentRenderer },
  { name: "StepperForm", renderer: stepperFormRenderer },
  { name: "TabsForm", renderer: tabsFormRenderer },
  { name: "Option", renderer: optionRenderer },
  { name: "Pagination", renderer: paginationRenderer },
  { name: "Table", renderer: tableRenderer },
  { name: "Column", renderer: columnRenderer },
  { name: "TileGrid", renderer: tileGridRenderer },
  { name: "Tree", renderer: treeRenderer },
  { name: "TreeDisplay", renderer: treeDisplayRenderer },
  { name: "TableOfContents", renderer: tableOfContentsRenderer },
  { name: "RadioGroup", renderer: radioGroupRenderer },
  { name: "ScrollViewer", renderer: scrollViewerRenderer },
  { name: "Select", renderer: selectRenderer },
  { name: "SelectionStore", renderer: selectionStoreRenderer },
  { name: "Items", renderer: itemsRenderer },
  { name: "TimeInput", renderer: timeInputRenderer },
  { name: "ValidationSummary", renderer: validationSummaryRenderer },
  { name: "NavGroup", renderer: navGroupRuntimeRenderer },
  { name: "NavLink", renderer: navLinkRuntimeRenderer },
  { name: "NavPanelCollapseButton", renderer: navPanelCollapseButtonRenderer },
  { name: "NavPanel", renderer: navPanelRuntimeRenderer },
  { name: "DataSource", renderer: dataSourceRenderer },
  { name: "APICall", renderer: apiCallRenderer },
  { name: "AppState", renderer: appStateRenderer },
  { name: "ChangeListener", renderer: changeListenerRenderer },
  { name: "Lifecycle", renderer: lifecycleRenderer },
  { name: "Timer", renderer: timerRenderer },
  { name: "Queue", renderer: queueRenderer },
  { name: "EventSource", renderer: eventSourceRenderer },
  { name: "MessageListener", renderer: messageListenerRenderer },
  { name: "WebSocket", renderer: webSocketRenderer },
  { name: "LiveRegion", renderer: liveRegionRenderer },
  { name: "Bookmark", renderer: bookmarkRenderer },
  { name: "SkipLink", renderer: skipLinkRenderer },
  { name: "Toast", renderer: toastRenderer },
  { name: "Theme", renderer: themeRenderer },
  { name: "Slot", renderer: slotRenderer },
  { name: "Part", renderer: partRenderer },
  { name: "ToneSwitch", renderer: toneSwitchRenderer },
  { name: "ToneChangerButton", renderer: toneChangerButtonRenderer },
  { name: "Pages", renderer: pagesRuntimeRenderer },
  { name: "Page", renderer: pageRuntimeRenderer },
  { name: "Redirect", renderer: redirectRenderer },
  { name: "NestedApp", renderer: nestedAppRenderer },
  { name: "IncludeMarkup", renderer: includeMarkupRenderer },
  { name: "Markdown", renderer: markdownRenderer },
  { name: "Inspector", renderer: inspectorRenderer },
  { name: "InspectButton", renderer: inspectButtonRenderer },
  { name: "I18n", renderer: i18nRenderer },
  { name: "RetryPolicy", renderer: retryPolicyRenderer },
] satisfies RuntimeRendererEntry[];

export const runtimeRendererEntries = [
  ...coreRuntimeRendererEntries,
  ...Object.entries(htmlTagRenderers).map(([name, renderer]) => ({ name, renderer })),
] satisfies RuntimeRendererEntry[];

export const builtInComponentRenderers: Partial<Record<string, XmluiBuiltInRenderer>> = {
  ...legacyBuiltInRenderers,
  ...Object.fromEntries(runtimeRendererEntries.map(({ name, renderer }) => [name, renderer])),
};

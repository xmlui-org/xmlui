import type { XmluiComponentContract } from "./types";
import { supportedLayoutPropNames, supportedResponsiveLayoutPropNames } from "../../styling";
import { htmlTagDefinitions } from "../../component-core/htmlTags";
import { AccordionItemMd, AccordionMd } from "../../components/Accordion/Accordion";
import { AvatarMd } from "../../components/Avatar/Avatar";
import { BadgeMd } from "../../components/Badge/Badge";
import { ExpandableItemMd } from "../../components/ExpandableItem/ExpandableItem";
import { htmlTagMetadata } from "../../components/HtmlTags/HtmlTags";
import { BrCapitalizedMd, BrMd } from "../../components/Br/Br";
import { ButtonMd } from "../../components/Button/Button";
import { CardMd } from "../../components/Card/Card";
import { FragmentMd } from "../../components/Fragment/Fragment";
import { ImageMd } from "../../components/Image/Image";
import { IFrameMd } from "../../components/IFrame/IFrame";
import { LinkMd } from "../../components/Link/Link";
import { ItemsMd } from "../../components/Items/Items";
import { PasswordInputMd, TextBoxMd } from "../../components/TextBox/TextBox";
import { FormMd } from "../../components/Form/Form";
import { FormValidatorMd } from "../../components/Form/FormValidator";
import { FormItemMd } from "../../components/FormItem/FormItem";
import { FormSegmentMd } from "../../components/FormSegment/FormSegment";
import { FormSectionMd } from "../../components/FormSection/FormSection";
import { StepperFormMd } from "../../components/StepperForm/StepperForm";
import { TabsFormMd } from "../../components/TabsForm/TabsForm";
import { TextAreaMd } from "../../components/TextArea/TextArea";
import { NumberBoxMd } from "../../components/NumberBox/NumberBox";
import { RatingInputMd } from "../../components/RatingInput/RatingInput";
import { SliderMd } from "../../components/Slider/Slider";
import { ColorPickerMd } from "../../components/ColorPicker/ColorPicker";
import { DateInputMd } from "../../components/DateInput/DateInput";
import { DatePickerMd } from "../../components/DatePicker/DatePicker";
import { DrawerMd } from "../../components/Drawer/Drawer";
import { ModalDialogMd } from "../../components/ModalDialog/ModalDialog";
import { TooltipMd } from "../../components/Tooltip/Tooltip";
import { ContextMenuMd } from "../../components/ContextMenu/ContextMenu";
import { DropdownMenuMd, MenuItemMd, MenuSeparatorMd, SubMenuItemMd } from "../../components/DropdownMenu/DropdownMenu";
import { FileInputMd } from "../../components/FileInput/FileInput";
import { FileUploadDropZoneMd } from "../../components/FileUploadDropZone/FileUploadDropZone";
import { FocusScopeMd } from "../../components/FocusScope/FocusScope";
import { FlowLayoutMd } from "../../components/FlowLayout/FlowLayout";
import { ScrollViewerMd } from "../../components/ScrollViewer/ScrollViewer";
import { TimeInputMd } from "../../components/TimeInput/TimeInput";
import { TileGridMd } from "../../components/TileGrid/TileGrid";
import { ContentSeparatorMd } from "../../components/ContentSeparator/ContentSeparator";
import { FallbackMd } from "../../components/Fallback/Fallback";
import { NoResultMd } from "../../components/NoResult/NoResult";
import { ValidationSummaryMd } from "../../components/ValidationSummary/ValidationSummary";
import { ConciseValidationFeedbackMd } from "../../components/ConciseValidationFeedback/ConciseValidationFeedback";
import { PageMetaTitleMd } from "../../components/PageMetaTitle/PageMetaTitle";
import { ProgressBarMd } from "../../components/ProgressBar/ProgressBar";
import { QRCodeMd } from "../../components/QRCode/QRCode";
import { ResponsiveBarMd } from "../../components/ResponsiveBar/ResponsiveBar";
import { SpaceFillerMd } from "../../components/SpaceFiller/SpaceFiller";
import { HSplitterMd, SplitterMd, VSplitterMd } from "../../components/Splitter/Splitter";
import { StickyBoxMd } from "../../components/StickyBox/StickyBox";
import { StickySectionMd } from "../../components/StickySection/StickySection";
import { SpinnerMd } from "../../components/Spinner/Spinner";
import { StepMd, StepperMd } from "../../components/Stepper/Stepper";
import { TabItemMd, TabsMd } from "../../components/Tabs/Tabs";
import { DataSourceMd } from "../../components/DataSource/DataSource";
import { APICallMd } from "../../components/APICall/APICall";
import { AppStateMd } from "../../components/AppState/AppState";
import { ChangeListenerMd } from "../../components/ChangeListener/ChangeListener";
import { LifecycleMd } from "../../components/Lifecycle/Lifecycle";
import { TimerMd } from "../../components/Timer/Timer";
import { QueueMd } from "../../components/Queue/Queue";
import { MessageListenerMd } from "../../components/MessageListener/MessageListener";
import { EventSourceMd } from "../../components/EventSource/EventSource";
import { WebSocketMd } from "../../components/WebSocket/WebSocket";
import { LiveRegionMd } from "../../components/LiveRegion/LiveRegion";
import { BookmarkMd } from "../../components/Bookmark/Bookmark";
import { SkipLinkMd } from "../../components/SkipLink/SkipLink";
import { ToastMd } from "../../components/Toast/Toast";
import { ThemeMd } from "../../components/Theme/Theme";
import { SlotMd } from "../../components/Slot/Slot";
import { PartMd } from "../../components/Part/Part";
import { ToneSwitchMd } from "../../components/ToneSwitch/ToneSwitch";
import { ToneChangerButtonMd } from "../../components/ToneChangerButton/ToneChangerButton";
import { PageMd, PagesMd } from "../../components/Pages/Pages";
import { RedirectMd } from "../../components/Redirect/Redirect";
import { NestedAppMd } from "../../components/NestedApp/NestedApp";
import { IncludeMarkupMd } from "../../components/IncludeMarkup/IncludeMarkup";
import { MarkdownMd } from "../../components/Markdown/Markdown";
import { InspectorMd } from "../../components/Inspector/Inspector";
import { InspectButtonMd } from "../../components/InspectButton/InspectButton";
import { I18nMd } from "../../components/I18n/I18n";
import { RetryPolicyMd } from "../../components/RetryPolicy/RetryPolicy";
import { contractFromMetadata } from "./fromMetadata";

export const builtInComponentContracts: XmluiComponentContract[] = [
  ...htmlTagDefinitions.map((definition) =>
    contractFromMetadata(htmlTagMetadata[definition.name], {
      name: definition.name,
      acceptsArbitraryProps: true,
      includeLayoutProps: true,
    }),
  ),
  contractFromMetadata(BrMd, {
    name: "br",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(BrCapitalizedMd, {
    name: "Br",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(AccordionMd, {
    name: "Accordion",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      displayDidChange: "onDisplayDidChange",
    },
  }),
  contractFromMetadata(AccordionItemMd, {
    name: "AccordionItem",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(AvatarMd, {
    name: "Avatar",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      click: "onClick",
      contextMenu: "onContextMenu",
    },
  }),
  contractFromMetadata(BadgeMd, {
    name: "Badge",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      contextMenu: "onContextMenu",
    },
  }),
  contractFromMetadata(ExpandableItemMd, {
    name: "ExpandableItem",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      expandedChange: "onExpandedChange",
    },
  }),
  contractFromMetadata(TabsMd, {
    name: "Tabs",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      contextMenu: "onContextMenu",
    },
  }),
  contractFromMetadata(StepperMd, {
    name: "Stepper",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
    },
  }),
  contractFromMetadata(StepMd, {
    name: "Step",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      activated: "onActivated",
    },
  }),
  contractFromMetadata(TabItemMd, {
    name: "TabItem",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      activated: "onActivated",
    },
  }),
  contractFromMetadata(DrawerMd, {
    name: "Drawer",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      open: "onOpen",
      close: "onClose",
    },
  }),
  contractFromMetadata(ModalDialogMd, {
    name: "ModalDialog",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      open: "onOpen",
      close: "onClose",
    },
  }),
  contractFromMetadata(TooltipMd, {
    name: "Tooltip",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(ContextMenuMd, {
    name: "ContextMenu",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(DropdownMenuMd, {
    name: "DropdownMenu",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      willOpen: "onWillOpen",
    },
  }),
  contractFromMetadata(MenuItemMd, {
    name: "MenuItem",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      click: "onClick",
      contextMenu: "onContextMenu",
    },
  }),
  contractFromMetadata(MenuSeparatorMd, {
    name: "MenuSeparator",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(SubMenuItemMd, {
    name: "SubMenuItem",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(FragmentMd, {
    name: "Fragment",
    includeLayoutProps: false,
  }),
  {
    name: "variable",
    kind: "builtin",
    acceptsArbitraryProps: false,
    allowsChildren: false,
    declarations: {},
    props: {
      name: { name: "name" },
      value: { name: "value" },
    },
    events: {},
  },
  contractFromMetadata(ImageMd, {
    name: "Image",
    includeLayoutProps: true,
    eventAttributes: {
      click: "onClick",
    },
  }),
  withExtraProps(
    contractFromMetadata(IFrameMd, {
      name: "IFrame",
      includeLayoutProps: true,
      eventAttributes: {
        load: "onLoad",
      },
    }),
    ["title"],
  ),
  {
    name: "App",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true, global: true },
    props: withLayoutProps({
      testId: { name: "testId" },
      layout: { name: "layout" },
      name: { name: "name" },
      loggedInUser: { name: "loggedInUser" },
      scrollWholePage: { name: "scrollWholePage" },
      noScrollbarGutters: { name: "noScrollbarGutters" },
      fitContent: { name: "fitContent" },
      useHashBasedRouting: { name: "useHashBasedRouting" },
      locale: { name: "locale" },
      localeBundles: { name: "localeBundles" },
      "backgroundColor-content-App": { name: "backgroundColor-content-App" },
      "borderLeft-content-App": { name: "borderLeft-content-App" },
      "maxWidth-content-App": { name: "maxWidth-content-App" },
      "paddingHorizontal-content-App": { name: "paddingHorizontal-content-App" },
      "paddingVertical-content-App": { name: "paddingVertical-content-App" },
      "gap-content-App": { name: "gap-content-App" },
      "width-navPanel-App": { name: "width-navPanel-App" },
      "borderRight-navPanelWrapper-App": { name: "borderRight-navPanelWrapper-App" },
    }),
    events: {
      ready: { name: "ready", attributeName: "onReady" },
      messageReceived: { name: "messageReceived", attributeName: "onMessageReceived" },
      willNavigate: { name: "willNavigate", attributeName: "onWillNavigate" },
      didNavigate: { name: "didNavigate", attributeName: "onDidNavigate" },
      keyDown: { name: "keyDown", attributeName: "onKeyDown" },
      keyUp: { name: "keyUp", attributeName: "onKeyUp" },
    },
  },
  {
    name: "AppHeader",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps({
      profileMenuTemplate: { name: "profileMenuTemplate" },
      logoTemplate: { name: "logoTemplate" },
      titleTemplate: { name: "titleTemplate" },
      title: { name: "title" },
      showLogo: { name: "showLogo" },
      testId: { name: "testId" },
      id: { name: "id" },
    }),
    events: {},
  },
  {
    name: "Footer",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps({
      sticky: { name: "sticky" },
      testId: { name: "testId" },
      id: { name: "id" },
    }),
    events: {},
  },
  {
    name: "Heading",
    kind: "builtin",
    acceptsArbitraryProps: true,
    allowsChildren: true,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      value: { name: "value" },
      level: { name: "level" },
      maxLines: { name: "maxLines" },
      ellipses: { name: "ellipses" },
      preserveLinebreaks: { name: "preserveLinebreaks" },
      omitFromToc: { name: "omitFromToc" },
      showAnchor: { name: "showAnchor" },
      anchorId: { name: "anchorId" },
      anchorTemplate: { name: "anchorTemplate" },
      testId: { name: "testId" },
    }),
    events: {},
    templates: {
      anchorTemplate: { name: "anchorTemplate" },
    },
    contextVariables: {
      $anchorId: { name: "$anchorId" },
      $anchorHref: { name: "$anchorHref" },
    },
    apis: {
      scrollIntoView: { name: "scrollIntoView" },
      hasOverflow: { name: "hasOverflow" },
    },
  },
  ...["H1", "H2", "H3", "H4", "H5", "H6"].map((name): XmluiComponentContract => ({
    name,
    kind: "builtin",
    acceptsArbitraryProps: true,
    allowsChildren: true,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      value: { name: "value" },
      level: { name: "level" },
      maxLines: { name: "maxLines" },
      ellipses: { name: "ellipses" },
      preserveLinebreaks: { name: "preserveLinebreaks" },
      omitFromToc: { name: "omitFromToc" },
      showAnchor: { name: "showAnchor" },
      anchorId: { name: "anchorId" },
      anchorTemplate: { name: "anchorTemplate" },
      testId: { name: "testId" },
    }),
    events: {},
    templates: {
      anchorTemplate: { name: "anchorTemplate" },
    },
    contextVariables: {
      $anchorId: { name: "$anchorId" },
      $anchorHref: { name: "$anchorHref" },
    },
    apis: {
      scrollIntoView: { name: "scrollIntoView" },
      hasOverflow: { name: "hasOverflow" },
    },
  })),
  {
    name: "Icon",
    kind: "builtin",
    allowsChildren: false,
    acceptsArbitraryProps: true,
    declarations: {},
    props: withLayoutProps({
      fallback: { name: "fallback" },
      name: { name: "name" },
      size: { name: "size" },
      testId: { name: "testId" },
    }),
    events: {
      click: { name: "click", attributeName: "onClick" },
    },
  },
  {
    name: "Logo",
    kind: "builtin",
    allowsChildren: false,
    declarations: {},
    props: withLayoutProps({
      src: { name: "src" },
      alt: { name: "alt" },
      inline: { name: "inline" },
      testId: { name: "testId" },
    }),
    events: {},
  },
  contractFromMetadata(PageMetaTitleMd, {
    name: "PageMetaTitle",
    allowsChildren: true,
    includeLayoutProps: false,
  }),
  contractFromMetadata(ProgressBarMd, {
    name: "ProgressBar",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(QRCodeMd, {
    name: "QRCode",
    allowsChildren: false,
    includeLayoutProps: true,
    eventAttributes: {
      init: "onInit",
    },
  }),
  contractFromMetadata(ContentSeparatorMd, {
    name: "ContentSeparator",
    allowsChildren: false,
    includeLayoutProps: true,
  }),
  contractFromMetadata(NoResultMd, {
    name: "NoResult",
    allowsChildren: true,
    includeLayoutProps: true,
  }),
  contractFromMetadata(ValidationSummaryMd, {
    name: "ValidationSummary",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(ConciseValidationFeedbackMd, {
    name: "ConciseValidationFeedback",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(FallbackMd, {
    name: "Fallback",
    allowsChildren: true,
    includeLayoutProps: false,
  }),
  contractFromMetadata(IncludeMarkupMd, {
    name: "IncludeMarkup",
    allowsChildren: true,
    includeLayoutProps: false,
    eventAttributes: {
      didLoad: "onDidLoad",
      didFail: "onDidFail",
    },
  }),
  contractFromMetadata(MarkdownMd, {
    name: "Markdown",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(InspectorMd, {
    name: "Inspector",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(InspectButtonMd, {
    name: "InspectButton",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(I18nMd, {
    name: "I18n",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(RetryPolicyMd, {
    name: "RetryPolicy",
    allowsChildren: true,
    includeLayoutProps: false,
    acceptsArbitraryProps: false,
  }),
  contractFromMetadata(SpaceFillerMd, {
    name: "SpaceFiller",
    allowsChildren: false,
    includeLayoutProps: false,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(LinkMd, {
    name: "Link",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      click: "onClick",
    },
  }),
  contractFromMetadata(FormMd, {
    name: "Form",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      willSubmit: "onWillSubmit",
      submit: "onSubmit",
      submitFailed: "onSubmitFailed",
      cancel: "onCancel",
      reset: "onReset",
      success: "onSuccess",
      saved: "onSaved",
      submitError: "onSubmitError",
      submitDropped: "onSubmitDropped",
    },
  }),
  contractFromMetadata(FormValidatorMd, {
    name: "FormValidator",
    allowsChildren: false,
    includeLayoutProps: false,
    acceptsArbitraryProps: true,
    eventAttributes: {
      validate: "onValidate",
    },
  }),
  contractFromMetadata(FormItemMd, {
    name: "FormItem",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(FormSegmentMd, {
    name: "FormSegment",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(FormSectionMd, {
    name: "FormSection",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(TabsFormMd, {
    name: "TabsForm",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      submit: "onSubmit",
      submitFailed: "onSubmitFailed",
      cancel: "onCancel",
    },
  }),
  contractFromMetadata(StepperFormMd, {
    name: "StepperForm",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      submit: "onSubmit",
      submitFailed: "onSubmitFailed",
      cancel: "onCancel",
    },
  }),
  contractFromMetadata(TextBoxMd, {
    name: "TextBox",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
    },
  }),
  contractFromMetadata(PasswordInputMd, {
    name: "PasswordInput",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
    },
  }),
  contractFromMetadata(TextAreaMd, {
    name: "TextArea",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
    },
  }),
  contractFromMetadata(NumberBoxMd, {
    name: "NumberBox",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
    },
  }),
  contractFromMetadata(RatingInputMd, {
    name: "RatingInput",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
    },
  }),
  contractFromMetadata(SliderMd, {
    name: "Slider",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
    },
  }),
  contractFromMetadata(ColorPickerMd, {
    name: "ColorPicker",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
    },
  }),
  contractFromMetadata(DateInputMd, {
    name: "DateInput",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
    },
  }),
  contractFromMetadata(DatePickerMd, {
    name: "DatePicker",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
    },
  }),
  contractFromMetadata(FileInputMd, {
    name: "FileInput",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
      parseError: "onParseError",
    },
  }),
  contractFromMetadata(FileUploadDropZoneMd, {
    name: "FileUploadDropZone",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      upload: "onUpload",
    },
  }),
  contractFromMetadata(FocusScopeMd, {
    name: "FocusScope",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(TileGridMd, {
    name: "TileGrid",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      selectionDidChange: "onSelectionDidChange",
      itemDoubleClick: "onItemDoubleClick",
      contextMenu: "onContextMenu",
    },
  }),
  contractFromMetadata(TimeInputMd, {
    name: "TimeInput",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
      gotFocus: "onGotFocus",
      lostFocus: "onLostFocus",
      invalidTime: "onInvalidTime",
    },
  }),
  {
    name: "Stack",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps(stackProps()),
    events: stackEvents(),
  },
  contractFromMetadata(FlowLayoutMd, {
    name: "FlowLayout",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      contextMenu: "onContextMenu",
    },
  }),
  contractFromMetadata(ScrollViewerMd, {
    name: "ScrollViewer",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(ResponsiveBarMd, {
    name: "ResponsiveBar",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      click: "onClick",
      willOpen: "onWillOpen",
    },
  }),
  contractFromMetadata(SplitterMd, {
    name: "Splitter",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      resize: "onResize",
    },
  }),
  contractFromMetadata(HSplitterMd, {
    name: "HSplitter",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      resize: "onResize",
    },
  }),
  contractFromMetadata(VSplitterMd, {
    name: "VSplitter",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      resize: "onResize",
    },
  }),
  contractFromMetadata(StickyBoxMd, {
    name: "StickyBox",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(StickySectionMd, {
    name: "StickySection",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(SpinnerMd, {
    name: "Spinner",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  {
    name: "HStack",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps(stackProps()),
    events: stackEvents(),
  },
  {
    name: "VStack",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps(stackProps()),
    events: stackEvents(),
  },
  {
    name: "CHStack",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps(stackProps()),
    events: stackEvents(),
  },
  {
    name: "CVStack",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps(stackProps()),
    events: stackEvents(),
  },
  {
    name: "CodeBlock",
    kind: "builtin",
    acceptsArbitraryProps: true,
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps({
      meta: { name: "meta" },
      testId: { name: "testId" },
    }),
    events: {},
  },
  contractFromMetadata(ButtonMd, {
    name: "Button",
    allowsChildren: true,
    includeLayoutProps: true,
    declarations: { local: true },
  }),
  contractFromMetadata(CardMd, {
    name: "Card",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      click: "onClick",
      doubleClick: "onDoubleClick",
      contextMenu: "onContextMenu",
    },
  }),
  {
    name: "Text",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps({
      id: { name: "id" },
      value: { name: "value" },
      variant: { name: "variant" },
      size: { name: "size" },
      weight: { name: "weight" },
      maxLines: { name: "maxLines" },
      preserveLinebreaks: { name: "preserveLinebreaks" },
      ellipses: { name: "ellipses" },
      overflowMode: { name: "overflowMode" },
      breakMode: { name: "breakMode" },
      lang: { name: "lang" },
      testId: { name: "testId" },
    }),
    events: {
      click: { name: "click", attributeName: "onClick" },
      contextMenu: { name: "contextMenu", attributeName: "onContextMenu" },
    },
    apis: {
      hasOverflow: { name: "hasOverflow" },
    },
  },
  contractFromMetadata(ThemeMd, {
    name: "Theme",
    acceptsArbitraryProps: true,
    allowsChildren: true,
    includeLayoutProps: true,
  }),
  contractFromMetadata(ItemsMd, {
    name: "Items",
    allowsChildren: true,
    includeLayoutProps: false,
  }),
  {
    name: "Checkbox",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      testId: { name: "testId" },
      bindTo: { name: "bindTo" },
      initialValue: { name: "initialValue" },
      value: { name: "value" },
      label: { name: "label" },
      labelPosition: { name: "labelPosition" },
      labelBreak: { name: "labelBreak" },
      labelWidth: { name: "labelWidth" },
      direction: { name: "direction" },
      enabled: { name: "enabled" },
      readOnly: { name: "readOnly" },
      required: { name: "required" },
      autoFocus: { name: "autoFocus" },
      indeterminate: { name: "indeterminate" },
      validationStatus: { name: "validationStatus" },
      requireLabelMode: { name: "requireLabelMode" },
      tooltip: { name: "tooltip" },
      tooltipMarkdown: { name: "tooltipMarkdown" },
      animation: { name: "animation" },
      variant: { name: "variant" },
    }),
    events: {
      click: { name: "click", attributeName: "onClick" },
      didChange: { name: "didChange", attributeName: "onDidChange" },
      gotFocus: { name: "gotFocus", attributeName: "onGotFocus" },
      lostFocus: { name: "lostFocus", attributeName: "onLostFocus" },
    },
  },
  {
    name: "Switch",
    kind: "builtin",
    allowsChildren: false,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      invalidProp: { name: "invalidProp" },
      testId: { name: "testId" },
      bindTo: { name: "bindTo" },
      initialValue: { name: "initialValue" },
      value: { name: "value" },
      label: { name: "label" },
      labelPosition: { name: "labelPosition" },
      labelBreak: { name: "labelBreak" },
      labelWidth: { name: "labelWidth" },
      direction: { name: "direction" },
      enabled: { name: "enabled" },
      readOnly: { name: "readOnly" },
      required: { name: "required" },
      autoFocus: { name: "autoFocus" },
      validationStatus: { name: "validationStatus" },
      requireLabelMode: { name: "requireLabelMode" },
      tooltip: { name: "tooltip" },
      tooltipMarkdown: { name: "tooltipMarkdown" },
      animation: { name: "animation" },
      variant: { name: "variant" },
    }),
    events: {
      click: { name: "click", attributeName: "onClick" },
      didChange: { name: "didChange", attributeName: "onDidChange" },
      gotFocus: { name: "gotFocus", attributeName: "onGotFocus" },
      lostFocus: { name: "lostFocus", attributeName: "onLostFocus" },
    },
  },
  {
    name: "Select",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      testId: { name: "testId" },
      bindTo: { name: "bindTo" },
      initialValue: { name: "initialValue" },
      value: { name: "value" },
      enabled: { name: "enabled" },
      readOnly: { name: "readOnly" },
      required: { name: "required" },
      autoFocus: { name: "autoFocus" },
      placeholder: { name: "placeholder" },
      label: { name: "label" },
      labelPosition: { name: "labelPosition" },
      labelBreak: { name: "labelBreak" },
      labelWidth: { name: "labelWidth" },
      requireLabelMode: { name: "requireLabelMode" },
      verboseValidationFeedback: { name: "verboseValidationFeedback" },
      validationMode: { name: "validationMode" },
      validationStatus: { name: "validationStatus" },
      tooltip: { name: "tooltip" },
      tooltipMarkdown: { name: "tooltipMarkdown" },
      animation: { name: "animation" },
      variant: { name: "variant" },
      data: { name: "data" },
      valueField: { name: "valueField" },
      labelField: { name: "labelField" },
      multiSelect: { name: "multiSelect" },
      multmultiSelect: { name: "multmultiSelect" },
      modal: { name: "modal" },
      clearable: { name: "clearable" },
      searchable: { name: "searchable" },
      groupBy: { name: "groupBy" },
      groupHeaderTemplate: { name: "groupHeaderTemplate" },
      ungroupedHeaderTemplate: { name: "ungroupedHeaderTemplate" },
      valueTemplate: { name: "valueTemplate" },
      inProgress: { name: "inProgress" },
      inProgressNotificationMessage: { name: "inProgressNotificationMessage" },
      dropdownHeight: { name: "dropdownHeight" },
      scrollIndicators: { name: "scrollIndicators" },
      emptyListTemplate: { name: "emptyListTemplate" },
    }),
    events: {
      didChange: { name: "didChange", attributeName: "onDidChange" },
      gotFocus: { name: "gotFocus", attributeName: "onGotFocus" },
      lostFocus: { name: "lostFocus", attributeName: "onLostFocus" },
    },
  },
  {
    name: "Option",
    kind: "builtin",
    allowsChildren: true,
    acceptsArbitraryProps: true,
    declarations: {},
    props: {
      value: { name: "value" },
      label: { name: "label" },
      testId: { name: "testId" },
      enabled: { name: "enabled" },
      keywords: { name: "keywords" },
    },
    events: {},
  },
  {
    name: "RadioGroup",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      testId: { name: "testId" },
      bindTo: { name: "bindTo" },
      initialValue: { name: "initialValue" },
      value: { name: "value" },
      label: { name: "label" },
      labelPosition: { name: "labelPosition" },
      requireLabelMode: { name: "requireLabelMode" },
      direction: { name: "direction" },
      autoFocus: { name: "autoFocus" },
      required: { name: "required" },
      readOnly: { name: "readOnly" },
      enabled: { name: "enabled" },
      validationStatus: { name: "validationStatus" },
      orientation: { name: "orientation" },
      gap: { name: "gap" },
    }),
    events: {
      didChange: { name: "didChange", attributeName: "onDidChange" },
      gotFocus: { name: "gotFocus", attributeName: "onGotFocus" },
      lostFocus: { name: "lostFocus", attributeName: "onLostFocus" },
    },
    apis: {
      value: { name: "value" },
      setValue: { name: "setValue" },
    },
  },
  {
    name: "AutoComplete",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      testId: { name: "testId" },
      bindTo: { name: "bindTo" },
      label: { name: "label" },
      labelPosition: { name: "labelPosition" },
      labelBreak: { name: "labelBreak" },
      labelWidth: { name: "labelWidth" },
      placeholder: { name: "placeholder" },
      initialValue: { name: "initialValue" },
      value: { name: "value" },
      maxLength: { name: "maxLength" },
      autoFocus: { name: "autoFocus" },
      required: { name: "required" },
      requireLabelMode: { name: "requireLabelMode" },
      readOnly: { name: "readOnly" },
      enabled: { name: "enabled" },
      initiallyOpen: { name: "initiallyOpen" },
      modal: { name: "modal" },
      creatable: { name: "creatable" },
      verboseValidationFeedback: { name: "verboseValidationFeedback" },
      validationMode: { name: "validationMode" },
      validationStatus: { name: "validationStatus" },
      tooltip: { name: "tooltip" },
      tooltipMarkdown: { name: "tooltipMarkdown" },
      animation: { name: "animation" },
      variant: { name: "variant" },
      dropdownHeight: { name: "dropdownHeight" },
      multi: { name: "multi" },
      groupBy: { name: "groupBy" },
      groupHeaderTemplate: { name: "groupHeaderTemplate" },
      optionTemplate: { name: "optionTemplate" },
      emptyListTemplate: { name: "emptyListTemplate" },
    }),
    events: {
      didChange: { name: "didChange", attributeName: "onDidChange" },
      gotFocus: { name: "gotFocus", attributeName: "onGotFocus" },
      lostFocus: { name: "lostFocus", attributeName: "onLostFocus" },
      itemCreated: { name: "itemCreated", attributeName: "onItemCreated" },
    },
  },
  {
    name: "Pagination",
    kind: "builtin",
    allowsChildren: false,
    declarations: { local: true },
    props: withLayoutProps({
      id: { name: "id" },
      testId: { name: "testId" },
      enabled: { name: "enabled" },
      itemCount: { name: "itemCount" },
      pageSize: { name: "pageSize" },
      pageIndex: { name: "pageIndex" },
      maxVisiblePages: { name: "maxVisiblePages" },
      showPageInfo: { name: "showPageInfo" },
      showPageSizeSelector: { name: "showPageSizeSelector" },
      showCurrentPage: { name: "showCurrentPage" },
      pageSizeOptions: { name: "pageSizeOptions" },
      hasPrevPage: { name: "hasPrevPage" },
      hasNextPage: { name: "hasNextPage" },
      orientation: { name: "orientation" },
      pageSizeSelectorPosition: { name: "pageSizeSelectorPosition" },
      pageInfoPosition: { name: "pageInfoPosition" },
      buttonRowPosition: { name: "buttonRowPosition" },
    }),
    events: {
      pageDidChange: { name: "pageDidChange", attributeName: "onPageDidChange" },
      pageSizeDidChange: { name: "pageSizeDidChange", attributeName: "onPageSizeDidChange" },
    },
    apis: {
      moveFirst: { name: "moveFirst" },
      moveLast: { name: "moveLast" },
      movePrev: { name: "movePrev" },
      moveNext: { name: "moveNext" },
      currentPage: { name: "currentPage" },
      currentPageSize: { name: "currentPageSize" },
    },
  },
  {
    name: "SelectionStore",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {
      id: { name: "id" },
      idKey: { name: "idKey" },
      value: { name: "value" },
    },
    events: {},
  },
  {
    name: "List",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      invalidProp: { name: "invalidProp" },
      testId: { name: "testId" },
      data: { name: "data" },
      items: { name: "items" },
      loading: { name: "loading" },
      limit: { name: "limit" },
      scrollAnchor: { name: "scrollAnchor" },
      fixedItemSize: { name: "fixedItemSize" },
      groupBy: { name: "groupBy" },
      orderBy: { name: "orderBy" },
      availableGroups: { name: "availableGroups" },
      itemTemplate: { name: "itemTemplate" },
      emptyListTemplate: { name: "emptyListTemplate" },
      groupHeaderTemplate: { name: "groupHeaderTemplate" },
      groupFooterTemplate: { name: "groupFooterTemplate" },
      pageInfo: { name: "pageInfo" },
      idKey: { name: "idKey" },
      groupsInitiallyExpanded: { name: "groupsInitiallyExpanded" },
      defaultGroups: { name: "defaultGroups" },
      hideEmptyGroups: { name: "hideEmptyGroups" },
      borderCollapse: { name: "borderCollapse" },
      rowsSelectable: { name: "rowsSelectable" },
      enableMultiRowSelection: { name: "enableMultiRowSelection" },
      initiallySelected: { name: "initiallySelected" },
      syncWithVar: { name: "syncWithVar" },
      refreshOn: { name: "refreshOn" },
      rowUnselectablePredicate: { name: "rowUnselectablePredicate" },
      hideSelectionCheckboxes: { name: "hideSelectionCheckboxes" },
      selectionCheckboxPosition: { name: "selectionCheckboxPosition" },
      selectionCheckboxAnchor: { name: "selectionCheckboxAnchor" },
      selectionCheckboxOffsetX: { name: "selectionCheckboxOffsetX" },
      selectionCheckboxOffsetY: { name: "selectionCheckboxOffsetY" },
      selectionCheckboxSize: { name: "selectionCheckboxSize" },
      keyBindings: { name: "keyBindings" },
    }),
    events: {
      contextMenu: { name: "contextMenu", attributeName: "onContextMenu" },
      rowDoubleClick: { name: "rowDoubleClick", attributeName: "onRowDoubleClick" },
      scroll: { name: "scroll", attributeName: "onScroll" },
      selectionDidChange: { name: "selectionDidChange", attributeName: "onSelectionDidChange" },
      requestFetchPrevPage: { name: "requestFetchPrevPage", attributeName: "onRequestFetchPrevPage" },
      requestFetchNextPage: { name: "requestFetchNextPage", attributeName: "onRequestFetchNextPage" },
      selectAllAction: { name: "selectAllAction", attributeName: "onSelectAllAction" },
      cutAction: { name: "cutAction", attributeName: "onCutAction" },
      copyAction: { name: "copyAction", attributeName: "onCopyAction" },
      pasteAction: { name: "pasteAction", attributeName: "onPasteAction" },
      deleteAction: { name: "deleteAction", attributeName: "onDeleteAction" },
    },
  },
  {
    name: "Table",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      testId: { name: "testId" },
      data: { name: "data" },
      items: { name: "items" },
      idKey: { name: "idKey" },
      isPaginated: { name: "isPaginated" },
      pageSize: { name: "pageSize" },
      pageSizeOptions: { name: "pageSizeOptions" },
      alwaysShowPagination: { name: "alwaysShowPagination" },
      paginationControlsLocation: { name: "paginationControlsLocation" },
      rowHeight: { name: "rowHeight" },
      loading: { name: "loading" },
      rowsSelectable: { name: "rowsSelectable" },
      autoFocus: { name: "autoFocus" },
      enableMultiRowSelection: { name: "enableMultiRowSelection" },
      initiallySelected: { name: "initiallySelected" },
      syncWithVar: { name: "syncWithVar" },
      refreshOn: { name: "refreshOn" },
      hideHeader: { name: "hideHeader" },
      noBottomBorder: { name: "noBottomBorder" },
      rowDisabledPredicate: { name: "rowDisabledPredicate" },
      rowUnselectablePredicate: { name: "rowUnselectablePredicate" },
      toggleSelectionOnClick: { name: "toggleSelectionOnClick" },
      hideSelectionCheckboxes: { name: "hideSelectionCheckboxes" },
      hideSelectionCheckboxesHeader: { name: "hideSelectionCheckboxesHeader" },
      alwaysShowSelectionCheckboxes: { name: "alwaysShowSelectionCheckboxes" },
      alwaysShowSortingIndicator: { name: "alwaysShowSortingIndicator" },
      checkboxTolerance: { name: "checkboxTolerance" },
      sortBy: { name: "sortBy" },
      sortDirection: { name: "sortDirection" },
      iconNoSort: { name: "iconNoSort" },
      iconSortAsc: { name: "iconSortAsc" },
      iconSortDesc: { name: "iconSortDesc" },
      userSelectCell: { name: "userSelectCell" },
      userSelectRow: { name: "userSelectRow" },
      userSelectHeading: { name: "userSelectHeading" },
      cellVerticalAlign: { name: "cellVerticalAlign" },
      keyBindings: { name: "keyBindings" },
      striped: { name: "striped" },
      noDataTemplate: { name: "noDataTemplate" },
    }),
    events: {
      contextMenu: { name: "contextMenu", attributeName: "onContextMenu" },
      rowClick: { name: "rowClick", attributeName: "onRowClick" },
      rowDoubleClick: { name: "rowDoubleClick", attributeName: "onRowDoubleClick" },
      selectionDidChange: { name: "selectionDidChange", attributeName: "onSelectionDidChange" },
      selectAllAction: { name: "selectAllAction", attributeName: "onSelectAllAction" },
      cutAction: { name: "cutAction", attributeName: "onCutAction" },
      copyAction: { name: "copyAction", attributeName: "onCopyAction" },
      pasteAction: { name: "pasteAction", attributeName: "onPasteAction" },
      deleteAction: { name: "deleteAction", attributeName: "onDeleteAction" },
    },
    templates: {
      noDataTemplate: { name: "noDataTemplate" },
    },
    contextVariables: {
      $item: { name: "$item" },
      $itemIndex: { name: "$itemIndex" },
      $cell: { name: "$cell" },
      $colIndex: { name: "$colIndex" },
      $row: { name: "$row" },
      $rowIndex: { name: "$rowIndex" },
    },
    apis: {
      getSelectedIds: { name: "getSelectedIds" },
      getSelectedItems: { name: "getSelectedItems" },
      clearSelection: { name: "clearSelection" },
      selectAll: { name: "selectAll" },
    },
  },
  {
    name: "Column",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {
      id: { name: "id" },
      bindTo: { name: "bindTo" },
      header: { name: "header" },
      width: { name: "width" },
      minWidth: { name: "minWidth" },
      maxWidth: { name: "maxWidth" },
      canSort: { name: "canSort" },
      pinTo: { name: "pinTo" },
      canResize: { name: "canResize" },
      horizontalAlignment: { name: "horizontalAlignment" },
      verticalAlignment: { name: "verticalAlignment" },
      backgroundColor: { name: "backgroundColor" },
    },
    events: {},
    contextVariables: {
      $item: { name: "$item" },
      $cell: { name: "$cell" },
      $itemIndex: { name: "$itemIndex" },
      $colIndex: { name: "$colIndex" },
      $row: { name: "$row" },
      $rowIndex: { name: "$rowIndex" },
    },
  },
  {
    name: "Tree",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: withLayoutProps({
      id: { name: "id" },
      testId: { name: "testId" },
      data: { name: "data" },
      dataFormat: { name: "dataFormat" },
      idField: { name: "idField" },
      nameField: { name: "nameField" },
      iconField: { name: "iconField" },
      iconExpandedField: { name: "iconExpandedField" },
      iconCollapsedField: { name: "iconCollapsedField" },
      parentIdField: { name: "parentIdField" },
      childrenField: { name: "childrenField" },
      selectableField: { name: "selectableField" },
      dynamicField: { name: "dynamicField" },
      loadedField: { name: "loadedField" },
      dynamic: { name: "dynamic" },
      autoLoadAfterField: { name: "autoLoadAfterField" },
      autoLoadAfter: { name: "autoLoadAfter" },
      spinnerDelay: { name: "spinnerDelay" },
      selectedValue: { name: "selectedValue" },
      selectedId: { name: "selectedId" },
      defaultExpanded: { name: "defaultExpanded" },
      autoExpandToSelection: { name: "autoExpandToSelection" },
      itemClickExpands: { name: "itemClickExpands" },
      iconCollapsed: { name: "iconCollapsed" },
      iconExpanded: { name: "iconExpanded" },
      iconSize: { name: "iconSize" },
      itemHeight: { name: "itemHeight" },
      scrollStyle: { name: "scrollStyle" },
      showScrollerFade: { name: "showScrollerFade" },
      overflow: { name: "overflow" },
      itemTemplate: { name: "itemTemplate" },
    }),
    events: {
      contextMenu: { name: "contextMenu", attributeName: "onContextMenu" },
      itemClick: { name: "itemClick", attributeName: "onItemClick" },
      selectionDidChange: { name: "selectionDidChange", attributeName: "onSelectionDidChange" },
      nodeDidExpand: { name: "nodeDidExpand", attributeName: "onNodeDidExpand" },
      nodeDidCollapse: { name: "nodeDidCollapse", attributeName: "onNodeDidCollapse" },
      loadChildren: { name: "loadChildren", attributeName: "onLoadChildren" },
    },
    templates: {
      itemTemplate: { name: "itemTemplate" },
    },
    contextVariables: {
      $item: { name: "$item" },
    },
    apis: {
      selectedId: { name: "selectedId" },
      expandAll: { name: "expandAll" },
      collapseAll: { name: "collapseAll" },
      selectId: { name: "selectId" },
      selectNode: { name: "selectNode" },
      clearSelection: { name: "clearSelection" },
      expandNode: { name: "expandNode" },
      collapseNode: { name: "collapseNode" },
      expandToLevel: { name: "expandToLevel" },
      getExpandedNodes: { name: "getExpandedNodes" },
      getSelectedNode: { name: "getSelectedNode" },
      getVisibleItems: { name: "getVisibleItems" },
      scrollIntoView: { name: "scrollIntoView" },
      scrollToItem: { name: "scrollToItem" },
      appendNode: { name: "appendNode" },
      removeNode: { name: "removeNode" },
      removeChildren: { name: "removeChildren" },
      insertNodeBefore: { name: "insertNodeBefore" },
      insertNodeAfter: { name: "insertNodeAfter" },
      replaceNode: { name: "replaceNode" },
      replaceChildren: { name: "replaceChildren" },
      refreshData: { name: "refreshData" },
      getNodeById: { name: "getNodeById" },
      getDynamic: { name: "getDynamic" },
      setDynamic: { name: "setDynamic" },
      getNodeLoadingState: { name: "getNodeLoadingState" },
      setNodeLoaded: { name: "setNodeLoaded" },
      markNodeLoaded: { name: "markNodeLoaded" },
      markNodeUnloaded: { name: "markNodeUnloaded" },
      getExpandedTimestamp: { name: "getExpandedTimestamp" },
      setAutoLoadAfter: { name: "setAutoLoadAfter" },
      getAutoLoadAfter: { name: "getAutoLoadAfter" },
      getNodeAutoLoadAfter: { name: "getNodeAutoLoadAfter" },
    },
  },
  {
    name: "TreeDisplay",
    kind: "builtin",
    allowsChildren: false,
    declarations: {},
    props: withLayoutProps({
      testId: { name: "testId" },
      content: { name: "content" },
      itemHeight: { name: "itemHeight" },
    }),
    events: {
      contextMenu: { name: "contextMenu", attributeName: "onContextMenu" },
    },
  },
  {
    name: "TableOfContents",
    kind: "builtin",
    allowsChildren: false,
    declarations: {},
    props: withLayoutProps({
      testId: { name: "testId" },
      smoothScrolling: { name: "smoothScrolling" },
      maxHeadingLevel: { name: "maxHeadingLevel" },
      omitH1: { name: "omitH1" },
      scrollStyle: { name: "scrollStyle" },
      showScrollerFade: { name: "showScrollerFade" },
    }),
    events: {
      contextMenu: { name: "contextMenu", attributeName: "onContextMenu" },
    },
  },
  contractFromMetadata(DataSourceMd, {
    name: "DataSource",
    allowsChildren: false,
    includeLayoutProps: false,
    eventAttributes: {
      loaded: "onLoaded",
      error: "onError",
      fetch: "onFetch",
    },
  }),
  contractFromMetadata(PagesMd, {
    name: "Pages",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(PageMd, {
    name: "Page",
    allowsChildren: true,
    includeLayoutProps: false,
    acceptsArbitraryProps: true,
    contextVariables: {
      $routeParams: { name: "$routeParams" },
      $queryParams: { name: "$queryParams" },
    },
  }),
  contractFromMetadata(RedirectMd, {
    name: "Redirect",
    allowsChildren: false,
    includeLayoutProps: false,
  }),
  contractFromMetadata(NestedAppMd, {
    name: "NestedApp",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  {
    name: "NavPanel",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps({
      logoTemplate: { name: "logoTemplate" },
      footerTemplate: { name: "footerTemplate" },
      inDrawer: { name: "inDrawer" },
      scrollStyle: { name: "scrollStyle" },
      showScrollerFade: { name: "showScrollerFade" },
      syncWithContent: { name: "syncWithContent" },
      syncScrollBehavior: { name: "syncScrollBehavior" },
      syncScrollPosition: { name: "syncScrollPosition" },
      testId: { name: "testId" },
      id: { name: "id" },
    }),
    events: {},
  },
  {
    name: "NavLink",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps({
      to: { name: "to" },
      enabled: { name: "enabled" },
      active: { name: "active" },
      target: { name: "target" },
      label: { name: "label" },
      vertical: { name: "vertical" },
      displayActive: { name: "displayActive" },
      noIndicator: { name: "noIndicator" },
      exact: { name: "exact" },
      icon: { name: "icon" },
      iconAlignment: { name: "iconAlignment" },
      level: { name: "level" },
      testId: { name: "testId" },
      id: { name: "id" },
    }),
    events: {
      click: { name: "click", attributeName: "onClick" },
    },
  },
  {
    name: "NavPanelCollapseButton",
    kind: "builtin",
    allowsChildren: false,
    declarations: {},
    props: withLayoutProps({
      icon: { name: "icon" },
      iconCollapsed: { name: "iconCollapsed" },
      "aria-label": { name: "aria-label" },
      "aria-labelCollapsed": { name: "aria-labelCollapsed" },
      testId: { name: "testId" },
      id: { name: "id" },
    }),
    events: {},
  },
  {
    name: "NavGroup",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: withLayoutProps({
      label: { name: "label" },
      initiallyExpanded: { name: "initiallyExpanded" },
      enabled: { name: "enabled" },
      to: { name: "to" },
      icon: { name: "icon" },
      iconHorizontalExpanded: { name: "iconHorizontalExpanded" },
      iconVerticalExpanded: { name: "iconVerticalExpanded" },
      iconHorizontalCollapsed: { name: "iconHorizontalCollapsed" },
      iconVerticalCollapsed: { name: "iconVerticalCollapsed" },
      noIndicator: { name: "noIndicator" },
      iconAlignment: { name: "iconAlignment" },
      expandIconAlignment: { name: "expandIconAlignment" },
      testId: { name: "testId" },
      id: { name: "id" },
    }),
    events: {},
  },
  contractFromMetadata(APICallMd, {
    name: "APICall",
    allowsChildren: false,
    includeLayoutProps: false,
    eventAttributes: {
      beforeRequest: "onBeforeRequest",
      success: "onSuccess",
      error: "onError",
      mockExecute: "onMockExecute",
    },
  }),
  contractFromMetadata(AppStateMd, {
    name: "AppState",
    allowsChildren: false,
    includeLayoutProps: false,
    eventAttributes: {
      didUpdate: "onDidUpdate",
    },
  }),
  contractFromMetadata(ChangeListenerMd, {
    name: "ChangeListener",
    allowsChildren: false,
    includeLayoutProps: false,
    eventAttributes: {
      didChange: "onDidChange",
    },
  }),
  contractFromMetadata(LifecycleMd, {
    name: "Lifecycle",
    allowsChildren: false,
    includeLayoutProps: false,
    eventAttributes: {
      mount: "onMount",
      unmount: "onUnmount",
      error: "onError",
    },
  }),
  contractFromMetadata(TimerMd, {
    name: "Timer",
    allowsChildren: false,
    includeLayoutProps: false,
    eventAttributes: {
      tick: "onTick",
    },
  }),
  contractFromMetadata(QueueMd, {
    name: "Queue",
    allowsChildren: true,
    includeLayoutProps: false,
    eventAttributes: {
      willProcess: "onWillProcess",
      process: "onProcess",
      didProcess: "onDidProcess",
      processError: "onProcessError",
      complete: "onComplete",
    },
  }),
  contractFromMetadata(MessageListenerMd, {
    name: "MessageListener",
    allowsChildren: true,
    includeLayoutProps: false,
    eventAttributes: {
      messageReceived: "onMessageReceived",
    },
  }),
  contractFromMetadata(EventSourceMd, {
    name: "EventSource",
    allowsChildren: false,
    includeLayoutProps: false,
    eventAttributes: {
      open: "onOpen",
      message: "onMessage",
      error: "onError",
      close: "onClose",
    },
  }),
  contractFromMetadata(WebSocketMd, {
    name: "WebSocket",
    allowsChildren: false,
    includeLayoutProps: false,
    eventAttributes: {
      open: "onOpen",
      message: "onMessage",
      error: "onError",
      close: "onClose",
    },
  }),
  contractFromMetadata(LiveRegionMd, {
    name: "LiveRegion",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(BookmarkMd, {
    name: "Bookmark",
    allowsChildren: true,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(SkipLinkMd, {
    name: "SkipLink",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(ToastMd, {
    name: "Toast",
    allowsChildren: true,
    includeLayoutProps: false,
  }),
  contractFromMetadata(SlotMd, {
    name: "Slot",
    allowsChildren: true,
    includeLayoutProps: false,
    acceptsArbitraryProps: true,
  }),
  contractFromMetadata(PartMd, {
    name: "Part",
    allowsChildren: true,
    includeLayoutProps: false,
    acceptsArbitraryProps: false,
  }),
  contractFromMetadata(ToneSwitchMd, {
    name: "ToneSwitch",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      didChange: "onDidChange",
    },
  }),
  contractFromMetadata(ToneChangerButtonMd, {
    name: "ToneChangerButton",
    allowsChildren: false,
    includeLayoutProps: true,
    acceptsArbitraryProps: true,
    eventAttributes: {
      click: "onClick",
    },
  }),
  {
    name: "property",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {
      name: { name: "name" },
    },
    events: {},
  },
  {
    name: "method",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {
      name: { name: "name" },
    },
    events: {},
  },
  {
    name: "Component",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: {
      name: { name: "name" },
    },
    events: {},
  },
];

function stackProps(): XmluiComponentContract["props"] {
  return {
    id: { name: "id" },
    testId: { name: "testId" },
    desktopOnly: { name: "desktopOnly" },
    gap: { name: "gap" },
    reverse: { name: "reverse" },
    wrapContent: { name: "wrapContent" },
    orientation: { name: "orientation" },
    horizontalAlignment: { name: "horizontalAlignment" },
    verticalAlignment: { name: "verticalAlignment" },
    hoverContainer: { name: "hoverContainer" },
    visibleOnHover: { name: "visibleOnHover" },
    scrollStyle: { name: "scrollStyle" },
    showScrollerFade: { name: "showScrollerFade" },
    itemWidth: { name: "itemWidth" },
    dock: { name: "dock" },
  };
}

function stackEvents(): XmluiComponentContract["events"] {
  return {
    click: { name: "click", attributeName: "onClick" },
    contextMenu: { name: "contextMenu", attributeName: "onContextMenu" },
    mounted: { name: "mounted", attributeName: "onMounted" },
  };
}

function withLayoutProps(
  props: XmluiComponentContract["props"] = {},
): XmluiComponentContract["props"] {
  return {
    ...Object.fromEntries(
      supportedLayoutPropNames.map((name) => [name, { name }]),
    ),
    ...Object.fromEntries(
      supportedResponsiveLayoutPropNames.map((name) => [name, { name }]),
    ),
    when: { name: "when" },
    "when-xs": { name: "when-xs" },
    "when-sm": { name: "when-sm" },
    "when-md": { name: "when-md" },
    "when-lg": { name: "when-lg" },
    "when-xl": { name: "when-xl" },
    "when-xxl": { name: "when-xxl" },
    tooltip: { name: "tooltip" },
    tooltipMarkdown: { name: "tooltipMarkdown" },
    tooltipOptions: { name: "tooltipOptions" },
    animation: { name: "animation" },
    animationOptions: { name: "animationOptions" },
    ...props,
  };
}

function withExtraProps(
  contract: XmluiComponentContract,
  names: readonly string[],
): XmluiComponentContract {
  return {
    ...contract,
    props: {
      ...contract.props,
      ...Object.fromEntries(names.map((name) => [name, { name }])),
    },
  };
}

export function normalizeEventName(attributeOrEventName: string): string {
  if (/^on[A-Z]/.test(attributeOrEventName)) {
    const eventName = attributeOrEventName.slice(2);
    return eventName.charAt(0).toLowerCase() + eventName.slice(1);
  }
  return attributeOrEventName;
}

import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { ButtonMd } from "@components/Button/Button";
import { CHStackMd, CVStackMd, HStackMd, StackMd, VStackMd } from "@components/Stack/Stack";
import { TextboxMd } from "@components/TextBox/TextBox";
import { ThemeMd } from "@components/Theme/Theme";
import { AppMd } from "@components/App/App";
import { AppHeaderMd } from "@components/AppHeader/AppHeader";
import { AppStateMd } from "@components/AppState/AppState";
import { AvatarMd } from "@components/Avatar/Avatar";
import { BadgeMd } from "@components/Badge/Badge";
import { BookmarkMd } from "@components/Bookmark/Bookmark";
import { CardMd } from "@components/Card/Card";
import { ChangeListenerMd } from "@components/ChangeListener/ChangeListener";
import { CheckboxMd } from "@components/Checkbox/Checkbox";
import { ComboboxMd } from "@components/Combobox/Combobox";
import { ContentSeparatorMd } from "@components/ContentSeparator/ContentSeparator";
import { DatePickerMd } from "@components/DatePicker/DatePicker";
import { DropdownMenuMd, MenuItemMd, SubMenuItemMd } from "@components/DropdownMenu/DropdownMenu";
import { EmojiSelectorMd } from "@components/EmojiSelector/EmojiSelector";
import { FileInputMd } from "@components/FileInput/FileInput";
import { FileUploadDropZoneMd } from "@components/FileUploadDropZone/FileUploadDropZone";
import { FlowLayoutMd } from "@components/FlowLayout/FlowLayout";
import { FooterMd } from "@components/Footer/Footer";
import { FormMd } from "@components/Form/Form";
import { FormItemMd } from "@components/FormItem/FormItem";
import { H1Md, H2Md, H3Md, H4Md, H5Md, H6Md, HeadingMd } from "@components/Heading/Heading";
import { HoverCardMd } from "@components/HoverCard/HoverCard";
import { IconMd } from "@components/Icon/Icon";
import { ImageMd } from "@components/Image/Image";
import { ItemsMd } from "@components/Items/Items";
import { LinkMd } from "@components/Link/Link";
import { ListMd } from "@components/List/List";
import { LogoMd } from "@components/Logo/Logo";
import Markdown from "react-markdown";
import { MarkdownMd } from "@components/Markdown/Markdown";
import { ModalDialogMd } from "@components/ModalDialog/ModalDialog";
import { MultiSelectMd } from "@components/MultiSelect/MultiSelect";
import { NavGroupMd } from "@components/NavGroup/NavGroup";
import { NavLinkMd } from "@components/NavLink/NavLink";
import { NavPanelMd } from "@components/NavPanel/NavPanel";
import { NoResultMd } from "@components/NoResult/NoResult";
import { NumberBoxMd } from "@components/NumberBox/NumberBox";
import { OffCanvasMd } from "@components/OffCanvas/OffCanvas";
import { OptionMd } from "@components/Option/Option";
import { PageMetaTitleMd } from "@components/PageMetaTitle/PageMetaTitle";
import { PagesMd } from "@components/Pages/Pages";
import { PdfMd } from "@components/Pdf/LazyPdf";
import { PieChartMd } from "@components/PieChart/PieChart";
import { PositionedContainerMd } from "@components/PositionedContainer/PositionedContainer";
import { ProgressBarMd } from "@components/ProgressBar/ProgressBar";
import { QueueMd } from "@components/Queue/Queue";
import { RadioGroupMd } from "@components/RadioGroup/RadioGroup";
import { RealTimeAdapterMd } from "@components/RealTimeAdapter/RealTimeAdapter";
import { RedirectMd } from "@components/Redirect/Redirect";
import { SelectMd } from "@components/Select/Select";
import { SelectionStoreMd } from "@components/SelectionStore/SelectionStore";
import { SpaceFillerMd } from "@components/SpaceFiller/SpaceFiller";
import { SpinnerMd } from "@components/Spinner/Spinner";
import { HSplitterMd, SplitterMd, VSplitterMd } from "@components/Splitter/Splitter";
import { StickyBoxMd } from "@components/StickyBox/StickyBox";
import { SwitchMd } from "@components/Switch/Switch";
import { TableMd } from "@components/Table/Table";
import { TableColumnDefMd } from "@components/TableColumnDef/TableColumnDef";
import { TableHeaderMd } from "@components/TableHeader/TableHeader";
import { TableOfContentsMd } from "@components/TableOfContents/TableOfContents";
import { TabsMd } from "@components/Tabs/Tabs";
import { TextMd } from "@components/Text/Text";
import { TextAreaMd } from "@components/TextArea/TextArea";
import { ComponentMetadata } from "@abstractions/ComponentDefs";
import { AccordionMd } from "./Accordion/Accordion";
import { AlertMd } from "./Alert/Alert";

export const collectedComponentMetadata: Record<string, ComponentMetadata> = {
  Accordion: AccordionMd,
  Alert: AlertMd,
  // App: AppMd,
  // AppHeader: AppHeaderMd,
  // AppState: AppStateMd,
  Avatar: AvatarMd,
  Badge: BadgeMd,
  Bookmark: BookmarkMd,
  Button: ButtonMd,
  Card: CardMd,
  ChangeListener: ChangeListenerMd,
  Checkbox: CheckboxMd,
  Combobox: ComboboxMd,
  ContentSeparator: ContentSeparatorMd,
  DatePicker: DatePickerMd,
  DropdownMenu: DropdownMenuMd,
  MenuItem: MenuItemMd,
  SubMenuItem: SubMenuItemMd,
  EmojiSelector: EmojiSelectorMd,
  FileInput: FileInputMd,
  FileUploadDropZone: FileUploadDropZoneMd,
  FlowLayout: FlowLayoutMd,
  Footer: FooterMd,
  Form: FormMd,
  FormItem: FormItemMd,
  Heading: HeadingMd,
  H1: H1Md,
  H2: H2Md,
  H3: H3Md,
  H4: H4Md,
  H5: H5Md,
  H6: H6Md,
  HoverCard: HoverCardMd,
  // Icon: IconMd,
  // Image: ImageMd,
  // Items: ItemsMd,
  // Link: LinkMd,
  // List: ListMd,
  // Logo: LogoMd,
  // Markdown: MarkdownMd,
  // MenuItem: MenuItemMd,
  // ModalDialog: ModalDialogMd,
  // MultiCombobox: ComboboxMd,
  // MultiSelect: MultiSelectMd,
  // NavGroup: NavGroupMd,
  // NavLink: NavLinkMd,
  // NavPanel: NavPanelMd,
  // NoResult: NoResultMd,
  // NumberBox: NumberBoxMd,
  OffCanvas: OffCanvasMd,
  // Option: OptionMd,
  // PageMetaTitle: PageMetaTitleMd,
  // Pages: PagesMd,
  // Pdf: PdfMd,
  // PieChart: PieChartMd,
  // PositionedContainer: PositionedContainerMd,
  // ProgressBar: ProgressBarMd,
  // Queue: QueueMd,
  // RadioGroup: RadioGroupMd,
  // RealTimeAdapter: RealTimeAdapterMd,
  // Redirect: RedirectMd,
  // Select: SelectMd,
  // SelectionStore: SelectionStoreMd,
  // SpaceFiller: SpaceFillerMd,
  // Spinner: SpinnerMd,
  // Splitter: SplitterMd,
  // HSplitter: HSplitterMd,
  // VSplitter: VSplitterMd,
  // Stack: StackMd,
  // CHStack: CHStackMd,
  // CVStack: CVStackMd,
  // HStack: HStackMd,
  // VStack: VStackMd,
  // StickyBox: StickyBoxMd,
  // Table: TableMd,
  // TableColumnDef: TableColumnDefMd,
  // TableHeader: TableHeaderMd,
  // TableOfContents: TableOfContentsMd,
  // Tabs: TabsMd,
  // Text: TextMd,
  // TextArea: TextAreaMd,
  // TextBox: TextboxMd,
  // Theme: ThemeMd,
  Switch: SwitchMd,
};

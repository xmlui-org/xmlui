import { ButtonMd } from "../../../src/components/Button/Button";
import { CHStackMd, CVStackMd, HStackMd, StackMd, VStackMd } from "../../../src/components/Stack/Stack";
import { TextBoxMd } from "../../../src/components/TextBox/TextBox";
import { ThemeMd } from "../../../src/components/Theme/Theme";
import { AppMd } from "../../../src/components/App/App";
import { AppHeaderMd } from "../../../src/components/AppHeader/AppHeader";
import { AppStateMd } from "../../../src/components/AppState/AppState";
import { AvatarMd } from "../../../src/components/Avatar/Avatar";
import { BadgeMd } from "../../../src/components/Badge/Badge";
import { BookmarkMd } from "../../../src/components/Bookmark/Bookmark";
import { CardMd } from "../../../src/components/Card/Card";
import { ChangeListenerMd } from "../../../src/components/ChangeListener/ChangeListener";
import { CheckboxMd } from "../../../src/components/Checkbox/Checkbox";
import { ContentSeparatorMd } from "../../../src/components/ContentSeparator/ContentSeparator";
import { DatePickerMd } from "../../../src/components/DatePicker/DatePicker";
import { DropdownMenuMd, MenuItemMd } from "../../../src/components/DropdownMenu/DropdownMenu";
import { EmojiSelectorMd } from "../../../src/components/EmojiSelector/EmojiSelector";
import { FileInputMd } from "../../../src/components/FileInput/FileInput";
import { FileUploadDropZoneMd } from "../../../src/components/FileUploadDropZone/FileUploadDropZone";
import { FlowLayoutMd } from "../../../src/components/FlowLayout/FlowLayout";
import { FooterMd } from "../../../src/components/Footer/Footer";
import { FormMd } from "../../../src/components/Form/Form";
import { FormItemMd } from "../../../src/components/FormItem/FormItem";
import { H1Md, H2Md, H3Md, H4Md, H5Md, H6Md, HeadingMd } from "../../../src/components/Heading/Heading";
import { HoverCardMd } from "../../../src/components/HoverCard/HoverCard";
import { IconMd } from "../../../src/components/Icon/Icon";
import { ImageMd } from "../../../src/components/Image/Image";
import { ItemsMd } from "../../../src/components/Items/Items";
import { LinkMd } from "../../../src/components/Link/Link";
import { ListMd } from "../../../src/components/List/List";
import { LogoMd } from "../../../src/components/Logo/Logo";
import Markdown from "react-markdown";
import { MarkdownMd } from "../../../src/components/Markdown/Markdown";
import { ModalDialogMd } from "../../../src/components/ModalDialog/ModalDialog";
import { NavGroupMd } from "../../../src/components/NavGroup/NavGroup";
import { NavLinkMd } from "../../../src/components/NavLink/NavLink";
import { NavPanelMd } from "../../../src/components/NavPanel/NavPanel";
import { NoResultMd } from "../../../src/components/NoResult/NoResult";
import { NumberBoxMd } from "../../../src/components/NumberBox/NumberBox";
import { OffCanvasMd } from "../../../src/components/OffCanvas/OffCanvas";
import { OptionMd } from "../../../src/components/Option/Option";
import { PageMetaTitleMd } from "../../../src/components/PageMetaTitle/PageMetaTitle";
import { PagesMd } from "../../../src/components/Pages/Pages";
import { PdfMd } from "../../../src/components/Pdf/LazyPdf";
import { PositionedContainerMd } from "../../../src/components/PositionedContainer/PositionedContainer";
import { ProgressBarMd } from "../../../src/components/ProgressBar/ProgressBar";
import { QueueMd } from "../../../src/components/Queue/Queue";
import { RealTimeAdapterMd } from "../../../src/components/RealTimeAdapter/RealTimeAdapter";
import { RedirectMd } from "../../../src/components/Redirect/Redirect";
import { SelectMd } from "../../../src/components/Select/Select";
import { SelectionStoreMd } from "../../../src/components/SelectionStore/SelectionStore";
import { SpaceFillerMd } from "../../../src/components/SpaceFiller/SpaceFiller";
import { SpinnerMd } from "../../../src/components/Spinner/Spinner";
import { HSplitterMd, SplitterMd, VSplitterMd } from "../../../src/components/Splitter/Splitter";
import { StickyBoxMd } from "../../../src/components/StickyBox/StickyBox";
import { SwitchMd } from "../../../src/components/Switch/Switch";
import { TableMd } from "../../../src/components/Table/Table";
import { ColumnMd } from "../../../src/components/Column/Column";
import { TableHeaderMd } from "../../../src/components/TableHeader/TableHeader";
import { TableOfContentsMd } from "../../../src/components/TableOfContents/TableOfContents";
import { TabsMd } from "../../../src/components/Tabs/Tabs";
import { TextMd } from "../../../src/components/Text/Text";
import { TextAreaMd } from "../../../src/components/TextArea/TextArea";
import type { ComponentMetadata } from "../../../src/abstractions/ComponentDefs";

export const metadataHash: Record<string, ComponentMetadata> = {
  App: AppMd,
  AppHeader: AppHeaderMd,
  AppState: AppStateMd,
  Avatar: AvatarMd,
  Badge: BadgeMd,
  Bookmark: BookmarkMd,
  Button: ButtonMd,
  Card: CardMd,
  ChangeListener: ChangeListenerMd,
  Checkbox: CheckboxMd,
  Column: ColumnMd,
  ContentSeparator: ContentSeparatorMd,
  DatePicker: DatePickerMd,
  DropdownMenu: DropdownMenuMd,
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
  Icon: IconMd,
  Image: ImageMd,
  Items: ItemsMd,
  Link: LinkMd,
  List: ListMd,
  Logo: LogoMd,
  Markdown: MarkdownMd,
  MenuItem: MenuItemMd,
  ModalDialog: ModalDialogMd,
  NavGroup: NavGroupMd,
  NavLink: NavLinkMd,
  NavPanel: NavPanelMd,
  NoResult: NoResultMd,
  NumberBox: NumberBoxMd,
  OffCanvas: OffCanvasMd,
  Option: OptionMd,
  PageMetaTitle: PageMetaTitleMd,
  Pages: PagesMd,
  Pdf: PdfMd,
  PositionedContainer: PositionedContainerMd,
  ProgressBar: ProgressBarMd,
  Queue: QueueMd,
  RealTimeAdapter: RealTimeAdapterMd,
  Redirect: RedirectMd,
  Select: SelectMd,
  SelectionStore: SelectionStoreMd,
  SpaceFiller: SpaceFillerMd,
  Spinner: SpinnerMd,
  Splitter: SplitterMd,
  HSplitter: HSplitterMd,
  VSplitter: VSplitterMd,
  Stack: StackMd,
  CHStack: CHStackMd,
  CVStack: CVStackMd,
  HStack: HStackMd,
  VStack: VStackMd,
  StickyBox: StickyBoxMd,
  Table: TableMd,
  TableHeader: TableHeaderMd,
  TableOfContents: TableOfContentsMd,
  Tabs: TabsMd,
  Text: TextMd,
  TextArea: TextAreaMd,
  TextBox: TextBoxMd,
  Theme: ThemeMd,
  Switch: SwitchMd,
};

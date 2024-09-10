import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { ButtonMd } from "@components/Button/Button";
import { StackMd } from "@components/Stack/Stack";
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
import { DropdownMenuMd, MenuItemMd } from "@components/DropdownMenu/DropdownMenu";
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

export const metadataHash: Record<string, ComponentDescriptor<any>> = {
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
  Combobox: ComboboxMd,
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
  MenuItem: MenuItemMd,
  Stack: StackMd,
  TextBox: TextboxMd,
  Theme: ThemeMd,
};

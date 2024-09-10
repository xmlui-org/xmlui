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

export const metadataHash: Record<string, ComponentDescriptor<any>> = {
  App: AppMd,
  AppHeader: AppHeaderMd,
  AppState: AppStateMd,
  Avatar: AvatarMd,
  Badge: BadgeMd,
  Bookmark: BookmarkMd,
  Button: ButtonMd,
  Card: CardMd,
  Stack: StackMd,
  TextBox: TextboxMd,
  Theme: ThemeMd,
};

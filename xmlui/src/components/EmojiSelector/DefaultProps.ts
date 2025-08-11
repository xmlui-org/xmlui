import { noop } from "../../components-core/constants";
import type { Theme as EmojiPickerTheme } from "emoji-picker-react";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";

export type EmojiSelectorProps = {
  theme?: EmojiPickerTheme;
  select?: AsyncFunction;
  autoFocus?: boolean;
};

export const defaultProps: Pick<EmojiSelectorProps, "theme" | "select" | "autoFocus"> = {
  theme: "light" as EmojiPickerTheme,
  select: noop,
  autoFocus: false,
};
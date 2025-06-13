import EmojiPicker, { EmojiStyle, Theme as EmojiPickerTheme } from "emoji-picker-react";

import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import { noop } from "../../components-core/constants";

// =====================================================================================================================
// React EmojiSelector component implementation

type Props = {
  theme?: EmojiPickerTheme;
  select?: AsyncFunction;
  autoFocus?: boolean;
};

export const defaultProps: Pick<Props, "theme" | "select" | "autoFocus"> = {
  theme: EmojiPickerTheme.LIGHT,
  select: noop,
  autoFocus: false,
};

export const EmojiSelector = ({
  select = defaultProps.select,
  theme = defaultProps.theme,
  autoFocus = defaultProps.autoFocus,
}: Props) => (
  <EmojiPicker
    autoFocusSearch={autoFocus}
    onEmojiClick={async (emojiObject) => {
      await select(emojiObject.emoji);
    }}
    lazyLoadEmojis={true}
    theme={theme}
    previewConfig={{ showPreview: false }}
    skinTonesDisabled={true}
    height={360}
    emojiStyle={EmojiStyle.NATIVE}
  />
);

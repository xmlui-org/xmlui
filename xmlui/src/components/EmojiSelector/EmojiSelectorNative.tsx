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

export const EmojiSelector = ({
  select = noop,
  theme = EmojiPickerTheme.LIGHT,
  autoFocus = false,
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

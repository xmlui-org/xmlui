import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import type { EmojiSelectorProps } from "./DefaultProps";
import { defaultProps } from "./DefaultProps";

// =====================================================================================================================
// React EmojiSelector component implementation

export const EmojiSelector = ({
  select = defaultProps.select,
  theme = defaultProps.theme,
  autoFocus = defaultProps.autoFocus,
}: EmojiSelectorProps) => (
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

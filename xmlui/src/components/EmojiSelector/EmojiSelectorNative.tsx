import { forwardRef } from "react";
import EmojiPicker, { EmojiStyle, Theme as EmojiPickerTheme } from "emoji-picker-react";
import { AsyncFunction } from "../../abstractions/FunctionDefs";
import { noop } from "../../components-core/constants";

// =====================================================================================================================
// React EmojiSelector component implementation

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

export const EmojiSelector = forwardRef<HTMLDivElement, EmojiSelectorProps>(
  (
    {
      select = defaultProps.select,
      theme = defaultProps.theme,
      autoFocus = defaultProps.autoFocus,
      ...rest
    },
    ref,
  ) => (
    <div
      {...rest}
      ref={ref}
      style={{ display: "inline-block", width: "fit-content", height: "fit-content" }}
    >
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
    </div>
  ),
);

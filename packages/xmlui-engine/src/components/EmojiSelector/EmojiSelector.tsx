import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { noop } from "@components-core/constants";
import EmojiPicker, { EmojiStyle, Theme as EmojiPickerTheme } from "emoji-picker-react";
import { useTheme } from "@components-core/theming/ThemeContext";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import type { AsyncFunction } from "@abstractions/FunctionDefs";

// =====================================================================================================================
// React EmojiSelector component implementation

type Props = {
  theme?: EmojiPickerTheme;
  select?: AsyncFunction;
  autoFocus?: boolean;
};

const EmojiSelector = ({ select = noop, theme = EmojiPickerTheme.LIGHT, autoFocus = false }: Props) => (
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

// =====================================================================================================================
// XMLUI EmojiSelector component definition

/** 
 * The `EmojiSelector` component provides users with a graphical interface to browse,
 * search and select emojis to insert into text fields, messages, or other forms of communication.
 */
export interface EmojiSelectorComponentDef extends ComponentDef<"EmojiSelector"> {
  props: {
    /** 
     * This prop is used to auto focus on the component when the user navigates to the page.
     * @descriptionRef
     */
    autoFocus: string;
  };
  readonly events: {
    /** 
     * This event is fired when the user selects an emoticon from this component.
     * @descriptionRef
     */
    select: string;
  };
}

const metadata: ComponentDescriptor<EmojiSelectorComponentDef> = {
  displayName: "EmojiSelector",
  description: "A panel to select an emoji from the available ones",
  events: {
    select: desc("Sign that an emoji has been selected"),
  },
};

export const emojiSelectorRenderer = createComponentRenderer<EmojiSelectorComponentDef>(
  "EmojiSelector",
  ({ node, lookupEventHandler, extractValue }) => {
    const onActionSelect = lookupEventHandler("select");
    const theme = useTheme();

    return (
      <EmojiSelector
        select={onActionSelect}
        theme={theme.activeThemeTone as EmojiPickerTheme}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      />
    );
  },
  metadata
);

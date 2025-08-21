import { createComponentRenderer } from "../../components-core/renderers";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { createMetadata, d, dAutoFocus } from "../metadata-helpers";
import { EmojiSelector } from "./EmojiSelectorNative";
import { defaultProps } from "./EmojiSelectorNative";

const COMP = "EmojiSelector";

export const EmojiSelectorMd = createMetadata({
  status: "experimental",
  description:
    "`EmojiSelector` enables users to browse, search and select emojis from " +
    "their system's native emoji set.",
  props: {
    autoFocus: {
      ...dAutoFocus(),
      defaultValue: defaultProps.autoFocus,
    },
  },
  events: {
    select: d(`This event is fired when the user selects an emoticon from this component.`),
  },
});

export const emojiSelectorRenderer = createComponentRenderer(
  COMP,
  EmojiSelectorMd,
  ({ node, lookupEventHandler, extractValue }) => {
    const onActionSelect = lookupEventHandler("select");
    const theme = useTheme();

    return (
      <EmojiSelector
        select={onActionSelect}
        theme={theme.activeThemeTone as any}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      />
    );
  },
);

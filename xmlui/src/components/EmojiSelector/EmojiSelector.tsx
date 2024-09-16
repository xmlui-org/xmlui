import { createComponentRendererNew } from "@components-core/renderers";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { useTheme } from "@components-core/theming/ThemeContext";
import { EmojiSelector } from "./EmojiSelectorNative";
import { dAutoFocus } from "@components/metadata-helpers";

const COMP = "EmojiSelector";

export const EmojiSelectorMd = createMetadata({
  description: 
    `The \`${COMP}\` component provides users with a graphical interface to browse, search and ` + 
    `select emojis to insert into text fields, messages, or other forms of communication.`,
  props: {
    autoFocus: dAutoFocus(),
  },
  events: {
    select: d(`This event is fired when the user selects an emoticon from this component.`),
  },
});

export const emojiSelectorRenderer = createComponentRendererNew(
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

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { dAutoFocus } from "../metadata-helpers";
import { EmojiSelector } from "./EmojiSelectorNative";

const COMP = "EmojiSelector";

export const EmojiSelectorMd = createMetadata({
  status: "experimental",
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

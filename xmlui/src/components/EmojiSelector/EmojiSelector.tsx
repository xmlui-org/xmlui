import { createComponentRendererNew } from "@components-core/renderers";
import { createMetadata, d, type ComponentDef } from "@abstractions/ComponentDefs";
import { useTheme } from "@components-core/theming/ThemeContext";
import { EmojiSelector } from "./EmojiSelectorNative";
import { dAutoFocus } from "@components/metadata-helpers";

const COMP = "EmojiSelector";
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

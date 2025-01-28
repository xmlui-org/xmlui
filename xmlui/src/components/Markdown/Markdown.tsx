import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./Markdown.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Markdown } from "./MarkdownNative";

const COMP = "Markdown";

export const MarkdownMd = createMetadata({
  description: `\`${COMP}\` displays plain text styled using markdown syntax.`,
  themeVars: parseScssVar(styles.themeVars),
  props: {
    content: d("This property sets the markdown content to display."),
    removeIndents: d(
      "This boolean property specifies whether leading indents should be " +
        "removed from the markdown content. If set to `true`, the shortest " +
        "indent found at the start of the content lines is removed from the " +
        "beginning of every line.",
      null,
      "boolean",
      false,
    ),
  },
  defaultThemeVars: {
    "color-border-HorizontalRule": "$color-border",
    "thickness-border-HorizontalRule": "1px",
    "style-border-HorizontalRule": "solid",
    "accent-Blockquote": "$color-primary",
    "padding-Blockquote": "$space-2 $space-6",
    "margin-Blockquote": "$space-2",
    "padding-left-UnorderedList": "$space-6",
    "padding-left-OrderedList": "$space-6",
    "padding-left-ListItem": "$space-1",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const markdownComponentRenderer = createComponentRenderer(
  COMP,
  MarkdownMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    const content = extractValue.asString(node.props.content);
    return (
      <Markdown
        style={layoutCss}
        removeIndents={extractValue.asOptionalBoolean(node.props.removeIndents, false)}
      >
        {content || renderChild(node.children)}
      </Markdown>
    );
  },
);

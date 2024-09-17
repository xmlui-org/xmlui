import { createMetadata } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import styles from "./Markdown.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Markdown } from "./MarkdownNative";

const COMP = "Markdown";

export const MarkdownMd = createMetadata({
  description: `\`${COMP}\` displays plain text styled using markdown syntax.`,
  themeVars: parseScssVar(styles.themeVars),
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

export const markdownComponentRenderer = createComponentRendererNew(
  COMP,
  MarkdownMd,
  ({ node, renderChild }) => {
    return <Markdown>{renderChild(node.children)}</Markdown>;
  },
);

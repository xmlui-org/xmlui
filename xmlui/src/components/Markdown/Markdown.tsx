import styles from "./Markdown.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Markdown } from "./MarkdownNative";

const COMP = "Markdown";

export const MarkdownMd = createMetadata({
  description: `\`${COMP}\` displays plain text styled using markdown syntax.`,
  themeVars: parseScssVar(styles.themeVars),
  props: {
    content: d("This property sets the markdown content to display."),
    removeIndents: {
      description:
        "This boolean property specifies whether leading indents should be " +
        "removed from the markdown content. If set to `true`, the shortest " +
        "indent found at the start of the content lines is removed from the " +
        "beginning of every line.",
      valueType: "boolean",
      defaultValue: true,
    },
  },

  defaultThemeVars: {
    "borderRadius-Admonition": "$space-4",
    "iconSize-Admonition": "1.5rem",
    "padding-Admonition": "1rem",
    "marginBottom-Admonition": "1rem",
    "marginLeft-Admonition-content":".5rem",

    "accentWidth-Blockquote": "3px",
    "accentColor-Blockquote": "$color-surface-500",
    "padding-Blockquote": ".5rem",
    "marginBottom-Blockquote": "1rem",

    "marginBottom-Text-codefence": ".5rem",
    "marginBottom-Text-markdown": ".5rem",

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
    let renderedChildren = "";

    // 1. Static content prop fallback
    if (!renderedChildren) {
      renderedChildren = extractValue.asString(node.props.content);
    }

    // 2. "data" property fallback)
    if (!renderedChildren) {
      renderedChildren = extractValue.asString((node.props as any).data);
    }

    // 3. Children fallback
    if (!renderedChildren) {
      (node.children ?? []).forEach((child) => {
        const renderedChild = renderChild(child);
        if (typeof renderedChild === "string") {
          renderedChildren += renderedChild;
        }
      });
    }

    return (
      <Markdown
        style={layoutCss}
        removeIndents={extractValue.asOptionalBoolean(node.props.removeIndents, true)}
        extractValue={extractValue}
      >
        {renderedChildren}
      </Markdown>
    );
  },
);

export { Markdown } from './MarkdownNative';

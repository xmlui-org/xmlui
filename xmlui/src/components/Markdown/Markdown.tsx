import styles from "./Markdown.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { defaultProps, Markdown } from "./MarkdownNative";

const COMP = "Markdown";

export const MarkdownMd = createMetadata({
  description: `\`${COMP}\` displays plain text styled with markdown syntax.`,
  themeVars: parseScssVar(styles.themeVars),
  props: {
    content: {
      description: "This property sets the markdown content to display.",
      valueType: "string",
    },
    removeIndents: {
      description:
        "This boolean property specifies whether leading indents should be " +
        "removed from the markdown content. If set to `true`, the shortest " +
        "indent found at the start of the content lines is removed from the " +
        "beginning of every line.",
      valueType: "boolean",
      defaultValue: defaultProps.removeIndents,
    },
  },
  defaultThemeVars: {
    "borderColor-HorizontalRule": "$borderColor",
    "borderWidth-HorizontalRule": "1px",
    "borderStyle-HorizontalRule": "solid",
    "accent-Blockquote": "$color-primary",
    "padding-Blockquote": "$space-2 $space-6",
    "margin-Blockquote": "$space-2",
    "paddingLeft-UnorderedList": "$space-6",
    "paddingLeft-OrderedList": "$space-6",
    "paddingLeft-ListItem": "$space-1",
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
    let renderedChildren = extractValue.asString(node.props.content);
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
        removeIndents={extractValue.asOptionalBoolean(
          node.props.removeIndents,
          defaultProps.removeIndents,
        )}
        extractValue={extractValue}
      >
        {renderedChildren}
      </Markdown>
    );
  },
);

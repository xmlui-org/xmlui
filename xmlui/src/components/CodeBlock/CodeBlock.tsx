import styles from "./CodeBlock.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { CodeBlock } from "./CodeBlockNative";

const COMP = "CodeBlock";

export const CodeBlockMd = createMetadata({
  description: `The \`${COMP}\` component displays code with optional syntax highlighting and meta information.`,
  status: "in progress",
  props: {},
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "backgroundColor-CodeBlock": "$color-primary-50",
    "backgroundColor-CodeBlock-header": "$color-primary-100",
    "marginTop-CodeBlock": "$space-5",
    "marginBottom-CodeBlock": "$space-5",
    "backgroundColor-CodeBlock-highlightRow": "rgba($color-primary-200-rgb, .25)",
    "backgroundColor-CodeBlock-highlightString": "rgba($color-primary-200-rgb, .5)",
    "borderRadius-CodeBlock": "$space-2",

    dark: {
      "backgroundColor-CodeBlock-header": "$color-surface-200",
      "backgroundColor-CodeBlock": "$color-surface-50",
      "backgroundColor-CodeBlock-highlightRow": "rgba($color-primary-300-rgb, .15)",
      "backgroundColor-CodeBlock-highlightString": "rgba($color-primary-300-rgb, .5)",
    }
  },
});

export const codeBlockComponentRenderer = createComponentRenderer(
  "CodeBlock",
  CodeBlockMd,
  ({ node, renderChild, layoutCss }) => {
    return (
      <CodeBlock style={layoutCss}>
        {renderChild(node.children)}
      </CodeBlock>
    );
  },
);

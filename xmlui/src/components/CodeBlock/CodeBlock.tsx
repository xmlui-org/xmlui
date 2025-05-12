import styles from "./CodeBlock.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { CodeBlock } from "./CodeBlockNative";

const COMP = "CodeBlock";

export const CodeBlockMd = createMetadata({
  description: `The \`${COMP}\` component displays code with optional syntax highlighting and meta information.`,
  props: {},
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "backgroundColor-CodeBlock": "#f2f7fc", // "$color-surface-100"
    "backgroundColor-CodeBlock-header": "$color-primary-100",
    "marginTop-CodeBlock": "$space-5",
    "marginBottom-CodeBlock": "$space-5",
    "backgroundColor-CodeBlock-highlightRow": "$color-surface-200",
    "backgroundColor-CodeBlock-highlightString": "$color-surface-300",

    dark: {
      "backgroundColor-CodeBlock-header": "$color-primary-200",
      "backgroundColor-CodeBlock": "#112033",
      "backgroundColor-CodeBlock-highlightRow": "$color-surface-100",
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

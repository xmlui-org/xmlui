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
    "backgroundColor-CodeBlock": "$color-surface-100",
    "backgroundColor-CodeBlock-header": "$color-primary-100",
    //"borderLeft-CodeBlock": "$color-surface-300 2px solid",
    "marginTop-CodeBlock": "$space-5",
    "marginBottom-CodeBlock": "$space-5",

    dark: {
      "backgroundColor-CodeBlock-header": "$color-primary-200",
    }
  },
});

export const codeBlockComponentRenderer = createComponentRenderer(
  "CodeBlock",
  CodeBlockMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <CodeBlock style={layoutCss}>
        {renderChild(node.children)}
      </CodeBlock>
    );
  },
);

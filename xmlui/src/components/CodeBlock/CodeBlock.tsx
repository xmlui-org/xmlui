import styles from "./CodeBlock.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { CodeBlock } from "./CodeBlockNative";
import { createMetadata } from "../metadata-helpers";

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
    "backgroundColor-CodeBlock-highlightRow": "rgb(from $color-primary-200 r g b / 0.25)",
    "backgroundColor-CodeBlock-highlightString": "rgb(from $color-primary-200 r g b / 0.5)",

    "borderColor-CodeBlock-highlightString-emphasis": "$color-attention",
    "border-CodeBlock": "0.5px solid $borderColor",
    "borderRadius-CodeBlock": "$space-2",
    "boxShadow-CodeBlock": "none",
    "height-CodeBlock": "fit-content",
    "paddingVertical-content-CodeBlock": "0",
    "paddingHorizontal-content-CodeBlock": "0",

    dark: {
      "backgroundColor-CodeBlock-header": "$color-surface-200",
      "backgroundColor-CodeBlock": "$color-surface-50",
      "backgroundColor-CodeBlock-highlightRow": "rgb(from $color-primary-300 r g b / 0.15)",
      "backgroundColor-CodeBlock-highlightString": "rgb(from $color-primary-300 r g b / 0.5)",
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

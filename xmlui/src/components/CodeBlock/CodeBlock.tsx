import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { CodeBlock } from "./CodeBlockReact";
import codeBlockStylesSource from "./CodeBlock.module.scss?xmlui-theme-vars";

const COMP = "CodeBlock";

export const CodeBlockMd = createMetadata({
  status: "stable",
  description:
    "`CodeBlock` displays code content with CodeBlock theme variables and code-container semantics.",
  parts: {
    header: {
      description: "The header section of the CodeBlock, typically displaying a filename.",
    },
    content: {
      description: "The main content area of the CodeBlock where the code is displayed.",
    },
  },
  props: {
    meta: {
      description: "Optional metadata used by Markdown-generated code fences.",
      valueType: "string",
      isInternal: true,
    },
    testId: {
      description: "Adds a test identifier to the CodeBlock root.",
      valueType: "string",
    },
  },
  themeVars: extractScssThemeVars(codeBlockStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-primary-50",
    [`backgroundColor-${COMP}-header`]: "$color-primary-100",
    [`border-${COMP}`]: "0.5px solid $borderColor",
    [`borderRadius-${COMP}`]: "$space-2",
    [`height-${COMP}`]: "fit-content",
    [`marginTop-${COMP}`]: "$space-6",
    [`marginBottom-${COMP}`]: "$space-6",
    [`paddingVertical-content-${COMP}`]: "0",
    [`paddingHorizontal-content-${COMP}`]: "0",
  },
});

export const codeBlockRenderer = wrapComponent({
  name: COMP,
  metadata: CodeBlockMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <CodeBlock
      {...adapter.rootAttrs()}
      data-testid={adapter.stringProp("testId", "test-id-component")}
      meta={adapter.prop("meta")}
    >
      {adapter.renderChildren()}
    </CodeBlock>
  ),
});

import styles from "./Markdown.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Markdown } from "./MarkdownNative";
import type React from "react";
import { useMemo } from "react";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { parseBindingExpression } from "./parse-binding-expr";
import type { CodeHighlighter } from "../CodeBlock/highlight-code";
import { convertPlaygroundPatternToMarkdown, observePlaygroundPattern } from "./utils";

const COMP = "Markdown";

export const MarkdownMd = createMetadata({
  description: `\`${COMP}\` displays plain text styled using markdown syntax.`,
  themeVars: parseScssVar(styles.themeVars),
  props: {
    content: d("This property sets the markdown content to display."),
    codeHighlighter: {
      description: "This property sets the code highlighter to use.",
      isInternal: true,
    },
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
    "backgroundColor-Admonition": "$color-primary-100",
    "borderRadius-Admonition": "$space-2",
    "border-Admonition": "1px solid $color-primary-300",
    "iconSize-Admonition": "$space-5",
    "paddingLeft-Admonition": "$space-2",
    "paddingRight-Admonition": "$space-6",
    "paddingTop-Admonition": "$space-3",
    "paddingBottom-Admonition": "$space-2",
    "marginLeft-Admonition-content": "$space-1_5",
    "marginTop-Admonition": "$space-7",
    "marginBottom-Admonition": "$space-7",

    "marginTop-Blockquote": "$space-7",
    "marginBottom-Blockquote": "$space-7",
    "paddingHorizontal-Blockquote": "$space-6",
    "paddingTop-Blockquote": "$space-3",
    "paddingBottom-Blockquote": "$space-2_5",
    "backgroundColor-Blockquote": "$color-surface-100",
    "accentWidth-Blockquote": "3px",
    "accentColor-Blockquote": "$color-surface-500",

    "marginTop-HtmlLi": "$space-2_5",
    "marginBottom-HtmlLi": "$space-2_5",

    light: {
      // --- No light-specific theme vars
    },
    dark: {
      "backgroundColor-Blockquote": "$color-surface-50",
      "backgroundColor-Admonition": "$color-primary-200",
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

    // 2. "data" property fallback
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
      <TransformedMarkdown
        style={layoutCss}
        removeIndents={extractValue.asOptionalBoolean(node.props.removeIndents, true)}
        codeHighlighter={extractValue(node.props.codeHighlighter)}
        extractValue={extractValue}
      >
        {renderedChildren}
      </TransformedMarkdown>
    );
  },
);

type TransformedMarkdownProps = {
  children: React.ReactNode;
  removeIndents?: boolean;
  style: React.CSSProperties;
  extractValue: ValueExtractor;
  codeHighlighter?: CodeHighlighter;
};

const TransformedMarkdown = ({
  children,
  removeIndents,
  style,
  extractValue,
  codeHighlighter,
}: TransformedMarkdownProps) => {
  const markdownContent = useMemo(() => {
    if (typeof children !== "string") {
      return null;
    }

    // --- Resolve binding expression values
    // --- Resolve xmlui playground definitions

    let resolvedMd = children;
    while (true) {
      const nextPlayground = observePlaygroundPattern(resolvedMd);
      if (!nextPlayground) break;

      resolvedMd =
        resolvedMd.slice(0, nextPlayground[0]) +
        convertPlaygroundPatternToMarkdown(nextPlayground[2]) +
        resolvedMd.slice(nextPlayground[1]);
    }
    resolvedMd = parseBindingExpression(resolvedMd, extractValue)
    return resolvedMd;
  }, [children, extractValue]);

  return (
    <Markdown removeIndents={removeIndents} codeHighlighter={codeHighlighter} style={style}>
      {markdownContent}
    </Markdown>
  );
};

export { Markdown } from "./MarkdownNative";

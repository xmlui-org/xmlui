import styles from "./Markdown.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Markdown } from "./MarkdownNative";
import { parseBindingExpression } from "./parse-binding-expr";
import { ValueExtractor } from "../../abstractions/RendererDefs";
import { useMemo } from "react";
import { CodeHighlighter } from "./highlight-code";
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
    "borderRadius-Admonition": "$space-2",
    "iconSize-Admonition": "$space-6",
    "paddingLeft-Admonition": "$space-2",
    "paddingRight-Admonition": "$space-6",
    "paddingVertical-Admonition": "$space-2",
    "marginLeft-Admonition-content": "$space-2",
    "marginTop-Admonition": "$space-6",
    "marginBottom-Admonition": "$space-6",
    "backgroundColor-Admonition": "$color-warn-200",

    "marginTop-Blockquote": "$space-6",
    "marginBottom-Blockquote": "$space-6",
    "paddingHorizontal-Blockquote": "$space-6",
    "paddingTop-Blockquote": "$space-4",
    "paddingBottom-Blockquote": "$space-2_5",
    "backgroundColor-Blockquote": "$color-warn-200",
    "accentWidth-Blockquote": "3px",
    "accentColor-Blockquote": "$color-surface-500",

    "marginTop-HtmlLi": "$space-2",
    "marginBottom-HtmlLi": "$space-2",

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

const TransformedMarkdown = ({ children, removeIndents, style, extractValue }: TransformedMarkdownProps) => {
  const markdownContent = useMemo(()=>{
    if (typeof children !== "string") {
      return null;
    }

    // --- Resolve bindig expression values
    const withBindinxExprs = parseBindingExpression(children, extractValue);

    // --- Resolve xmlui playground definitions
    let resolvedMd = withBindinxExprs;
    while (true) {
      const nextPlayground = observePlaygroundPattern(resolvedMd);
      if (!nextPlayground) break;

      resolvedMd = resolvedMd.slice(0, nextPlayground[0]) + 
        convertPlaygroundPatternToMarkdown(nextPlayground[2]) +
        resolvedMd.slice(nextPlayground[1]);
    }
    console.log(resolvedMd)
    return resolvedMd;

  }, [children, extractValue]);

  return (
    <Markdown removeIndents={removeIndents} style={style}>
      {markdownContent}
    </Markdown>
  );
};

export { Markdown } from "./MarkdownNative";

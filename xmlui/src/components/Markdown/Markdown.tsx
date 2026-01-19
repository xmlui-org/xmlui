import styles from "./Markdown.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Markdown, defaultProps } from "./MarkdownNative";
import type React from "react";
import { forwardRef, useMemo } from "react";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { parseBindingExpression } from "./parse-binding-expr";
import type { CodeHighlighter } from "../CodeBlock/highlight-code";
import {
  convertPlaygroundPatternToMarkdown,
  convertTreeDisplayToMarkdown,
  observePlaygroundPattern,
  observeTreeDisplay,
} from "./utils";
import { createMetadata, d } from "../metadata-helpers";
import type { BreakMode, OverflowMode } from "../abstractions";

const COMP = "Markdown";

export const MarkdownMd = createMetadata({
  status: "stable",
  description:
    "`Markdown` renders formatted text using markdown syntax. Use " +
    "[Text](/working-with-text) for simple, styled text content, and `Markdown` " +
    "when you need [rich formatting](/working-with-markdown).",
  themeVars: parseScssVar(styles.themeVars),
  props: {
    content: d(
      "This property sets the markdown content to display. Alternatively, you can nest " +
        "the markdown content as a child in a CDATA section. In neither this property " +
        "value nor any child is defined, empty content is displayed.",
    ),
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
      defaultValue: defaultProps.removeIndents,
    },
    removeBr: {
      description:
        "This boolean property specifies whether `<br>` (line break) elements should be " +
        "omitted from the rendered output. When set to `true`, `<br/>` tags in the " +
        "markdown content will not be rendered. When `false` (default), `<br/>` tags " +
        "render as horizontal bars.",
      valueType: "boolean",
      defaultValue: defaultProps.removeBr,
    },
    showHeadingAnchors: {
      description:
        "This boolean property specifies whether heading anchors should be " +
        "displayed. If set to `true`, heading anchors will be displayed on hover " +
        "next to headings.",
      valueType: "boolean",
    },
    grayscale: {
      description:
        "This boolean property specifies whether images should be displayed in " +
        "grayscale. If set to `true`, all images within the markdown will be " +
        "rendered in grayscale.",
      valueType: "boolean",
    },
    truncateLinks: {
      description:
        "This boolean property specifies whether long links should be " +
        "truncated with ellipsis. If set to `true`, links will be displayed " +
        "with a maximum width and overflow will be hidden with text-overflow: ellipsis.",
      valueType: "boolean",
    },
    openLinkInNewTab: {
      description:
        "This boolean property specifies whether links should open in a new tab. " +
        "If set to `true`, all links within the markdown will open in a new tab " +
        "with `target=\"_blank\"`. Links that explicitly specify their own target " +
        "using the `| target=...` syntax will override this setting.",
      valueType: "boolean",
    },
    breakMode: {
      description:
        "This property controls how text breaks into multiple lines. " +
        "`normal` uses standard word boundaries, `word` breaks long words to prevent overflow, " +
        "`anywhere` breaks at any character, `keep` prevents word breaking, " +
        "and `hyphenate` uses automatic hyphenation. When not specified, uses the default browser behavior or theme variables.",
      valueType: "string",
      defaultValue: "normal",
      availableValues: [
        { value: "normal", description: "Uses standard word boundaries for breaking" },
        { value: "word", description: "Breaks long words when necessary to prevent overflow" },
        { value: "anywhere", description: "Breaks at any character if needed to fit content" },
        { value: "keep", description: "Prevents breaking within words entirely" },
        { value: "hyphenate", description: "Uses automatic hyphenation when breaking words" },
      ],
    },
    overflowMode: {
      description:
        "This property controls how text overflow is handled. " +
        "`none` prevents wrapping and shows no overflow indicator, " +
        "`ellipsis` shows ellipses when text is truncated, `scroll` forces single line with horizontal scrolling, " +
        "and `flow` allows multi-line wrapping with vertical scrolling when needed. " +
        "When not specified, uses the default text behavior.",
      valueType: "string",
      defaultValue: "not specified",
      availableValues: [
        {
          value: "none",
          description: "No wrapping, text stays on a single line with no overflow indicator",
        },
        { value: "ellipsis", description: "Truncates with an ellipsis" },
        {
          value: "scroll",
          description: "Forces single line with horizontal scrolling when content overflows",
        },
        {
          value: "flow",
          description:
            "Allows text to wrap into multiple lines with vertical scrolling when container height is constrained",
        },
      ],
    },
  },

  defaultThemeVars: {
    "marginTop-H1-markdown": "$space-4",
    "marginBottom-H1-markdown": "$space-6",
    "marginTop-H2-markdown": "$space-8",
    "marginBottom-H2-markdown": "$space-5",
    "marginTop-H3-markdown": "$space-7",
    "marginBottom-H3-markdown": "$space-4",
    "marginTop-H4-markdown": "$space-6",
    "marginBottom-H4-markdown": "$space-3",
    "marginTop-H5-markdown": "$space-5",
    "marginBottom-H5-markdown": "$space-3",
    "marginTop-H6-markdown": "$space-4",
    "marginBottom-H6-markdown": "$space-2_5",

    "backgroundColor-Admonition-markdown": "$color-primary-100",
    "border-Admonition-markdown": "1px solid $color-primary-300",
    "backgroundColor-Admonition-markdown-warning": "$color-warn-100",
    "borderColor-Admonition-markdown-warning": "$color-warn-300",
    "backgroundColor-Admonition-markdown-danger": "$color-danger-100",
    "borderColor-Admonition-markdown-danger": "$color-danger-300",
    "borderRadius-Admonition-markdown": "$space-2",
    "size-icon-Admonition-markdown": "$space-5",
    "paddingLeft-Admonition-markdown": "$space-2",
    "paddingRight-Admonition-markdown": "$space-6",
    "paddingTop-Admonition-markdown": "$space-3",
    "paddingBottom-Admonition-markdown": "$space-2",
    "marginLeft-content-Admonition-markdown": "$space-1_5",
    "marginTop-Admonition-markdown": "$space-6",
    "marginBottom-Admonition-markdown": "$space-6",

    "marginTop-Blockquote-markdown": "$space-6",
    "marginBottom-Blockquote-markdown": "$space-6",
    "paddingHorizontal-Blockquote-markdown": "$space-6",
    "paddingTop-Blockquote-markdown": "$space-3",
    "paddingBottom-Blockquote-markdown": "$space-2_5",
    "backgroundColor-Blockquote-markdown": "$color-surface-100",
    "width-accent-Blockquote-markdown": "3px",
    "color-accent-Blockquote-markdown": "$color-surface-500",

    "border-Table-markdown": "1px solid $borderColor",
    "textColor-Thead-markdown": "$color-surface-500",
    "backgroundColor-Thead-markdown": "$color-surface-100",
    "textTransform-Thead-markdown": "uppercase",
    "fontWeight-Thead-markdown": "$fontWeight-bold",
    "padding-Th-markdown": "$space-2",
    "fontSize-Th-markdown": "$fontSize-sm",

    "marginLeft-Ul-markdown": "$space-8",
    "marginRight-Ul-markdown": "$space-0",
    "marginTop-Ul-markdown": "$space-2_5",
    "marginBottom-Ul-markdown": "$space-5",
    "marginLeft-Ol-markdown": "$space-8",
    "marginRight-Ol-markdown": "$space-0",
    "marginTop-Ol-markdown": "$space-2_5",
    "marginBottom-Ol-markdown": "$space-5",
    "marginTop-Li-markdown": "$space-2_5",
    "marginBottom-Li-markdown": "$space-2_5",

    "marginTop-Image-markdown": "$space-6",
    "marginBottom-Image-markdown": "$space-6",
    "marginLeft-Image-markdown": "$space-0",
    "marginRight-Image-markdown": "$space-0",

    "marginTop-Text-markdown": "$space-3",
    "marginBottom-Text-markdown": "$space-6",
    "fontSize-Text-markdown": "$fontSize",
    "fontWeight-Text-markdown": "fontWeight-Text",

    "borderColor-HorizontalRule-markdown": "$borderColor",
    "borderStyle-HorizontalRule-markdown": "solid",
    "borderWidth-HorizontalRule-markdown": "2px",

    light: {
      // --- No light-specific theme vars
    },
    dark: {
      "backgroundColor-Blockquote-markdown": "$color-surface-50",
      "backgroundColor-Admonition-markdown": "$color-primary-200",
    },
  },
});

export const markdownComponentRenderer = createComponentRenderer(
  COMP,
  MarkdownMd,
  ({ node, extractValue, renderChild, className }) => {
    let renderedChildren = "";

    // 1. Static content prop fallback
    if (!renderedChildren) {
      renderedChildren = extractValue.asString(node.props.content);
    }

    // 2. "data" property fallback
    if (!renderedChildren && typeof (node.props as any).data === "string") {
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
        className={className}
        removeIndents={extractValue.asOptionalBoolean(node.props.removeIndents, true)}
        removeBr={extractValue.asOptionalBoolean(node.props.removeBr, false)}
        codeHighlighter={extractValue(node.props.codeHighlighter)}
        extractValue={extractValue}
        showHeadingAnchors={extractValue.asOptionalBoolean(node.props.showHeadingAnchors)}
        grayscale={extractValue.asOptionalBoolean(node.props.grayscale)}
        truncateLinks={extractValue.asOptionalBoolean(node.props.truncateLinks)}
        openLinkInNewTab={extractValue.asOptionalBoolean(node.props.openLinkInNewTab)}
        overflowMode={extractValue(node.props.overflowMode) as OverflowMode | undefined}
        breakMode={extractValue(node.props.breakMode) as BreakMode | undefined}
      >
        {renderedChildren}
      </TransformedMarkdown>
    );
  },
);

type TransformedMarkdownProps = {
  children: React.ReactNode;
  removeIndents?: boolean;
  removeBr?: boolean;
  className?: string;
  extractValue: ValueExtractor;
  codeHighlighter?: CodeHighlighter;
  showHeadingAnchors?: boolean;
  grayscale?: boolean;
  truncateLinks?: boolean;
  openLinkInNewTab?: boolean;
  overflowMode?: OverflowMode;
  breakMode?: BreakMode;
};

const TransformedMarkdown = forwardRef<HTMLDivElement, TransformedMarkdownProps>(
  (
    {
      children,
      removeIndents,
      removeBr,
      className,
      extractValue,
      codeHighlighter,
      showHeadingAnchors,
      grayscale,
      truncateLinks,
      openLinkInNewTab,
      overflowMode,
      breakMode,
    }: TransformedMarkdownProps,
    ref,
  ) => {
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

      while (true) {
        const nextTreeDisplay = observeTreeDisplay(resolvedMd);
        if (!nextTreeDisplay) break;
        resolvedMd =
          resolvedMd.slice(0, nextTreeDisplay[0]) +
          convertTreeDisplayToMarkdown(nextTreeDisplay[2]) +
          resolvedMd.slice(nextTreeDisplay[1]);
      }

      resolvedMd = parseBindingExpression(resolvedMd, extractValue);
      return resolvedMd;
    }, [children, extractValue]);

    return (
      <Markdown
        ref={ref}
        removeIndents={removeIndents}
        removeBr={removeBr}
        codeHighlighter={codeHighlighter}
        className={className}
        showHeadingAnchors={showHeadingAnchors}
        grayscale={grayscale}
        truncateLinks={truncateLinks}
        openLinkInNewTab={openLinkInNewTab}
        overflowMode={overflowMode}
        breakMode={breakMode}
      >
        {markdownContent}
      </Markdown>
    );
  },
);

export { Markdown } from "./MarkdownNative";

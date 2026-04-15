import React, {
  type CSSProperties,
  forwardRef,
  memo,
  type ReactNode,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import styles from "./Markdown.module.scss";

import { ThemedHeading as Heading } from "../Heading/Heading";
import { ThemedText as Text } from "../Text/Text";
import { ThemedLinkNative as LinkNative } from "../Link/Link";
import { Toggle } from "../Toggle/Toggle";
import {
  type CodeHighlighter,
  isCodeHighlighter,
  parseMetaAndHighlightCode,
} from "../CodeBlock/highlight-code";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useAppContext } from "../../components-core/AppContext";
import { ThemedCodeBlock as CodeBlock } from "../CodeBlock/CodeBlock";
import { markdownCodeBlockParser } from "../CodeBlock/CodeBlockReact";
import classnames from "classnames";
import { ThemedIcon } from "../Icon/Icon";
import { ThemedTreeDisplay as TreeDisplay } from "../TreeDisplay/TreeDisplay";
import { visit } from "unist-util-visit";
import type { Node, Parent } from "unist";
import { ThemedExpandableItem as ExpandableItem } from "../ExpandableItem/ExpandableItem";
import NestedAppAndCodeViewNative from "../NestedApp/AppWithCodeViewNative";
import { CodeText } from "./CodeText";
import { decodeFromBase64 } from "../../components-core/utils/base64-utils";

// ---------------------------------------------------------------------------
// Module-level helpers — defined outside any component so their references
// are stable for the entire session (no new allocation on each render).
// Neither of these closes over any component state.
// ---------------------------------------------------------------------------

function getImageKey(node: any): string {
  return `${node?.position?.start?.offset}|${node?.position?.end?.offset}`;
}

/** Rehype plugin that unwraps a samp playground element from its surrounding <p> tag. */
const preventPlaygroundParagraphWrap = () => {
  return function transformer(tree: Node) {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== "p" || !node.children || !Array.isArray(node.children)) {
        return;
      }
      const nonEmptySiblings = node.children.filter((child: any) => {
        return !(child.type === "text" && /^\s*$/.test(child.value));
      });
      if (
        nonEmptySiblings.length === 1 &&
        nonEmptySiblings[0].type === "element" &&
        nonEmptySiblings[0].tagName === "samp" &&
        nonEmptySiblings[0].properties?.["data-pg-content"]
      ) {
        const sampElement = nonEmptySiblings[0];
        if (parent && parent.children && Array.isArray(parent.children) && typeof index === "number") {
          parent.children.splice(index, 1, sampElement);
        }
        return index;
      }
    });
  };
};

/** Stable rehype plugin array — same reference across all Markdown renders. */
const stableRehypePlugins = [rehypeRaw, preventPlaygroundParagraphWrap];

/**
 * Stable component for rendering xmlui-pg playground elements inside Markdown.
 * Defined at module level so its identity never changes across renders.
 */
function PlaygroundSampRenderer(props: any) {
  const _renderCount = useRef(0);
  _renderCount.current++;

  const markdownContentBase64 = props?.["data-pg-markdown"];
  const markdownContent = markdownContentBase64
    ? decodeFromBase64(markdownContentBase64)
    : "";
  const dataContentBase64 = props?.["data-pg-content"];
  const jsonContent = decodeFromBase64(dataContentBase64);
  const appProps = JSON.parse(jsonContent);
  const content = (
    <NestedAppAndCodeViewNative
      markdown={markdownContent}
      app={appProps.app}
      config={appProps.config}
      components={appProps.components}
      api={appProps.api}
      activeTheme={appProps.activeTheme}
      activeTone={appProps.activeTone}
      title={appProps.name}
      height={appProps.height}
      allowPlaygroundPopup={!appProps.noPopup}
      withFrame={appProps.noFrame ? false : true}
      noHeader={appProps.noHeader ?? false}
      splitView={appProps.splitView ?? false}
      initiallyShowCode={appProps.initiallyShowCode ?? false}
      popOutUrl={appProps.popOutUrl}
      immediate={appProps.immediate}
      withSplashScreen={appProps.withSplashScreen}
    />
  );
  if (appProps.noFrame === true) {
    return <div style={{ height: appProps.height ?? "fit-content" }}>{content}</div>;
  }
  return content;
}
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import type { BreakMode, OverflowMode } from "../abstractions";

// Default props for the Markdown component
export const defaultProps = {
  removeIndents: true,
  removeBr: false,
  overflowMode: undefined as OverflowMode | undefined,
  breakMode: "normal" as BreakMode | undefined,
};

type MarkdownProps = {
  removeIndents?: boolean;
  removeBr?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  codeHighlighter?: CodeHighlighter;
  showHeadingAnchors?: boolean;
  grayscale?: boolean;
  truncateLinks?: boolean;
  openLinkInNewTab?: boolean;
  overflowMode?: OverflowMode;
  breakMode?: BreakMode;
  anchorRenderer?: (anchorId: string, anchorHref: string) => ReactNode;
};

function PreTagComponent({ id, children, codeHighlighter }) {
  // TEMP: After ironing out theming for syntax highlighting, this should be removed
  const { activeThemeTone } = useTheme();
  const appContext = useAppContext();

  let _codeHighlighter = null;
  if (codeHighlighter) {
    _codeHighlighter = codeHighlighter;
  } else if (isCodeHighlighter(appContext?.appGlobals?.codeHighlighter)) {
    _codeHighlighter = appContext.appGlobals.codeHighlighter;
  } else if (typeof window !== "undefined" && isCodeHighlighter((window as any).__xmluiCodeHighlighter)) {
    _codeHighlighter = (window as any).__xmluiCodeHighlighter;
  }

  const defaultCodefence = (
    <CodeBlock>
      <CodeText uid={id}>{children}</CodeText>
    </CodeBlock>
  );

  if (!_codeHighlighter) {
    return defaultCodefence;
  }

  const highlighterResult = parseMetaAndHighlightCode(children, _codeHighlighter, activeThemeTone);
  if (!highlighterResult) {
    return defaultCodefence;
  }

  return (
    <CodeBlock meta={highlighterResult.meta} textToCopy={highlighterResult.codeStr}>
      <CodeText uid={id} dangerouslySetInnerHTML={{ __html: highlighterResult.cleanedHtmlStr }} />
    </CodeBlock>
  );
}

export const Markdown = memo(
  forwardRef<HTMLDivElement, MarkdownProps>(function Markdown(
    {
      removeIndents = defaultProps.removeIndents,
      removeBr = defaultProps.removeBr,
      children,
      style,
      className,
      classes,
      codeHighlighter,
      showHeadingAnchors,
      grayscale,
      truncateLinks,
      openLinkInNewTab,
      overflowMode = defaultProps.overflowMode,
      breakMode = defaultProps.breakMode,
      anchorRenderer,
      ...rest
    }: MarkdownProps,
    ref,
  ) {
    // Determine overflow mode classes based on overflowMode
    const overflowClasses = useMemo(() => {
      const classes: Record<string, boolean> = {};

      // If overflowMode is not explicitly set, use original behavior
      if (!overflowMode) {
        return classes;
      }

      switch (overflowMode) {
        case "none":
          classes[styles.overflowNone] = true;
          break;
        case "scroll":
          classes[styles.overflowScroll] = true;
          break;
        case "ellipsis":
          classes[styles.overflowEllipsis] = true;
          break;
        case "flow":
          classes[styles.overflowFlow] = true;
          break;
      }

      return classes;
    }, [overflowMode]);

    // Determine break mode classes
    const breakClasses = useMemo(() => {
      const classes: Record<string, boolean> = {};

      // Only apply break mode classes if explicitly set (preserves theme variable support)
      if (breakMode) {
        switch (breakMode) {
          case "normal":
            classes[styles.breakNormal] = true;
            break;
          case "word":
            classes[styles.breakWord] = true;
            break;
          case "anywhere":
            classes[styles.breakAnywhere] = true;
            break;
          case "keep":
            classes[styles.breakKeep] = true;
            break;
          case "hyphenate":
            classes[styles.breakHyphenate] = true;
            break;
        }
      }

      return classes;
    }, [breakMode]);

    const imageInfo = useRef(new Map<string, boolean>());
    if (typeof children !== "string") {
      return null;
    }
    children = removeIndents ? removeTextIndents(children) : children;

    // markdownImgParser only reads imageInfo.current (a stable ref) — safe with empty deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const markdownImgParser = useCallback(() => {
      imageInfo.current.clear();
      return function transformer(tree: Node) {
        visit(tree, "image", visitor);
        function visitor(node: any, _: number, parent: Parent | undefined) {
          imageInfo.current.set(
            getImageKey(node),
            parent.type === "paragraph" && parent.children.length > 1,
          );
        }
      };
    }, []);

    // Stable remark plugins array — only changes when markdownImgParser changes (never, with [] deps above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const remarkPlugins = useMemo(
      () => [remarkGfm, markdownCodeBlockParser, markdownImgParser],
      [markdownImgParser],
    );

    return (
      <div
        {...rest}
        ref={ref}
        className={classnames(
          styles.markdownContent,
          { [styles.grayscale]: grayscale },
          { [styles.truncateLinks]: truncateLinks },
          overflowClasses,
          breakClasses,
          classes?.[COMPONENT_PART_KEY],
          className,
        )}
        style={style}
      >
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={stableRehypePlugins}
          components={{
            details({ children, node, ...props }) {
              return (
                <details className={styles.htmlDetails} {...props}>
                  {children}
                </details>
              );
            },
            video({ children, node, ...props }) {
              return (
                <video className={styles.htmlVideo} {...props}>
                  {children}
                </video>
              );
            },
            img({ children, node, ...props }) {
              const src = props?.src;
              const popOut = props?.["data-popout"];
              const alt = props?.alt || "";

              // --- Determine if the image should be inline or block
              let isInline = imageInfo.current.get(getImageKey(node));

              // Apply styling based on whether image should be inline or block
              const imgStyle = {
                ...(props.style || {}),
                display: isInline ? "inline" : "block",
              };

              if (popOut) {
                return (
                  <a href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt={alt} style={imgStyle}>
                      {children}
                    </img>
                  </a>
                );
              } else {
                return (
                  <img
                    src={src}
                    alt={alt}
                    style={imgStyle}
                    {...props}
                    className={classnames({ [styles.image]: !isInline })}
                  >
                    {children}
                  </img>
                );
              }
            },
            h1({ children }) {
              const { label, uid } = removeGeneratedAnchorSuffix(children);
              return <Heading className={className} level="h1" uid={uid} showAnchor={showHeadingAnchors} anchorRenderer={anchorRenderer}>{label}</Heading>;
            },
            h2({ children }) {
              const { label, uid } = removeGeneratedAnchorSuffix(children);
              return <Heading className={className} level="h2" uid={uid} showAnchor={showHeadingAnchors} anchorRenderer={anchorRenderer}>{label}</Heading>;
            },
            h3({ children }) {
              const { label, uid } = removeGeneratedAnchorSuffix(children);
              return <Heading className={className} level="h3" uid={uid} showAnchor={showHeadingAnchors} anchorRenderer={anchorRenderer}>{label}</Heading>;
            },
            h4({ children }) {
              const { label, uid } = removeGeneratedAnchorSuffix(children);
              return <Heading className={className} level="h4" uid={uid} showAnchor={showHeadingAnchors} anchorRenderer={anchorRenderer}>{label}</Heading>;
            },
            h5({ children }) {
              const { label, uid } = removeGeneratedAnchorSuffix(children);
              return <Heading className={className} level="h5" uid={uid} showAnchor={showHeadingAnchors} anchorRenderer={anchorRenderer}>{label}</Heading>;
            },
            h6({ children }) {
              const { label, uid } = removeGeneratedAnchorSuffix(children);
              return <Heading className={className} level="h6" uid={uid} showAnchor={showHeadingAnchors} anchorRenderer={anchorRenderer}>{label}</Heading>;
            },
            p({ id, children, node }) {
              // Check if this paragraph contains a samp element (xmlui-pg playground)
              // If so, render the children directly without the paragraph wrapper
              if ((node as any)?.children?.[0]?.tagName === "samp") {
                return <>{children}</>;
              }

              return (
                <Text variant="paragraph" className={classnames(styles.markdown, className)} uid={id}>
                  {children}
                </Text>
              );
            },
            code({ id, children }) {
              return (
                <Text uid={id} className={className} variant="code">
                  {children}
                </Text>
              );
            },
            pre({ id, children }) {
              return (
                <PreTagComponent id={id} codeHighlighter={codeHighlighter}>
                  {children}
                </PreTagComponent>
              );
            },
            strong({ id, children }) {
              return (
                <Text uid={id} className={className} variant="strong">
                  {children}
                </Text>
              );
            },
            em({ id, children }) {
              return (
                <Text uid={id} className={className} variant="em">
                  {children}
                </Text>
              );
            },
            del({ id, children }) {
              return (
                <Text uid={id} className={className} variant="deleted">
                  {children}
                </Text>
              );
            },
            blockquote({ children }) {
              return <Blockquote>{children}</Blockquote>;
            },
            ol({ children, node, ...props }) {
              return (
                <ol className={styles.htmlOl} {...props}>
                  {children}
                </ol>
              );
            },
            ul({ children, node, ...props }) {
              return (
                <ul className={styles.htmlUl} {...props}>
                  {children}
                </ul>
              );
            },
            li({ children, node, ...props }) {
              return (
                <li className={styles.htmlLi} {...props}>
                  {children}
                </li>
              );
            },
            hr() {
              return <HorizontalRule />;
            },
            br() {
              return removeBr ? null : <br />;
            },

            a({ children, href, ...props }) {
              let target: string | undefined = undefined;
              let label: React.ReactNode = children;

              // --- Extract the optional target
              if (typeof children === "string") {
                // Match a non-escaped pipe followed by target specification
                const match = children.match(
                  /^((?:[^|]|\\\|)*[^\\])\|\s*target\s*=\s*([_a-zA-Z0-9-]+)\s*$/,
                );
                if (match) {
                  // Unescape any escaped pipes in the label
                  label = match[1].trim().replace(/\\\|/g, "|");
                  target = match[2];
                } else {
                  // If no target specification, unescape any escaped pipes in the whole text
                  label = children.replace(/\\\|/g, "|");
                }
              }

              // Use openLinkInNewTab as default if no explicit target is set
              if (!target && openLinkInNewTab) {
                target = "_blank";
              }

              // Detect downloadable files by checking for file extensions
              // Exclude web page extensions that should navigate instead
              if (href) {
                // Remove query parameters and hash fragments
                const pathOnly = href.split("?")[0].split("#")[0];

                // Match file extension pattern: ends with .{2-5 alphanumeric chars}
                const fileExtensionMatch = pathOnly.match(/\.([a-zA-Z0-9]{2,5})$/);

                if (fileExtensionMatch) {
                  const extension = fileExtensionMatch[1].toLowerCase();

                  // Web page extensions that should navigate, not download
                  const navigableExtensions = ["html", "htm", "php", "asp", "aspx", "jsp", "xhtml"];

                  // If it has a file extension and it's not a navigable web page, trigger download
                  if (!navigableExtensions.includes(extension)) {
                    props.download = true;
                  }
                }
              }

              return (
                <LinkNative className={className} to={href} target={target} {...(props as any)}>
                  {label}
                </LinkNative>
              );
            },

            // TODO: somehow get the label from the containing li element
            input({ disabled, checked }) {
              return (
                <Toggle
                  variant="checkbox"
                  readOnly={disabled}
                  value={checked}
                  className={className}
                  /* label={value}
                labelPosition={"right"} */
                />
              );
            },
            table({ children }) {
              return (
                <div className={styles.tableScrollContainer}>
                  <table className={styles.htmlTable}>{children}</table>
                </div>
              );
            },
            tr({ children, ...props }) {
              return (
                <tr className={styles.htmlTr} {...props}>
                  {children}
                </tr>
              );
            },
            td({ children, ...props }) {
              return (
                <td className={styles.htmlTd} {...props}>
                  {children}
                </td>
              );
            },
            th({ children, ...props }) {
              return (
                <th className={styles.htmlTh} {...props}>
                  {children}
                </th>
              );
            },
            thead({ children }) {
              return <thead className={styles.htmlThead}>{children}</thead>;
            },
            tbody({ children }) {
              return <tbody className={styles.htmlTbody}>{children}</tbody>;
            },
            tfoot({ children }) {
              return <tfoot className={styles.htmlTfoot}>{children}</tfoot>;
            },
            samp: PlaygroundSampRenderer,
            section({ children, ...props }) {
              const treeContentBase64 = props?.["data-tree-content"];
              if (treeContentBase64 !== undefined) {
                const content = decodeFromBase64(treeContentBase64);
                return <TreeDisplay content={content} />;
              }
              return null;
            },
            // Handle SVG elements that pass through via rehype-raw
            // These need to be created using React.createElement to avoid warnings about unrecognized tags
            svg: (({ children, ...props }) => {
              const { ref, ...restProps } = props as any;
              return React.createElement("svg", restProps, children);
            }) as any,
            g: (({ children, ...props }) => {
              const { ref, ...restProps } = props as any;
              return React.createElement("g", restProps, children);
            }) as any,
            path: (({ children, ...props }) => {
              const { ref, ...restProps } = props as any;
              return React.createElement("path", restProps, children);
            }) as any,
            rect: (({ children, ...props }) => {
              const { ref, ...restProps } = props as any;
              return React.createElement("rect", restProps, children);
            }) as any,
            ellipse: (({ children, ...props }) => {
              const { ref, ...restProps } = props as any;
              return React.createElement("ellipse", restProps, children);
            }) as any,
            // The <text> element can appear in two contexts:
            // 1. As an SVG <text> element inside SVG diagrams (rare, handled by rehype-raw)
            // 2. As a literal <text> tag in markdown content that passes through rehype-raw
            // We strip the wrapper and just render the children to avoid React warnings
            text: (({ children }) => {
              return <>{children}</>;
            }) as any,
          }}
        >
          {children as any}
        </ReactMarkdown>
      </div>
    );
  }),
);

const HorizontalRule = () => {
  return <hr className={styles.horizontalRule} />;
};

type BlockquoteProps = {
  children: React.ReactNode;
  style?: CSSProperties;
};

const Blockquote = ({ children, style }: BlockquoteProps) => {
  // Helper function to extract text content from React nodes
  const extractTextContent = (node: React.ReactNode): string => {
    if (typeof node === "string") {
      return node;
    }

    if (React.isValidElement(node) && node.props && node.props.children) {
      if (Array.isArray(node.props.children)) {
        return node.props.children.map(extractTextContent).join("");
      }
      return extractTextContent(node.props.children);
    }

    return "";
  };

  // Extract all text content
  const allText: string = React.Children.toArray(children).map(extractTextContent).join("");

  // Check for adornment pattern
  const match = allText.match(/\[!([A-Z]+)\]/);
  const isAdornment = !!match;

  if (isAdornment && match && match[1]) {
    const type = match[1].toLowerCase();

    // Process children to remove the adornment marker
    const processNode = (node: React.ReactNode): React.ReactNode => {
      if (typeof node === "string") {
        return node.replace(/\[!([A-Z]+)\]\s*/, "");
      }

      if (React.isValidElement(node)) {
        // Handle React elements with children
        if (node.props && node.props.children) {
          let newChildren: any;

          if (Array.isArray(node.props.children)) {
            newChildren = node.props.children.map(processNode);
          } else {
            newChildren = processNode(node.props.children);
          }

          return React.cloneElement(node, node.props, newChildren);
        }

        // Element without children, return as is
        return node;
      }

      // Other node types (null, undefined, etc.)
      return node;
    };

    const processedChildren = React.Children.map(children, processNode);

    // Handle [!DETAILS] or [!SDETAILS] adornment
    if (type === "details" || type === "sdetails") {
      // Extract summary from the original text
      const originalText = allText;
      const detailsMatch = originalText.match(/\[!(S?DETAILS)\](.*?)(?:\n|$)/);
      const summaryText = detailsMatch && detailsMatch[2] ? detailsMatch[2].trim() : "Details";
      const withSwitch = type === "sdetails";

      // Create separate content children without the summary line
      // We need to find the first Text element and remove the summary from it
      let contentWithoutSummary = [];
      let foundFirstTextElement = false;

      React.Children.forEach(processedChildren, (child, index) => {
        // Process the first text element to remove the summary line
        if (!foundFirstTextElement && React.isValidElement(child) && child.props?.children) {
          foundFirstTextElement = true;

          // Get the child's text content
          const childText = extractTextContent(child.props.children);

          // Skip the first line which contains the summary
          const lines = childText.split("\n");
          if (lines.length > 1) {
            // Create modified element with remaining content
            const remainingContent = lines.slice(1).join("\n");
            if (remainingContent.trim()) {
              contentWithoutSummary.push(React.cloneElement(child, child.props, remainingContent));
            }
          }
        } else {
          // Keep all other elements unchanged
          contentWithoutSummary.push(child);
        }
      });

      return (
        <ExpandableItem summary={summaryText} withSwitch={withSwitch}>
          {contentWithoutSummary}
        </ExpandableItem>
      );
    }

    const iconMap: Record<string, React.ReactNode> = {
      info: <ThemedIcon name="admonition_info" />,
      warning: <ThemedIcon name="admonition_warning" />,
      danger: <ThemedIcon name="admonition_danger" />,
      note: <ThemedIcon name="admonition_note" />,
      tip: <ThemedIcon name="admonition_tip" />,
      card: null,
      feat: <ThemedIcon name="star" />,
      def: <ThemedIcon name="definition" />,
    };

    // Render adornment blockquote with the updated structure
    return (
      <blockquote
        className={classnames(styles.admonitionBlockquote, {
          [styles.info]: type === "info",
          [styles.warning]: type === "warning",
          [styles.danger]: type === "danger",
          [styles.note]: type === "note",
          [styles.tip]: type === "tip",
          [styles.card]: type === "card",
          [styles.feat]: type === "feat",
          [styles.def]: type === "def",
        })}
        style={style}
      >
        <div className={styles.admonitionContainer}>
          {iconMap[type] !== null && (
            <div className={`${styles.admonitionIcon} ${styles[type] || ""}`}>
              {iconMap[type] || <ThemedIcon name="admonition_info" />}
            </div>
          )}
          <div className={styles.admonitionContent}>{processedChildren}</div>
        </div>
      </blockquote>
    );
  }

  return (
    <blockquote className={styles.blockquote} style={style}>
      <div className={styles.blockquoteContainer}>{children}</div>
    </blockquote>
  );
};

function removeGeneratedAnchorSuffix(children: React.ReactNode): {
  label: React.ReactNode;
  uid?: string;
} {
  const textContent = getHeadingText(children);
  const match = textContent.match(/^(.*)\[#([a-zA-Z0-9-]+)\]\s*$/);

  if (match) {
    const anchor = match[2];
    const anchorText = `[#${anchor}]`;
    const label = removeSuffixFromReactNodes(children, anchorText);
    if (typeof label === "string") {
      const trimmedLabel = label.trim();
      return { label: trimmedLabel === "" ? null : trimmedLabel, uid: anchor };
    } else if (React.isValidElement(label)) {
      const trimmedLabel = getHeadingText(label).trim();
      return { label: trimmedLabel === "" ? null : label, uid: anchor };
    }
    return { label, uid: anchor };
  }

  return { label: children };
}

function removeSuffixFromReactNodes(node: React.ReactNode, suffix: string): React.ReactNode {
  if (!suffix) {
    return node;
  }

  if (typeof node === "string") {
    if (node.endsWith(suffix)) {
      const result = node.slice(0, -suffix.length);
      return result || null;
    }
    return node;
  }

  if (Array.isArray(node)) {
    const newChildren = [...node];
    let suffixRemaining = suffix;

    for (let i = newChildren.length - 1; i >= 0 && suffixRemaining.length > 0; i--) {
      const child = newChildren[i];
      const childText = getHeadingText(child);

      if (suffixRemaining.endsWith(childText)) {
        newChildren[i] = null;
        suffixRemaining = suffixRemaining.slice(0, -childText.length);
      } else {
        newChildren[i] = removeSuffixFromReactNodes(child, suffixRemaining);
        // After this call, the suffix should have been removed from the child, so we are done.
        suffixRemaining = "";
      }
    }

    return newChildren.filter(Boolean);
  }

  if (React.isValidElement(node) && node.props.children) {
    const newChildren = removeSuffixFromReactNodes(node.props.children, suffix);
    return React.cloneElement(node, { ...node.props, children: newChildren });
  }

  return node;
}

function getHeadingText(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(getHeadingText).join("");
  }
  if (React.isValidElement(children) && children.props.children) {
    return getHeadingText(children.props.children);
  }
  return "";
}

function removeTextIndents(input: string): string {
  if (!input) {
    return "";
  }

  const lines = input.split("\n");

  // Find the shortest starting whitespace length
  const minIndent = lines.reduce((min, line) => {
    const match = line.match(/^\s*/);
    const indentLength = match ? match[0].length : 0;
    return line.trim() ? Math.min(min, indentLength) : min;
  }, Infinity);

  // Remove the shortest starting whitespace length from each line
  const trimmedLines = lines.map((line) =>
    line.startsWith(" ".repeat(minIndent)) ? line.slice(minIndent) : line,
  );

  return trimmedLines.join("\n");
}

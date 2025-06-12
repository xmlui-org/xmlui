import React, { type CSSProperties, memo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import styles from "./Markdown.module.scss";
import htmlTagStyles from "../HtmlTags/HtmlTags.module.scss";

import { Heading } from "../Heading/HeadingNative";
import { Text } from "../Text/TextNative";
import { LinkNative } from "../Link/LinkNative";
import { Toggle } from "../Toggle/Toggle";
import { IndexAwareNestedApp } from "../NestedApp/NestedAppNative";
import {
  type CodeHighlighter,
  isCodeHighlighter,
  parseMetaAndHighlightCode,
} from "../CodeBlock/highlight-code";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useAppContext } from "../../components-core/AppContext";
import { CodeBlock, markdownCodeBlockParser } from "../CodeBlock/CodeBlockNative";
import classnames from "classnames";
import Icon from "../Icon/IconNative";
import { TreeDisplay } from "../TreeDisplay/TreeDisplayNative";
import { visit } from "unist-util-visit";
import type { Node, Parent } from "unist";

type MarkdownProps = {
  removeIndents?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  codeHighlighter?: CodeHighlighter;
  showHeadingAnchors?: boolean;
};

function PreTagComponent({ id, children, codeHighlighter }) {
  // TEMP: After ironing out theming for syntax highlighting, this should be removed
  const { activeThemeTone } = useTheme();
  const { appGlobals } = useAppContext();

  let _codeHighlighter = null;
  if (codeHighlighter) {
    _codeHighlighter = codeHighlighter;
  } else {
    _codeHighlighter = isCodeHighlighter(appGlobals.codeHighlighter)
      ? appGlobals.codeHighlighter
      : null;
  }

  const defaultCodefence = (
    <CodeBlock>
      <Text uid={id} variant="codefence">
        {children}
      </Text>
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
      <Text
        uid={id}
        variant="codefence"
        syntaxHighlightClasses={highlighterResult.classNames}
        dangerouslySetInnerHTML={{ __html: highlighterResult.cleanedHtmlStr }}
      />
    </CodeBlock>
  );
}

export const Markdown = memo(function Markdown({
  removeIndents = true,
  children,
  style,
  codeHighlighter,
  showHeadingAnchors = false,
}: MarkdownProps) {
  if (typeof children !== "string") {
    return null;
  }
  children = removeIndents ? removeTextIndents(children) : children;

  const classifyImages = new Map<string, boolean>();
  const markdownImgParser = () => {
    classifyImages.clear();
    return function transformer(tree: Node) {
      visit(tree, "image", visitor);
    };

    function visitor(node: any, _: number, parent: Parent | undefined) {
      const imgKey = `${node?.position?.start?.offset}|${node?.position?.end?.offset}`;

      // --- Store if this image is inline (true) or block (false)
      classifyImages.set(imgKey, parent.type === "paragraph" && parent.children.length > 1);
    }
  };

  return (
    <div className={styles.markdownContent} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, markdownCodeBlockParser, markdownImgParser]}
        rehypePlugins={[rehypeRaw]}
        components={{
          details({ children, node, ...props }) {
            return (
              <details className={htmlTagStyles.htmlDetails} {...props}>
                {children}
              </details>
            );
          },
          video({ children, node, ...props }) {
            return (
              <video className={htmlTagStyles.htmlVideo} {...props}>
                {children}
              </video>
            );
          },
          img({ children, node, ...props }) {
            console.log("img", node);
            const src = props?.src;
            const popOut = props?.["data-popout"];
            const alt = props?.alt || "";

            // --- Determine if the image should be inline or block
            let isInline = classifyImages.get(
              `${node?.position?.start?.offset}|${node?.position?.end?.offset}`,
            );

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
                  className={classnames({ [styles.block]: !isInline })}
                >
                  {children}
                </img>
              );
            }
          },
          h1({ children }) {
            return (
              <LinkAwareHeading level="h1" showHeadingAnchors={showHeadingAnchors}>
                {children}
              </LinkAwareHeading>
            );
          },
          h2({ children }) {
            return (
              <LinkAwareHeading level="h2" showHeadingAnchors={showHeadingAnchors}>
                {children}
              </LinkAwareHeading>
            );
          },
          h3({ children }) {
            return (
              <LinkAwareHeading level="h3" showHeadingAnchors={showHeadingAnchors}>
                {children}
              </LinkAwareHeading>
            );
          },
          h4({ children }) {
            return (
              <LinkAwareHeading level="h4" showHeadingAnchors={showHeadingAnchors}>
                {children}
              </LinkAwareHeading>
            );
          },
          h5({ children }) {
            return (
              <LinkAwareHeading level="h5" showHeadingAnchors={showHeadingAnchors}>
                {children}
              </LinkAwareHeading>
            );
          },
          h6({ children }) {
            return (
              <LinkAwareHeading level="h6" showHeadingAnchors={showHeadingAnchors}>
                {children}
              </LinkAwareHeading>
            );
          },
          p({ id, children }) {
            return (
              <Text uid={id} variant="markdown">
                {children}
              </Text>
            );
          },
          code({ id, children }) {
            return (
              <Text uid={id} variant="code">
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
              <Text uid={id} variant="strong">
                {children}
              </Text>
            );
          },
          em({ id, children }) {
            return (
              <Text uid={id} variant="em">
                {children}
              </Text>
            );
          },
          del({ id, children }) {
            return (
              <Text uid={id} variant="deleted">
                {children}
              </Text>
            );
          },
          blockquote({ children }) {
            return <Blockquote>{children}</Blockquote>;
          },
          ol({ children, node, ...props }) {
            return (
              <ol className={htmlTagStyles.htmlOl} {...props}>
                {children}
              </ol>
            );
          },
          ul({ children, node, ...props }) {
            return (
              <ul className={htmlTagStyles.htmlUl} {...props}>
                {children}
              </ul>
            );
          },
          li({ children, node, ...props }) {
            return (
              <li className={htmlTagStyles.htmlLi} {...props}>
                <Text>{children}</Text>
              </li>
            );
          },
          hr() {
            return <HorizontalRule />;
          },

          a({ children, href, ...props }) {
            let target: string | undefined = undefined;
            let label: React.ReactNode = children;

            // --- Extract the optional target
            if (typeof children === "string") {
              const match = children.match(/^(.*)\|\s*target\s*=\s*([_a-zA-Z0-9-]+)\s*$/);
              if (match) {
                label = match[1].trim();
                target = match[2];
              }
            }

            return (
              <LinkNative to={href} target={target} {...(props as any)}>
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
                /* label={value}
                labelPosition={"right"} */
              />
            );
          },
          table({ children }) {
            return (
              <div className={styles.tableScrollContainer}>
                <table className={htmlTagStyles.htmlTable}>{children}</table>
              </div>
            );
          },
          tr({ children }) {
            return <tr className={htmlTagStyles.htmlTr}>{children}</tr>;
          },
          td({ children }) {
            return <td className={htmlTagStyles.htmlTd}>{children}</td>;
          },
          th({ children }) {
            return <th className={htmlTagStyles.htmlTh}>{children}</th>;
          },
          thead({ children }) {
            return <thead className={htmlTagStyles.htmlThead}>{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className={htmlTagStyles.htmlTbody}>{children}</tbody>;
          },
          tfoot({ children }) {
            return <tfoot className={htmlTagStyles.htmlTfoot}>{children}</tfoot>;
          },
          samp({ ...props }) {
            const nestedProps = props as any;
            const dataContentBase64 = props?.["data-pg-content"];
            if (dataContentBase64 !== undefined) {
              const jsonContent = atob(dataContentBase64);
              const appProps = JSON.parse(jsonContent);
              return (
                <IndexAwareNestedApp
                  app={appProps.app}
                  config={appProps.config}
                  components={appProps.components}
                  api={appProps.api}
                  activeTheme={appProps.activeTheme}
                  activeTone={appProps.activeTone}
                  title={appProps.name}
                  height={appProps.height}
                  allowPlaygroundPopup={!appProps.noPopup}
                />
              );
            }
            return (
              <IndexAwareNestedApp
                app={nestedProps.app}
                config={nestedProps.config}
                components={nestedProps.components}
                api={nestedProps.api}
                activeTheme={nestedProps.activeTheme}
                activeTone={nestedProps.activeTone}
                title={nestedProps.title}
                height={nestedProps.height}
                allowPlaygroundPopup={true}
              />
            );
          },
          section({ children, ...props }) {
            const treeContentBase64 = props?.["data-tree-content"];
            if (treeContentBase64 !== undefined) {
              const content = atob(treeContentBase64);
              return <TreeDisplay content={content} itemHeight={24} />;
            }
            return null;
          },
        }}
      >
        {children as any}
      </ReactMarkdown>
    </div>
  );
});

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

  // Check for admonition pattern
  const match = allText.match(/\[!([A-Z]+)\]/);
  const isAdmonition = !!match;

  if (isAdmonition && match && match[1]) {
    const type = match[1].toLowerCase();

    const iconMap: Record<string, React.ReactNode> = {
      info: <Icon name="admonition_info" />,
      warning: <Icon name="admonition_warning" />,
      danger: <Icon name="admonition_danger" />,
      note: <Icon name="admonition_note" />,
      tip: <Icon name="admonition_tip" />,
    };

    // Process children to remove the admonition marker
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

    // Render admonition blockquote with the updated structure
    return (
      <blockquote
        className={classnames(styles.admonitionBlockquote, {
          [styles.info]: type === "info",
          [styles.warning]: type === "warning",
          [styles.danger]: type === "danger",
          [styles.note]: type === "note",
          [styles.tip]: type === "tip",
        })}
        style={style}
      >
        <div className={styles.admonitionContainer}>
          <div className={`${styles.admonitionIcon} ${styles[type] || ""}`}>
            {iconMap[type] || <Icon name="admonition_info" />}
          </div>
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

type OrderedListProps = {
  children: React.ReactNode;
  style?: CSSProperties;
};

const OrderedList = ({ children, style }: OrderedListProps) => {
  return (
    <ol className={styles.orderedList} style={style}>
      {children}
    </ol>
  );
};

type ListItemProps = {
  children: React.ReactNode;
  style?: CSSProperties;
};

const ListItem = ({ children, style }: ListItemProps) => {
  return (
    <li className={styles.listItem} style={style}>
      {children}
    </li>
  );
};

type LinkAwareHeadingProps = {
  children: React.ReactNode;
  level: string;
  showHeadingAnchors?: boolean;
};

function LinkAwareHeading({ children, level, showHeadingAnchors }: LinkAwareHeadingProps) {
  let headingLabel: React.ReactNode = "";
  let anchorId = "";
  if (!children) return <></>;

  if (typeof children === "string") {
    [headingLabel, anchorId] = getCustomAnchor(children);
    // At this point, the anchorId might still be empty
  } else if (Array.isArray(children)) {
    if (children.length === 0) return <></>;
    if (children.length === 1) {
      headingLabel = children[0];
    } else {
      headingLabel = children.slice(0, -1);
      const last = children[children.length - 1];

      // Check for explicit anchor at the end
      if (typeof last === "string") {
        const match = last.trim().match(/^\[#([^\]]+)\]$/);
        if (match && match.length > 0) {
          anchorId = match[1];
        }
      }
    }
  } else {
    // Provided children are not a string or array but still valid React elements
    // if it contains text, use it as the heading label
    const headingContent = extractTextNodes(children);
    if (!headingContent) return <></>;
    headingLabel = children;
  }

  // Generate implicit anchor if not provided
  if (!anchorId) {
    anchorId = headingToAnchorLink(extractTextNodes(headingLabel));
  }

  return (
    <Heading level={level} id={anchorId} showAnchor={showHeadingAnchors}>
      {headingLabel}
    </Heading>
  );
}

// --- Helper functions

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

function getCustomAnchor(value: string): [string, string] {
  if (!value) {
    return ["", ""];
  }

  // --- Match the pattern: "Heading text [#anchor]"
  const match = value.match(/^(.*?)\s*\[#([^\]]+)\]$/);

  if (match) {
    const headingLabel = match[1].trim(); // Extract the heading text
    const anchorId = match[2].trim(); // Extract the anchor ID
    return [headingLabel, anchorId];
  }

  // If no match, return the full value as the heading label and an empty anchor ID
  return [value.trim(), ""];
}

function headingToAnchorLink(rawStr: string) {
  return (
    rawStr
      .trim()
      .toLocaleLowerCase()
      // replace all non-alphanumeric characters with hyphens
      .replaceAll(/[^A-Za-z0-9-]/g, "-")
      // remove multiple hyphens
      .replaceAll(/--+/g, "-")
      // remove leading and trailing hyphens
      .replace(/^-|-$/, "")
      // remove backticks
      .replace(/`/g, "")
      // remove parentheses
      .replace(/"|'/g, "")
  );
}

function extractTextNodes(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return node.toString();
  if (React.isValidElement(node) && node.props && node.props.children) {
    if (Array.isArray(node.props.children)) {
      return node.props.children.map(extractTextNodes).join("");
    }
    return extractTextNodes(node.props.children);
  }
  return "";
}

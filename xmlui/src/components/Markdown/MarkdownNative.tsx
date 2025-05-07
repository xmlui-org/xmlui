import { type CSSProperties, memo, type ReactNode } from "react";
import React from "react";
import { MarkdownHooks } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";
import type { Node, Parent } from "unist";

import styles from "./Markdown.module.scss";
import htmlTagStyles from "../HtmlTags/HtmlTags.module.scss";

import { Heading } from "../Heading/HeadingNative";
import { Text } from "../Text/TextNative";
import { LocalLink } from "../Link/LinkNative";
import { Toggle } from "../Toggle/Toggle";
import { NestedApp } from "../NestedApp/NestedAppNative";
import {
  type CodeHighlighter,
  type CodeHighlighterMeta,
  parseMetaAndHighlightCode,
} from "./highlight-code";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { Button } from "../Button/ButtonNative";
import Icon from "../Icon/IconNative";
import toast from "react-hot-toast";

type MarkdownProps = {
  removeIndents?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  codeHighlighter?: CodeHighlighter;
};

export const Markdown = memo(function Markdown({
  removeIndents = true,
  children,
  style,
  codeHighlighter,
}: MarkdownProps) {
  // TEMP: After ironing out theming for syntax highlighting, this should be removed
  const { activeThemeTone } = useTheme();
  if (typeof children !== "string") {
    return null;
  }

  children = removeIndents ? removeTextIndents(children) : children;

  return (
    <div className={styles.markdownContent} style={{ ...style }}>
      <MarkdownHooks
        remarkPlugins={[remarkGfm, codeBlockParser]}
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
            const src = props?.src;
            const popOut = props?.["data-popout"];
            if (popOut) {
              return (
                <a href={src} target="_blank" rel="noreferrer">
                  <img className={htmlTagStyles.htmlImage} {...props}>
                    {children}
                  </img>
                </a>
              );
            } else {
              return (
                <img className={htmlTagStyles.htmlImage} {...props}>
                  {children}
                </img>
              );
            }
          },
          h1({ children }) {
            return <Heading level="h1">{children}</Heading>;
          },
          h2({ children }) {
            return <Heading level="h2">{children}</Heading>;
          },
          h3({ children }) {
            return <Heading level="h3">{children}</Heading>;
          },
          h4({ children }) {
            return <Heading level="h4">{children}</Heading>;
          },
          h5({ children }) {
            return <Heading level="h5">{children}</Heading>;
          },
          h6({ children }) {
            return <Heading level="h6">{children}</Heading>;
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
            const defaultCodefence = (
              <CodeBlock>
                <Text uid={id} variant="codefence">
                  {children}
                </Text>
              </CodeBlock>
            );

            if (!codeHighlighter) {
              return defaultCodefence;
            }

            const highlighterResult = parseMetaAndHighlightCode(
              children,
              codeHighlighter,
              activeThemeTone,
            );
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
            return (
              <LocalLink to={href} {...(props as any)}>
                {children}
              </LocalLink>
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
            return <table className={htmlTagStyles.htmlTable}>{children}</table>;
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
                <NestedApp
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
              <NestedApp
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
        }}
      >
        {children as any}
      </MarkdownHooks>
    </div>
  );
});

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
  const allText = React.Children.toArray(children).map(extractTextContent).join("");

  // Check for admonition pattern
  const match = allText.match(/\[!([A-Z]+)\]/);
  const isAdmonition = !!match;

  if (isAdmonition && match && match[1]) {
    const type = match[1].toLowerCase();

    // Map admonition type to emoji
    const emojiMap: Record<string, string> = {
      info: "💡",
      warning: "⚠️",
      danger: "🚫",
      note: "📝",
      tip: "💬",
    };

    // Process children to remove the admonition marker
    const processNode = (node: React.ReactNode): React.ReactNode => {
      if (typeof node === "string") {
        return node.replace(/\[!([A-Z]+)\]\s*/, "");
      }

      if (React.isValidElement(node)) {
        // Handle React elements with children
        if (node.props && node.props.children) {
          let newChildren;

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
      <blockquote className={styles.admonitionBlockquote} style={style}>
        <div className={styles.admonitionContainer}>
          <div className={`${styles.admonitionIcon} ${styles[type] || ""}`}>
            {emojiMap[type] || "💡"}
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

type UnorderedListProps = {
  children: React.ReactNode;
  style?: CSSProperties;
};

const UnorderedList = ({ children, style }: UnorderedListProps) => {
  return (
    <ul className={styles.unorderedList} style={style}>
      {children}
    </ul>
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

type CodeBlockProps = {
  children?: React.ReactNode;
  textToCopy?: string;
  meta?: CodeHighlighterMeta;
};

function CodeBlock({ children, meta, textToCopy }: CodeBlockProps) {
  if (!meta) {
    return <div className={styles.codeBlock}>{children}</div>;
  }
  return (
    <div className={styles.codeBlock}>
      {meta.filename && (
        <div className={styles.codeBlockHeader}>
          <Text variant="em">
            <Text variant="strong">Filename:</Text> {meta.filename}
          </Text>
        </div>
      )}
      <div className={styles.codeBlockCopyWrapper}>
        {children}
        <div className={styles.codeBlockCopyButton}>
          <Button
            variant="ghost"
            themeColor="secondary"
            size="sm"
            icon={<Icon name={"copy"} aria-hidden />}
            onClick={() => {
              if (!textToCopy) return;
              navigator.clipboard.writeText(textToCopy);
              toast.success("Code copied!");
            }}
          ></Button>
        </div>
      </div>
    </div>
  );
}

interface CodeNode extends Node {
  lang: string | null;
  meta: string | null;
}

function codeBlockParser() {
  return function transformer(tree: Node) {
    visit(tree, "code", visitor);
  };

  function visitor(node: CodeNode, _: number, parent: Parent | undefined) {
    const { lang, meta } = node;
    const nodeData = { hProperties: {} };
    if (lang !== null) {
      nodeData.hProperties["dataLanguage"] = lang;
      node.data = nodeData;
    }
    if (!parent) return;
    if (!meta) return;

    const params = splitter(meta)
      ?.filter((s) => s !== "")
      .map((s) => s.trim());
    if (!params) return;
    if (params.length === 0) return;

    const parsedMeta = params.reduce(
      (acc, item) => {
        item = item.trim();
        if (item === "") return acc;
        if (item.indexOf("=") === -1) {
          if (item.startsWith("/") && item.endsWith("/")) {
            acc["dataHighlightSubstrings"] = item.substring(1, item.length - 1);
          }
          if (item.startsWith("{") && !item.endsWith("}")) {
            acc["dataHighlightRows"] = item.substring(1, item.length - 1);
          }
          if (item === "copy") {
            acc["dataCopy"] = "true";
          }
          if (item === "rowNumbers") {
            acc["dataRowNumbers"] = "true";
          }
          return acc;
        }
        const index = item.indexOf("=");
        if (item.substring(0, index) !== "filename") return acc;
        acc["dataFilename"] = item
          .substring(index + 1)
          .replace(/"(.+)"/, "$1")
          .replace(/'(.+)'/, "$1");
        return acc;
      },
      {} as Record<string, string>,
    );
    nodeData.hProperties = { ...nodeData.hProperties, ...parsedMeta };
    node.data = nodeData;
  }

  function splitter(str: string): string[] | null {
    return str.match(/(?:[^\s"']+|("|')[^"']*("|'))+/g);
  }
}

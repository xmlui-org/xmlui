import { type CSSProperties, memo, type ReactNode } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";

import styles from "./Markdown.module.scss";
import htmlTagStyles from "../HtmlTags/HtmlTags.module.scss";

import { Heading } from "../Heading/HeadingNative";
import { Text } from "../Text/TextNative";
import { LocalLink } from "../Link/LinkNative";
import { Image } from "../Image/ImageNative";
import { Toggle } from "../Toggle/Toggle";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { T_ARROW_EXPRESSION } from "../../abstractions/scripting/ScriptingSourceTree";

type MarkdownProps = {
  extractValue: ValueExtractor;
  removeIndents?: boolean;
  children: ReactNode;
  style?: CSSProperties;
};

export const Markdown = memo(function Markdown({
  extractValue,
  removeIndents = true,
  children,
  style,
}: MarkdownProps) {
  if (typeof children !== "string") {
    return null;
  }

  children = removeIndents ? removeTextIndents(children) : children;

  return (
    <div className={styles.markdownContent} style={{ ...style }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [bindingExpression, { extractValue }]]}
        rehypePlugins={[rehypeRaw]}
        components={{
          details({ children, node, ...props }) {
            return <details className={htmlTagStyles.htmlDetails} {...props} >{children}</details>;
          },
          video({ children, node, ...props }) {
            return <video className={htmlTagStyles.htmlVideo} {...props} >{children}</video>;
          },
          img({ children, node, ...props }) {
            return <img className={htmlTagStyles.htmlImage} {...props} >{children}</img>;
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
            return (
              <Text uid={id} variant="codefence">
                {children}
              </Text>
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
            return <ol className={htmlTagStyles.htmlOl} {...props} >{children}</ol>;
          },
          ul({ children, node, ...props }) {
            return <ul className={htmlTagStyles.htmlUl} {...props} >{children}</ul>;
          },
          li({ children, node, ...props }) {
            return <li className={htmlTagStyles.htmlLi} {...props} >{children}</li>;
          },
          hr() {
            return <HorizontalRule />;
          },

          a({ children, href, ...props }) {
            const allowedProps = ['style', 'disabled', 'active', 'icon', 'onClick'];
            return (
              <LocalLink to={href} {...allowedProps}>
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
        }}
      >
        {children as any}
      </ReactMarkdown>
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
    if (typeof node === 'string') {
      return node;
    }

    if (React.isValidElement(node) && node.props && node.props.children) {
      if (Array.isArray(node.props.children)) {
        return node.props.children.map(extractTextContent).join('');
      }
      return extractTextContent(node.props.children);
    }

    return '';
  };

  // Extract all text content
  const allText = React.Children.toArray(children).map(extractTextContent).join('');

  // Check for admonition pattern
  const match = allText.match(/\[!([A-Z]+)\]/);
  const isAdmonition = !!match;

  if (isAdmonition && match && match[1]) {
    const type = match[1].toLowerCase();

    // Map admonition type to emoji
    const emojiMap: Record<string, string> = {
      info: '💡',
      warning: '⚠️',
      danger: '🚫',
      note: '📝',
      tip: '💬'
    };

    // Process children to remove the admonition marker
    const processNode = (node: React.ReactNode): React.ReactNode => {
      if (typeof node === 'string') {
        return node.replace(/\[!([A-Z]+)\]\s*/, '');
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
          <div className={`${styles.admonitionIcon} ${styles[type] || ''}`}>
            {emojiMap[type] || '💡'}
          </div>
          <div className={styles.admonitionContent}>
            {processedChildren}
          </div>
        </div>
      </blockquote>
    );
  }

  return (
    <blockquote className={styles.blockquote} style={style}>
      <div className={styles.blockquoteContainer}>
        {children}
      </div>
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

/**
 * Finds and evaluates given binding expressions in markdown text.
 * The binding expressions are of the form `${...}$`.
 * @param extractValue The function to resolve binding expressions
 * @returns visitor function that processes the binding expressions
 */
function bindingExpression({ extractValue }: { extractValue: ValueExtractor }) {
  return (tree: any) => {
    visit(tree, "text", (node) => {
      return detectBindingExpression(node);
    });
  };

  function detectBindingExpression(node: any) {
    // Remove empty ${} expressions first
    node.value = node.value.replace(/\$\{\s*\}/g, "");

    const regex = /\$\{((?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*)\}/g;
    const parts: string[] = node.value.split(regex);
    if (parts.length > 1) {
      node.type = "html";
      node.value = parts
        .map((part, index) => {
          const extracted = index % 2 === 0 ? part : extractValue(`{${part}}`);
          const resultExpr = mapByType(extracted);
          // The result expression might be an object, in that case we stringify it here,
          // at the last step, so that there are no unnecessary apostrophes
          return typeof resultExpr === "object" && resultExpr !== null
            ? JSON.stringify(resultExpr)
            : resultExpr;
        })
        .join("");
    }
  }

  function mapByType(extracted: any) {
    if (extracted === null) {
      return null;
    } else if (extracted === undefined || typeof extracted === "undefined") {
      return undefined;
    } else if (typeof extracted === "object") {
      const arrowFuncResult = parseArrowFunc(extracted);
      if (arrowFuncResult) {
        return arrowFuncResult;
      }
      if (Array.isArray(extracted)) {
        return extracted;
      }
      return Object.fromEntries(
        Object.entries(extracted).map(([key, value]) => {
          return [key, mapByType(value)];
        }),
      );
    } else {
      return extracted;
    }
  }

  function parseArrowFunc(extracted: Record<string, any>): string {
    if (
      extracted.hasOwnProperty("type") &&
      extracted.type === T_ARROW_EXPRESSION &&
      extracted?._ARROW_EXPR_
    ) {
      return "[xmlui function]";
    }
    return "";
  }
}

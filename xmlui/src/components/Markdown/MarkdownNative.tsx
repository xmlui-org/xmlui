import { type CSSProperties, memo, type ReactNode } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

import styles from "./Markdown.module.scss";
import htmlTagStyles from "../HtmlTags/HtmlTags.module.scss";

import { Text } from "../Text/TextNative";
import { LocalLink } from "../Link/LinkNative";
import { Image } from "../Image/ImageNative";
import { Toggle } from "../Toggle/Toggle";
import type { ValueExtractor } from "../../abstractions/RendererDefs";

type MarkdownProps = {
  extractValue: ValueExtractor;
  removeIndents?: boolean;
  children: ReactNode;
  style?: CSSProperties;
};

export const defaultProps: Pick<MarkdownProps, "removeIndents"> = {
  removeIndents: true,
};

export const Markdown = memo(function Markdown({
  extractValue,
  removeIndents = defaultProps.removeIndents,
  children,
  style,
}: MarkdownProps) {
  if (typeof children !== "string") {
    return null;
  }

  const _children = removeIndents ? removeTextIndents(children) : children;
  
  return (
    <div className={styles.markdownContent} style={{ ...style }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [bindingExpression, { extractValue }]]}
        components={{
          h1({ children }) {
            return <h1 className={htmlTagStyles.htmlH1}>{children}</h1>;
          },
          h2({ children }) {
            return <h2 className={htmlTagStyles.htmlH2}>{children}</h2>;
          },
          h3({ children }) {
            return <h3 className={htmlTagStyles.htmlH3}>{children}</h3>;
          },
          h4({ children }) {
            return <h4 className={htmlTagStyles.htmlH4}>{children}</h4>;
          },
          h5({ children }) {
            return <h5 className={htmlTagStyles.htmlH5}>{children}</h5>;
          },
          h6({ children }) {
            return <h6 className={htmlTagStyles.htmlH6}>{children}</h6>;
          },
          p({ id, children }) {
            return (
              <Text uid={id}>
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
          ol({ children }) {
            return <ol className={htmlTagStyles.htmlOl}>{children}</ol>;
          },
          ul({ children }) {
            return <ul className={htmlTagStyles.htmlUl}>{children}</ul>;
          },
          li({ children }) {
            return <li>{children}</li>; // No custom styling for li elements
          },
          hr() {
            return <HorizontalRule />;
          },
          a({ href, children }) {
            return <LocalLink to={href || "/"}>{children}</LocalLink>;
          },
          img({ src, alt }) {
            return <Image src={src} alt={alt} />;
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
        {_children}
      </ReactMarkdown>
    </div>
  );
});

function removeTextIndents(input: string) {
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

  // Render regular blockquote
  return (
    <blockquote className={styles.blockquote} style={style}>
      {children}
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
      extracted.type === "ArrowE" &&
      extracted?._ARROW_EXPR_ &&
      extracted.hasOwnProperty("source")
    ) {
      return extracted.source;
    }
    return "";
  }
}

import { type CSSProperties, memo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from 'unist-util-visit';

import styles from "./Markdown.module.scss";
import htmlTagStyles from "../HtmlTags/HtmlTags.module.scss";

import { Heading } from "../Heading/HeadingNative";
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

export const Markdown = memo(function Markdown({
  extractValue,
  removeIndents = false,
  children,
  style,
}: MarkdownProps) {
  if (typeof children !== "string") {
    return null;
  }

  children = removeIndents ? removeTextIndents(children) : children;
  const textLayoutToUse = { textAlign: style?.textAlign };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [bindingExpression, { extractValue }]]}
      components={{
        h1({ id, children }) {
          return (
            <Heading uid={id} style={textLayoutToUse} level="h1" sx={{ lineHeight: "initial" }}>
              {children}
            </Heading>
          );
        },
        h2({ id, children }) {
          return (
            <Heading uid={id} level="h2" sx={{ lineHeight: "initial" }}>
              {children}
            </Heading>
          );
        },
        h3({ id, children }) {
          return (
            <Heading uid={id} level="h3" sx={{ lineHeight: "initial" }}>
              {children}
            </Heading>
          );
        },
        h4({ id, children }) {
          return (
            <Heading uid={id} level="h4" sx={{ lineHeight: "initial" }}>
              {children}
            </Heading>
          );
        },
        h5({ id, children }) {
          return (
            <Heading uid={id} level="h5" sx={{ lineHeight: "initial" }}>
              {children}
            </Heading>
          );
        },
        h6({ id, children }) {
          return (
            <Heading uid={id} level="h6" sx={{ lineHeight: "initial" }}>
              {children}
            </Heading>
          );
        },
        p({ id, children }) {
          return (
            <Text uid={id} style={textLayoutToUse}>
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
          return <Blockquote style={textLayoutToUse}>{children}</Blockquote>;
        },
        ol({ children }) {
          return <OrderedList style={textLayoutToUse}>{children}</OrderedList>;
        },
        ul({ children }) {
          return <UnorderedList style={textLayoutToUse}>{children}</UnorderedList>;
        },
        li({ children }) {
          return <ListItem style={textLayoutToUse}>{children}</ListItem>;
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
      {children as any}
    </ReactMarkdown>
  );
});

function removeTextIndents(input: string): string {
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
    visit(tree, 'text', (node) => {
      const regex = /\$\{(?![^{]*\$\{)([^}]+)\}/g;
      const parts: string[] = node.value.split(regex);
      if (parts.length > 1) {
        node.type = 'html';
        node.value = parts.map((part, index) => 
          index % 2 === 0 ? part : extractValue(`{${part}}`)
        ).join('');
      }
    });
  };
}

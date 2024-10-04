import { memo, type ReactNode } from "react";

import styles from "./Markdown.module.scss";

import ReactMarkdown from "react-markdown";
import { Heading } from "@components/Heading/HeadingNative";
import { Text } from "../Text/TextNative";
import { LocalLink } from "@components/Link/LinkNative";
import { Image } from "@components/Image/ImageNative";

type MarkdownProps = {
  children: ReactNode;
};

export const Markdown = memo(function Markdown({ children }: MarkdownProps) {
  if (typeof children !== "string") {
    return null;
  }
  return (
    <ReactMarkdown
      components={{
        h1({ id, children }) {
          return (
            <Heading uid={id} level="h1" sx={{ lineHeight: "initial" }}>
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
          return <Text uid={id}>{children}</Text>;
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
        blockquote({ children }) {
          return <Blockquote>{children}</Blockquote>;
        },
        ol({ children }) {
          return <OrderedList>{children}</OrderedList>;
        },
        ul({ children }) {
          return <UnorderedList>{children}</UnorderedList>;
        },
        li({ children }) {
          return <ListItem>{children}</ListItem>;
        },
        // This needs a parser plugin for the ~ and ~~ signs that are available via react-markdown-gfm
        // or we implement our own parser?
        // del: variant="deleted"
        hr() {
          return <HorizontalRule />;
        },
        a({ href, children }) {
          return <LocalLink to={href || "/"}>{children}</LocalLink>;
        },
        img({ src, alt }) {
          return <Image src={src} alt={alt} />;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
});

const HorizontalRule = () => {
    return <hr className={styles.horizontalRule} />;
  };
  
  type BlockquoteProps = {
    children: React.ReactNode;
  };
  
  const Blockquote = ({ children }: BlockquoteProps) => {
    return <blockquote className={styles.blockquote}>{children}</blockquote>;
  };
  
  type UnorderedListProps = {
    children: React.ReactNode;
  };
  
  const UnorderedList = ({ children }: UnorderedListProps) => {
    return <ul className={styles.unorderedList}>{children}</ul>;
  };
  
  type OrderedListProps = {
    children: React.ReactNode;
  };
  
  const OrderedList = ({ children }: OrderedListProps) => {
    return <ol className={styles.orderedList}>{children}</ol>;
  };
  
  type ListItemProps = {
    children: React.ReactNode;
  };
  
  const ListItem = ({ children }: ListItemProps) => {
    return <li className={styles.listItem}>{children}</li>;
  };
  
import { memo, ReactNode } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import ReactMarkdown from "react-markdown";
import { Heading } from "@components/Heading/Heading";
import { Text } from "../Text/Text";
import styles from "./Markdown.module.scss";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { LocalLink } from "@components/Link/Link";
import { Image } from "@components/Image/Image";

type MarkdownProps = {
  children: ReactNode;
};

const Markdown = memo(function Markdown({ children }: MarkdownProps) {
  if (typeof children !== "string") {
    return null;
  }
  return (
    <ReactMarkdown
      components={{
        h1({ id, children }) {
          return (
            <Heading uid={id} level="h1">
              {children}
            </Heading>
          );
        },
        h2({ id, children }) {
          return (
            <Heading uid={id} level="h2">
              {children}
            </Heading>
          );
        },
        h3({ id, children }) {
          return (
            <Heading uid={id} level="h3">
              {children}
            </Heading>
          );
        },
        h4({ id, children }) {
          return (
            <Heading uid={id} level="h4">
              {children}
            </Heading>
          );
        },
        h5({ id, children }) {
          return (
            <Heading uid={id} level="h5">
              {children}
            </Heading>
          );
        },
        h6({ id, children }) {
          return (
            <Heading uid={id} level="h6">
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
        // del: variant="deleted" <-- This needs a parser plugin for ~ and ~~ signs that is available via react-markdown-gfm or we roll with an in-house one (?)
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

/**
 * \`Markdown\` displays plain text styled using markdown syntax.
 * 
 * The \`Markdown\` component does not have properties. You must provide the text to display 
 * nested between an opening and a closing tag `<Markdown>`.
 */
export interface MarkdownComponentDef extends ComponentDef<"Markdown"> {}

const metadata: ComponentDescriptor<MarkdownComponentDef> = {
  displayName: "Markdown",
  description: "This component lets you use markdown syntax to create rich text content.",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-border-HorizontalRule": "$color-border",
    "thickness-border-HorizontalRule": "1px",
    "style-border-HorizontalRule": "solid",
    "accent-Blockquote": "$color-primary",
    "padding-Blockquote": "$space-2 $space-6",
    "margin-Blockquote": "$space-2",
    "padding-left-UnorderedList": "$space-6",
    "padding-left-OrderedList": "$space-6",
    "padding-left-ListItem": "$space-1",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

export const markdownComponentRenderer = createComponentRenderer<MarkdownComponentDef>(
  "Markdown",
  ({ node, renderChild }) => {
    return <Markdown>{renderChild(node.children)}</Markdown>;
  },
  metadata
);

// --------------------------------------------------------------------------------------------------------------------
// Markdown only components

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

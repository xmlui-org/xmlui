import type React from "react";
import styles from "./CodeBlock.module.scss";
import { Text } from "../Text/TextNative";
import { type CodeHighlighterMeta, CodeHighlighterMetaKeys } from "./highlight-code";
import { Button } from "../Button/ButtonNative";
import Icon from "../Icon/IconNative";
import toast from "react-hot-toast";
import { visit } from "unist-util-visit";
import type { Node, Parent } from "unist";
import type { CSSProperties } from "react";

type CodeBlockProps = {
  children?: React.ReactNode;
  textToCopy?: string;
  meta?: CodeHighlighterMeta;
  style?: CSSProperties;
};

export function CodeBlock({ children, meta, textToCopy, style }: CodeBlockProps) {
  if (!meta) {
    return (
      <div className={styles.codeBlock} style={style}>
        {children}
      </div>
    );
  }
  return (
    <div className={styles.codeBlock} style={style}>
      {meta.filename && (
        <div className={styles.codeBlockHeader}>
          <Text variant="em">{meta.filename}</Text>
        </div>
      )}
      <div className={styles.codeBlockCopyWrapper}>
        {children}
        <div className={styles.codeBlockCopyButton}>
          <Button
            variant="outlined"
            themeColor="primary"
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

export function markdownCodeBlockParser() {
  return function transformer(tree: Node) {
    visit(tree, "code", visitor);
  };

  /**
   * This visitor visits each node in the mdast tree and adds all meta information to the code block html element
   * that we use later in the Markdown component.
   */
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
            const unparsedSubstrings = acc[CodeHighlighterMetaKeys.highlightSubstrings.data];
            const newItemBase64 = window.btoa(item.substring(1, item.length - 1));

            if (!unparsedSubstrings) {
              acc[CodeHighlighterMetaKeys.highlightSubstrings.data] = newItemBase64;
            } else {
              acc[CodeHighlighterMetaKeys.highlightSubstrings.data] =
                `${unparsedSubstrings} ${newItemBase64}`;
            }
          }
          if (item.startsWith("{") && item.endsWith("}")) {
            const unparsedRows = acc[CodeHighlighterMetaKeys.highlightRows.data];
            const newItem = item.substring(1, item.length - 1);

            if (!unparsedRows) {
              acc[CodeHighlighterMetaKeys.highlightRows.data] = newItem;
            } else {
              acc[CodeHighlighterMetaKeys.highlightRows.data] = `${unparsedRows}, ${newItem}`;
            }
          }
          if (item === "copy") {
            acc[CodeHighlighterMetaKeys.copy.data] = "true";
          }
          if (item === "rowNumbers") {
            acc[CodeHighlighterMetaKeys.rowNumbers.data] = "true";
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
    return str.match(/(?:("|')[^"']*\1|\{[^{}]*\}|\/.*?\/|[^\s"'{}/])+/g);
  }
}

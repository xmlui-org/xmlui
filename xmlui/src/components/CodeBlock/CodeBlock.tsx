import type React from "react";
import styles from "./CodeBlock.module.scss";
import { Text } from "../Text/TextNative";
import {
  type CodeHighlighterMeta,
  CodeHighlighterMetaKeys,
} from "../Markdown/highlight-code";
import { Button } from "../Button/ButtonNative";
import Icon from "../Icon/IconNative";
import toast from "react-hot-toast";
import { visit } from "unist-util-visit";
import type { Node, Parent } from "unist";

type CodeBlockProps = {
  children?: React.ReactNode;
  textToCopy?: string;
  meta?: CodeHighlighterMeta;
};

export function CodeBlock({ children, meta, textToCopy }: CodeBlockProps) {
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

export function markdownCodeBlockParser() {
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
            acc[CodeHighlighterMetaKeys.highlightSubstrings.data] = item.substring(
              1,
              item.length - 1,
            );
          }
          if (item.startsWith("{") && item.endsWith("}")) {
            acc[CodeHighlighterMetaKeys.highlightRows.data] = item.substring(1, item.length - 1);
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

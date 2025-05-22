import { useEffect, useMemo, useState } from "react";
import type { HighlighterCore } from "@shikijs/core/types";
import styles from "./XmluiCodeHighlighter.module.scss";
import { useTheme } from "./theming/ThemeContext";
import classnames from "classnames";
import { createComponentRenderer } from "./renderers";

let highlighter: HighlighterCore | null = null;

export function XmluiCodeHighlighter({ value, style }: { value: string, style?: React.CSSProperties }) {
  const { activeThemeTone } = useTheme();

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    async function load() {
      if (!highlighter) {
        const { createHighlighterCore } = await import("shiki/core");
        highlighter = await createHighlighterCore({
          // @ts-ignore
          themes: [import("../syntax/textMate/xmlui.json")],
          // @ts-ignore
          langs: [import("../syntax/grammar.tmLanguage.json")],
          loadWasm: import("shiki/wasm"),
        });
      }
      setInitialized(true);
    }

    load();
  }, []);

  const html = useMemo(() => {
    return !initialized || !highlighter
      ? ""
      : highlighter.codeToHtml(value, {
          lang: "xmlui",
          theme: "xmlui",
          colorReplacements: {
            "#000001": "var(--syntax-token-component)",
            "#000002": "var(--syntax-token-delimiter-angle)",
            "#000003": "var(--syntax-token-attribute-name)",
            "#000004": "var(--syntax-token-equal-sign)",
            "#000005": "var(--syntax-token-string)",
            "#000006": "var(--syntax-token-script)",
            "#000007": "var(--syntax-token-helper)",
            "#000008": "var(--syntax-token-comment)",
            "#000009": "var(--syntax-token-escape)",
            "#000010": "var(--syntax-token-constant)",
            "#000011": "var(--syntax-token-cdata)",
            "#000012": "var(--syntax-token-delimiter-curly)",
            "#000013": "var(--syntax-token-text)",
          },
        });
  }, [initialized, value]);

  return (
    <div className={styles.wrapper}>
      <div
        className={classnames(styles.innerWrapper, {
          [styles.dark]: activeThemeTone === "dark",
          [styles.light]: activeThemeTone === "light",
        })}
        style={style}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    </div>
  );
}

export const codeComponentRenderer = createComponentRenderer(
  "XmluiCodehighlighter",
  {},
  ({ node, renderChild, layoutCss }) => {
    return <XmluiCodeHighlighter value={renderChild(node.children) as string} style={layoutCss} />;
  },
);

import { useEffect, useMemo, useState } from "react";
import type { HighlighterCore } from "@shikijs/core/types";
import styles from "./XmluiCodeHighlighter.module.scss";
import { useTheme } from "./theming/ThemeContext";
import classnames from "classnames";
import { createComponentRenderer } from "./renderers";
// @ts-ignore
import js from "@shikijs/langs/javascript";
// @ts-ignore
import json from "@shikijs/langs/json";

// @ts-ignore
import html from "@shikijs/langs/html";

import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import xmluiGrammar from "../syntax/grammar.tmLanguage.json";
import xmluiThemeLight from "../syntax/textMate/xmlui-light.json";
import xmluiThemeDark from "../syntax/textMate/xmlui-dark.json";

let highlighter: HighlighterCore | null = null;

export function XmluiCodeHighlighter({
  value,
  style,
}: {
  value: string;
  style?: React.CSSProperties;
}) {
  const { activeThemeTone } = useTheme();

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    async function load() {
      if (!highlighter) {
        const { createHighlighterCore } = await import("shiki/core");
        highlighter = await createHighlighterCore({
          // @ts-ignore
          themes: [xmluiThemeLight, xmluiThemeDark],
          // @ts-ignore
          langs: [js, json, html, xmluiGrammar],
          loadWasm: import("shiki/wasm"),
          engine: createJavaScriptRegexEngine(),
        });
      }
      setInitialized(true);
    }

    load();
  }, []);

  const htmlCode = useMemo(() => {
    return !initialized || !highlighter
      ? ""
      : highlighter.codeToHtml(value, {
          lang: "xmlui",
          theme: `xmlui-${activeThemeTone}`,
          decorations: [],
        });
  }, [initialized, value, activeThemeTone]);

  return (
    <div className={styles.wrapper}>
      <div
        className={classnames(styles.innerWrapper, {
          [styles.dark]: activeThemeTone === "dark",
          [styles.light]: activeThemeTone === "light",
        })}
        style={style}
        dangerouslySetInnerHTML={{
          __html: htmlCode,
        }}
      />
    </div>
  );
}

export const codeComponentRenderer = createComponentRenderer(
  "XmluiCodehighlighter",
  {
    status: "stable",
  },
  ({ node, renderChild, layoutCss }) => {
    return <XmluiCodeHighlighter value={renderChild(node.children) as string} style={layoutCss} />;
  },
);

import { Editor as MonacoEditor, useMonaco } from "@monaco-editor/react";
import { CSSProperties, useEffect } from "react";
import { XmluiGrammar } from "./syntax/monaco/grammar.monacoLanguage";
import xmluiLight from "./syntax/monaco/xmlui-light";
import xmluiDark from "./syntax/monaco/xmlui-dark";
import { XmluiScripGrammar } from "./syntax/monaco/xmluiscript.monacoLanguage";
import { useTheme } from "xmlui";
import styles from "./EditorNative.module.scss";

export type EditorProps = {
  readOnly?: boolean;
  language?: string;
  highlight?: boolean;
  style?: CSSProperties;
  value?: string;
};

export function Editor({
  readOnly = true,
  language = "xmlui",
  highlight = true,
  value,
}: EditorProps) {
  const monaco = useMonaco();
  const { activeThemeTone } = useTheme();

  useEffect(() => {
    if (monaco) {
      //xmlui markup
      monaco.languages.register({ id: XmluiGrammar.id });
      monaco.languages.setMonarchTokensProvider(XmluiGrammar.id, XmluiGrammar.language);
      monaco.languages.setLanguageConfiguration(XmluiGrammar.id, XmluiGrammar.config);
      monaco.editor.defineTheme("xmlui-light", xmluiLight);
      monaco.editor.defineTheme("xmlui-dark", xmluiDark);
      if (language === "xmlui") {
        monaco.editor.setTheme(activeThemeTone === "dark" ? "xmlui-dark" : "xmlui-light");
      }
      //xmluiscript
      monaco.languages.register({ id: XmluiScripGrammar.id });
      monaco.languages.setMonarchTokensProvider(XmluiScripGrammar.id, XmluiScripGrammar.language);
      monaco.languages.setLanguageConfiguration(XmluiScripGrammar.id, XmluiScripGrammar.config);
    }
  }, [monaco, language, activeThemeTone]);

  return (
    <MonacoEditor
      className={styles.editor}
      saveViewState={true}
      key={"devtools"}
      options={{
        readOnly: readOnly,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
      }}
      language={language}
      value={value}
    />
  );
}

export default Editor;

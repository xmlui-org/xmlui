import { Editor as MonacoEditor, useMonaco } from "@monaco-editor/react";
import type { CSSProperties} from "react";
import { useEffect } from "react";
import { XmluiGrammar } from "../syntax/monaco/grammar.monacoLanguage";
import xmluiLight from "../syntax/monaco/xmlui-light";
import xmluiDark from "../syntax/monaco/xmlui-dark";
import { XmluiScripGrammar } from "../syntax/monaco/xmluiscript.monacoLanguage";

export type EditorProps = {
  readOnly?: boolean;
  language?: string;
  style?: CSSProperties;
  value?: string;
  saveViewState?: boolean;
  onChange?: any;
  onMount?: any;
  activeThemeTone?: string;
};

export const Editor = ({
  readOnly = true,
  language = "xmlui",
  value,
  onChange = () => {},
  onMount = () => {},
  saveViewState = false,
  activeThemeTone = "light",
}: EditorProps) => {
  const monaco = useMonaco();

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
      saveViewState={saveViewState}
      onChange={onChange}
      onMount={onMount}
      key={"devtools"}
      options={{
        readOnly: readOnly,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        stickyScroll: { enabled: false },
      }}
      language={language}
      value={value}
    />
  );
};

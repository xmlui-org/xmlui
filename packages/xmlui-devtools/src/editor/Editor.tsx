import { Editor as MonacoEditor, useMonaco } from "@monaco-editor/react";
import type { CSSProperties } from "react";
import { useEffect } from "react";
import {
  xmluiThemeLight,
  xmluiThemeDark,
  xmluiGrammar,
  xmluiScriptGrammar,
} from "xmlui/syntax/monaco";

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
      monaco.languages.register({ id: xmluiGrammar.id });
      monaco.languages.setMonarchTokensProvider(xmluiGrammar.id, xmluiGrammar.language);
      monaco.languages.setLanguageConfiguration(xmluiGrammar.id, xmluiGrammar.config);
      monaco.editor.defineTheme("xmlui-light", xmluiThemeLight);
      monaco.editor.defineTheme("xmlui-dark", xmluiThemeDark);
      if (language === "xmlui") {
        monaco.editor.setTheme(activeThemeTone === "dark" ? "xmlui-dark" : "xmlui-light");
      }
      //xmluiscript
      monaco.languages.register({ id: xmluiScriptGrammar.id });
      monaco.languages.setMonarchTokensProvider(xmluiScriptGrammar.id, xmluiScriptGrammar.language);
      monaco.languages.setLanguageConfiguration(xmluiScriptGrammar.id, xmluiScriptGrammar.config);
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

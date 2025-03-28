import { editorStatusChanged, textChanged } from "../../src/state/store";
import React, { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { Editor as MonacoEditor, useMonaco } from "@monaco-editor/react";
import { usePlayground } from "../hooks/usePlayground";
import { XmluiGrammar } from "../../../xmlui/src/syntax/monaco/grammar.monacoLanguage";
import { XmluiScripGrammar } from "../../../xmlui/src/syntax/monaco/xmluiscript.monacoLanguage";
import xmluiLight from "../../../xmlui/src/syntax/monaco/xmlui-light";
import xmluiDark from "../../../xmlui/src/syntax/monaco/xmlui-dark";
import { useTheme } from "nextra-theme-docs";

export const Editor = () => {
  const { text, dispatch, options } = usePlayground();
  const [value, setValue] = useState(text);
  const monaco = useMonaco();
  const { theme, systemTheme } = useTheme();

  const isDark = useMemo(() => {
    return theme === "dark" || (theme === "system" && systemTheme === "dark");
  }, [theme, systemTheme]);

  useEffect(() => {
    if (monaco) {
      //xmlui markup
      monaco.languages.register({ id: XmluiGrammar.id });
      monaco.languages.setMonarchTokensProvider(XmluiGrammar.id, XmluiGrammar.language);
      monaco.languages.setLanguageConfiguration(XmluiGrammar.id, XmluiGrammar.config);
      monaco.editor.defineTheme("xmlui-light", xmluiLight);
      monaco.editor.defineTheme("xmlui-dark", xmluiDark);
      if (options.language === "xmlui") {
        monaco.editor.setTheme(isDark ? "xmlui-dark" : "xmlui-light");
      }
      //xmluiscript
      monaco.languages.register({ id: XmluiScripGrammar.id });
      monaco.languages.setMonarchTokensProvider(XmluiScripGrammar.id, XmluiScripGrammar.language);
      monaco.languages.setLanguageConfiguration(XmluiScripGrammar.id, XmluiScripGrammar.config);
    }
  }, [monaco, isDark, options.language]);

  useEffect(() => {
    setValue(text);
  }, [text]);

  const updateValue = useCallback(
    (value) => {
      setValue(value);
      startTransition(() => {
        dispatch(textChanged(value));
      });
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(editorStatusChanged("loading"));
  }, [dispatch]);

  return (
    <MonacoEditor
      saveViewState={true}
      key={"app"}
      onChange={updateValue}
      language={options.language}
      onMount={() => {
        dispatch(editorStatusChanged("loaded"));
      }}
      options={{
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
      }}
      value={value}
    />
  );
};

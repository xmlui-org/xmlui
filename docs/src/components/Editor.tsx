import { editorStatusChanged, textChanged } from "@/src/state/store";
import React, { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { Editor as MonacoEditor, useMonaco } from "@monaco-editor/react";
import { usePlayground } from "@/src/hooks/usePlayground";
import { UEMLGrammar } from "../../../xmlui/src/syntax/monaco/grammar.monacoLanguage";
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
      //ueml markup
      monaco.languages.register({ id: UEMLGrammar.id });
      monaco.languages.setMonarchTokensProvider(UEMLGrammar.id, UEMLGrammar.language);
      monaco.languages.setLanguageConfiguration(UEMLGrammar.id, UEMLGrammar.config);
      monaco.editor.defineTheme("ueml-light", xmluiLight);
      monaco.editor.defineTheme("ueml-dark", xmluiDark);
      if (options.language === "ueml") {
        monaco.editor.setTheme(isDark ? "ueml-dark" : "ueml-light");
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

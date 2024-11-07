import { textChanged } from "@/src/state/store";
import React, { useEffect, useMemo } from "react";
import { Editor as MonacoEditor, useMonaco } from "@monaco-editor/react";
import { usePlayground } from "@/src/hooks/usePlayground";
import { UEMLGrammar } from "@/syntax/monaco/grammar.monacoLanguage";
import { XmluiScripGrammar } from "@/syntax/monaco/xmluiscript.monacoLanguage";
import xmluiLight from "../../syntax/monaco/xmlui-light";
import xmluiDark from "../../syntax/monaco/xmlui-dark";
import { useTheme } from "nextra-theme-docs";
import { preprocessCode } from "@/src/utils/helpers";

export const Editor = () => {
  const { text, dispatch, options } = usePlayground();
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

  const preprocessedCode = useMemo(() => preprocessCode(text), [text]);

  return (
    <MonacoEditor
      saveViewState={true}
      key={"app"}
      onChange={(val: string | undefined) => {
        dispatch(textChanged(val || ""));
      }}
      language={options.language}
      options={{
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
      }}
      value={preprocessedCode}
    />
  );
};

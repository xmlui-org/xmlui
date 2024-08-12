import { textChanged } from "@/src/state/store";
import React, { useEffect } from "react";
import { Editor as MonacoEditor, useMonaco } from "@monaco-editor/react";
import { usePlayground } from "@/src/hooks/usePlayground";
import { UEMLGrammar } from "@/syntax/monaco/grammar.monacoLanguage";
import { XmluiScripGrammar } from "@/syntax/monaco/xmluiscript.monacoLanguage";
import xmluiLight from "../../syntax/monaco/xmlui-light";

export const Editor = () => {
  const { text, dispatch, options } = usePlayground();
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      //ueml markup
      monaco.languages.register({ id: UEMLGrammar.id });
      monaco.languages.setMonarchTokensProvider(UEMLGrammar.id, UEMLGrammar.language);
      monaco.languages.setLanguageConfiguration(UEMLGrammar.id, UEMLGrammar.config);
      monaco.editor.defineTheme("ueml", xmluiLight);
      monaco.editor.setTheme("ueml");

      //xmluiscript
      monaco.languages.register({ id: XmluiScripGrammar.id });
      monaco.languages.setMonarchTokensProvider(XmluiScripGrammar.id, XmluiScripGrammar.language);
      monaco.languages.setLanguageConfiguration(XmluiScripGrammar.id, XmluiScripGrammar.config);
    }
  }, [monaco]);

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
      theme={options.language}
      value={text}
    />
  );
};

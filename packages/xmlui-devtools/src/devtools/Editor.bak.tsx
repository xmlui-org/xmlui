import React, { useEffect, useRef } from "react";
import loader from "@monaco-editor/loader";
import { XmluiGrammar } from "../syntax/monaco/grammar.monacoLanguage";
import { XmluiScripGrammar } from "../syntax/monaco/xmluiscript.monacoLanguage";
import xmluiLight from "../syntax/monaco/xmlui-light";
import xmluiDark from "../syntax/monaco/xmlui-dark";

interface EditorProps {
  value: string;
  activeThemeTone: "light" | "dark";
  className?: string;
  onEditorInstanceChange?: (instance: any) => void;
}

export const Editor: React.FC<EditorProps> = ({
  value,
  activeThemeTone,
  className,
  onEditorInstanceChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorInstance = useRef<any>(null);
  const monacoSetupDone = useRef(false);

  useEffect(() => {
    if (editorRef.current) {
      loader.init().then((monaco) => {
        if (!editorRef.current || monacoEditorInstance.current) return;
        if (!monacoSetupDone.current) {
          monaco.languages.register({ id: XmluiGrammar.id });
          monaco.languages.setMonarchTokensProvider(XmluiGrammar.id, XmluiGrammar.language);
          monaco.languages.setLanguageConfiguration(XmluiGrammar.id, XmluiGrammar.config);

          monaco.languages.register({ id: XmluiScripGrammar.id });
          monaco.languages.setMonarchTokensProvider(
            XmluiScripGrammar.id,
            XmluiScripGrammar.language,
          );
          monaco.languages.setLanguageConfiguration(XmluiScripGrammar.id, XmluiScripGrammar.config);

          monaco.editor.defineTheme("xmlui-light", xmluiLight);
          monaco.editor.defineTheme("xmlui-dark", xmluiDark);

          monacoSetupDone.current = true;
        }

        monaco.editor.setTheme(activeThemeTone === "dark" ? "xmlui-dark" : "xmlui-light");

        monacoEditorInstance.current = monaco.editor.create(editorRef.current, {
          value,
          language: "xmlui",
          readOnly: true,
          scrollBeyondLastLine: false,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          minimap: { enabled: false },
          padding: {
            top: 10,
            bottom: 10,
          },
        });

        onEditorInstanceChange?.(monacoEditorInstance.current);
      });
    }

    return () => {
      if (monacoEditorInstance.current) {
        monacoEditorInstance.current.dispose();
        monacoEditorInstance.current = null;
        onEditorInstanceChange?.(null);
      }
    };
  }, [activeThemeTone, value, onEditorInstanceChange]);

  return <div ref={editorRef} className={className} />;
};
